const Command = require('../../core/command');
const { MessageEmbed} = require('discord.js');
const {SlashCommandBuilder} = require("@discordjs/builders");

class Ping extends Command {

    constructor(client) {
        super(client, {
            name: "ping",
            description: "misc/ping:general:description",
            dirname: __dirname,
            aliases: ["latency"],
            cooldown: 5000,
            slashCommand: {
                addCommand: true,
                data: new SlashCommandBuilder()
            }
        });
    }
    async run(interaction, message, args, data){
        const guild = interaction?.guild || message.guild;
        const channel = interaction?.channel || message.channel;
        const createdTimestamp = interaction?.createdTimestamp || message.createdTimestamp;

        let ping = 0;
        let wsPing = this.client.ws.ping;

        await channel.send({content:'Pong'})
            .then(async (msg) => {
                msg.delete();
                ping = msg.createdTimestamp - createdTimestamp;
            });
        let embed = new MessageEmbed()
            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
            .setDescription(guild.translate("misc/ping:main:ping")
                .replace('{emotes.arrow}', this.client.emotes.arrow)
                .replace('{ping}', ping)
                .replace('{wsping}', wsPing))
            .setColor(this.client.embedColor)
            .setFooter(data.guild.footer);
        if(message) return message.send(embed);
        if(interaction) return interaction.send(embed);
    }
}

module.exports = Ping;
