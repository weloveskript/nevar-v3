const Command = require('../../core/command');
const { MessageEmbed} = require('discord.js');
const {SlashCommandBuilder} = require("@discordjs/builders");

class Premiumcommands extends Command {

    constructor(client) {
        super(client, {
            name: "premiumcommands",
            description: "misc/premiumcommands:general:description",
            dirname: __dirname,
            aliases: ["premiumcmds"],
            cooldown: 2000,
            slashCommand: {
                addCommand: true,
                data: new SlashCommandBuilder()
            }
        });
    }
    async run(interaction, message, args, data){
        const guild = interaction?.guild || message.guild;

        let premiumCommands = [];
        for(let cmd of this.client.commands){
            if(cmd[1].conf.premium){
                premiumCommands.push(cmd[1].help.name);
            }
        }

        let embed = new MessageEmbed()
            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
            .setDescription(guild.translate("misc/premiumcommands:main:list")
                .replace('{emotes.arrow}', this.client.emotes.arrow)
                .replace('{client}', this.client.user.username)
                .replace('{list}', premiumCommands.join('\n|- ')))
            .setColor(this.client.embedColor)
            .setFooter({text: data.guild.footer});
        if(message) return message.send(embed);
        if(interaction) return interaction.send(embed);
    }
}

module.exports = Premiumcommands;
