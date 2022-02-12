const Command = require('../../core/command');
const { MessageEmbed } = require('discord.js');

class Setprefix extends Command {

    constructor(client) {
        super(client, {
            name: "setprefix",
            description: "admin/sp:general:description",
            dirname: __dirname,
            aliases: ["prefix"],
            memberPermissions: ["MANAGE_GUILD"],
            cooldown: 3000,
            slashCommand: {
                addCommand: false
            }
        });
    }
    async run(interaction, message, args, data){
        let prefix = args[0]?.toLowerCase();
        let guild = message?.guild || interaction?.guild;
        if(!prefix){
            let embed = new MessageEmbed()
                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                .setDescription(guild.translate("admin/sp:general:usage")
                        .replace('{prefix}', data.guild.prefix)
                        .replace('{emotes.use}', this.client.emotes.use) + '\n' +
                    guild.translate("admin/sp:general:example")
                        .replace('{prefix}', data.guild.prefix)
                        .replace('{emotes.example}', this.client.emotes.example))
                .setColor(this.client.embedColor)
                .setFooter({text: data.guild.footer});
            if (message) return message.send(embed);
            if (interaction) return interaction.send(embed);
        }
        if(prefix.length > 4) prefix = prefix.substring(0, 4);

        data.guild.prefix = prefix;
        await data.guild.save();

        let embed = new MessageEmbed()
            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
            .setDescription(guild.translate("admin/sp:main:set")
                .replace('{emotes.success}', this.client.emotes.success)
                .replace('{prefix}', prefix))
            .setColor(this.client.embedColor)
            .setFooter({text: data.guild.footer});
        if (message) return message.send(embed);
        if (interaction) return interaction.send(embed);

    }
}

module.exports = Setprefix;
