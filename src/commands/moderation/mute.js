const Command = require('../../core/command');
const { MessageEmbed} = require('discord.js');
const {SlashCommandBuilder} = require("@discordjs/builders");

class Mute extends Command {

    constructor(client) {
        super(client, {
            name: "mute",
            description: "moderation/mute:general:description",
            dirname: __dirname,
            cooldown: 5000,
            slashCommand: {
                addCommand: true,
                data: new SlashCommandBuilder()
            }
        });
    }

    async run(interaction, message, args, data) {

        let guild = interaction?.guild || message?.guild;
        let embed = new MessageEmbed()
            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
            .setDescription(guild.translate("moderation/mute:main:info")
                .replace('{emotes.info}', this.client.emotes.info))
            .setColor(this.client.embedColor)
            .setFooter({text: data.guild.footer});
        if(message) return message.send(embed, false);
        if(interaction) return interaction.send(embed);
    }
}

module.exports = Mute;
