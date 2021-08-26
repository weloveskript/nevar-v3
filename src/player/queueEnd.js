const { MessageEmbed } = require('discord.js')
	, reply = require('../helper/simpleReply')
	, config = require('../../config.json');

module.exports = async (client, message, queue) => {

	let guildData = await client.findOrCreateGuild({id: message.guild.id})

	let embed = new MessageEmbed()
		.setAuthor(client.user.username, client.user.displayAvatarURL(), client.website)
		.setDescription(message.translate("player/messages:queueEnd")
			.replace('{emotes.stop}', client.emotes.stop))
		.setColor(client.embedColor)
		.setFooter(guildData.footer);
	reply.message(message, embed)

	await client.wait(config.music.stay_time * 1000);

	if (!client.player.getQueue(message)){
		await message.guild.me.voice.channel.leave();
	}

};
