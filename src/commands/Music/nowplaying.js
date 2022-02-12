const Command = require('../../core/command');
const { MessageEmbed } = require('discord.js');
const {SlashCommandBuilder} = require("@discordjs/builders");
const { QueueRepeatMode } = require('discord-player');
const formatter = new Intl.NumberFormat('de-DE');


class Nowplaying extends Command {

    constructor(client) {
        super(client, {
            name: "nowplaying",
            description: "music/np:general:description",
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
        if (interaction) await interaction.deferReply();
        let member = message?.member || interaction?.member;
        let channel = message?.channel || interaction?.channel;
        let guild = message?.guild || interaction?.guild;

        const queue = this.client.player.getQueue(guild.id);

        if(!queue || !queue.playing){
            let embed = new MessageEmbed()
                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                .setDescription(guild.translate("music/loop:main:errors:notPlaying")
                    .replace('{emotes.error}', this.client.emotes.error))
                .setColor(this.client.embedColor)
                .setFooter({text: data.guild.footer});
            if(message) return message.send(embed);
            if(interaction) return interaction.editReply({embeds:[embed]});
        }


        const progress = queue.createProgressBar();

        let repeatMode = queue.repeatMode;
        if(repeatMode === QueueRepeatMode.OFF) repeatMode = guild.translate("music/np:main:loopModes:0")
        if(repeatMode === QueueRepeatMode.TRACK) repeatMode = guild.translate("music/np:main:loopModes:1")
        if(repeatMode === QueueRepeatMode.QUEUE) repeatMode = guild.translate("music/np:main:loopModes:2")
        if(repeatMode === QueueRepeatMode.AUTOPLAY) repeatMode = guild.translate("music/np:main:loopModes:3")

        let embed = new MessageEmbed()
            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
            .addField(guild.translate("music/np:main:current"), '```' + queue.current.title + '```')
            .addField(guild.translate("music/np:main:uploaded"), '```' + queue.current.author + '```', true)
            .addField(guild.translate("music/np:main:views"), '```' + formatter.format(queue.current.views) + '```', true)
            .addField(guild.translate("music/np:main:requested"), '```' + queue.current.requestedBy.tag + '```', true)
            .addField(guild.translate("music/np:main:duration"), '```' + queue.current.duration + '```', true)
            .addField(guild.translate("music/np:main:volume"), '```' + queue.volume + '```', true)
            .addField(guild.translate("music/np:main:loop"), '```' + repeatMode + '```', true)
            .addField('\u200b', progress.replace(/ 0:00/g, ' ◉ LIVE'))
            .setThumbnail(queue.current?.thumbnail)
            .setColor(this.client.embedColor)
            .setFooter({text: data.guild.footer});

        return interaction.editReply({embeds: [ embed ]})

    }

}
module.exports = Nowplaying;
