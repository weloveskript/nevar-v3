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
                        .addIntegerOption(option =>
                            option.setName('music/jump:slash:1:name')
                                .setDescription('music/jump:slash:1:description')
                                .setRequired(true)
                        )
            }
        });
    }

    async run(interaction, message, args, data) {

        if(interaction) await interaction.deferReply();
        let member = message?.member || interaction?.member;
        let channel = message?.channel || interaction?.channel;
        let guild = message?.guild || interaction?.guild;

        if(!parseInt(args[0])){
            let embed = new MessageEmbed()
                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                .setDescription(guild.translate("music/jump:general:usage")
                        .replace('{prefix}', data.guild.prefix)
                        .replace('{emotes.use}', this.client.emotes.use) + '\n' +
                    guild.translate("music/jump:general:example")
                        .replace('{prefix}', data.guild.prefix)
                        .replace('{emotes.example}', this.client.emotes.example))
                .setColor(this.client.embedColor)
                .setFooter(data.guild.footer);
            if(message) return message.send(embed);
            if(interaction) return interaction.editReply({embeds:[embed]});
        }

        if(!this.client.mathUtils.isPositive(parseInt(args[0]))){
            let embed = new MessageEmbed()
                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                .setDescription(guild.translate("music/jump:general:usage")
                        .replace('{prefix}', data.guild.prefix)
                        .replace('{emotes.use}', this.client.emotes.use) + '\n' +
                    guild.translate("music/jump:general:example")
                        .replace('{prefix}', data.guild.prefix)
                        .replace('{emotes.example}', this.client.emotes.example))
                .setColor(this.client.embedColor)
                .setFooter(data.guild.footer);
            if(message) return message.send(embed);
            if(interaction) return interaction.editReply({embeds:[embed]});
        }

        let trackIndex = args[0];

        if(this.client.mathUtils.hasDecimals(args[0].toString().replace(',', '.'))){
            trackIndex = this.client.mathUtils.removeDecimals(args[0].replace(',', '.'));
        }
        trackIndex = parseInt(trackIndex) - 1;

        const queue = this.client.player.getQueue(guild.id);

        if(!queue){
            let embed = new MessageEmbed()
                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                .setDescription(guild.translate("music/jump:main:noQueue")
                    .replace('{emotes.error}', this.client.emotes.error))
                .setColor(this.client.embedColor)
                .setFooter(data.guild.footer);
            if(message) return message.send(embed);
            if(interaction) return interaction.editReply({embeds:[embed]});
        }

        if(!member.voice?.channel || queue.connection.channel.id !== member.voice.channel.id){
            let embed = new MessageEmbed()
                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                .setDescription(guild.translate("music/jump:main:errors:sameChannel")
                    .replace('{emotes.error}', this.client.emotes.error))
                .setColor(this.client.embedColor)
                .setFooter(data.guild.footer);
            if(message) return message.send(embed);
            if(interaction) return interaction.editReply({embeds: [embed]});
        }

        if(!queue.tracks[trackIndex]){
            let embed = new MessageEmbed()
                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                .setDescription(guild.translate("music/jump:main:errors:noTrack")
                    .replace('{emotes.error}', this.client.emotes.error))
                .setColor(this.client.embedColor)
                .setFooter(data.guild.footer);
            if(message) return message.send(embed);
            if(interaction) return interaction.editReply({embeds: [embed]});
        }else{
            queue.jump(trackIndex);
            let embed = new MessageEmbed()
                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                .setDescription(guild.translate("music/jump:main:jumped")
                    .replace('{emotes.success}', this.client.emotes.success)
                    .replace('{amount}', trackIndex + 1))
                .setColor(this.client.embedColor)
                .setFooter(data.guild.footer);
            if(message) return message.send(embed);
            if(interaction) return interaction.editReply({embeds: [embed]});
        }
    }
}
module.exports = Jump;
