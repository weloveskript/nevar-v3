const Command = require('../../core/command');
const { MessageEmbed } = require('discord.js');
const {SlashCommandBuilder} = require("@discordjs/builders");
const { QueueRepeatMode } = require('discord-player')

class Loop extends Command {

    constructor(client) {
        super(client, {
            name: "loop",
            description: "music/loop:general:description",
            dirname: __dirname,
            cooldown: 5000,
            slashCommand: {
                addCommand: true,
                data:
                    new SlashCommandBuilder()
                        .addStringOption(option =>
                            option
                                .setRequired(true)
                                .addChoice('1', '5')
                                .addChoice('3', '6')
                                .addChoice('3', '7')
                                .addChoice('4', '8')
                        )
            }
        });
    }

    async run(interaction, message, args, data) {
        let member = message?.member || interaction?.member;
        let channel = message?.channel || interaction?.channel;
        let guild = message?.guild || interaction?.guild;

        if(!args[0]){
            if(message) return message.send(this.client.usageEmbed(guild, this, data));
            if(interaction) return interaction.send(this.client.usageEmbed(guild, this, data));
        }

        const queue = this.client.player.getQueue(guild.id);

        if(!queue || !queue.playing){
            let embed = new MessageEmbed()
                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                .setDescription(guild.translate("music/loop:main:errors:notPlaying")
                    .replace('{emotes.error}', this.client.emotes.error))
                .setColor(this.client.embedColor)
                .setFooter({text: data.guild.footer});
            if(message) return message.send(embed);
            if(interaction) return interaction.send(embed);
        }
        if(!member.voice?.channel || queue.connection.channel.id !== member.voice.channel.id){
            let embed = new MessageEmbed()
                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                .setDescription(guild.translate("music/loop:main:errors:sameChannel")
                    .replace('{emotes.error}', this.client.emotes.error))
                .setColor(this.client.embedColor)
                .setFooter({text: data.guild.footer});
            if(message) return message.send(embed);
            if(interaction) return interaction.send(embed);
        }

        let loopMode = args[0].toLowerCase();

        if(loopMode !== 'off' && loopMode !== 'queue' && loopMode !== 'track' && loopMode !== 'autoplay'){
            if(message) return message.send(this.client.usageEmbed(guild, this, data));
            if(interaction) return interaction.send(this.client.usageEmbed(guild, this, data));
        }

        loopMode = loopMode.toString()
            .replace('off', QueueRepeatMode.OFF)
            .replace('track', QueueRepeatMode.TRACK)
            .replace('queue', QueueRepeatMode.QUEUE)
            .replace('autoplay', QueueRepeatMode.AUTOPLAY);

        let success = queue.setRepeatMode(parseInt(loopMode));
        if(success){
            let embed = new MessageEmbed()
                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                .setDescription(guild.translate("music/loop:main:set")
                    .replace('{emotes.loop}', this.client.emotes.loop))
                .setColor(this.client.embedColor)
                .setFooter({text: data.guild.footer});
            if(message) return message.send(embed);
            if(interaction) return interaction.send(embed);
        }else{
            let embed = new MessageEmbed()
                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                .setDescription(guild.translate("music/loop:main:errors:cantSet")
                    .replace('{emotes.error}', this.client.emotes.error))
                .setColor(this.client.embedColor)
                .setFooter({text: data.guild.footer});
            if(message) return message.send(embed);
            if(interaction) return interaction.send(embed);
        }
    }
}

module.exports = Loop;
