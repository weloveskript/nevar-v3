const { MessageEmbed } = require('discord.js')
	, reply = require('../helper/simpleReply');



module.exports = async (client, error, message, ...args) => {
	let guildData = await client.findOrCreateGuild({id: message.guild.id})
	switch (error) {
		case 'NotPlaying':
			let embed = new MessageEmbed()
				.setAuthor(client.user.username, client.user.displayAvatarURL(), client.website)
				.setDescription(message.translate("player/messages:error_nothingIsPlaying")
					.replace('{emotes.error}', client.emotes.error))
				.setColor(client.embedColor)
				.setFooter(guildData.footer);
			reply.message(message, embed)
			break;
		case 'NotConnected':
			let embed2 = new MessageEmbed()
				.setAuthor(client.user.username, client.user.displayAvatarURL(), client.website)
				.setDescription(message.translate("player/messages:error_noVoiceConnection")
					.replace('{emotes.error}', client.emotes.error))
				.setColor(client.embedColor)
				.setFooter(guildData.footer);
			reply.message(message, embed2)
			break;
		case 'UnableToJoin':
			let embed3 = new MessageEmbed()
				.setAuthor(client.user.username, client.user.displayAvatarURL(), client.website)
				.setDescription(message.translate("player/messages:error_cantJoin")
					.replace('{emotes.error}', client.emotes.error))
				.setColor(client.embedColor)
				.setFooter(guildData.footer);
			reply.message(message, embed3)
			break;
		case 'VideoUnavailable':
			let embed4 = new MessageEmbed()
				.setAuthor(client.user.username, client.user.displayAvatarURL(), client.website)
				.setDescription(message.translate("player/messages:error_notAvailabe")
					.replace('{emotes.error}', client.emotes.error))
				.setColor(client.embedColor)
				.setFooter(guildData.footer);
			reply.message(message, embed4)
			break;
		case 'MusicStarting':
			break;
		default:
			message.guild.me.voice.channel.leave();
			client.player.setRepeatMode(message, false);
			let embed5 = new MessageEmbed()
				.setAuthor(client.user.username, client.user.displayAvatarURL(), client.website)
				.setDescription(message.translate("player/messages:error_other")
					.replace('{emotes.error}', client.emotes.error)
					.replace('{emotes.arrow}', client.emotes.arrow)
					.replace('{support}', client.supportUrl))
				.setColor(client.embedColor)
				.setFooter(guildData.footer);
			reply.message(message, embed5)
	}
};
