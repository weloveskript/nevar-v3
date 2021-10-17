const Command = require('../../structure/Command')
    , { MessageEmbed } = require('discord.js')
	, fs = require('fs');

class Enable extends Command {
    constructor(client) {
        super(client, {
            name: "enable",
            description: "owner/enable:description",
            dirname: __dirname,
            ownerOnly: true,
            cooldown: 20000,
            slashCommand: {
                addCommand: false
            }
        });
    }
    async run(interaction, message, args, data) {
		const guild = interaction?.guild || message?.guild;

		if(!args[0]){
			let embed = new MessageEmbed()
				.setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
				.setDescription(guild.translate("owner/enable:usage")
						.replace('{prefix}', data.guild.prefix)
						.replace('{emotes.use}', this.client.emotes.use) + '\n' +
					guild.translate("owner/enable:example")
						.replace('{prefix}', data.guild.prefix)
						.replace('{emotes.example}', this.client.emotes.example))
				.setColor(this.client.embedColor)
				.setFooter(data.guild.footer);
			if(message) return message.send(embed);
			if(interaction) return interaction.send(embed);
		}
		const command = args[0]
			, cmd = this.client.commands.get(command) || this.client.commands.get(this.client.aliases.get(command));

		if(!cmd){
			let embed = new MessageEmbed()
				.setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
				.setDescription(guild.translate("owner/enable:usage")
						.replace('{prefix}', data.guild.prefix)
						.replace('{emotes.use}', this.client.emotes.use) + '\n' +
					guild.translate("owner/enable:example")
						.replace('{prefix}', data.guild.prefix)
						.replace('{emotes.example}', this.client.emotes.example))
				.setColor(this.client.embedColor)
				.setFooter(data.guild.footer);
			if(message) return message.send(embed);
			if(interaction) return interaction.send(embed);
		}

		let disabled
			, file = JSON.parse(fs.readFileSync('storage/disabledcmds.json'));

		for(let attributename in file){
			if(file[attributename].toLowerCase() === cmd.help.name) {
				disabled = true;
			}
		}

		if(!disabled) {
			let embed = new MessageEmbed()
				.setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
				.setDescription(guild.translate("owner/enable:isNot")
					.replace('{emotes.error}', this.client.emotes.use)
					.replace('{cmd}', cmd.help.name.toString().charAt(0).toUpperCase() + cmd.help.name.toString().slice(1)))
				.setColor(this.client.embedColor)
				.setFooter(data.guild.footer);
			if(interaction) return interaction.send(embed);
			if(message) return message.send(embed, false)
		}

		let remove = cmd.help.name
			, jsonData = fs.readFileSync('storage/disabledcmds.json')
			,json = JSON.parse(jsonData);

		json = json.filter((value) => value !== cmd.help.name);
		fs.writeFileSync('storage/disabledcmds.json', JSON.stringify(json, null, 2));


		let embed = new MessageEmbed()
			.setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
			.setDescription(guild.translate("owner/enable:enabled")
				.replace('{emotes.success}', this.client.emotes.success)
				.replace('{cmd}', cmd.help.name.toString().charAt(0).toUpperCase() + cmd.help.name.toString().slice(1)))
			.setColor(this.client.embedColor)
			.setFooter(data.guild.footer);
		if(interaction) return interaction.send(embed);
		if(message) return message.send(embed, false)
    }
}

module.exports = Enable;
