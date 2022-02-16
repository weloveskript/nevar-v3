const Command = require('../../core/command');
const math = require('mathjs');
const { MessageEmbed } = require('discord.js');
const {SlashCommandBuilder} = require("@discordjs/builders");

class Calc extends Command {
    constructor(client) {
        super(client, {
            name: "calc",
            description: "misc/calc:general:description",
            dirname: __dirname,
            aliases: ["math", "calculate"],
            cooldown: 5000,
            slashCommand: {
                addCommand: true,
                data:
                    new SlashCommandBuilder()
                        .addStringOption(option => option.setRequired(true))
            }
        });
    }
    async run(interaction, message, args, data){
        let guild = message?.guild || interaction?.guild;

        if(!args[0]){
            if(message) return message.send(this.client.usageEmbed(guild, this, data));
            if(interaction) return interaction.send(this.client.usageEmbed(guild, this, data));
        }

        let result;
        try {
            result = math.evaluate(args.join(' ').replace(/[x]/gi, "*").replace(/[,]/g, ".").replace(/[÷]/gi, "/").replace(/[:]/gi, '/'));
        }catch (e) {
            if(message) return message.send(this.client.usageEmbed(guild, this, data));
            if(interaction) return interaction.send(this.client.usageEmbed(guild, this, data));
        }
        let embed = new MessageEmbed()
            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
            .addField(this.client.emotes.formula + ' ' + guild.translate("misc/calc:main:formula"), `\`\`\`js\n${args.join("").replace(/[x]/gi, "*").replace(/[,]/g, ".").replace(/[÷]/gi, "/").replace(/[:]/gi, '/')}\`\`\``)
            .addField(this.client.emotes.result + ' ' + guild.translate("misc/calc:main:result"), `\`\`\`js\n${result}\`\`\``)
            .setColor(this.client.embedColor)
            .setFooter({text: data.guild.footer});
        if(message) return message.send(embed, false);
        if(interaction) return interaction.send(embed);
    }
}

module.exports = Calc;
