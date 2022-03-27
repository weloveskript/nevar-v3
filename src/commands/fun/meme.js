const Command = require('../../core/command');
const {SlashCommandBuilder} = require("@discordjs/builders");
const {MessageEmbed} = require("discord.js");
const axios = require('axios');

class Meme extends Command {
    constructor(client) {
        super(client, {
            name: "meme",
            dirname: __dirname,
            description: "fun/meme:general:description",
            cooldown: 3000,
            slashCommand: {
                addCommand: true,
                data:
                    new SlashCommandBuilder()
            }
        });
    }

    async run(interaction, message, args, data) {

        if(interaction) await interaction.deferReply();

        let children = (await axios.get('https://www.reddit.com/r/dankmemes/top.json?sort=top&t=day&limit=1000', {
            validateStatus: false
        })).data.data.children;
        let meme = children[Math.floor(Math.random() * children.length)];

        let embed = new MessageEmbed()
            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
            .setImage(meme.data.url)
            .setTitle(meme.data.title)
            .setColor(this.client.embedColor)
            .setFooter({text: '👍 ' + meme.data.ups + ' | 👎 ' + meme.data.downs});
        if (message) return message.send(embed);
        if (interaction) return interaction.editReply({embeds:[embed]});
    }
}
module.exports = Meme;
