const { MessageEmbed } = require('discord.js')
	, reply = require('../helper/simpleReply');

module.exports = async (client, message, query) => {

	let guildData = await client.findOrCreateGuild({id: message.guild.id})



	let embed = new MessageEmbed()
		.setAuthor(client.user.username, client.user.displayAvatarURL(), client.website)
		.setDescription(message.translate("player/messages:noResults")
			.replace('{emotes.error}', client.emotes.error)
			.replace('{query}', query))
		.setColor(client.embedColor)
		.setFooter(guildData.footer);

	reply.message(message, embed)
};
