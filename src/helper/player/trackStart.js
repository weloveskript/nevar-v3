const { MessageEmbed } = require('discord.js');

module.exports = async (client, message, track) => {

	let guildData = await client.findOrCreateGuild({id: message.guild.id})

	let embed = new MessageEmbed()
		.setAuthor(client.user.username, client.user.displayAvatarURL(), client.website)
		.setDescription(message.translate("player/messages:trackAdded")
			.replace('{emotes.play}', client.emotes.play)
			.replace('{track}', track.title)
			.replace('{channel}', message.member.voice.channel.id))
		.setColor(client.embedColor)
		.setFooter(guildData.footer);
	return message.send(embed)
};
