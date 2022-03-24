const Command = require('../../core/command');
const {MessageEmbed} = require("discord.js");
const { spawn } = require('child_process');


class Reboot extends Command {
    constructor(client){
        super(client, {
            name: "reboot",
            dirname: __dirname,
            description: "owner/reboot:general:description",
            cooldown: 3000,
            ownerOnly: true,
            slashCommand: {
                addCommand: false
            }
        });
    }

    async run(interaction, message, args, data){
        let guild = interaction?.guild || message?.guild;

        let embed = new MessageEmbed()
            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
            .setDescription(guild.translate("owner/reboot:main:message")
                .replace('{emotes.arrow}', this.client.emotes.arrow))
            .setColor(this.client.embedColor)
            .setFooter({text: data.guild.footer});
        if (message) await message.send(embed);
        if (interaction) await interaction.send(embed);

        process.exit(1);




    }
}

module.exports = Reboot;
