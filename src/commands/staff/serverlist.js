const Command = require('../../core/command');
const {SlashCommandBuilder} = require("@discordjs/builders");
const Resolver = require('../../helper/finder');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const {forEach} = require("mathjs");

class Serverlist extends Command {
    constructor(client){
        super(client, {
            name: "serverlist",
            dirname: __dirname,
            description: "staff/serverlist:general:description",
            cooldown: 3000,
            staffOnly: true,
            slashCommand: {
                addCommand: false
            }
        });
    }

    async run(interaction, message, args, data){
        let member = interaction?.member || message?.member;
        let channel = interaction?.channel || message?.channel;
        let guild = interaction?.guild || message?.guild;

        let backId = member.user.id + '_back';
        let forwardId = member.user.id + '_forward';

        let backButton = new MessageButton({
            style: "SECONDARY",
            label: guild.translate("staff/serverlist:main:labels:back"),
            emoji: '⬅️',
            custom_id: backId
        });

        let forwardButton = new MessageButton({
            style: "SECONDARY",
            label: guild.translate("staff/serverlist:main:labels:forward"),
            emoji: '➡️',
            custom_id: forwardId
        });

        const guilds = [... this.client.guilds.cache.values()];

        let generateEmbed = async start => {
            const current = guilds.slice(start, start + 10);
            let text = '{text}'
                .replace('{text}',
                    current.map(guild => (
                        '\n\n**'+ this.client.emotes.arrow + guild.name + '**\n' + '» ' + guild.translate("staff/serverlist:main:members") + guild.memberCount + '\n' + '» ' + guild.translate("staff/serverlist:main:id") + guild.id
                    )).join(''));
            return new MessageEmbed()
                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                .setTitle(guild.translate("staff/serverlist:main:showing")
                    .replace('{index}', start + 1)
                    .replace('{indexEnd}', start + current.length)
                    .replace('{total}', guilds.length)
                    .replace('{emotes.server}', this.client.emotes.discord))
                .setDescription(text)
                .setThumbnail(this.client.user.displayAvatarURL())
                .setColor(this.client.embedColor)
                .setFooter({text: data.guild.footer});
        }

        const canFitOnePage = guilds.length <= 10;
        const embedMessage = await channel.send({
            embeds : [await generateEmbed(0)],
            components: canFitOnePage
                ? []
                : [new MessageActionRow({components: [forwardButton]})]
        });
        if(canFitOnePage) return;

        const collector = embedMessage.createMessageComponentCollector({
            filter: ({user}) => user.id === member.user.id
        });

        let currentIndex = 0;

        collector.on('collect', async (interaction) => {
            interaction.customId === backId ? (currentIndex -= 10) : (currentIndex += 10);

            await interaction.update({
                embeds: [await generateEmbed(currentIndex)],
                components: [
                    new MessageActionRow({
                        components: [
                            ...(currentIndex ? [backButton] : []),
                            ...(currentIndex + 10 < guilds.length ? [forwardButton] : [])
                        ]
                    })
                ]
            })
        })
    }
}

module.exports = Serverlist;
