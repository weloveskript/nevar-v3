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
                        .addStringOption(option =>
                            option.setName('misc/calc:slash:1:name')
                                .setDescription('misc/calc:slash:1:description')
                                .setRequired(true)
                        )
            }
        });
    }
    async run(interaction, message, args, data){
        let guild = message?.guild || interaction?.guild;

        if(!args[0]){
            let embed = new MessageEmbed()
                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                .setDescription(guild.translate("misc/calc:general:usage")
                        .replace('{prefix}', data.guild.prefix)
                        .replace('{emotes.use}', this.client.emotes.use) + '\n' +
                    guild.translate("misc/calc:general:example")
                        .replace('{prefix}', data.guild.prefix)
                        .replace('{emotes.example}', this.client.emotes.example))
                .setColor(this.client.embedColor)
                .setFooter(data.guild.footer);
            if(message) return message.send(embed, false);
            if(interaction) return interaction.send(embed);
        }

        let result;
        try {
            result = math.evaluate(args.join(' ').replace(/[x]/gi, "*").replace(/[,]/g, ".").replace(/[÷]/gi, "/").replace(/[:]/gi, '/'));
        }catch (e) {
            let embed = new MessageEmbed()
                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                .setDescription(guild.translate("misc/calc:general:usage")
                        .replace('{prefix}', data.guild.prefix)
                        .replace('{emotes.use}', this.client.emotes.use) + '\n' +
                    guild.translate("misc/calc:general:example")
                        .replace('{prefix}', data.guild.prefix)
                        .replace('{emotes.example}', this.client.emotes.example))
                .setColor(this.client.embedColor)
                .setFooter(data.guild.footer);
            if(message) return message.send(embed, false);
            if(interaction) return interaction.send(embed);
        }
        let embed = new MessageEmbed()
            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
            .addField(this.client.emotes.formula + ' ' + guild.translate("misc/calc:embed:formula"), `\`\`\`js\n${args.join("").replace(/[x]/gi, "*").replace(/[,]/g, ".").replace(/[÷]/gi, "/").replace(/[:]/gi, '/')}\`\`\``)
            .addField(this.client.emotes.result + ' ' + guild.translate("misc/calc:embed:result"), `\`\`\`js\n${result}\`\`\``)
            .setColor(this.client.embedColor)
            .setFooter(data.guild.footer);
        if(message) return message.send(embed, false);
        if(interaction) return interaction.send(embed);
    }
}

module.exports = Calc;
