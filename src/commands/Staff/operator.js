const Command = require('../../structure/Command')
    , { MessageEmbed } = require('discord.js')
    , Discord = require('discord.js');

class Operator extends Command {
    constructor(client) {
        super(client, {
            name: "operator",
            description: "staff/operator:description",
            dirname: __dirname,
            aliases: ["op"],
            memberPermissions: ["SEND_MESSAGES"],
            botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
            ownerOnly: false,
            staffOnly: true,
            cooldown: 20000,
            slashCommand: {
                addCommand: true
            }
        });
    }
    async run(interaction, message, args, data){
        let guild = interaction?.guild || message?.guild
            , member = interaction?.member || message?.member
            , channel = interaction?.channel || message?.channel;
        if(message) {
            let embedmessage = new MessageEmbed()
            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
            .setDescription(guild.translate("staff/operator:success")
                .replace('{user}', message.author.username)
                .replace('{emotes.nevar}', this.client.emotes.nevar.logo_small_transparent))
            .setColor(this.client.embedColor)
            .setFooter(data.guild.footer);
            return message.send(embedmessage, false);
        } else if (interaction) {
            let embedinteraction = new MessageEmbed()
            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
            .setDescription(guild.translate("staff/operator:success")
                .replace('{user}', interaction.member.user.username)
                .replace('{emotes.nevar}', this.client.emotes.nevar.logo_small_transparent))
            .setColor(this.client.embedColor)
            .setFooter(data.guild.footer);
            return interaction.send(embedinteraction);
        }
        
    }
   
}

module.exports = Operator;