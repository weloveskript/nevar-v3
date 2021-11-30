const Command = require('../../core/command')
    , { MessageEmbed } = require('discord.js');

class Setprefix extends Command {

    constructor(client) {
        super(client, {
            name: "setprefix",
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
                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                .setDescription(guild.translate("administration/setprefix:usage")
                        .replace('{prefix}', data.guild.prefix)
                        .replace('{emotes.use}', this.client.emotes.use) + '\n' +
                    guild.translate("administration/setprefix:example")
                        .replace('{prefix}', data.guild.prefix)
                        .replace('{emotes.example}', this.client.emotes.example))
                .setColor(this.client.embedColor)
                .setFooter(data.guild.footer);
            if (message) return message.send(embed);
            if (interaction) return interaction.send(embed);
        }
        if(prefix.length > 4){
            let embed = new MessageEmbed()
                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                .setDescription(guild.translate("administration/setprefix:tooLong")
                        .replace('{emotes.error}', this.client.emotes.error))
                .setColor(this.client.embedColor)
                .setFooter(data.guild.footer);
            if (message) return message.send(embed);
            if (interaction) return interaction.send(embed);
        }

        data.guild.prefix = prefix;
        await data.guild.save();

        let embed = new MessageEmbed()
            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
            .setDescription(guild.translate("administration/setprefix:set")
                .replace('{emotes.success}', this.client.emotes.success))
            .setColor(this.client.embedColor)
            .setFooter(data.guild.footer);
        if (message) return message.send(embed);
        if (interaction) return interaction.send(embed);

    }
}

module.exports = Setprefix;
