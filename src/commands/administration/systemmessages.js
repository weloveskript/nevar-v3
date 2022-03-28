const Command = require('../../core/command');
const { MessageEmbed} = require('discord.js');
const { MessageButton, MessageActionRow } = require('discord.js');
const {SlashCommandBuilder} = require("@discordjs/builders");
const Resolver = require('../../helper/finder');

class Systemmessages extends Command {

    constructor(client) {
        super(client, {
            name: "systemmessages",
            description: "administration/systemmessages:general:description",
            dirname: __dirname,
            memberPermissions: ["MANAGE_GUILD"],
            aliases: ["goodbye", "welcome", "system-messages", "systemmessage"],
            cooldown: 10000,
            slashCommand: {
                addCommand: true,
                data:
                    new SlashCommandBuilder()
                        .addStringOption(option =>
                            option
                                .setRequired(true)
                                .addChoice('1', '3')
                                .addChoice('2', '4')
                        )
            }
        });
    }

    async run(interaction, message, args, data) {

        const guild = message?.guild || interaction?.guild;
        const channel = message?.channel || interaction?.channel;
        const member = message?.member || interaction?.member;

        if (!args[0]) {
            if(message) return message.send(this.client.usageEmbed(guild, this, data));
            if(interaction) return interaction.send(this.client.usageEmbed(guild, this, data));
        }

        if (args[0].toLowerCase() === "goodbye") {
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
                        .setCustomId('systemmessages_' + id + '_edit')
                        .setLabel(guild.translate("administration/systemmessages:main:actions:1"))
                        .setEmoji('✏️')
                        .setDisabled(data.guild.plugins.goodbye.enabled === false)
                        .setStyle('PRIMARY'),
                    new MessageButton()
                        .setCustomId('systemmessages_' + id + '_test')
                        .setLabel(guild.translate("administration/systemmessages:main:actions:2"))
                        .setEmoji('▶️')
                        .setDisabled(data.guild.plugins.goodbye.enabled === false)
                        .setStyle('PRIMARY'),
                    new MessageButton()
                        .setCustomId('systemmessages_' + id + '_enable')
                        .setLabel(guild.translate("administration/systemmessages:main:actions:3"))
                        .setEmoji('✅')
                        .setDisabled(data.guild.plugins.goodbye.enabled === true)
                        .setStyle('SUCCESS'),
                    new MessageButton()
                        .setCustomId('systemmessages_' + id + '_disable')
                        .setLabel(guild.translate("administration/systemmessages:main:actions:4"))
                        .setEmoji('❌')
                        .setDisabled(data.guild.plugins.goodbye.enabled === false)
                        .setStyle('DANGER'),
                )
            let sent;
            if (message) sent = await message.send(embed, false, [row]);
            if (interaction) sent = await interaction.send(embed, false, [row]);

            const filter = i => i.customId.startsWith('systemmessages_' + id) && i.user.id === id;

            const clicked = await sent.awaitMessageComponent({filter, time: 60000}).catch(() => {
            })

            if (clicked) {
                if (clicked.customId === 'systemmessages_' + id + '_edit') {
                    let embed = new MessageEmbed()
                        .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                        .setDescription(guild.translate("administration/systemmessages:main:collectors:message")
                            .replace('{emotes.arrow}', this.client.emotes.arrow)
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
                        let content = msg.content;
                        if (content.length > 1800) content = content.substring(0, 1800);
                        let embed = new MessageEmbed()
                            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                            .setDescription(guild.translate("language:collectors:channel")
                                .replace('{emotes.arrow}', this.client.emotes.arrow))
                            .setColor(this.client.embedColor)
                            .setFooter({text: data.guild.footer});
                        await sent.edit({embeds: [embed]});
                        const collectChannel = channel.createMessageCollector(
                            {
                                filter: m => m.author.id === member.user.id,
                                time: 120000
                            }
                        );
                        collectChannel.on("collect", async (msg) => {
                            collectChannel.stop();
                            msg.delete().catch(() => {});
                            let channel = await Resolver.resolveChannel({
                                message: msg,
                                search: msg.content,
                                channelType: "GUILD_TEXT"
                            });
                            if (channel) {
                                data.guild.plugins.goodbye.message = content;
                                data.guild.plugins.goodbye.channel = channel.id;
                                data.guild.markModified("plugins.goodbye");
                                await data.guild.save();
                                let embed = new MessageEmbed()
                                    .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                                    .setDescription(guild.translate("administration/systemmessages:main:goodbye:success")
                                        .replace('{emotes.success}', this.client.emotes.success))
                                    .setColor(this.client.embedColor)
                                    .setFooter({text: data.guild.footer});
                                await sent.edit({embeds: [embed]});
                            } else {
                                let embed = new MessageEmbed()
                                    .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                                    .setDescription(guild.translate("language:invalid:channel")
                                        .replace('{emotes.error}', this.client.emotes.error))
                                    .setColor(this.client.embedColor)
                                    .setFooter({text: data.guild.footer});
                                await sent.edit({embeds: [embed]});
                            }
                        });
                    });
                }
                if (clicked.customId === 'systemmessages_' + id + '_test') {
                    this.client.emit("guildMemberRemove", member);
                    let embed = new MessageEmbed()
                        .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                        .setDescription(guild.translate("administration/systemmessages:main:executed")
                            .replace('{emotes.success}', this.client.emotes.success))
                        .setColor(this.client.embedColor)
                        .setFooter({text: data.guild.footer});
                    await clicked.update({embeds: [embed], components: []});
                }
                if (clicked.customId === 'systemmessages_' + id + '_enable') {
                    data.guild.plugins.goodbye.enabled = true;
                    data.guild.markModified("plugins.goodbye");
                    await data.guild.save();
                    let embed = new MessageEmbed()
                        .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                        .setDescription(guild.translate("administration/systemmessages:main:goodbye:enabled")
                            .replace('{emotes.success}', this.client.emotes.success))
                        .setColor(this.client.embedColor)
                        .setFooter({text: data.guild.footer});
                    await clicked.update({embeds: [embed], components: []});
                }
                if (clicked.customId === 'systemmessages_' + id + '_disable') {
                    data.guild.plugins.goodbye.enabled = false;
                    data.guild.markModified("plugins.goodbye");
                    await data.guild.save();
                    let embed = new MessageEmbed()
                        .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                        .setDescription(guild.translate("administration/systemmessages:main:goodbye:disabled")
                            .replace('{emotes.success}', this.client.emotes.success))
                        .setColor(this.client.embedColor)
                        .setFooter({text: data.guild.footer});
                    await clicked.update({embeds: [embed], components: []});
                }
            }
        }
        if (args[0].toLowerCase() === "welcome") {
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
                        .setCustomId('systemmessages_' + id + '_edit')
                        .setLabel(guild.translate("administration/systemmessages:main:actions:1"))
                        .setEmoji('✏️')
                        .setDisabled(data.guild.plugins.welcome.enabled === false)
                        .setStyle('PRIMARY'),
                    new MessageButton()
                        .setCustomId('systemmessages_' + id + '_test')
                        .setLabel(guild.translate("administration/systemmessages:main:actions:2"))
                        .setEmoji('▶️')
                        .setDisabled(data.guild.plugins.welcome.enabled === false)
                        .setStyle('PRIMARY'),
                    new MessageButton()
                        .setCustomId('systemmessages_' + id + '_enable')
                        .setLabel(guild.translate("administration/systemmessages:main:actions:3"))
                        .setEmoji('✅')
                        .setDisabled(data.guild.plugins.welcome.enabled === true)
                        .setStyle('SUCCESS'),
                    new MessageButton()
                        .setCustomId('systemmessages_' + id + '_disable')
                        .setLabel(guild.translate("administration/systemmessages:main:actions:4"))
                        .setEmoji('❌')
                        .setDisabled(data.guild.plugins.welcome.enabled === false)
                        .setStyle('DANGER'),
                )
            let sent;
            if (message) sent = await message.send(embed, false, [row]);
            if (interaction) sent = await interaction.send(embed, false, [row]);

            const filter = i => i.customId.startsWith('systemmessages_' + id) && i.user.id === id;

            const clicked = await sent.awaitMessageComponent({filter, time: 60000}).catch(() => {
            })

            if (clicked) {
                if (clicked.customId === 'systemmessages_' + id + '_edit') {
                    let embed = new MessageEmbed()
                        .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                        .setDescription(guild.translate("administration/systemmessages:main:collectors:message")
                            .replace('{emotes.arrow}', this.client.emotes.arrow)
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
                        let content = msg.content;
                        if (content.length > 1800) content = content.substring(0, 1800);
                        let embed = new MessageEmbed()
                            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                            .setDescription(guild.translate("language:collectors:channel")
                                .replace('{emotes.arrow}', this.client.emotes.arrow))
                            .setColor(this.client.embedColor)
                            .setFooter({text: data.guild.footer});
                        await sent.edit({embeds: [embed]});
                        const collectChannel = channel.createMessageCollector(
                            {
                                filter: m => m.author.id === member.user.id,
                                time: 120000
                            }
                        );
                        collectChannel.on("collect", async (msg) => {
                            collectChannel.stop();
                            msg.delete().catch(() => {});
                            let channel = await Resolver.resolveChannel({
                                message: msg,
                                search: msg.content,
                                channelType: "GUILD_TEXT"
                            });
                            if (channel) {
                                data.guild.plugins.welcome.message = content;
                                data.guild.plugins.welcome.channel = channel.id;
                                data.guild.markModified("plugins.welcome");
                                await data.guild.save();
                                let embed = new MessageEmbed()
                                    .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                                    .setDescription(guild.translate("administration/systemmessages:main:welcome:success")
                                        .replace('{emotes.success}', this.client.emotes.success))
                                    .setColor(this.client.embedColor)
                                    .setFooter({text: data.guild.footer});
                                await sent.edit({embeds: [embed]});
                            } else {
                                let embed = new MessageEmbed()
                                    .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                                    .setDescription(guild.translate("language:invalid:channel")
                                        .replace('{emotes.error}', this.client.emotes.error))
                                    .setColor(this.client.embedColor)
                                    .setFooter({text: data.guild.footer});
                                await sent.edit({embeds: [embed]});
                            }
                        });
                    });
                }
                if (clicked.customId === 'systemmessages_' + id + '_test') {
                    this.client.emit("guildMemberAdd", member);
                    let embed = new MessageEmbed()
                        .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                        .setDescription(guild.translate("administration/systemmessages:main:executed")
                            .replace('{emotes.success}', this.client.emotes.success))
                        .setColor(this.client.embedColor)
                        .setFooter({text: data.guild.footer});
                    await clicked.update({embeds: [embed], components: []});
                }
                if (clicked.customId === 'systemmessages_' + id + '_enable') {
                    data.guild.plugins.welcome.enabled = true;
                    data.guild.markModified("plugins.welcome");
                    await data.guild.save();
                    let embed = new MessageEmbed()
                        .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                        .setDescription(guild.translate("administration/systemmessages:main:welcome:enabled")
                            .replace('{emotes.success}', this.client.emotes.success))
                        .setColor(this.client.embedColor)
                        .setFooter({text: data.guild.footer});
                    await clicked.update({embeds: [embed], components: []});
                }
                if (clicked.customId === 'systemmessages_' + id + '_disable') {
                    data.guild.plugins.welcome.enabled = false;
                    data.guild.markModified("plugins.welcome");
                    await data.guild.save();
                    let embed = new MessageEmbed()
                        .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                        .setDescription(guild.translate("administration/systemmessages:main:welcome:disabled")
                            .replace('{emotes.success}', this.client.emotes.success))
                        .setColor(this.client.embedColor)
                        .setFooter({text: data.guild.footer});
                    await clicked.update({embeds: [embed], components: []});
                }
            }
        }
    };
}

module.exports = Systemmessages;
