const Command = require('../../core/command');
const { MessageEmbed } = require('discord.js');
const {SlashCommandBuilder} = require("@discordjs/builders");
const { QueryType } = require('discord-player')

class Jump extends Command {

    constructor(client) {
        super(client, {
            name: "jump",
            description: "music/jump:general:description",
            dirname: __dirname,
            cooldown: 5000,
            slashCommand: {
                addCommand: true,
                data:
                    new SlashCommandBuilder()
                        .addIntegerOption(option => option.setRequired(true))
            }
        });
    }

    async run(interaction, message, args, data) {

        let member = message?.member || interaction?.member;
        let channel = message?.channel || interaction?.channel;
        let guild = message?.guild || interaction?.guild;

        if(!parseInt(args[0])){
            if(message) return message.send(this.client.usageEmbed(guild, this, data));
            if(interaction) return interaction.send(this.client.usageEmbed(guild, this, data));
        }

        if(!this.client.mathUtils.isPositive(parseInt(args[0]))){
            if(message) return message.send(this.client.usageEmbed(guild, this, data));
            if(interaction) return interaction.send(this.client.usageEmbed(guild, this, data));
        }

        let trackIndex = args[0];

        if(this.client.mathUtils.hasDecimals(args[0].toString().replace(',', '.'))){
            trackIndex = this.client.mathUtils.removeDecimals(args[0].replace(',', '.'));
        }
        trackIndex = parseInt(trackIndex) - 1;

        const queue = this.client.player.getQueue(guild.id);

        if(!queue){
            let embed = new MessageEmbed()
                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                .setDescription(guild.translate("music/jump:main:noQueue")
                    .replace('{emotes.error}', this.client.emotes.error))
                .setColor(this.client.embedColor)
                .setFooter({text: data.guild.footer});
            if(message) return message.send(embed);
            if(interaction) return interaction.send(embed);
        }

        if(!member.voice?.channel || queue.connection.channel.id !== member.voice.channel.id){
            let embed = new MessageEmbed()
                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                .setDescription(guild.translate("music/jump:main:errors:sameChannel")
                    .replace('{emotes.error}', this.client.emotes.error))
                .setColor(this.client.embedColor)
                .setFooter({text: data.guild.footer});
            if(message) return message.send(embed);
            if(interaction) return interaction.send(embed);
        }

        if(!queue.tracks[trackIndex]){
            let embed = new MessageEmbed()
                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                .setDescription(guild.translate("music/jump:main:errors:noTrack")
                    .replace('{emotes.error}', this.client.emotes.error))
                .setColor(this.client.embedColor)
                .setFooter({text: data.guild.footer});
            if(message) return message.send(embed);
            if(interaction) return interaction.send(embed);
        }else{
            queue.jump(trackIndex);
            let embed = new MessageEmbed()
                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                .setDescription(guild.translate("music/jump:main:jumped")
                    .replace('{emotes.success}', this.client.emotes.success)
                    .replace('{amount}', trackIndex + 1))
                .setColor(this.client.embedColor)
                .setFooter({text: data.guild.footer});
            if(message) return message.send(embed);
            if(interaction) return interaction.send(embed);
        }
    }
}
module.exports = Jump;
