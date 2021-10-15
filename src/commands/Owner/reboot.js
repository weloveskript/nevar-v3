const Command = require('../../structure/Command')
    , { MessageEmbed } = require('discord.js')
    , Discord = require('discord.js');

class Reboot extends Command {
    constructor(client) {
        super(client, {
            name: "reboot",
            description: "owner/reboot:description",
            dirname: __dirname,
            aliases: ["rb"],
            memberPermissions: ["SEND_MESSAGES"],
            botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
            ownerOnly: true,
            staffOnly: false,
            cooldown: 20000,
            slashCommand: {
                addCommand: true
            }
        });
    }
    async run(interaction, message, args, data){
        let guild = interaction?.guild || message?.guild
            , member = interaction?.member || message?.member
            , channel = interaction?.channel || message?.channel;
        if(message) {
            let embed = new MessageEmbed()
			.setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
			.setDescription(guild.translate("owner/reboot:reboot")
				.replace('{emotes.arrow}', this.client.emotes.arrow))
			.setColor(this.client.embedColor)
			.setFooter(data.guild.footer);
		message.send(embed, false).then(async msg => {
			process.exit(42)
		})
        } else if (interaction) {
            let embed = new MessageEmbed()
			.setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
			.setDescription(guild.translate("owner/reboot:reboot")
				.replace('{emotes.arrow}', this.client.emotes.arrow))
			.setColor(this.client.embedColor)
			.setFooter(data.guild.footer);
		interaction.send(embed).then(async msg => {
            console.log('Bot wird neugestartet.')
			process.exit(42)
		})
        }
        
    }
   
}

module.exports = Reboot;