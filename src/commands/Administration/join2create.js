const Command = require('../../core/command')
    , { MessageEmbed } = require('discord.js')
    , { MessageActionRow, MessageSelectMenu } = require('discord.js');

class Join2create extends Command {

    constructor(client) {
        super(client, {
            name: "join2create",
            description: "administration/join2create:description",
            dirname: __dirname,
            memberPermissions: ["MANAGE_GUILD"],
            cooldown: 10000,
            premium: true,
            slashCommand: {
                addCommand: true
            }
        });
    }
    async run(interaction, message, args, data){
        let guild = interaction?.guild || message?.guild
            , member = interaction?.member || message?.member
            , channel = interaction?.channel || message?.channel;

        let embed = new MessageEmbed()
            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
            .setDescription(guild.translate("administration/join2create:sendChannel")
                .replace('{emotes.arrow}', this.client.emotes.arrow))
            .setColor(this.client.embedColor)
            .setFooter(data.guild.footer);
        let sent;

        let row = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId('select_'+member.user.id)
                    .setPlaceholder(guild.translate("administration/join2create:chooseChannel"))
            )
        for(let channel of guild.channels.cache){
            let option = {
                label: channel[1].name,
                value: member.user.id+'_'+channel[1].id
            }
            if(channel[1].type === "GUILD_VOICE") row.components[0].options.push(option)
        }
        if (message) sent = await message.send(embed, false, [row]);
        if (interaction) sent = await interaction.send(embed, false, [row]);

        const filter = i => (i.customId === 'select_'+member.user.id) && i.user.id === member.user.id;

        const clicked = await sent.awaitMessageComponent({ filter, time: 20000 }).catch(() => {})

        if(clicked){
            data.guild.joinToCreate.voice = clicked.values[0].toString().split('_')[1];
            data.guild.markModified("joinToCreate")
            let embed = new MessageEmbed()
                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                .setDescription(guild.translate("administration/join2create:sendUserlimit")
                    .replace('{emotes.arrow}', this.client.emotes.arrow))
                .setColor(this.client.embedColor)
                .setFooter(data.guild.footer);
            await clicked.update({embeds:[embed], components: []});
            const collectUserlimit = channel.createMessageCollector(
                {
                    filter: m => m.author.id === member.user.id,
                    time: 120000
                }
            );
            collectUserlimit.on("collect", async (msg) => {

                if(!isNaN(msg.content)){
                    let i = Math.round(Number(msg.content));
                    if(i < 1 || i > 99){
                        let embed = new MessageEmbed()
                            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                            .setDescription(guild.translate("administration/join2create:invalidUserLimit")
                                .replace('{emotes.error}', this.client.emotes.error))
                            .setColor(this.client.embedColor)
                            .setFooter(data.guild.footer);
                        if (message) await sent.edit({embeds:[embed]});
                        if (interaction) await sent.edit({embeds:[embed]});
                        msg.delete().catch(() => {});
                        return collectUserlimit.stop();
                    }else{
                        data.guild.joinToCreate.userLimit = i;
                        data.guild.markModified("joinToCreate");
                        let embed = new MessageEmbed()
                            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                            .setDescription(guild.translate("administration/join2create:sendBitrate")
                                .replace('{emotes.arrow}', this.client.emotes.arrow))
                            .setColor(this.client.embedColor)
                            .setFooter(data.guild.footer);
                        if (message) await sent.edit({embeds:[embed]});
                        if (interaction) await sent.edit({embeds:[embed]});
                        msg.delete().catch(() => {});
                        collectUserlimit.stop();


                        const collectBitrate = channel.createMessageCollector(
                            {
                                filter: m => m.author.id === member.user.id,
                                time: 120000
                            }
                        );
                        collectBitrate.on("collect", async (msg) => {
                            if(!isNaN(msg.content)) {
                                let i = Math.round(Number(msg.content));
                                if (i < 8 || i > 96) {
                                    let embed = new MessageEmbed()
                                        .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                                        .setDescription(guild.translate("administration/join2create:invalidBitrate")
                                            .replace('{emotes.error}', this.client.emotes.error))
                                        .setColor(this.client.embedColor)
                                        .setFooter(data.guild.footer);
                                    if (message) await sent.edit({embeds: [embed]});
                                    if (interaction) await sent.edit({embeds: [embed]});
                                    msg.delete().catch(() => {});
                                    return collectBitrate.stop();
                                } else {
                                    data.guild.joinToCreate.bitrate = i;
                                    data.guild.markModified("joinToCreate");
                                    let embed = new MessageEmbed()
                                        .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                                        .setDescription(guild.translate("administration/join2create:success")
                                            .replace('{emotes.success}', this.client.emotes.success))
                                        .setColor(this.client.embedColor)
                                        .setFooter(data.guild.footer);
                                    if (message) await sent.edit({embeds: [embed]});
                                    if (interaction) await sent.edit({embeds: [embed]});
                                    msg.delete().catch(() => {});
                                    collectBitrate.stop();
                                    data.guild.joinToCreate.bitrate = i;
                                    data.guild.markModified("joinToCreate");
                                    await data.guild.save();
                                }
                            }else{
                                let embed = new MessageEmbed()
                                    .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                                    .setDescription(guild.translate("administration/join2create:invalidBitrate")
                                        .replace('{emotes.error}', this.client.emotes.error))
                                    .setColor(this.client.embedColor)
                                    .setFooter(data.guild.footer);
                                if (message) await sent.edit({embeds: [embed]});
                                if (interaction) await sent.edit({embeds: [embed]});
                                msg.delete().catch(() => {});
                                return collectBitrate.stop();
                            }
                        });
                    }
                }else{
                    let embed = new MessageEmbed()
                        .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                        .setDescription(guild.translate("administration/join2create:invalidUserLimit")
                            .replace('{emotes.error}', this.client.emotes.error))
                        .setColor(this.client.embedColor)
                        .setFooter(data.guild.footer);
                    if (message) await sent.edit({embeds:[embed]});
                    if (interaction) await sent.edit({embeds:[embed]});
                    msg.delete().catch(() => {});
                    return collectUserlimit.stop();
                }
            });
        }
    }
}

module.exports = Join2create;
