const Command = require('../../core/command');
const { MessageEmbed } = require('discord.js');
const {SlashCommandBuilder} = require("@discordjs/builders");
const { QueryType } = require('discord-player')

class Clearqueue extends Command {

    constructor(client) {
        super(client, {
            name: "clearqueue",
            description: "music/clear:general:description",
            dirname: __dirname,
            aliases: ["clear-queue", "clearq"],
            cooldown: 5000,
            slashCommand: {
                addCommand: true,
                data:
                    new SlashCommandBuilder()
            }
        });
    }
    async run(interaction, message, args, data){
        let member = message?.member || interaction?.member;
        let channel = message?.channel || interaction?.channel;
        let guild = message?.guild || interaction?.guild;

        if(interaction) await interaction.deferReply();

        const queue = this.client.player.getQueue(guild.id);



        if(!queue){
            let embed = new MessageEmbed()
                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                .setDescription(guild.translate("music/clear:main:noQueue")
                    .replace('{emotes.error}', this.client.emotes.error))
                .setColor(this.client.embedColor)
                .setFooter({text: data.guild.footer});
            if(message) return message.send(embed);
            if(interaction) return interaction.editReply({embeds:[embed]});
        }

        if(!member.voice?.channel || queue.connection.channel.id !== member.voice.channel.id){
            let embed = new MessageEmbed()
                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                .setDescription(guild.translate("music/clear:main:errors:sameChannel")
                    .replace('{emotes.error}', this.client.emotes.error))
                .setColor(this.client.embedColor)
                .setFooter({text: data.guild.footer});
            if(message) return message.send(embed);
            if(interaction) return interaction.editReply({embeds: [embed]});
        }

        queue.clear();

        let embed = new MessageEmbed()
            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
            .setDescription(guild.translate("music/clear:main:cleared")
                .replace('{emotes.success}', this.client.emotes.success))
            .setColor(this.client.embedColor)
            .setFooter({text: data.guild.footer});
        if(message) return message.send(embed);
        if(interaction) return interaction.editReply({embeds:[embed]});
    }
}
module.exports = Clearqueue;
