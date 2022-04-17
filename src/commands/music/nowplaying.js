const Command = require('../../core/command');
const { MessageEmbed } = require('discord.js');
const {SlashCommandBuilder} = require("@discordjs/builders");
const { QueueRepeatMode } = require('discord-player');
const formatter = new Intl.NumberFormat('de-DE');


class Nowplaying extends Command {

    constructor(client) {
        super(client, {
            name: "nowplaying",
            description: "music/nowplaying:general:description",
            dirname: __dirname,
            aliases: ["np", "now-playing"],
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
                .setDescription(guild.translate("music/nowplaying:main:errors:notPlaying")
                    .replace('{emotes.error}', this.client.emotes.error))
                .setColor(this.client.embedColor)
                .setFooter({text: data.guild.footer});
            if(message) return message.send(embed);
            if(interaction) return interaction.send(embed);
        }


        const progress = queue.createProgressBar();

        let repeatMode = queue.repeatMode;
        if(repeatMode === QueueRepeatMode.OFF) repeatMode = guild.translate("music/nowplaying:main:loopModes:0")
        if(repeatMode === QueueRepeatMode.TRACK) repeatMode = guild.translate("music/nowplaying:main:loopModes:1")
        if(repeatMode === QueueRepeatMode.QUEUE) repeatMode = guild.translate("music/nowplaying:main:loopModes:2")
        if(repeatMode === QueueRepeatMode.AUTOPLAY) repeatMode = guild.translate("music/nowplaying:main:loopModes:3")

        let embed = new MessageEmbed()
            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
            .addField(guild.translate("music/nowplaying:main:current"), '```' + queue.current.title + '```')
            .addField(guild.translate("music/nowplaying:main:uploaded"), '```' + queue.current.author + '```', true)
            .addField(guild.translate("music/nowplaying:main:views"), '```' + formatter.format(queue.current.views) + '```', true)
            .addField(guild.translate("music/nowplaying:main:requested"), '```' + queue.current.requestedBy.tag + '```', true)
            .addField(guild.translate("music/nowplaying:main:duration"), '```' + queue.current.duration + '```', true)
            .addField(guild.translate("music/nowplaying:main:volume"), '```' + queue.volume + '```', true)
            .addField(guild.translate("music/nowplaying:main:loop"), '```' + repeatMode + '```', true)
            .addField('\u200b', progress.replace(/ 0:00/g, ' ◉ LIVE'))
            .setThumbnail(queue.current?.thumbnail)
            .setColor(this.client.embedColor)
            .setFooter({text: data.guild.footer});

        if(interaction) return interaction.send(embed);
        if(message) return message.send(embed);

    }

}
module.exports = Nowplaying;
