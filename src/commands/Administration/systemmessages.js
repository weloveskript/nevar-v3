const Command = require('../../core/command');
const { MessageEmbed} = require('discord.js');
const { MessageButton, MessageActionRow } = require('discord.js');
const {SlashCommandBuilder} = require("@discordjs/builders");

class Systemmessages extends Command {

    constructor(client) {
        super(client, {
            name: "systemmessages",
            description: "admin/sm:general:description",
            dirname: __dirname,
            memberPermissions: ["MANAGE_GUILD"],
            aliases: ["goodbye", "welcome", "system-messages", "systemmessage"],
            cooldown: 10000,
            slashCommand: {
                addCommand: true,
                data:
                    new SlashCommandBuilder()
                        .addStringOption(option =>
                            option.setName('admin/sm:slash:1:name')
                                .setDescription('admin/sm:slash:1:description')
                                .setRequired(true)
                                .addChoice('admin/sm:slash:1:choices:1:name', 'welcome')
                                .addChoice('admin/sm:slash:1:choices:2:name', 'goodbye')
                        )
            }
        });
    }

    async run(interaction, message, args, data) {

        const guild = message?.guild || interaction?.guild;
        const channel = message?.channel || interaction?.channel;
        const member = message?.member || interaction?.member;

        if (!args[0]) {
            let embed = new MessageEmbed()
                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                .setDescription(guild.translate("admin/sm:general:usage")
                        .replace('{prefix}', data.guild.prefix)
                        .replace('{emotes.use}', this.client.emotes.use) + '\n' +
                    guild.translate("admin/sm:general:example")
                        .replace('{prefix}', data.guild.prefix)
                        .replace('{emotes.example}', this.client.emotes.example))
                .setColor(this.client.embedColor)
                .setFooter(data.guild.footer);
            if (message) return message.send(embed);
            if (interaction) return interaction.send(embed);
        }

        if (args[0].toLowerCase() === "goodbye") {
            let embed = new MessageEmbed()
                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                .setDescription(guild.translate("admin/sm:main:chooseAction")
                    .replace('{emotes.arrow}', this.client.emotes.arrow))
                .setColor(this.client.embedColor)
                .setFooter(data.guild.footer);
            let id = message?.member?.user?.id || interaction?.member?.user?.id
            let row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('systemmessages_' + id + '_edit')
                        .setLabel(guild.translate("admin/sm:main:actions:1"))
                        .setEmoji('✏️')
                        .setDisabled(data.guild.plugins.goodbye.enabled === false)
                        .setStyle('PRIMARY'),
                    new MessageButton()
                        .setCustomId('systemmessages_' + id + '_test')
                        .setLabel(guild.translate("admin/sm:main:actions:2"))
                        .setEmoji('▶️')
                        .setDisabled(data.guild.plugins.goodbye.enabled === false)
                        .setStyle('PRIMARY'),
                    new MessageButton()
                        .setCustomId('systemmessages_' + id + '_enable')
                        .setLabel(guild.translate("admin/sm:main:actions:3"))
                        .setEmoji('✅')
                        .setDisabled(data.guild.plugins.goodbye.enabled === true)
                        .setStyle('SUCCESS'),
                    new MessageButton()
                        .setCustomId('systemmessages_' + id + '_disable')
                        .setLabel(guild.translate("admin/sm:main:actions:4"))
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
                        .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                        .setDescription(guild.translate("admin/sm:collectors:message")
                            .replace('{emotes.arrow}', this.client.emotes.arrow)
                            .replace('{emotes.arrow}', this.client.emotes.arrow))
                        .setColor(this.client.embedColor)
                        .setFooter(data.guild.footer);
                    await clicked.update({embeds: [embed], components: []});
                    const collectMessage = channel.createMessageCollector(
                        {
                            filter: m => m.author.id === member.user.id,
                            time: 120000
                        }
                    );
                    collectMessage.on("collect", async (msg) => {
                        collectMessage.stop();
                        let content = msg.content;
                        await msg.delete().catch(() => {
                        });
                        if (content.length > 1800) content = content.substring(0, 1800);
                        let embed = new MessageEmbed()
                            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                            .setDescription(guild.translate("admin/sm:collectors:channel")
                                .replace('{emotes.arrow}', this.client.emotes.arrow))
                            .setColor(this.client.embedColor)
                            .setFooter(data.guild.footer);
                        await sent.edit({embeds: [embed]});
                        const collectChannel = channel.createMessageCollector(
                            {
                                filter: m => m.author.id === member.user.id,
                                time: 120000
                            }
                        );
                        collectChannel.on("collect", async (channelMsg) => {
                            collectChannel.stop();
                            let sentChannel;
                            if (channelMsg.mentions.channels.first()) {
                                sentChannel = channelMsg.mentions.channels.first();
                            } else {
                                sentChannel = channelMsg.guild.channels.cache.get(channelMsg.content);
                            }
                            await channelMsg.delete().catch(() => {
                            });
                            if (sentChannel && (sentChannel.type === "GUILD_TEXT" || sentChannel.type === "GUILD_NEWS")) {
                                data.guild.plugins.goodbye.message = content;
                                data.guild.plugins.goodbye.channel = sentChannel.id;
                                data.guild.markModified("plugins.goodbye");
                                await data.guild.save();
                                let embed = new MessageEmbed()
                                    .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                                    .setDescription(guild.translate("admin/sm:goodbye:success")
                                        .replace('{emotes.success}', this.client.emotes.success))
                                    .setColor(this.client.embedColor)
                                    .setFooter(data.guild.footer);
                                await sent.edit({embeds: [embed]});
                            } else {
                                let embed = new MessageEmbed()
                                    .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                                    .setDescription(guild.translate("admin/sm:main:invalidChannel")
                                        .replace('{emotes.error}', this.client.emotes.error))
                                    .setColor(this.client.embedColor)
                                    .setFooter(data.guild.footer);
                                await sent.edit({embeds: [embed]});
                            }
                        });
                    });
                }
                if (clicked.customId === 'systemmessages_' + id + '_test') {
                    this.client.emit("guildMemberRemove", member);
                    let embed = new MessageEmbed()
                        .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                        .setDescription(guild.translate("admin/sm:main:executed")
                            .replace('{emotes.success}', this.client.emotes.success))
                        .setColor(this.client.embedColor)
                        .setFooter(data.guild.footer);
                    await clicked.update({embeds: [embed], components: []});
                }
                if (clicked.customId === 'systemmessages_' + id + '_enable') {
                    data.guild.plugins.goodbye.enabled = true;
                    data.guild.markModified("plugins.goodbye");
                    await data.guild.save();
                    let embed = new MessageEmbed()
                        .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                        .setDescription(guild.translate("admin/sm:goodbye:enabled")
                            .replace('{emotes.success}', this.client.emotes.success))
                        .setColor(this.client.embedColor)
                        .setFooter(data.guild.footer);
                    await clicked.update({embeds: [embed], components: []});
                }
                if (clicked.customId === 'systemmessages_' + id + '_disable') {
                    data.guild.plugins.goodbye.enabled = false;
                    data.guild.markModified("plugins.goodbye");
                    await data.guild.save();
                    let embed = new MessageEmbed()
                        .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                        .setDescription(guild.translate("admin/sm:goodbye:disabled")
                            .replace('{emotes.success}', this.client.emotes.success))
                        .setColor(this.client.embedColor)
                        .setFooter(data.guild.footer);
                    await clicked.update({embeds: [embed], components: []});
                }
            }
        }
        if (args[0].toLowerCase() === "welcome") {
            let embed = new MessageEmbed()
                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                .setDescription(guild.translate("admin/sm:main:chooseAction")
                    .replace('{emotes.arrow}', this.client.emotes.arrow))
                .setColor(this.client.embedColor)
                .setFooter(data.guild.footer);
            let id = message?.member?.user?.id || interaction?.member?.user?.id
            let row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('systemmessages_' + id + '_edit')
                        .setLabel(guild.translate("admin/sm:main:actions:1"))
                        .setEmoji('✏️')
                        .setDisabled(data.guild.plugins.welcome.enabled === false)
                        .setStyle('PRIMARY'),
                    new MessageButton()
                        .setCustomId('systemmessages_' + id + '_test')
                        .setLabel(guild.translate("admin/sm:main:actions:2"))
                        .setEmoji('▶️')
                        .setDisabled(data.guild.plugins.welcome.enabled === false)
                        .setStyle('PRIMARY'),
                    new MessageButton()
                        .setCustomId('systemmessages_' + id + '_enable')
                        .setLabel(guild.translate("admin/sm:main:actions:3"))
                        .setEmoji('✅')
                        .setDisabled(data.guild.plugins.welcome.enabled === true)
                        .setStyle('SUCCESS'),
                    new MessageButton()
                        .setCustomId('systemmessages_' + id + '_disable')
                        .setLabel(guild.translate("admin/sm:main:actions:4"))
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
                        .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                        .setDescription(guild.translate("admin/sm:collectors:message")
                            .replace('{emotes.arrow}', this.client.emotes.arrow)
                            .replace('{emotes.arrow}', this.client.emotes.arrow))
                        .setColor(this.client.embedColor)
                        .setFooter(data.guild.footer);
                    await clicked.update({embeds: [embed], components: []});
                    const collectMessage = channel.createMessageCollector(
                        {
                            filter: m => m.author.id === member.user.id,
                            time: 120000
                        }
                    );
                    collectMessage.on("collect", async (msg) => {
                        collectMessage.stop();
                        let content = msg.content;
                        await msg.delete().catch(() => {
                        });
                        if (content.length > 1800) content = content.substring(0, 1800);
                        let embed = new MessageEmbed()
                            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                            .setDescription(guild.translate("admin/sm:collectors:channel")
                                .replace('{emotes.arrow}', this.client.emotes.arrow))
                            .setColor(this.client.embedColor)
                            .setFooter(data.guild.footer);
                        await sent.edit({embeds: [embed]});
                        const collectChannel = channel.createMessageCollector(
                            {
                                filter: m => m.author.id === member.user.id,
                                time: 120000
                            }
                        );
                        collectChannel.on("collect", async (channelMsg) => {
                            collectChannel.stop();
                            let sentChannel;
                            if (channelMsg.mentions.channels.first()) {
                                sentChannel = channelMsg.mentions.channels.first();
                            } else {
                                sentChannel = channelMsg.guild.channels.cache.get(channelMsg.content);
                            }
                            await channelMsg.delete().catch(() => {
                            });
                            if (sentChannel && (sentChannel.type === "GUILD_TEXT" || sentChannel.type === "GUILD_NEWS")) {
                                data.guild.plugins.welcome.message = content;
                                data.guild.plugins.welcome.channel = sentChannel.id;
                                data.guild.markModified("plugins.welcome");
                                await data.guild.save();
                                let embed = new MessageEmbed()
                                    .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                                    .setDescription(guild.translate("admin/sm:welcome:success")
                                        .replace('{emotes.success}', this.client.emotes.success))
                                    .setColor(this.client.embedColor)
                                    .setFooter(data.guild.footer);
                                await sent.edit({embeds: [embed]});
                            } else {
                                let embed = new MessageEmbed()
                                    .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                                    .setDescription(guild.translate("admin/sm:main:invalidChannel")
                                        .replace('{emotes.error}', this.client.emotes.error))
                                    .setColor(this.client.embedColor)
                                    .setFooter(data.guild.footer);
                                await sent.edit({embeds: [embed]});
                            }
                        });
                    });
                }
                if (clicked.customId === 'systemmessages_' + id + '_test') {
                    this.client.emit("guildMemberAdd", member);
                    let embed = new MessageEmbed()
                        .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                        .setDescription(guild.translate("admin/sm:main:executed")
                            .replace('{emotes.success}', this.client.emotes.success))
                        .setColor(this.client.embedColor)
                        .setFooter(data.guild.footer);
                    await clicked.update({embeds: [embed], components: []});
                }
                if (clicked.customId === 'systemmessages_' + id + '_enable') {
                    data.guild.plugins.welcome.enabled = true;
                    data.guild.markModified("plugins.welcome");
                    await data.guild.save();
                    let embed = new MessageEmbed()
                        .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                        .setDescription(guild.translate("admin/sm:welcome:enabled")
                            .replace('{emotes.success}', this.client.emotes.success))
                        .setColor(this.client.embedColor)
                        .setFooter(data.guild.footer);
                    await clicked.update({embeds: [embed], components: []});
                }
                if (clicked.customId === 'systemmessages_' + id + '_disable') {
                    data.guild.plugins.welcome.enabled = false;
                    data.guild.markModified("plugins.welcome");
                    await data.guild.save();
                    let embed = new MessageEmbed()
                        .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                        .setDescription(guild.translate("admin/sm:welcome:disabled")
                            .replace('{emotes.success}', this.client.emotes.success))
                        .setColor(this.client.embedColor)
                        .setFooter(data.guild.footer);
                    await clicked.update({embeds: [embed], components: []});
                }
            }
        }
    }
}

module.exports = Systemmessages;
