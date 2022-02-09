const Command = require('../../core/command');
const { MessageEmbed} = require('discord.js');
const {SlashCommandBuilder} = require("@discordjs/builders");
const moment = require('moment');

class Reportbug extends Command {

    constructor(client) {
        super(client, {
            name: "reportbug",
            description: "misc/rb:general:description",
            dirname: __dirname,
            aliases: ["reportbugs", "bug", "bugreport", "report-bug"],
            cooldown: 5000,
            slashCommand: {
                addCommand: true,
                data: new SlashCommandBuilder()
                    .addStringOption(option =>
                        option.setName("misc/rb:slash:1:name")
                            .setDescription("misc/rb:slash:1:description")
                            .setRequired(true)
                    )
            }
        });
    }
    async run(interaction, message, args, data){
        const guild = interaction?.guild || message.guild;
        const member = interaction?.member || message.member;

        if(!args[0]){
            let embed = new MessageEmbed()
                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                .setDescription(guild.translate("misc/rb:general:usage")
                        .replace('{prefix}', data.guild.prefix)
                        .replace('{emotes.use}', this.client.emotes.use) + '\n' +
                    guild.translate("misc/rb:general:example")
                        .replace('{prefix}', data.guild.prefix)
                        .replace('{emotes.example}', this.client.emotes.example))
                .setColor(this.client.embedColor)
                .setFooter(data.guild.footer);
            if(message) return message.send(embed, false);
            if(interaction) return interaction.send(embed);
        }

        let date = moment.tz(Date.now(), guild.translate("language:timezone")).format(guild.translate("language:dateformat"))
        let privateEmbed = new MessageEmbed()
            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
            .setDescription(guild.translate("misc/rb:main:bugPrivate")
                    .replace('{bug}', args.join(' '))
                    .replace('{emotes.bug}', this.client.emotes.badges.bughunter_2))
            .setColor(this.client.embedColor)
            .setFooter(guild.translate("misc/rb:main:privateFooter")
                .replace('{user}', member.user.tag)
                .replace('{userId}', member.user.id)
                .replace('{guild}', guild.name)
                .replace('{guildId}', guild.id)
                .replace('{time}', date), member.user.displayAvatarURL());

        let publicEmbed = new MessageEmbed()
            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
            .setDescription(guild.translate("misc/rb:main:bugPublic")
                .replace('{bug}', args.join(' '))
                .replace('{emotes.bug}', this.client.emotes.badges.bughunter_1))
            .setColor(this.client.embedColor)
            .setFooter(data.guild.footer);

        if(message) message.send(publicEmbed);
        if(interaction) interaction.send(publicEmbed);

        let supportGuild = await this.client.guilds.fetch(this.client.config.support.id);
        let logChannel = await supportGuild.channels.fetch(this.client.config.support.bot_log);
        if(logChannel) logChannel.send({embeds: [privateEmbed]});
    }
}

module.exports = Reportbug;
