const Command = require('../../core/command');
const { MessageEmbed, MessageActionRow, MessageButton} = require('discord.js');
const {SlashCommandBuilder} = require("@discordjs/builders");

class Notify extends Command {

    constructor(client) {
        super(client, {
            name: "notify",
            description: "fun/notify:general:description",
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
            .setAuthor({
                name: this.client.user.username,
                iconURL: this.client.user.displayAvatarURL(),
                url: this.client.website
            })
            .setDescription(guild.translate("fun/notify:main:collectors:platform")
                .replace('{emotes.arrow}', this.client.emotes.arrow))
            .setColor(this.client.embedColor)
            .setFooter({text: data.guild.footer});
        let id = message?.member?.user?.id || interaction?.member?.user?.id
        let row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('notify_' + id + '_youtube')
                    .setLabel(guild.translate("fun/notify:main:actions:1"))
                    .setEmoji(this.client.emotes.youtube)
                    .setDisabled(true)
                    .setStyle('PRIMARY'),
                new MessageButton()
                    .setCustomId('notify_' + id + '_twitch')
                    .setLabel(guild.translate("fun/notify:main:actions:2"))
                    .setEmoji(this.client.emotes.twitch)
                    .setDisabled(true)
                    .setStyle('PRIMARY'),
                new MessageButton()
                    .setCustomId('notify_' + id + '_tiktok')
                    .setLabel(guild.translate("fun/notify:main:actions:3"))
                    .setEmoji(this.client.emotes.tiktok)
                    .setDisabled(true)
                    .setStyle('PRIMARY'),
            )
        let sent;
        if (message) sent = await message.send(embed, false, [row]);
        if (interaction) sent = await interaction.send(embed, false, [row]);

        const filter = i => i.customId.startsWith('setfooter_' + id) && i.user.id === id;

        const clicked = await sent.awaitMessageComponent({filter, time: 120000}).catch(() => {})

        if (clicked) {
            if (clicked.customId === 'setfooter_' + id + '_edit') {

            }
        }

    }
}
module.exports = Notify;
