const Command = require('../../core/command');
const { MessageEmbed } = require('discord.js');
const {SlashCommandBuilder} = require("@discordjs/builders");

class Volume extends Command {

    constructor(client) {
        super(client, {
            name: "volume",
            description: "music/volume:general:description",
            dirname: __dirname,
            cooldown: 5000,
            slashCommand: {
                addCommand: true,
                data:
                    new SlashCommandBuilder()
                        .addIntegerOption(option =>
                            option
                                .setRequired(true)
                                .setMinValue(1)
                                .setMaxValue(100))
            }
        });
    }

    async run(interaction, message, args, data) {

        let member = message?.member || interaction?.member;
        let channel = message?.channel || interaction?.channel;
        let guild = message?.guild || interaction?.guild;

        if(!args[0]){
            if(message) return message.send(this.client.usageEmbed(guild, this, data));
            if(interaction) return interaction.editReply({embeds:[this.client.usageEmbed(guild, this, data)]});
        }

        const queue = this.client.player.getQueue(guild.id);
        if(!queue || !queue.playing){
            let embed = new MessageEmbed()
                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                .setDescription(guild.translate("music/volume:main:errors:notPlaying")
                    .replace('{emotes.error}', this.client.emotes.error))
                .setColor(this.client.embedColor)
                .setFooter({text: data.guild.footer});
            if(message) return message.send(embed);
            if(interaction) return interaction.send(embed);
        }

        if(!member.voice?.channel || queue.connection.channel.id !== member.voice.channel.id){
            let embed = new MessageEmbed()
                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                .setDescription(guild.translate("music/volume:main:errors:sameChannel")
                    .replace('{emotes.error}', this.client.emotes.error))
                .setColor(this.client.embedColor)
                .setFooter({text: data.guild.footer});
            if(message) return message.send(embed);
            if(interaction) return interaction.send(embed);
        }

        let volume = parseInt(args[0]);
        if(!volume || volume < 1 || volume > 100){
            if(message) return message.send(this.client.usageEmbed(guild, this, data));
            if(interaction) return interaction.editReply({embeds:[this.client.usageEmbed(guild, this, data)]});
        }

        queue.setVolume(volume);

        let embed = new MessageEmbed()
            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
            .setDescription(guild.translate("music/volume:main:set")
                .replace('{emotes.success}', this.client.emotes.success)
                .replace('{vol}', volume))
            .setColor(this.client.embedColor)
            .setFooter({text: data.guild.footer});
        if(message) return message.send(embed);
        if(interaction) return interaction.send(embed);
    }
}

module.exports = Volume;
