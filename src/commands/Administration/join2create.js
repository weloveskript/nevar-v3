const Command = require('../../core/command');
const { MessageEmbed } = require('discord.js');

class Join2create extends Command {

    constructor(client) {
        super(client, {
            name: "join2create",
            description: "admin/join2create:description",
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
            .setDescription(guild.translate("admin/join2create:sendChannel")
                .replace('{emotes.arrow}', this.client.emotes.arrow))
            .setColor(this.client.embedColor)
            .setFooter(data.guild.footer);
        let sent;

        if (message) sent = await message.send(embed, false);
        if (interaction) sent = await interaction.send(embed, false);

        const collectChannel = channel.createMessageCollector(
            {
                filter: m => m.author.id === member.user.id,
                time: 120000
            }
        );
        collectChannel.on("collect", async (msg) => {
            let chan;
            if(msg.mentions.channels.first()){
                chan = msg.mentions.channels.first();
            }else{
                chan = msg.guild.channels.cache.get(msg.content);
            }
            if(!chan || chan.type !== "GUILD_VOICE"){
                let embed = new MessageEmbed()
                    .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                    .setDescription(guild.translate("admin/join2create:wrongChannel")
                        .replace('{emotes.error}', this.client.emotes.error))
                    .setColor(this.client.embedColor)
                    .setFooter(data.guild.footer);
                msg.delete().catch(() => {});
                return sent.edit({embeds:[embed]});
            }
            msg.delete().catch(() => {});
            data.guild.plugins.joinToCreate.voice = chan.id;
            data.guild.markModified("plugins.joinToCreate")
            let embed = new MessageEmbed()
                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                .setDescription(guild.translate("admin/join2create:sendUserlimit")
                    .replace('{emotes.arrow}', this.client.emotes.arrow))
                .setColor(this.client.embedColor)
                .setFooter(data.guild.footer);
            await sent.edit({embeds:[embed]});
            collectChannel.stop();
            const collectUserlimit = channel.createMessageCollector(
                {
                    filter: m => m.author.id === member.user.id,
                    time: 120000
                }
            );
            collectUserlimit.on("collect", async (msg) => {

                if(!isNaN(msg.content)){
                    let i = Math.round(Number(msg.content));
                    if(i < 1 && i !== -1 || i > 99 && i !== -1){
                        let embed = new MessageEmbed()
                            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                            .setDescription(guild.translate("admin/join2create:invalidUserLimit")
                                .replace('{emotes.error}', this.client.emotes.error))
                            .setColor(this.client.embedColor)
                            .setFooter(data.guild.footer);
                        if (message) await sent.edit({embeds:[embed]});
                        if (interaction) await sent.edit({embeds:[embed]});
                        msg.delete().catch(() => {});
                        return collectUserlimit.stop();
                    }else{
                        data.guild.plugins.joinToCreate.userLimit = i;
                        data.guild.markModified("joinToCreate");
                        let embed = new MessageEmbed()
                            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                            .setDescription(guild.translate("admin/join2create:sendBitrate")
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
                                        .setDescription(guild.translate("admin/join2create:invalidBitrate")
                                            .replace('{emotes.error}', this.client.emotes.error))
                                        .setColor(this.client.embedColor)
                                        .setFooter(data.guild.footer);
                                    if (message) await sent.edit({embeds: [embed]});
                                    if (interaction) await sent.edit({embeds: [embed]});
                                    msg.delete().catch(() => {});
                                    return collectBitrate.stop();
                                } else {
                                    data.guild.plugins.joinToCreate.bitrate = i;
                                    data.guild.markModified("joinToCreate");
                                    let embed = new MessageEmbed()
                                        .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                                        .setDescription(guild.translate("admin/join2create:success")
                                            .replace('{emotes.success}', this.client.emotes.success))
                                        .setColor(this.client.embedColor)
                                        .setFooter(data.guild.footer);
                                    if (message) await sent.edit({embeds: [embed]});
                                    if (interaction) await sent.edit({embeds: [embed]});
                                    msg.delete().catch(() => {});
                                    collectBitrate.stop();
                                    data.guild.plugins.joinToCreate.bitrate = i;
                                    data.guild.markModified("joinToCreate");
                                    await data.guild.save();
                                }
                            }else{
                                let embed = new MessageEmbed()
                                    .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                                    .setDescription(guild.translate("admin/join2create:invalidBitrate")
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
                        .setDescription(guild.translate("admin/join2create:invalidUserLimit")
                            .replace('{emotes.error}', this.client.emotes.error))
                        .setColor(this.client.embedColor)
                        .setFooter(data.guild.footer);
                    if (message) await sent.edit({embeds:[embed]});
                    if (interaction) await sent.edit({embeds:[embed]});
                    msg.delete().catch(() => {});
                    return collectUserlimit.stop();
                }
            });
        });
    }
}

module.exports = Join2create;
