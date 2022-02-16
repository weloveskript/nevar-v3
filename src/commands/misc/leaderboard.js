const Command = require('../../core/command');
const { MessageEmbed } = require('discord.js');
const Levels = require('discord-xp');
const {SlashCommandBuilder} = require("@discordjs/builders");

class Leaderboard extends Command {

    constructor(client) {
        super(client, {
            name: "leaderboard",
            description: "misc/leaderboard:general:description",
            dirname: __dirname,
            aliases: ["levels", "lb"],
            cooldown: 3000,
            slashCommand: {
                addCommand: true,
                data: new SlashCommandBuilder()
            }
        });
    }
    async run(interaction, message, args, data){

        const guild = interaction?.guild || message?.guild;
        const member = interaction?.member || message?.member;
        const channel = interaction?.channel || message?.channel;

        const rawLb = await Levels.computeLeaderboard(this.client, await Levels.fetchLeaderboard(guild.id, 10), true)

        if(rawLb.length < 1){
            let embed = new MessageEmbed()
                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                .setDescription(guild.translate("misc/leaderboard:main:noLb")
                    .replace('{emotes.error}', this.client.emotes.error))
                .setColor(this.client.embedColor)
                .setFooter({text: data.guild.footer});
            if(message) return message.send(embed);
            if(interaction) return interaction.send(embed);
        }

        const leaderboard = rawLb.map(e =>
            e.position + ' | ' + e.username + '#' + e.discriminator + '\n' +
            guild.translate('misc/level:main:level').charAt(0).toUpperCase() +
            guild.translate('misc/level:main:level').slice(1).toLowerCase() + ': ' + e.level + '\n' +
            'XP:' + e.xp.toLocaleString()
        )

        let embed = new MessageEmbed()
            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
            .setDescription(guild.translate("misc/leaderboard:main:lb")
                .replace('{emotes.arrow}', this.client.emotes.arrow)
                .replace('{lb}', leaderboard.join('\n\n')))
            .setColor(this.client.embedColor)
            .setFooter({text: data.guild.footer});
        if(message) return message.send(embed);
        if(interaction) return interaction.send(embed);
    }
}

module.exports = Leaderboard;
