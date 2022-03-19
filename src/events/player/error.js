const {MessageEmbed} = require("discord.js");
module.exports = async (client, queue, error) => {

	let channel = queue.metadata;
	let guild = queue.guild;

	let guildData = await client.findOrCreateGuild({id: guild.id})


	let embed = new MessageEmbed()
		.setAuthor({name: client.user.username, iconURL: client.user.displayAvatarURL(), url: client.website})
		.setDescription(guild.translate("player/messages:error")
			.replace('{emotes.error}', client.emotes.error)
			.replace('{emotes.arrow}', client.emotes.arrow)
			.replace('{emotes.arrow}', client.emotes.arrow)
			.replace('{support}', client.supportUrl)
			.replace('{error}', error.message))
		.setColor(client.embedColor)
		.setFooter({text: guildData.footer});
	return channel.send({embeds:[embed]})
};
