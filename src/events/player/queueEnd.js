const { MessageEmbed } = require('discord.js');

module.exports = async (client, queue) => {

	let channel = queue.metadata;
	let guild = queue.guild;

	let guildData = await client.findOrCreateGuild({id: channel.guild.id})

	let embed = new MessageEmbed()
		.setAuthor({name: client.user.username, iconURL: client.user.displayAvatarURL(), url: client.website})
		.setDescription(guild.translate("player/messages:queueEnd")
			.replace('{emotes.stop}', client.emotes.stop))
		.setColor(client.embedColor)
		.setFooter({text: guildData.footer});
	return channel.send({embeds: [embed]})

};
