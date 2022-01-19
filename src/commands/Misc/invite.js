const Command = require('../../core/command');
const { MessageEmbed, MessageActionRow, MessageButton} = require('discord.js');
const {SlashCommandBuilder} = require("@discordjs/builders");

class Invite extends Command {

    constructor(client) {
        super(client, {
            name: "invite",
            description: "misc/invite:general:description",
            dirname: __dirname,
            aliases: ["vote", "web"],
            cooldown: 5000,
            slashCommand: {
                addCommand: true,
                data: new SlashCommandBuilder()
            }
        });
    }
    async run(interaction, message, args, data){
        const guild = interaction?.guild || message.guild;

        let row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setLabel(guild.translate("misc/invite:invite:buttons:1"))
                    .setEmoji('➕')
                    .setURL('https://discord.com/oauth2/authorize?client_id=' + this.client.user.id + '&permissions=1899359446&scope=bot%20applications.commands')
                    .setStyle('LINK'),
                new MessageButton()
                    .setLabel(guild.translate("misc/invite:invite:buttons:2"))
                    .setEmoji('🆘')
                    .setURL(this.client.config.support.invite)
                    .setStyle('LINK'),
                new MessageButton()
                    .setLabel(guild.translate("misc/invite:invite:buttons:3"))
                    .setEmoji('🌐')
                    .setURL(this.client.config.general.website)
                    .setStyle('LINK'),
                new MessageButton()
                    .setLabel(guild.translate("misc/invite:invite:buttons:4"))
                    .setEmoji('⚙️')
                    .setURL(this.client.config.webdashboard.base_url)
                    .setStyle('LINK'),
                new MessageButton()
                    .setLabel(guild.translate("misc/invite:invite:buttons:5"))
                    .setEmoji('🗳️')
                    .setURL('https://top.gg/bot/' + this.client.user.id + '/vote')
                    .setStyle('LINK'),
            )

        let embed = new MessageEmbed()
            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
            .setDescription(guild.translate("misc/invite:invite:description")
                    .replace('{emotes.arrow}', this.client.emotes.arrow))
            .setColor(this.client.embedColor)
            .setFooter(data.guild.footer);
        if(message) return message.send(embed, false, [row]);
        if(interaction) return interaction.send(embed, false, [row]);
    }
}

module.exports = Invite;
