const Command = require('../../structure/Command')
    , { MessageEmbed } = require('discord.js')
    , Discord = require('discord.js');

class Disable extends Command {
    constructor(client) {
        super(client, {
            name: "disable",
            description: "owner/disable:description",
            dirname: __dirname,
            memberPermissions: ["SEND_MESSAGES"],
            botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
            ownerOnly: false,
            staffOnly: true,
            cooldown: 20000,
            slashCommand: {
                addCommand: true,
				options: [
                    {
                        name: "owner/disable:slashOption1",
                        description: "owner/disable:slashOption1Desc",
                        type: "STRING",
                        required: true
                    },


                ]
            }
        });
    }
    async run(interaction, message, args, data) {
        const command = args[0];
		const cmd = this.client.commands.get(command) || this.client.commands.get(this.client.aliases.get(command));
        const fs = require('fs')
        const guild = interaction?.guild || message?.guild
            , member = interaction?.member || message?.member
            , channel = interaction?.channel || message?.channel;
        if(args[0] === "list") {
			if (interaction) {
				let disabled = [];
				let file = JSON.parse(fs.readFileSync("storage/disabledcmds.json"));
				for (let attributename in file) {
					disabled.push(file[attributename]);
				}
				if (disabled.length === 0) disabled = [guild.translate("owner/disable:noDisabled")]
				let embed = new MessageEmbed()
					.setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
					.setDescription(`${this.client.emotes.nevar.logo_small_transparent} | ${guild.translate("owner/disable:disabledList")}\n\n${this.client.emotes.arrow} ${disabled.join(`\n ${this.client.emotes.arrow}`)}`)
					.setColor(this.client.embedColor)
					.setFooter(data.guild.footer);
				return interaction.send(embed);
			} else 	if(message) {
				let disabled = [];
				let file = JSON.parse(fs.readFileSync("storage/disabledcmds.json"));
				for (let attributename in file) {
					disabled.push(file[attributename]);
				}
				if (disabled.length === 0) disabled = [guild.translate("owner/disable:noDisabled")]
				let embed = new MessageEmbed()
					.setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
					.setDescription(`${this.client.emotes.nevar.logo_small_transparent} | ${guild.translate("owner/disable:disabledList")}\n\n${this.client.emotes.arrow} ${disabled.join(`\n ${this.client.emotes.arrow}`)}`)
					.setColor(this.client.embedColor)
					.setFooter(data.guild.footer);
				return message.send(embed, false);
			}

		}
		if(!cmd){
			let embed = new MessageEmbed()
				.setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
				.setDescription(guild.translate("owner/disable:usage")
					.replace('{emotes.use}', this.client.emotes.use)
					.replace('{prefix}', data.guild.prefix))
				.setColor(this.client.embedColor)
				.setFooter(data.guild.footer);
			if(interaction) return interaction.send(embed);
			if(message) return message.send(embed, false)
		}

		let disablestate = false;
		let file = JSON.parse(fs.readFileSync("storage/disabledcmds.json"));
		for(let attributename in file){
			if(file[attributename].toLowerCase() === cmd.help.name) {
				disablestate = true;
			}
		}
		if(disablestate) {
			let embed = new MessageEmbed()
				.setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
				.setDescription(guild.translate("owner/disable:alreadyDisabled")
					.replace('{emotes.error}', this.client.emotes.error)
					.replace('{cmd}', cmd.help.name))
				.setColor(this.client.embedColor)
				.setFooter(data.guild.footer);
			if(interaction) interaction.send(embed);
			if(message) message.send(embed, false);
			return
		}
		let disabled = [];
		disabled.push(cmd.help.name)
		for(let attributename in file){
			disabled.push(file[attributename].toLowerCase())
		}
		let json = JSON.stringify(disabled);
		fs.writeFileSync('storage/disabledcmds.json', json);
		let embed = new MessageEmbed()
			.setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
			.setDescription(guild.translate("owner/disable:disabled")
				.replace('{emotes.success}', this.client.emotes.success)
				.replace('{cmd}', cmd.help.name))
			.setColor(this.client.embedColor)
			.setFooter(data.guild.footer);
		if(interaction) interaction.send(embed);
		if(message) message.send(embed, false);
    }
}

module.exports = Disable;