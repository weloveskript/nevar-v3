const { MessageEmbed } = require('discord.js');

module.exports = async (client, queue, track) => {

	let guild = queue.guild;
	let channel = queue.metadata;

	let guildData = await client.findOrCreateGuild({id: guild.id})

	let embed = new MessageEmbed()
		.setAuthor(client.user.username, client.user.displayAvatarURL(), client.website)
		.setDescription(guild.translate("player/messages:nowPlaying")
			.replace('{emotes.play}', client.emotes.play)
			.replace('{track}', track.title)
			.replace('{channel}', queue.connection.channel.id))
		.setColor(client.embedColor)
		.setFooter(guildData.footer);
	console.log(queue.interaction)
	return channel.send({embeds:[embed]})
};
