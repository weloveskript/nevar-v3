const { MessageEmbed } = require('discord.js')
	, reply = require('../helper/simpleReply');

module.exports = async (client, message, query, tracks, content, collector) => {
	let guildData = await client.findOrCreateGuild({id: message.guild.id})

	if (content === 'cancel') {
		collector.stop();
		return message.react(client.emotes.success)
	} else {

		let embed = new MessageEmbed()
			.setAuthor(client.user.username, client.user.displayAvatarURL(), client.website)
			.setDescription(message.translate("player/messages:invalidResponse")
				.replace('{emotes.error}', client.emotes.error)
				.replace('{count}', tracks.length))
			.setColor(client.embedColor)
			.setFooter(guildData.footer);
		return reply.message(message, embed)

	}
};
