const Command = require('../../core/command');
const {MessageEmbed} = require("discord.js");
const fs = require('fs');

class Disable extends Command {
    constructor(client){
        super(client, {
            name: "disable",
            dirname: __dirname,
            description: "owner/disable:general:description",
            cooldown: 3000,
            ownerOnly: true,
            slashCommand: {
                addCommand: false
            }
        });
    }

    async run(interaction, message, args, data){
        let guild = interaction?.guild || message?.guild;

        let clientCommand = this.client.commands.get(args[0]) || this.client.commands.get(this.client.aliases.get(args[0]));
        if(!clientCommand && args[0]?.toLowerCase() !== 'list'){
            if(message) return message.send(this.client.usageEmbed(guild, this, data));
            if(interaction) return interaction.send(this.client.usageEmbed(guild, this, data));
        }else if(!clientCommand && args[0].toLowerCase() === 'list'){
            let disabled = [];
            let file = JSON.parse(fs.readFileSync('./storage/disabledcmds.json'));
            for(let command in file){
                disabled.push(file[command]);
            }
            if(disabled.length < 1) disabled = [guild.translate("language:noEntries")];

            let embed = new MessageEmbed()
                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                .setDescription(guild.translate("owner/disable:main:list")
                    .replace('{emotes.arrow}', this.client.emotes.arrow)
                    .replace('{list}', disabled.join('\n|- ')))
                .setColor(this.client.embedColor)
                .setFooter({text: data.guild.footer});
            if (message) return message.send(embed);
            if (interaction) return interaction.send(embed);
        }
        let file = JSON.parse(fs.readFileSync('./storage/disabledcmds.json'));
        let disabled = [];
        disabled.push(clientCommand.help.name);
        for(let command in file){
            disabled.push(file[command]);
        }
        fs.writeFileSync('./storage/disabledcmds.json', JSON.stringify(disabled, null, 4));

        let embed = new MessageEmbed()
            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
            .setDescription(guild.translate("owner/disable:main:message")
                .replace('{emotes.success}', this.client.emotes.success)
                .replace('{command}', clientCommand.help.name.charAt(0).toUpperCase() + clientCommand.help.name.slice(1)))
            .setColor(this.client.embedColor)
            .setFooter({text: data.guild.footer});
        if (message) return message.send(embed);
        if (interaction) return interaction.send(embed);
    }
}

module.exports = Disable;
