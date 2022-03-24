const Command = require('../../core/command');
const {MessageEmbed} = require("discord.js");
const slashCommandHandler = require('../../helper/slashCommands');

class Updateslash extends Command {
    constructor(client){
        super(client, {
            name: "updateslash",
            dirname: __dirname,
            description: "owner/updateslash:general:description",
            cooldown: 3000,
            ownerOnly: true,
            slashCommand: {
                addCommand: false
            }
        });
    }

    async run(interaction, message, args, data){
        let guild = interaction?.guild || message?.guild;

        await slashCommandHandler.init(this.client);
        let embed = new MessageEmbed()
            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
            .setDescription(guild.translate("owner/updateslash:main:message")
                .replace('{emotes.success}', this.client.emotes.success)
                .replace('{emotes.arrow}', this.client.emotes.arrow))
            .setColor(this.client.embedColor)
            .setFooter({text: data.guild.footer});
        if (message) return message.send(embed);
        if (interaction) return interaction.send(embed);
    }
}

module.exports = Updateslash;
