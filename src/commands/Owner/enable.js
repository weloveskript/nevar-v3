const Command = require('../../structure/Command')
    , { MessageEmbed } = require('discord.js')
    , Discord = require('discord.js');

class Enable extends Command {
    constructor(client) {
        super(client, {
            name: "enable",
            description: "owner/enable:description",
            dirname: __dirname,
            memberPermissions: ["SEND_MESSAGES"],
            botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
            ownerOnly: false,
            staffOnly: true,
            cooldown: 20000,
            slashCommand: {
                addCommand: true
            }
        });
    }
    async run(interaction, message, args, data) {
		const fs = require('fs')
        const command = args[0];
		const cmd = this.client.commands.get(command) || this.client.commands.get(this.client.aliases.get(command));
		if(!cmd){
			let embed = new MessageEmbed()
				.setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
				.setDescription(message.translate("owner/enable:usage")
					.replace('{emotes.use}', this.client.emotes.use)
					.replace('{prefix}', data.guild.prefix))
				.setColor(this.client.embedColor)
				.setFooter(data.guild.footer);
			if (interaction) return interaction.send(embed);
			if (message) return message.send(embed, false)
		}

		let disablestate = false;
		let file = JSON.parse(fs.readFileSync("storage/disabledcmds.json"));
		for(let attributename in file){
			if(file[attributename].toLowerCase() === cmd.help.name) {
				disablestate = true;
			}
		}

		if(!disablestate) {
			let embed = new MessageEmbed()
				.setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
				.setDescription(message.translate("owner/enable:isNot")
					.replace('{emotes.error}', this.client.emotes.use)
					.replace('{cmd}', cmd.help.name))
				.setColor(this.client.embedColor)
				.setFooter(data.guild.footer);
			if(interaction) return interaction.send(embed);
			if(message) return message.send(embed, false)
		}

		const removeData = cmd.help.name;
		const dataa = fs.readFileSync('storage/disabledcmds.json');
		let json = JSON.parse(dataa);
		json = json.filter((name) => { return name !== cmd.help.name });
		fs.writeFileSync('storage/disabledcmds.json', JSON.stringify(json, null, 2));


		let embed = new MessageEmbed()
			.setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
			.setDescription(message.translate("owner/enable:enabled")
				.replace('{emotes.success}', this.client.emotes.success)
				.replace('{cmd}', cmd.help.name))
			.setColor(this.client.embedColor)
			.setFooter(data.guild.footer);
		if(interaction) return interaction.send(embed);
		if(message) return message.send(embed, false)
    }
}

module.exports = Enable;