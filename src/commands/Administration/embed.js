const Command = require('../../core/command');
const { MessageEmbed } = require('discord.js');
const Imgur = require('imgur');
const fs = require('fs');
const request = require('request');

async function download(uri, filename, callback){
    request.head(uri, function(err, res, body){
        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
};


class Embed extends Command {

    constructor(client) {
        super(client, {
            name: "embed",
            description: "administration/embed:description",
            dirname: __dirname,
            memberPermissions: ["MANAGE_GUILD"],
            cooldown: 10000,
            premium: true,
            slashCommand: {
                addCommand: true
            }
        });
    }

    async run(interaction, message, args, data) {

        let guild = message?.guild || interaction?.guild
            , channel = interaction?.channel || message?.channel
            , id = message?.member?.user?.id || interaction?.member?.user?.id;

        let authorText
            , authorIcon
            , title
            , thumbnail
            , image
            , description
            , footerText
            , footerIcon
            , color;

        let disclaimer = new MessageEmbed()
            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
            .setDescription(guild.translate("administration/embed:accept")
                .replace('{emotes.arrow}', this.client.emotes.arrow))
            .setColor(this.client.embedColor)
            .setFooter(data.guild.footer);

        const { MessageButton, MessageActionRow } = require('discord.js');
        let row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('consent_'+ id + '_yes')
                    .setLabel(guild.translate("language:yes"))
                    .setStyle('PRIMARY')
                    .setEmoji(this.client.emotes.success),
                new MessageButton()
                    .setCustomId('consent_'+ id + '_no')
                    .setLabel(guild.translate("language:no"))
                    .setStyle('PRIMARY')
                    .setEmoji(this.client.emotes.error)
            )

        let sent;
        if (message) sent = await message.send(disclaimer, false, [row]);
        if (interaction) sent = await interaction.send(disclaimer, false, [row]);

        const filter = i => i.customId.startsWith('consent_'+ id) && i.user.id === id;
        const clicked = await sent.awaitMessageComponent({ filter, time: 20000 }).catch(() => {});

        if(clicked){
            if(clicked.customId === 'consent_'+id+'_yes'){
                let collectAuthorEmbed = new MessageEmbed()
                    .setAuthor(guild.translate("administration/embed:author"), this.client.user.displayAvatarURL(), this.client.website)
                    .setDescription(guild.translate("administration/embed:collectAuthor")
                        .replace('{emotes.arrow}', this.client.emotes.arrow))
                    .setColor(this.client.embedColor)
                    .setFooter(data.guild.footer);
                await clicked.update({embeds: [collectAuthorEmbed], components: []})

                //Collect author
                let authorCollector = channel.createMessageCollector({
                    filter: m => m.author.id === id,
                    time: 60000
                })
                authorCollector.on("collect", async (msg) => {
                    if(msg.content){
                        authorText = msg.content;
                        msg.delete().catch(() => {});
                        authorCollector.stop();
                        let collectAuthorIconEmbed = new MessageEmbed()
                            .setAuthor(guild.translate("administration/embed:authorIcon"), this.client.user.displayAvatarURL(), this.client.website)
                            .setDescription(guild.translate("administration/embed:collectAuthorIcon")
                                .replace('{emotes.arrow}', this.client.emotes.arrow))
                            .setColor(this.client.embedColor)
                            .setFooter(data.guild.footer);
                        await sent.edit({embeds: [collectAuthorIconEmbed]});

                        //Collect author icon
                        const authorIconCollector = channel.createMessageCollector({
                            filter: m => m.author.id === id,
                            time: 60000
                        });
                        authorIconCollector.on("collect", async (msg) => {
                            if(msg.attachments.size < 1 && msg.content !== "/"){
                                msg.delete().catch(() => {});
                                authorIconCollector.stop();
                                let errorEmbed = new MessageEmbed()
                                    .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                                    .setDescription(guild.translate("administration/embed:cancelled")
                                        .replace('{emotes.error}', this.client.emotes.error))
                                    .setColor(this.client.embedColor)
                                    .setFooter(data.guild.footer);
                                return sent.edit({embeds: [errorEmbed]});
                            }else{
                                if(msg.attachments.size >= 1){
                                    let attachments = Array.from(msg.attachments)
                                        , contentType = attachments[0][1].contentType
                                        , attachmentUrl = attachments[0][1].url;
                                    if(contentType === "image/gif" || contentType === "image/jpeg" ||
                                        contentType === "image/png" || contentType === "image/webp"){
                                        if(attachments[0][1].size > 3145690){
                                            //Image is larger than 3mb
                                            msg.delete().catch(() => {});
                                            authorIconCollector.stop();
                                            let errorEmbed = new MessageEmbed()
                                                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                                                .setDescription(guild.translate("administration/embed:iconToLarge")
                                                    .replace('{emotes.error}', this.client.emotes.error))
                                                .setColor(this.client.embedColor)
                                                .setFooter(data.guild.footer);
                                            return sent.edit({embeds: [errorEmbed]})
                                        }else{
                                            //Download image
                                            let key = this.client.randomKey(32);
                                            authorIcon = './storage/images/'+Date.now()+'-'+key+'.'+attachments[0][1].contentType.split('/')[1];
                                            await download(attachmentUrl, authorIcon, function(){
                                                msg.delete().catch(() => {});
                                            });
                                        }
                                    }else{
                                        let errorEmbed = new MessageEmbed()
                                            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                                            .setDescription(guild.translate("administration/embed:noImageGiven")
                                                .replace('{emotes.error}', this.client.emotes.error))
                                            .setColor(this.client.embedColor)
                                            .setFooter(data.guild.footer);
                                        await sent.edit({embeds: [errorEmbed]});
                                        return authorIconCollector.stop();
                                    }
                                }
                                authorIconCollector.stop();
                                msg.delete().catch();
                                let collectThumbnailEmbed = new MessageEmbed()
                                    .setAuthor(guild.translate("administration/embed:thumbnail"), this.client.user.displayAvatarURL(), this.client.website)
                                    .setDescription(guild.translate("administration/embed:collectThumbnail")
                                        .replace('{emotes.arrow}', this.client.emotes.arrow))
                                    .setThumbnail(this.client.user.displayAvatarURL())
                                    .setColor(this.client.embedColor)
                                    .setFooter(data.guild.footer);
                                await sent.edit({embeds: [collectThumbnailEmbed]});

                                //Collect thumbnail
                                const thumbnailCollector = channel.createMessageCollector({
                                    filter: m => m.author.id === id,
                                    time: 60000
                                });
                                thumbnailCollector.on("collect", async (msg) => {
                                    if(msg.attachments.size < 1 && msg.content !== "/"){
                                        msg.delete().catch(() => {});
                                        thumbnailCollector.stop();
                                        let errorEmbed = new MessageEmbed()
                                            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                                            .setDescription(guild.translate("administration/embed:cancelled")
                                                .replace('{emotes.error}', this.client.emotes.error))
                                            .setColor(this.client.embedColor)
                                            .setFooter(data.guild.footer);
                                        return  sent.edit({embeds: [errorEmbed]});
                                    }else{
                                        if(msg.attachments.size >= 1){
                                            let attachments = Array.from(msg.attachments)
                                                , contentType = attachments[0][1].contentType
                                                , attachmentUrl = attachments[0][1].url;
                                            if(contentType === "image/gif" || contentType === "image/jpeg" ||
                                                contentType === "image/png" || contentType === "image/webp"){
                                                if(attachments[0][1].size > 3145690){
                                                    //Image is larger than 3mb
                                                    msg.delete().catch(() => {});
                                                    thumbnailCollector.stop();
                                                    let errorEmbed = new MessageEmbed()
                                                        .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                                                        .setDescription(guild.translate("administration/embed:iconToLarge")
                                                            .replace('{emotes.error}', this.client.emotes.error))
                                                        .setColor(this.client.embedColor)
                                                        .setFooter(data.guild.footer);
                                                    return sent.edit({embeds: [errorEmbed]})
                                                }else{
                                                    //Download image
                                                    let key = this.client.randomKey(32);
                                                    thumbnail = './storage/images/'+Date.now()+'-'+key+'.'+attachments[0][1].contentType.split('/')[1];
                                                    await download(attachmentUrl, thumbnail, function(){
                                                        msg.delete().catch(() => {});
                                                    });
                                                }
                                            }else{
                                                let errorEmbed = new MessageEmbed()
                                                    .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                                                    .setDescription(guild.translate("administration/embed:noImageGiven")
                                                        .replace('{emotes.error}', this.client.emotes.error))
                                                    .setColor(this.client.embedColor)
                                                    .setFooter(data.guild.footer);
                                                await sent.edit({embeds: [errorEmbed]});
                                                return thumbnailCollector.stop();
                                            }
                                        }
                                        thumbnailCollector.stop();
                                        msg.delete().catch();
                                        let collectTitleEmbed = new MessageEmbed()
                                            .setAuthor(guild.translate("administration/embed:title"), this.client.user.displayAvatarURL(), this.client.website)
                                            .setDescription(guild.translate("administration/embed:collectTitle")
                                                .replace('{emotes.arrow}', this.client.emotes.arrow))
                                            .setColor(this.client.embedColor)
                                            .setFooter(data.guild.footer);
                                        await sent.edit({embeds: [collectTitleEmbed]});

                                        //Collect title
                                        const titleCollector = channel.createMessageCollector({
                                            filter: m => m.author.id === id,
                                            time: 60000
                                        });

                                        titleCollector.on("collect", async (msg) => {
                                            if(msg.content !== "/"){
                                                title = msg.content;
                                            }

                                            titleCollector.stop();
                                            msg.delete().catch(() => {});
                                            let collectDescEmbed = new MessageEmbed()
                                                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                                                .setDescription(guild.translate("administration/embed:collectDesc")
                                                    .replace('{emotes.arrow}', this.client.emotes.arrow))
                                                .setColor(this.client.embedColor)
                                                .setFooter(data.guild.footer);
                                            await sent.edit({embeds: [collectDescEmbed]});

                                            //Collect description
                                            const descCollector = channel.createMessageCollector({
                                                filter: m => m.author.id === id,
                                                time: 60000
                                            });

                                            descCollector.on("collect", async (msg) => {
                                                if(msg.content !== "/"){
                                                    description = msg.content;
                                                }
                                                descCollector.stop();
                                                msg.delete().catch(() => {});
                                                let collectImageEmbed = new MessageEmbed()
                                                    .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                                                    .setDescription(guild.translate("administration/embed:collectImage")
                                                        .replace('{emotes.arrow}', this.client.emotes.arrow))
                                                    .setColor(this.client.embedColor)
                                                    .setImage('https://preview.redd.it/4zh2hgl46cp51.png?width=3325&format=png&auto=webp&s=b9123bff12e1d5b86248d27a059104b4c92e05b5')
                                                    .setFooter(data.guild.footer);
                                                await sent.edit({embeds: [collectImageEmbed]});

                                                //Collect image
                                                const imageCollector = channel.createMessageCollector({
                                                    filter: m => m.author.id === id,
                                                    time: 60000
                                                });
                                                imageCollector.on("collect", async (msg) => {
                                                    if (msg.attachments.size < 1 && msg.content !== "/") {
                                                        msg.delete().catch(() => {});
                                                        imageCollector.stop();
                                                        let errorEmbed = new MessageEmbed()
                                                            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                                                            .setDescription(guild.translate("administration/embed:cancelled")
                                                                .replace('{emotes.error}', this.client.emotes.error))
                                                            .setColor(this.client.embedColor)
                                                            .setFooter(data.guild.footer);
                                                        return sent.edit({embeds: [errorEmbed]});
                                                    } else {
                                                        if (msg.attachments.size >= 1) {
                                                            let attachments = Array.from(msg.attachments)
                                                                , contentType = attachments[0][1].contentType
                                                                , attachmentUrl = attachments[0][1].url;
                                                            if (contentType === "image/gif" || contentType === "image/jpeg" ||
                                                                contentType === "image/png" || contentType === "image/webp") {
                                                                if (attachments[0][1].size > 3145690) {
                                                                    //Image is larger than 3mb
                                                                    msg.delete().catch(() => {
                                                                    });
                                                                    imageCollector.stop();
                                                                    let errorEmbed = new MessageEmbed()
                                                                        .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                                                                        .setDescription(guild.translate("administration/embed:iconToLarge")
                                                                            .replace('{emotes.error}', this.client.emotes.error))
                                                                        .setColor(this.client.embedColor)
                                                                        .setFooter(data.guild.footer);
                                                                    return sent.edit({embeds: [errorEmbed]})
                                                                } else {
                                                                    //Download image
                                                                    let key = this.client.randomKey(32);
                                                                    image = './storage/images/' + Date.now() + '-' + key + '.' + attachments[0][1].contentType.split('/')[1];
                                                                    await download(attachmentUrl, image, function () {
                                                                        msg.delete().catch(() => {});
                                                                    });
                                                                }
                                                            }else{
                                                                let errorEmbed = new MessageEmbed()
                                                                    .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                                                                    .setDescription(guild.translate("administration/embed:noImageGiven")
                                                                        .replace('{emotes.error}', this.client.emotes.error))
                                                                    .setColor(this.client.embedColor)
                                                                    .setFooter(data.guild.footer);
                                                                await sent.edit({embeds: [errorEmbed]});
                                                                return imageCollector.stop();
                                                            }
                                                        }
                                                        imageCollector.stop();
                                                        msg.delete().catch();
                                                        let collectFooterEmbed = new MessageEmbed()
                                                            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                                                            .setDescription(guild.translate("administration/embed:collectFooter")
                                                                .replace('{emotes.arrow}', this.client.emotes.arrow))
                                                            .setColor(this.client.embedColor)
                                                            .setFooter(guild.translate("administration/embed:footer"));
                                                        await sent.edit({embeds: [collectFooterEmbed]});

                                                        //Collect footer
                                                        const footerCollector = channel.createMessageCollector({
                                                            filter: m => m.author.id === id,
                                                            time: 60000
                                                        });

                                                        footerCollector.on("collect", async (msg) => {
                                                            if (msg.content !== "/") {
                                                                footerText = msg.content;
                                                            }
                                                            footerCollector.stop();
                                                            msg.delete().catch(() => {});
                                                            let collectFooterIconEmbed = new MessageEmbed()
                                                                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                                                                .setDescription(guild.translate("administration/embed:collectFooterIcon")
                                                                    .replace('{emotes.arrow}', this.client.emotes.arrow))
                                                                .setColor(this.client.embedColor)
                                                                .setFooter(guild.translate("administration/embed:footerIcon"), this.client.user.displayAvatarURL());
                                                            await sent.edit({embeds: [collectFooterIconEmbed]});

                                                            //Collect footer icon
                                                            const footerIconCollector = channel.createMessageCollector({
                                                                filter: m => m.author.id === id,
                                                                time: 60000
                                                            });
                                                            footerIconCollector.on("collect", async (msg) => {
                                                                if (msg.attachments.size < 1 && msg.content !== "/") {
                                                                    msg.delete().catch(() => {
                                                                    });
                                                                    footerIconCollector.stop();
                                                                    let errorEmbed = new MessageEmbed()
                                                                        .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                                                                        .setDescription(guild.translate("administration/embed:cancelled")
                                                                            .replace('{emotes.error}', this.client.emotes.error))
                                                                        .setColor(this.client.embedColor)
                                                                        .setFooter(data.guild.footer);
                                                                    return sent.edit({embeds: [errorEmbed]});
                                                                } else {
                                                                    if (msg.attachments.size >= 1) {
                                                                        let attachments = Array.from(msg.attachments)
                                                                            , contentType = attachments[0][1].contentType
                                                                            , attachmentUrl = attachments[0][1].url;
                                                                        if (contentType === "image/gif" || contentType === "image/jpeg" ||
                                                                            contentType === "image/png" || contentType === "image/webp") {
                                                                            if (attachments[0][1].size > 3145690) {
                                                                                //Image is larger than 3mb
                                                                                msg.delete().catch(() => {
                                                                                });
                                                                                footerIconCollector.stop();
                                                                                let errorEmbed = new MessageEmbed()
                                                                                    .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                                                                                    .setDescription(guild.translate("administration/embed:iconToLarge")
                                                                                        .replace('{emotes.error}', this.client.emotes.error))
                                                                                    .setColor(this.client.embedColor)
                                                                                    .setFooter(data.guild.footer);
                                                                                return sent.edit({embeds: [errorEmbed]})
                                                                            } else {
                                                                                //Download image
                                                                                let key = this.client.randomKey(32);
                                                                                footerIcon = './storage/images/' + Date.now() + '-' + key + '.' + attachments[0][1].contentType.split('/')[1];
                                                                                await download(attachmentUrl, footerIcon, function () {
                                                                                    msg.delete().catch(() => {
                                                                                    });
                                                                                });
                                                                            }
                                                                        }else{
                                                                            let errorEmbed = new MessageEmbed()
                                                                                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                                                                                .setDescription(guild.translate("administration/embed:noImageGiven")
                                                                                    .replace('{emotes.error}', this.client.emotes.error))
                                                                                .setColor(this.client.embedColor)
                                                                                .setFooter(data.guild.footer);
                                                                            await sent.edit({embeds: [errorEmbed]});
                                                                            return footerIconCollector.stop();
                                                                        }
                                                                    }
                                                                    footerIconCollector.stop();
                                                                    msg.delete().catch();
                                                                    let collectColorEmbed = new MessageEmbed()
                                                                        .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                                                                        .setTitle(guild.translate("administration/embed:color"))
                                                                        .setDescription(guild.translate("administration/embed:collectColor")
                                                                            .replace('{emotes.arrow}', this.client.emotes.arrow))
                                                                        .setColor(this.client.embedColor)
                                                                        .setFooter(data.guild.footer);
                                                                    await sent.edit({embeds: [collectColorEmbed]});

                                                                    //Collect color
                                                                    const colorCollector = channel.createMessageCollector({
                                                                        filter: m => m.author.id === id,
                                                                        time: 30000
                                                                    });

                                                                    colorCollector.on("collect", async (msg) => {

                                                                        function isHexColor(hex) {
                                                                            return typeof hex === 'string'
                                                                                && hex.length === 6
                                                                                && !isNaN(Number('0x' + hex))
                                                                        }

                                                                        if(msg.content !== "/"){
                                                                            if(isHexColor(msg.content.replace('#', ''))){
                                                                                color = msg.content;
                                                                            }else{
                                                                                let rgbToHex = function(rgb){
                                                                                    let hex = Number(rgb).toString(16);
                                                                                    if(hex.length < 2){
                                                                                        hex = "0" + hex;
                                                                                    }
                                                                                    return hex;
                                                                                };
                                                                                let fullColorHex = function(r, g, b){
                                                                                    let red = rgbToHex(r)
                                                                                        , green = rgbToHex(g)
                                                                                        , blue = rgbToHex(b);
                                                                                    return red+green+blue;
                                                                                };
                                                                                let r = parseInt(msg.content.split(', ')[0])
                                                                                    , g = parseInt(msg.content.split(', ')[1])
                                                                                    , b = parseInt(msg.content.split(', ')[2]);

                                                                                if(isHexColor(fullColorHex(r,g,b))){
                                                                                    color = fullColorHex(r,g,b);
                                                                                }
                                                                            }
                                                                        }else{
                                                                            color = this.client.embedColor;
                                                                        }
                                                                        colorCollector.stop();
                                                                        msg.delete().catch(() => {});

                                                                        let generateEmbed = new MessageEmbed()
                                                                            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                                                                                .setDescription(guild.translate("administration/embed:generate")
                                                                                    .replace('{emotes.arrow}', this.client.emotes.arrow))
                                                                                .setColor(this.client.embedColor)
                                                                                .setFooter(data.guild.footer);
                                                                        await sent.edit({embeds: [generateEmbed]});

                                                                        //Embed generation
                                                                        let generatedEmbed = new MessageEmbed();

                                                                        if(authorIcon){
                                                                            generatedEmbed.setAuthor(authorText);
                                                                            await Imgur
                                                                                .uploadFile(authorIcon)
                                                                                .then((json) => {
                                                                                    generatedEmbed.setAuthor(authorText, json.link, this.client.website)
                                                                                });
                                                                        }else{
                                                                            generatedEmbed.setAuthor(authorText);
                                                                        }
                                                                        if(color) generatedEmbed.setColor(color);
                                                                        if(title) generatedEmbed.setTitle(title);

                                                                        if(thumbnail){
                                                                            await Imgur
                                                                                .uploadFile(thumbnail)
                                                                                .then((json) => {
                                                                                    generatedEmbed.setThumbnail(json.link)
                                                                                });
                                                                        }

                                                                        if(image){
                                                                            await Imgur
                                                                                .uploadFile(image)
                                                                                .then((json) => {
                                                                                    generatedEmbed.setImage(json.link)
                                                                                });
                                                                        }

                                                                        if(description) generatedEmbed.setDescription(description);

                                                                        if(footerText && footerIcon){
                                                                            await Imgur
                                                                                .uploadFile(footerIcon)
                                                                                .then((json) => {
                                                                                    generatedEmbed.setFooter(footerText, json.link)
                                                                                });
                                                                        }else{
                                                                            if(footerText){
                                                                                generatedEmbed.setFooter(footerText)
                                                                            }else if(footerIcon){
                                                                                await Imgur
                                                                                    .uploadFile(footerIcon)
                                                                                    .then((json) => {
                                                                                        generatedEmbed.setFooter('', json.link)
                                                                                    });
                                                                            }
                                                                        }
                                                                        //Send generated embed

                                                                        let webhook = await channel.createWebhook(authorText, {avatar: authorIcon ? authorIcon : 'https://www.designtagebuch.de/wp-content/uploads/mediathek//2021/05/discord-logo.jpg'}).catch(() => {});
                                                                        await webhook.send({embeds: [generatedEmbed]}).catch(async (err) => {
                                                                            let errorEmbed = new MessageEmbed()
                                                                                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                                                                                .setDescription(guild.translate("administration/embed:unsuccessfull")
                                                                                    .replace('{emotes.error}', this.client.emotes.error))
                                                                                .setColor(this.client.embedColor)
                                                                                .setFooter(data.guild.footer);
                                                                            await sent.edit({embeds: [errorEmbed]});
                                                                        })
                                                                            .then(async () => {
                                                                                let successfullEmbed = new MessageEmbed()
                                                                                    .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                                                                                    .setDescription(guild.translate("administration/embed:successfull")
                                                                                        .replace('{emotes.success}', this.client.emotes.success))
                                                                                    .setColor(this.client.embedColor)
                                                                                    .setFooter(data.guild.footer);
                                                                                await sent.edit({embeds: [successfullEmbed]});
                                                                            })
                                                                        await webhook.delete().catch(() => {});

                                                                        //Delete downloaded images
                                                                        if(authorIcon) fs.unlinkSync(authorIcon);
                                                                        if(thumbnail) fs.unlinkSync(thumbnail);
                                                                        if(image) fs.unlinkSync(image);
                                                                        if(footerIcon) fs.unlinkSync(footerIcon);
                                                                    })
                                                                }
                                                            });
                                                        });
                                                    }
                                                })
                                            })
                                        })
                                    }
                                });
                            }
                        });
                    }else{
                        msg.delete().catch(() => {});
                        authorCollector.stop();
                        let errorEmbed = new MessageEmbed()
                            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                            .setDescription(guild.translate("administration/embed:cancelled")
                                .replace('{emotes.error}', this.client.emotes.error))
                            .setColor(this.client.embedColor)
                            .setFooter(data.guild.footer);
                        await sent.edit({embeds: [errorEmbed]});
                    }
                })
            }else{
                let errorEmbed = new MessageEmbed()
                    .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                    .setDescription(guild.translate("administration/embed:cancelled")
                        .replace('{emotes.error}', this.client.emotes.error))
                    .setColor(this.client.embedColor)
                    .setFooter(data.guild.footer);
                await sent.edit({embeds: [errorEmbed], components: []})
            }
        }else if(clicked.customId === 'consent_'+id+'_no'){
            let errorEmbed = new MessageEmbed()
                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                .setDescription(guild.translate("administration/embed:cancelled")
                    .replace('{emotes.error}', this.client.emotes.error))
                .setColor(this.client.embedColor)
                .setFooter(data.guild.footer);
            await sent.edit({embeds: [errorEmbed], components: []})
        }
    }
}
module.exports = Embed;
