const Command = require('../../core/command');
const {SlashCommandBuilder} = require("@discordjs/builders");
const {MessageEmbed} = require("discord.js");

class Servericon extends Command {
    constructor(client) {
        super(client, {
            name: "servericon",
            dirname: __dirname,
            description: "misc/servericon:general:description",
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
            .setTitle(guild.translate('misc/servericon:main:icon')
                .replace('{server}', guild.name))
            .setImage(guild.iconURL() ? guild.iconURL({dynamic: true, size: 2048}) : 'https://cdn.discordapp.com/embed/avatars/' + (Math.floor(Math.random() * (5 - 1 + 1) + 1)).toString() +'.png')
            .setColor(this.client.embedColor)
            .setFooter({text: data.guild.footer});
        if (message) return message.send(embed);
        if (interaction) return interaction.send(embed);
    }
}

module.exports = Servericon;
