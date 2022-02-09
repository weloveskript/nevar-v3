const Command = require('../../core/command');
const { MessageEmbed } = require('discord.js');
const {SlashCommandBuilder} = require("@discordjs/builders");
const { QueueRepeatMode } = require('discord-player')

class Pause extends Command {

    constructor(client) {
        super(client, {
            name: "pause",
            description: "music/pause:general:description",
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
        if (interaction) await interaction.deferReply();
        let member = message?.member || interaction?.member;
        let channel = message?.channel || interaction?.channel;
        let guild = message?.guild || interaction?.guild;

        const queue = this.client.player.getQueue(guild.id);
        if(!queue || !queue.playing){
            let embed = new MessageEmbed()
                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                .setDescription(guild.translate("music/pause:main:errors:notPlaying")
                    .replace('{emotes.error}', this.client.emotes.error))
                .setColor(this.client.embedColor)
                .setFooter(data.guild.footer);
            if(message) return message.send(embed);
            if(interaction) return interaction.editReply({embeds:[embed]});
        }
        if(!member.voice?.channel || queue.connection.channel.id !== member.voice.channel.id){
            let embed = new MessageEmbed()
                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                .setDescription(guild.translate("music/pause:main:errors:sameChannel")
                    .replace('{emotes.error}', this.client.emotes.error))
                .setColor(this.client.embedColor)
                .setFooter(data.guild.footer);
            if(message) return message.send(embed);
            if(interaction) return interaction.editReply({embeds: [embed]});
        }

        const paused = queue.setPaused(true);
        if(paused){
            let embed = new MessageEmbed()
                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                .setDescription(guild.translate("music/pause:main:paused")
                    .replace('{emotes.success}', this.client.emotes.success))
                .setColor(this.client.embedColor)
                .setFooter(data.guild.footer);
            if(message) return message.send(embed);
            if(interaction) return interaction.editReply({embeds: [embed]});
        }else{
            let embed = new MessageEmbed()
                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                .setDescription(guild.translate("music/pause:main:errors:cantPause")
                    .replace('{emotes.error}', this.client.emotes.error))
                .setColor(this.client.embedColor)
                .setFooter(data.guild.footer);
            if(message) return message.send(embed);
            if(interaction) return interaction.editReply({embeds: [embed]});
        }

    }
}

module.exports = Pause;
