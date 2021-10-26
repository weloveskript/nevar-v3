const { MessageEmbed } = require('discord.js');

module.exports = async (client, message, queue, track) => {

	let guildData = await client.findOrCreateGuild({id: message.guild.id})

	let embed = new MessageEmbed()
		.setAuthor(client.user.username, client.user.displayAvatarURL(), client.website)
		.setDescription(message.translate("player/messages:trackAdded")
			.replace('{emotes.play}', client.emotes.play)
			.replace('{track}', track.title))
		.setColor(client.embedColor)
		.setFooter(guildData.footer);
	return message.send(embed)

};
