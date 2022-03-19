const { MessageEmbed } = require('discord.js');

module.exports = async (client, queue, track) => {

	let guild = queue.guild;
	let channel = queue.metadata;

	let guildData = await client.findOrCreateGuild({id: guild.id})

	let embed = new MessageEmbed()
		.setAuthor({name: client.user.username, iconURL: client.user.displayAvatarURL(), url: client.website})
		.setDescription(guild.translate("player/messages:nowPlaying")
			.replace('{emotes.play}', client.emotes.play)
			.replace('{track}', track.title)
			.replace('{channel}', queue.connection.channel.id))
		.setColor(client.embedColor)
		.setFooter({text: guildData.footer});
	return channel.send({embeds:[embed]})
};
