const Command = require('../../core/command');
const { MessageEmbed } = require('discord.js');
const {SlashCommandBuilder} = require("@discordjs/builders");
const { QueueRepeatMode } = require('discord-player')

class Queue extends Command {

    constructor(client) {
        super(client, {
            name: "queue",
            description: "music/queue:general:description",
            dirname: __dirname,
            cooldown: 5000,
            slashCommand: {
                addCommand: true,
                data:
                    new SlashCommandBuilder()
            }
        });
    }

    async run(interaction, message, args, data) {
        let member = message?.member || interaction?.member;
        let channel = message?.channel || interaction?.channel;
        let guild = message?.guild || interaction?.guild;

        const queue = this.client.player.getQueue(guild.id);
        if(!queue || !queue.playing){
            let embed = new MessageEmbed()
                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                .setDescription(guild.translate("music/queue:main:errors:notPlaying")
                    .replace('{emotes.error}', this.client.emotes.error))
                .setColor(this.client.embedColor)
                .setFooter({text: data.guild.footer});
            if(message) return message.send(embed);
            if(interaction) return interaction.send(embed);
        }

        let tracks = [];
        let i = 0;
        let andMore = 0;
        for(let track of queue.tracks){
            i++;
            if(i < 11)
                tracks.push(i + '. » ' + track.title)
            else
                andMore++;
        }
        if(tracks.length === 0) tracks = [guild.translate("language:noEntries")]
        let embed = new MessageEmbed()
            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
            .setDescription(guild.translate("music/queue:main:queue")
                .replace('{emotes.arrow}', this.client.emotes.arrow)
                .replace('{andmore}', (andMore > 0 ? guild.translate("music/queue:main:andmore").replace('{count}', andMore) : ''))
                .replace('{queue}', tracks.join('\n')))
            .setColor(this.client.embedColor)
            .setFooter({text: data.guild.footer});
        if(message) return message.send(embed);
        if(interaction) return interaction.send(embed);
    }
}
module.exports = Queue;
