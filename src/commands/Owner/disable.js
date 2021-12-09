const Command = require('../../core/command');
const { MessageEmbed } = require('discord.js');
const fs = require('fs');


class Disable extends Command {
    constructor(client) {
        super(client, {
            name: "disable",
            description: "owner/disable:description",
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
				.setDescription(guild.translate("owner/disable:usage")
						.replace('{prefix}', data.guild.prefix)
						.replace('{emotes.use}', this.client.emotes.use) + '\n' +
					guild.translate("owner/disable:example")
						.replace('{prefix}', data.guild.prefix)
						.replace('{emotes.example}', this.client.emotes.example))
				.setColor(this.client.embedColor)
				.setFooter(data.guild.footer);
			if(message) return message.send(embed);
			if(interaction) return interaction.send(embed);
		}

        const command = args[0].toLowerCase()
			, cmd = this.client.commands.get(command) || this.client.commands.get(this.client.aliases.get(command))

        if(args[0].toLowerCase() === "list") {
        	let disabled = []
				, file = JSON.parse(fs.readFileSync("storage/disabledcmds.json"));

        	for (let attributename in file) {
        		disabled.push(file[attributename]);
        	}
        	if (disabled.length === 0) disabled = [guild.translate("language:noEntries")];

        	let embed = new MessageEmbed()
				.setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
				.setDescription(guild.translate("owner/disable:disabledList")
					.replace('{emotes.arrow}', this.client.emotes.arrow)
					.replace('{list}', disabled.join('\n|- ')))
				.setColor(this.client.embedColor)
				.setFooter(data.guild.footer);
        	if(interaction) return interaction.send(embed);
        	if(message) return message.send(embed);
		}
		if(!cmd){
			let embed = new MessageEmbed()
				.setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
				.setDescription(guild.translate("owner/disable:usage")
						.replace('{prefix}', data.guild.prefix)
						.replace('{emotes.use}', this.client.emotes.use) + '\n' +
					guild.translate("owner/disable:example")
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
			if(file[attributename].toLowerCase() === cmd.help.name){
				disabled = true;
			}
		}
		if(disabled){
			let embed = new MessageEmbed()
				.setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
				.setDescription(guild.translate("owner/disable:alreadyDisabled")
					.replace('{emotes.error}', this.client.emotes.error)
					.replace('{cmd}', cmd.help.name.toString().charAt(0).toUpperCase() + cmd.help.name.toString().slice(1)))
				.setColor(this.client.embedColor)
				.setFooter(data.guild.footer);
			if(interaction) return interaction.send(embed);
			if(message) return message.send(embed);
		}

		let disabledArr = [];
		disabledArr.push(cmd.help.name)
		for(let attributename in file){
			disabledArr.push(file[disabledArr].toLowerCase())
		}
		let json = JSON.stringify(disabledArr);
		fs.writeFileSync('storage/disabledcmds.json', json);

		let embed = new MessageEmbed()
			.setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
			.setDescription(guild.translate("owner/disable:disabled")
				.replace('{emotes.success}', this.client.emotes.success)
				.replace('{cmd}', cmd.help.name.toString().charAt(0).toUpperCase() + cmd.help.name.toString().slice(1)))
			.setColor(this.client.embedColor)
			.setFooter(data.guild.footer);
		if(interaction) interaction.send(embed);
		if(message) message.send(embed, false);
    }
}

module.exports = Disable;
