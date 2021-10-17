const Command = require('../../structure/Command')
    , { MessageEmbed } = require('discord.js')
    , spawn = require('child_process').spawn;

class Reboot extends Command {
    constructor(client) {
        super(client, {
            name: "reboot",
            description: "owner/reboot:description",
            dirname: __dirname,
            aliases: ["rb"],
            ownerOnly: true,
            cooldown: 20000,
            slashCommand: {
                addCommand: false
            }
        });
    }
    async run(interaction, message, args, data){
        let guild = interaction?.guild || message?.guild;

        let embed = new MessageEmbed()
			.setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
			.setDescription(guild.translate("owner/reboot:reboot")
				.replace('{emotes.arrow}', this.client.emotes.arrow))
			.setColor(this.client.embedColor)
			.setFooter(data.guild.footer);
        if(interaction) {
            interaction.send(embed).then(async () => {
                this.client.logger.log("Restarting..", "debug")
			    process.exit(0)
		    })
        }
        if(message) {
            message.send(embed).then(async () => {
                this.client.logger.log("Restarting..", "debug")
                process.exit(0)
            })
        }

    }

}

module.exports = Reboot;
