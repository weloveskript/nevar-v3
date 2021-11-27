const Command = require('../../core/command')
    , { MessageEmbed } = require('discord.js')
    , Resolvers = require('../../helper/resolver')
    , Discord = require('discord.js');

class Reactionrole extends Command {

    constructor(client) {
        super(client, {
            name: "reactionrole",
            description: "administration/reactionrole:description",
            aliases: ["reactionroles", "reaction-roles", "reaction-roles"],
            dirname: __dirname,
            memberPermissions: ["MANAGE_GUILD"],
            cooldown: 10000,
            slashCommand: {
                addCommand: true
            }
        });
    }

    async run(interaction, message, args, data){

        let guild = message?.guild || interaction?.guild
            , member = message?.member || interaction?.member
            , channel = message?.channel || interaction?.channel
            , sent;

        let embed = new MessageEmbed()
            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
            .setDescription(guild.translate("administration/reactionrole:sendId")
                .replace('{emotes.arrow}', this.client.emotes.arrow))
            .setColor(this.client.embedColor)
            .setFooter(data.guild.footer);
        if (message) sent = await message.send(embed);
        if (interaction) sent = await interaction.send(embed);

        const collectId = channel.createMessageCollector(
            {
                filter: m => m.author.id === member.user.id,
                time: 120000
            }
        );
        collectId.on("collect", async (msg) => {
                if(isNaN(msg.content)){
                    let embed = new MessageEmbed()
                        .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                        .setDescription(guild.translate("administration/reactionrole:invalidId")
                            .replace('{emotes.error}', this.client.emotes.error))
                        .setColor(this.client.embedColor)
                        .setFooter(data.guild.footer);
                    sent.edit({embeds: [embed]});
                    msg.delete().catch(() => {});
                    return collectId.stop();
                }else {
                    if(msg.content.length === 18){
                        channel.messages.fetch(msg.content).catch(() => {
                            let embed = new MessageEmbed()
                                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                                .setDescription(guild.translate("administration/reactionrole:invalidId")
                                    .replace('{emotes.error}', this.client.emotes.error))
                                .setColor(this.client.embedColor)
                                .setFooter(data.guild.footer);
                            sent.edit({embeds: [embed]});
                            msg.delete().catch(() => {});
                            return collectId.stop();
                        }).then(async (fetchedMsg) => {
                            let embed = new MessageEmbed()
                                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                                .setDescription(guild.translate("administration/reactionrole:sendRole")
                                    .replace('{emotes.arrow}', this.client.emotes.arrow))
                                .setColor(this.client.embedColor)
                                .setFooter(data.guild.footer);
                            sent.edit({embeds: [embed]});
                            collectId.stop();
                            msg.delete().catch(() => {});
                            const collectRole = channel.createMessageCollector(
                                {
                                    filter: m => m.author.id === member.user.id,
                                    time: 120000
                                }
                            );
                            collectRole.on("collect", async (msg) => {
                                let role;
                                if(msg.mentions.roles.first()){
                                    role = msg.mentions.roles.first();
                                }else{
                                    role = guild.roles.cache.get(msg.content);
                                }
                                if(role){
                                    let embed = new MessageEmbed()
                                        .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                                        .setDescription(guild.translate("administration/reactionrole:sendEmote")
                                            .replace('{emotes.arrow}', this.client.emotes.arrow))
                                        .setColor(this.client.embedColor)
                                        .setFooter(data.guild.footer);
                                    sent.edit({embeds: [embed]});
                                    collectRole.stop();
                                    msg.delete().catch(() => {});
                                    const collectEmoji = channel.createMessageCollector(
                                        {
                                            filter: m => m.author.id === member.user.id,
                                            time: 120000
                                        }
                                    );
                                    collectEmoji.on("collect", async (msg) => {
                                        const emoteParse = Discord.Util.parseEmoji(msg.content);
                                        let emote;
                                        if(emoteParse?.id){
                                            emote = emoteParse.id;
                                        }else{
                                            let regex = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;
                                            if(regex.test(msg.content.split(' ')[0])){
                                                emote = msg.content.split(' ')[0];
                                            }else{
                                                let embed = new MessageEmbed()
                                                    .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                                                    .setDescription(guild.translate("administration/reactionrole:invalidEmote")
                                                        .replace('{emotes.error}', this.client.emotes.error))
                                                    .setColor(this.client.embedColor)
                                                    .setFooter(data.guild.footer);
                                                sent.edit({embeds: [embed]});
                                                msg.delete().catch(() => {});
                                                return collectEmoji.stop();
                                            }
                                        }
                                        fetchedMsg.react(emote).catch(() => {});
                                        data.guild.reactionRoles.push(fetchedMsg.id + ' | ' + emote + ' | ' + role.id);
                                        await data.guild.save();
                                        let embed = new MessageEmbed()
                                            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                                            .setDescription(guild.translate("administration/reactionrole:successfully")
                                                .replace('{emotes.success}', this.client.emotes.success))
                                            .setColor(this.client.embedColor)
                                            .setFooter(data.guild.footer);
                                        sent.edit({embeds: [embed]});
                                        msg.delete().catch(() => {});
                                        return collectEmoji.stop();
                                    });
                                }else{
                                    let embed = new MessageEmbed()
                                        .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                                        .setDescription(guild.translate("administration/reactionrole:invalidRole")
                                            .replace('{emotes.error}', this.client.emotes.error))
                                        .setColor(this.client.embedColor)
                                        .setFooter(data.guild.footer);
                                    sent.edit({embeds: [embed]});
                                    msg.delete().catch(() => {});
                                    return collectRole.stop();
                                }
                            });
                        })
                    }else{
                        let embed = new MessageEmbed()
                            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                            .setDescription(guild.translate("administration/reactionrole:invalidId")
                                .replace('{emotes.error}', this.client.emotes.error))
                            .setColor(this.client.embedColor)
                            .setFooter(data.guild.footer);
                        sent.edit({embeds: [embed]});
                        msg.delete().catch(() => {});
                        return collectId.stop();
                    }
                }

        });
    }
}

module.exports = Reactionrole;
