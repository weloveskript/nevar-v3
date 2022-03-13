const Command = require('../../core/command');
const { MessageEmbed } = require('discord.js');
const {SlashCommandBuilder} = require("@discordjs/builders");
const akinator = require('discord.js-akinator');

class Akinator extends Command {

    constructor(client) {
        super(client, {
            name: "akinator",
            description: "minigames/akinator:general:description",
            dirname: __dirname,
            cooldown: 5000,
            slashCommand: {
                addCommand: true,
                data:
                    new SlashCommandBuilder()
            }
        });
    }

    async run(interaction, message, args, data) {

        let guild = message?.guild || interaction?.guild;
        let options = {
            language: data.guild.language.split("-")[0],
            childMode: true,
            gameType: "character",
            useButtons: true,
            embedColor: this.client.embedColor
        }

        let embed = new MessageEmbed()
            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
            .setDescription(guild.translate("minigames/akinator:main:start")
                .replace('{emotes.success}', this.client.emotes.success))
            .setColor(this.client.embedColor)
            .setFooter({text: data.guild.footer});
        if(message) await message.send(embed);
        if(interaction) await interaction.send(embed);

        await akinator(message ? message : interaction, options)

    }
}
module.exports = Akinator;
