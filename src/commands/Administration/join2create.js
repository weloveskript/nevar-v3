const Command = require('../../core/command');
const { MessageEmbed, MessageActionRow, MessageButton} = require('discord.js');
const {SlashCommandBuilder} = require("@discordjs/builders");
const Resolver = require('../../helper/resolver')

class Join2create extends Command {

    constructor(client) {
        super(client, {
            name: "join2create",
            description: "admin/j2c:general:description",
            dirname: __dirname,
            memberPermissions: ["MANAGE_GUILD"],
            botPermissions: ["MANAGE_CHANNELS"],
            aliases: ["j2c"],
            cooldown: 10000,
            premium: true,
            slashCommand: {
                addCommand: true,
                data: new SlashCommandBuilder()
            }
        });
    }
    async run(interaction, message, args, data) {
        const guild = interaction?.guild || message?.guild;
        const member = interaction?.member || message?.member;
        const channel = interaction?.channel || message?.channel;

        let embed = new MessageEmbed()
            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
            .setDescription(guild.translate("admin/j2c:main:choose")
                .replace('{emotes.arrow}', this.client.emotes.arrow))
            .setColor(this.client.embedColor)
            .setFooter(data.guild.footer);
        let id = message?.member?.user?.id || interaction?.member?.user?.id
        console.log(data.guild.plugins.joinToCreate.voice)
        let row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('join2create_' + id + '_edit')
                    .setLabel(guild.translate("admin/j2c:main:actions:1"))
                    .setEmoji('✏️')
                    .setStyle('PRIMARY'),
                new MessageButton()
                    .setCustomId('join2create_' + id + '_show')
                    .setLabel(guild.translate("admin/j2c:main:actions:2"))
                    .setEmoji('📝')
                    .setDisabled(data.guild.plugins.joinToCreate.enabled === false)
                    .setStyle('PRIMARY'),
                new MessageButton()
                    .setCustomId('join2create_' + id + '_disable')
                    .setLabel(guild.translate("admin/j2c:main:actions:3"))
                    .setEmoji('❌')
                    .setDisabled(data.guild.plugins.joinToCreate.enabled === false)
                    .setStyle('DANGER'),
            )
        let sent;
        if (message) sent = await message.send(embed, false, [row]);
        if (interaction) sent = await interaction.send(embed, false, [row]);

        const filter = i => i.customId.startsWith('join2create_' + id) && i.user.id === id;
        const clicked = await sent.awaitMessageComponent({filter, time: 120000}).catch(() => {
        });

        if (clicked) {
            if (clicked.customId === 'join2create_' + id + '_edit') {
                let embed = new MessageEmbed()
                    .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                    .setDescription(guild.translate("admin/j2c:main:collectors:channel")
                        .replace('{emotes.arrow}', this.client.emotes.arrow))
                    .setColor(this.client.embedColor)
                    .setFooter(data.guild.footer);
                await clicked.update({embeds: [embed], components: []})

                const collectChannel = channel.createMessageCollector(
                    {
                        filter: m => m.author.id === member.user.id,
                        time: 120000
                    }
                );
                collectChannel.on("collect", async (msg) => {
                    collectChannel.stop();
                    msg.delete().catch(() => {});
                    let channelSent = await Resolver.resolveChannel({
                        message: msg,
                        search: msg.content,
                        channelType: 'GUILD_VOICE'
                    });
                    if (!channelSent) {
                        let embed = new MessageEmbed()
                            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                            .setDescription(guild.translate("admin/j2c:main:invalid:channel")
                                .replace('{emotes.error}', this.client.emotes.error))
                            .setColor(this.client.embedColor)
                            .setFooter(data.guild.footer);
                        return sent.edit({embeds: [embed]});
                    } else {
                        let embed = new MessageEmbed()
                            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                            .setDescription(guild.translate("admin/j2c:main:collectors:userlimit")
                                .replace('{emotes.arrow}', this.client.emotes.arrow))
                            .setColor(this.client.embedColor)
                            .setFooter(data.guild.footer);
                        await sent.edit({embeds: [embed]});
                        const collectUserlimit = channel.createMessageCollector(
                            {
                                filter: m => m.author.id === member.user.id,
                                time: 120000
                            }
                        );
                        collectUserlimit.on("collect", async (msg) => {
                            collectUserlimit.stop();
                            msg.delete().catch(() => {
                            });
                            let userlimit = parseInt(msg.content);
                            if (userlimit && (userlimit >= 1 && userlimit <= 99) || userlimit === -1) {
                                let embed = new MessageEmbed()
                                    .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                                    .setDescription(guild.translate("admin/j2c:main:collectors:bitrate")
                                        .replace('{emotes.arrow}', this.client.emotes.arrow))
                                    .setColor(this.client.embedColor)
                                    .setFooter(data.guild.footer);
                                await sent.edit({embeds: [embed]});
                                const collectBitrate = channel.createMessageCollector(
                                    {
                                        filter: m => m.author.id === member.user.id,
                                        time: 120000
                                    }
                                );
                                collectBitrate.on("collect", async (msg) => {
                                    collectBitrate.stop();
                                    msg.delete().catch(() => {
                                    });
                                    let bitrate = parseInt(msg.content);
                                    if (bitrate >= 8 && bitrate <= 96) {
                                        data.guild.plugins.joinToCreate = {
                                            enabled: true,
                                            voice: channelSent.id,
                                            userLimit: userlimit,
                                            bitrate: bitrate,
                                            tempChannels: (data.guild.plugins.joinToCreate.tempChannels || [])
                                        };
                                        data.guild.markModified("plugins.joinToCreate");
                                        await data.guild.save();
                                        let embed = new MessageEmbed()
                                            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                                            .setDescription(guild.translate("admin/j2c:main:set")
                                                .replace('{emotes.success}', this.client.emotes.success))
                                            .setColor(this.client.embedColor)
                                            .setFooter(data.guild.footer);
                                        await sent.edit({embeds: [embed]});
                                    } else {
                                        let embed = new MessageEmbed()
                                            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                                            .setDescription(guild.translate("admin/j2c:main:invalid:bitrate")
                                                .replace('{emotes.error}', this.client.emotes.error))
                                            .setColor(this.client.embedColor)
                                            .setFooter(data.guild.footer);
                                        return sent.edit({embeds: [embed]});
                                    }
                                });
                            } else {
                                let embed = new MessageEmbed()
                                    .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                                    .setDescription(guild.translate("admin/j2c:main:invalid:userlimit")
                                        .replace('{emotes.error}', this.client.emotes.error))
                                    .setColor(this.client.embedColor)
                                    .setFooter(data.guild.footer);
                                return sent.edit({embeds: [embed]});
                            }
                        });
                    }
                });
            }
            if (clicked.customId === 'join2create_' + id + '_show') {
                let j2cChannel = guild.channels.cache.get(data.guild.plugins.joinToCreate.voice);
                if (j2cChannel) j2cChannel = j2cChannel.name;
                if (!j2cChannel) j2cChannel = guild.translate("language:notFound");
                let embed = new MessageEmbed()
                    .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                    .setDescription(guild.translate("admin/j2c:main:show")
                        .replace('{emotes.arrow}', this.client.emotes.arrow)
                        .replace('{channel}', '#' + j2cChannel)
                        .replace('{userlimit}', data.guild.plugins.joinToCreate.userLimit)
                        .replace('{bitrate}', data.guild.plugins.joinToCreate.bitrate + 'kbps'))
                    .setColor(this.client.embedColor)
                    .setFooter(data.guild.footer);
                await clicked.update({embeds: [embed], components: []})
            }
            if (clicked.customId === 'join2create_' + id + '_disable') {
                data.guild.plugins.joinToCreate = {
                    enabled: false,
                    voice: null,
                    userLimit: null,
                    bitrate: null,
                    tempChannels: []
                }
                data.guild.markModified("plugins.joinToCreate");
                await data.guild.save();
                let embed = new MessageEmbed()
                    .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                    .setDescription(guild.translate("admin/j2c:main:disabled")
                        .replace('{emotes.success}', this.client.emotes.success))
                    .setColor(this.client.embedColor)
                    .setFooter(data.guild.footer);
                await clicked.update({embeds: [embed], components: []})
            }
        }
    };
}

module.exports = Join2create;
