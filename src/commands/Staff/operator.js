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
                addCommand: true,
                options: [
                    {
                        name: "owner/operator:slashOption1",
                        description: "owner/operator:slashOption1Desc",
                        type: "STRING",
                        required: false
                    },


                ]
            }
        });
    }
    async run(interaction, message, args, data){
        const guild = interaction?.guild || message?.guild
            , member = interaction?.member || message?.member
            , channel = interaction?.channel || message?.channel;
        if(!args[0]) {
            let name = interaction?.member?.user?.username || message?.member?.user?.username
            let embed = new MessageEmbed()
            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
            .setDescription(guild.translate("staff/operator:success")
                .replace('{user}', name)
                .replace('{emotes.nevar}', this.client.emotes.nevar.logo_small_transparent))
            .setColor(this.client.embedColor)
            .setFooter(data.guild.footer);
            if(interaction) return interaction.send(embed);
            if(message) return message.send(embed, false);
        } else if (args[0] === 'riptinte') {
            let name = interaction?.member?.user?.username || message?.member?.user?.username
            let embed = new MessageEmbed()
            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
            .setDescription(guild.translate("staff/operator:secret")
                .replace('{emotes.nevar}', this.client.emotes.nevar.logo_small_transparent))
            .setColor(this.client.embedColor)
            .setFooter(data.guild.footer);
            if(interaction) return interaction.send(embed);
            if(message) return message.send(embed, false);
        }
        
    }
   
}

module.exports = Operator;