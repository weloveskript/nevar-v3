const Command = require('../../core/command');
const {SlashCommandBuilder} = require("@discordjs/builders");
const {MessageEmbed} = require("discord.js");

class Serverbanner extends Command {
    constructor(client) {
        super(client, {
            name: "serverbanner",
            dirname: __dirname,
            description: "misc/serverbanner:general:description",
            cooldown: 3000,
            slashCommand: {
                addCommand: true,
                data:
                    new SlashCommandBuilder()
            }
        });
    }

    async run(interaction, message, args, data) {

        let guild = interaction?.guild || message?.guild;
        let member = interaction?.member || message?.member;


        let embed = new MessageEmbed()
            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
            .setTitle(guild.translate('misc/serverbanner:main:icon')
                .replace('{server}', guild.name))
            .setImage(guild.bannerURL() ? guild.bannerURL({dynamic: true, size: 2048}) : 'https://discord.com/assets/ff41b628a47ef3141164bfedb04fb220.png')
            .setColor(this.client.embedColor)
            .setFooter({text: data.guild.footer});
        if (message) return message.send(embed);
        if (interaction) return interaction.send(embed);
    }
}

module.exports = Serverbanner;
