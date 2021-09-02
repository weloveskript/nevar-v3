const { MessageEmbed } = require('discord.js');

module.exports = async (client, message, queue, playlist) => {

	let guildData = await client.findOrCreateGuild({id: message.guild.id})
	let embed = new MessageEmbed()
		.setAuthor(client.user.username, client.user.displayAvatarURL(), client.website)
		.setDescription(message.translate("player/messages:playlistAdded")
			.replace('{emotes.playlist}', client.emotes.playlist)
			.replace('{count}', playlist.tracks.length)
			.replace('{title}', playlist.title))
		.setColor(client.embedColor)
		.setFooter(guildData.footer);

	message.send(embed)

};
