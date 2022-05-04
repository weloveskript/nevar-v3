const Command = require('../../core/command');
const {SlashCommandBuilder} = require("@discordjs/builders");
const {MessageEmbed} = require("discord.js");
const axios = require('axios');

class Eightball extends Command {
    constructor(client) {
        super(client, {
            name: "8ball",
            dirname: __dirname,
            description: "fun/8ball:general:description",
            cooldown: 3000,
            slashCommand: {
                addCommand: true,
                data:
                    new SlashCommandBuilder()
                        .addStringOption(option =>
                            option.setRequired(true))
            }
        });
    }

    async run(interaction, message, args, data) {

        const guild = interaction?.guild || message?.guild;

        let text = args.join(' ');
        if(!text || !text.endsWith('?')){
            if(message) return message.send(this.client.usageEmbed(guild, this, data));
            if(interaction) return interaction.send(this.client.usageEmbed(guild, this, data));
        }

        let items = guild.translate("fun/8ball:main:answers");

        let item = items[Math.floor(Math.random() * items.length)];
        let embed = new MessageEmbed()
            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
            .setColor(this.client.embedColor)
            .setDescription(guild.translate("fun/8ball:main:answer")
                .replaceAll('{emotes.arrow}', this.client.emotes.arrow)
                .replace('{question}', text)
                .replace('{answer}', item))
            .setFooter({text: data.guild.footer});
        if (message) return message.send(embed);
        if (interaction) return interaction.editReply({embeds:[embed]});
    }
}
module.exports = Eightball;
