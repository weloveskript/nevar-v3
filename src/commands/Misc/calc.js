const Command = require('../../core/command');
const math = require('mathjs');
const { MessageEmbed } = require('discord.js');

class Calc extends Command {
    constructor(client) {
        super(client, {
            name: "calc",
            description: "misc/calc:description",
            dirname: __dirname,
            aliases: ["math", "calculate"],
            cooldown: 5000,
            slashCommand: {
                addCommand: true,
                options: [
                    {
                        name: "misc/calc:slashOption1",
                        description: "misc/calc:slashOption1Desc",
                        type: "STRING",
                        required: true,
                    }
                ]
            }
        });
    }
    async run(interaction, message, args, data){
        let guild = message?.guild || interaction?.guild;

        if(!args[0]){
            let embed = new MessageEmbed()
                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                .setDescription(guild.translate("misc/calc:usage")
                        .replace('{prefix}', data.guild.prefix)
                        .replace('{emotes.use}', this.client.emotes.use) + '\n' +
                    guild.translate("misc/calc:example")
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
                .setDescription(guild.translate("misc/calc:usage")
                        .replace('{prefix}', data.guild.prefix)
                        .replace('{emotes.use}', this.client.emotes.use) + '\n' +
                    guild.translate("misc/calc:example")
                        .replace('{prefix}', data.guild.prefix)
                        .replace('{emotes.example}', this.client.emotes.example))
                .setColor(this.client.embedColor)
                .setFooter(data.guild.footer);
            if(message) return message.send(embed, false);
            if(interaction) return interaction.send(embed);
        }
        let embed = new MessageEmbed()
            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
            .addField(this.client.emotes.equation + ' ' + guild.translate("misc/calc:formula"), `\`\`\`js\n${args.join("").replace(/[x]/gi, "*").replace(/[,]/g, ".").replace(/[÷]/gi, "/").replace(/[:]/gi, '/')}\`\`\``)
            .addField(this.client.emotes.result + ' ' + guild.translate("misc/calc:result"), `\`\`\`js\n${result}\`\`\``)
            .setColor(this.client.embedColor)
            .setFooter(data.guild.footer);
        if(message) return message.send(embed, false);
        if(interaction) return interaction.send(embed);
    }
}

module.exports = Calc;
