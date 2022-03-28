const Command = require('../../core/command');
const { MessageEmbed, MessageActionRow, MessageButton} = require('discord.js');
const ms = require('ms');
const {SlashCommandBuilder} = require("@discordjs/builders");
const Resolver = require('../../helper/finder');

class Autodelete extends Command {

    constructor(client) {
        super(client, {
            name: "autodelete",
            description: "administration/autodelete:general:description",
            dirname: __dirname,
            memberPermissions: ["MANAGE_GUILD"],
            premium: true,
            cooldown: 2000,
            slashCommand: {
                addCommand: true,
                data: new SlashCommandBuilder(),
            }
        });
    }

    async run(interaction, message, args, data) {

        const guild = message?.guild || interaction?.guild;
        const channel = message?.channel || interaction?.channel;
        const member = message?.member || interaction?.member;

        let embed = new MessageEmbed()
            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
            .setDescription(guild.translate("language:collectors:action")
                .replace('{emotes.arrow}', this.client.emotes.arrow))
            .setColor(this.client.embedColor)
            .setFooter({text: data.guild.footer});
        let id = message?.member?.user?.id || interaction?.member?.user?.id
        let row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('autodelete_' + id + '_add')
                    .setLabel(guild.translate("administration/autodelete:main:actions:1"))
                    .setEmoji('➕')
                    .setStyle('SUCCESS'),
                new MessageButton()
                    .setCustomId('autodelete_' + id + '_list')
                    .setLabel(guild.translate("administration/autodelete:main:actions:2"))
                    .setEmoji('📝')
                    .setDisabled(data.guild.plugins.autoDeleteChannels.length === 0)
                    .setStyle('PRIMARY'),
                new MessageButton()
                    .setCustomId('autodelete_' + id + '_remove')
                    .setLabel(guild.translate("administration/autodelete:main:actions:3"))
                    .setEmoji('➖')
                    .setDisabled(data.guild.plugins.autoDeleteChannels.length === 0)
                    .setStyle('DANGER'),
            )
        let sent;
        if (message) sent = await message.send(embed, false, [row]);
        if (interaction) sent = await interaction.send(embed, false, [row]);

        const filter = i => i.customId.startsWith('autodelete_' + id) && i.user.id === id;

        const clicked = await sent.awaitMessageComponent({filter, time: 120000}).catch(() => {})

        if (clicked) {
            if (clicked.customId === 'autodelete_' + id + '_add') {
                let embed = new MessageEmbed()
                    .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                    .setDescription(guild.translate("language:collectors:channel")
                        .replace('{emotes.arrow}', this.client.emotes.arrow))
                    .setColor(this.client.embedColor)
                    .setFooter({text: data.guild.footer});
                await clicked.update({embeds: [embed], components: []});
                const collectMessage = channel.createMessageCollector(
                    {
                        filter: m => m.author.id === member.user.id,
                        time: 120000
                    }
                );
                collectMessage.on("collect", async (msg) => {
                    collectMessage.stop();
                    msg.delete().catch(() => {});
                    let channelSent = await Resolver.resolveChannel({
                        message: msg,
                        search: msg.content,
                        channelType: 'GUILD_TEXT',
                    });
                    if(channelSent){
                        let embed = new MessageEmbed()
                            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                            .setDescription(guild.translate("language:collectors:time")
                                .replace('{emotes.arrow}', this.client.emotes.arrow)
                                .replace('{emotes.arrow}', this.client.emotes.arrow))
                            .setColor(this.client.embedColor)
                            .setFooter({text: data.guild.footer});
                        await sent.edit({embeds: [embed]});
                        const collectMessage = channel.createMessageCollector(
                            {
                                filter: m => m.author.id === member.user.id,
                                time: 120000
                            }
                        );
                        collectMessage.on("collect", async (msg) => {
                            collectMessage.stop();
                            msg.delete().catch(() => {});
                            let time = ms(msg.content);
                            if(time){
                                if(time <= 604800000){
                                    for (let val of data.guild.plugins.autoDeleteChannels) {
                                        if (val.split(' | ')[0] === channelSent.id) {
                                            data.guild.plugins.autoDeleteChannels = data.guild.plugins.autoDeleteChannels.filter((ch) => ch !== val)
                                        }
                                    }
                                    data.guild.plugins.autoDeleteChannels.push(channelSent.id + ' | ' + time);
                                    data.guild.markModified("plugins.autoDeleteChannels");
                                    await data.guild.save();
                                    let embed = new MessageEmbed()
                                        .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                                        .setDescription(guild.translate("administration/autodelete:main:set")
                                            .replace('{emotes.success}', this.client.emotes.success)
                                            .replace('{channel}', channelSent)
                                            .replace('{time}', ms(time)))
                                        .setColor(this.client.embedColor)
                                        .setFooter({text: data.guild.footer});
                                    await sent.edit({embeds: [embed]});

                                }else{
                                    let embed = new MessageEmbed()
                                        .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                                        .setDescription(guild.translate("administration/autodelete:main:errors:maxTime")
                                            .replace('{emotes.error}', this.client.emotes.error))
                                        .setColor(this.client.embedColor)
                                        .setFooter({text: data.guild.footer});
                                    return sent.edit({embeds: [embed]});
                                }
                            }else{
                                let embed = new MessageEmbed()
                                    .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                                    .setDescription(guild.translate("language:invalid:time")
                                        .replace('{emotes.error}', this.client.emotes.error))
                                    .setColor(this.client.embedColor)
                                    .setFooter({text: data.guild.footer});
                                return sent.edit({embeds: [embed]});
                            }
                        });

                    }else{
                        let embed = new MessageEmbed()
                            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                            .setDescription(guild.translate("language:invalid:channel")
                                .replace('{emotes.error}', this.client.emotes.error))
                            .setColor(this.client.embedColor)
                            .setFooter({text: data.guild.footer});
                        return sent.edit({embeds: [embed]});
                    }
                });
            }
            if (clicked.customId === 'autodelete_' + id + '_list') {
                let autodelete = [];
                for(let val of data.guild.plugins.autoDeleteChannels){
                    let channelId = val.split(' | ')[0];
                    let time = Number(val.split(' | ')[1]);
                    let channel = guild.channels.cache.get(channelId);
                    if(channel) autodelete.push(channel.name + ' | ' + ms(time));
                }
                let embed = new MessageEmbed()
                    .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                    .setDescription(guild.translate("administration/autodelete:main:list")
                        .replace('{emotes.arrow}', this.client.emotes.arrow)
                        .replace('{list}', autodelete.join('\n|- ')))
                    .setColor(this.client.embedColor)
                    .setFooter({text: data.guild.footer});
                await clicked.update({embeds: [embed], components: []});

            }
            if (clicked.customId === 'autodelete_' + id + '_remove') {
                let embed = new MessageEmbed()
                    .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                    .setDescription(guild.translate("language:collectors:channel")
                        .replace('{emotes.arrow}', this.client.emotes.arrow))
                    .setColor(this.client.embedColor)
                    .setFooter({text: data.guild.footer});
                await clicked.update({embeds: [embed], components: []});
                const collectMessage = channel.createMessageCollector(
                    {
                        filter: m => m.author.id === member.user.id,
                        time: 120000
                    }
                );
                collectMessage.on("collect", async (msg) => {
                    collectMessage.stop();
                    msg.delete().catch(() => {});
                    let channelSent = await Resolver.resolveChannel({
                        message: msg,
                        search: msg.content,
                        channelType: 'GUILD_TEXT',
                    });
                    if (channelSent) {
                        for(let val of data.guild.plugins.autoDeleteChannels){
                            if(val.split(' | ')[0].toString() === channelSent.id.toString()) {
                                data.guild.plugins.autoDeleteChannels.splice(data.guild.plugins.autoDeleteChannels.indexOf(val), 1);
                                data.guild.markModified("plugins.autoDeleteChannels");
                                await data.guild.save();
                            }
                        }
                        let embed = new MessageEmbed()
                            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                            .setDescription(guild.translate("administration/autodelete:main:removed")
                                .replace('{emotes.success}', this.client.emotes.success)
                                .replace('{channel}', channelSent))
                            .setColor(this.client.embedColor)
                            .setFooter({text: data.guild.footer});
                        return sent.edit({embeds: [embed]});
                    }else{
                        let embed = new MessageEmbed()
                            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                            .setDescription(guild.translate("language:invalid:channel")
                                .replace('{emotes.error}', this.client.emotes.error))
                            .setColor(this.client.embedColor)
                            .setFooter({text: data.guild.footer});
                        return sent.edit({embeds: [embed]});
                    }
                });
            }
        }
    };
}

module.exports = Autodelete;

