const { MessageEmbed } = require('discord.js')
	, reply = require('../helper/simpleReply');

module.exports = async (client, message, query, tracks) => {

	let guildData = await client.findOrCreateGuild({id: message.guild.id})

	let embed = new MessageEmbed()
		.setAuthor(client.user.username, client.user.displayAvatarURL(), client.website)
		.setDescription(`${tracks.map((t, i) => `**${i + 1}** - ${t.title}`).join('\n')}`)
		.setColor(client.embedColor)
		.setFooter(guildData.footer);
	return reply.message(message, embed)
};
