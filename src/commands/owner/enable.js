const Command = require('../../core/command');
const {MessageEmbed} = require("discord.js");
const fs = require('fs');

class Enable extends Command {
    constructor(client){
        super(client, {
            name: "enable",
            dirname: __dirname,
            description: "owner/enable:general:description",
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
        if(!clientCommand){
            if(message) return message.send(this.client.usageEmbed(guild, this, data));
            if(interaction) return interaction.send(this.client.usageEmbed(guild, this, data));
        }

        let file = JSON.parse(fs.readFileSync('./storage/disabledcmds.json'));

        file = file.filter((name) => { return name !== clientCommand.help.name });
        fs.writeFileSync('./storage/disabledcmds.json', JSON.stringify(file, null, 4));

        await this.client.unloadCommand(clientCommand.help.name);
        await this.client.loadCommand(clientCommand.help.name);

        let embed = new MessageEmbed()
            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
            .setDescription(guild.translate("owner/enable:main:message")
                .replace('{emotes.success}', this.client.emotes.success)
                .replace('{command}', clientCommand.help.name.charAt(0).toUpperCase() + clientCommand.help.name.slice(1)))
            .setColor(this.client.embedColor)
            .setFooter({text: data.guild.footer});
        if (message) return message.send(embed);
        if (interaction) return interaction.send(embed);
    }
}

module.exports = Enable;
