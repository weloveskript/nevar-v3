const Command = require('../../core/command');
const { MessageEmbed, MessageButton, MessageActionRow} = require('discord.js');
const {SlashCommandBuilder} = require("@discordjs/builders");
const Resolver = require('../../helper/finder');
const moment = require("moment");


class Warnlist extends Command {

    constructor(client) {
        super(client, {
            name: "warnlist",
            description: "moderation/warnlist:general:description",
            dirname: __dirname,
            cooldown: 5000,
            memberPermissions: ["KICK_MEMBERS"],
            slashCommand: {
                addCommand: true,
                data: new SlashCommandBuilder()
                    .addUserOption(option =>
                        option.setRequired(true))
            }
        });
    }

    async run(interaction, message, args, data) {
        let guild = interaction?.guild || message?.guild;
        let channel = interaction?.channel || message?.channel;
        let executor = interaction?.member || message?.member;

        if(!args[0]){
            if (message) return message.send(this.client.usageEmbed(guild, this, data));
            if (interaction) return interaction.send(this.client.usageEmbed(guild, this, data));
        }

        let member = await guild.members.fetch(args[0]).catch(() => {});
        if(message) member = await Resolver.resolveMember({
            message: message,
            search: args[0]
        });

        if(!member){
            if (message) return message.send(this.client.usageEmbed(guild, this, data));
            if (interaction) return interaction.send(this.client.usageEmbed(guild, this, data));
        }

        const targetData = await this.client.findOrCreateMember({
            guildID: guild.id,
            id: member.user.id
        });

        let warns = [... targetData.warnings.list];

        let backId = executor.user.id + '_back';
        let forwardId = executor.user.id + '_forward';

        let backButton = new MessageButton({
            style: "SECONDARY",
            label: guild.translate("moderation/warnlist:main:back"),
            emoji: '⬅️',
            custom_id: backId
        });

        let forwardButton = new MessageButton({
            style: "SECONDARY",
            label: guild.translate("moderation/warnlist:main:forward"),
            emoji: '➡️',
            custom_id: forwardId
        });


        let generateEmbed = async start => {
            const current = warns.slice(start, start + 5);
            let text = '{text}'
                .replace('{text}',
                    current.map(warn => (
                        '\n\n**'+ this.client.emotes.arrow + ' ' + guild.translate("moderation/warnlist:main:warnNumber").replace('{number}', warns.indexOf(warn) + 1) + '**\n' + '» ' + guild.translate("moderation/warnlist:main:reason") + warn.reason + '\n' + '» ' + guild.translate("moderation/warnlist:main:moderator") + warn.moderator + '\n' + '» ' + guild.translate("moderation/warnlist:main:warnedAt") + moment.tz(new Date(warn.date), guild.translate("language:timezone")).format(guild.translate("language:dateformat"))
                    )).join(''));
            return new MessageEmbed()
                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                .setTitle(guild.translate("moderation/warnlist:main:showing")
                    .replace('{index}', start + 1)
                    .replace('{indexEnd}', start + current.length)
                    .replace('{total}', warns.length)
                    .replace('{emotes.server}', this.client.emotes.discord))
                .setDescription(text)
                .setThumbnail(this.client.user.displayAvatarURL())
                .setColor(this.client.embedColor)
                .setFooter({text: data.guild.footer});
        }

        const canFitOnePage = warns.length <= 5;
        const embedMessage = await channel.send({
            embeds : [await generateEmbed(0)],
            components: canFitOnePage
                ? []
                : [new MessageActionRow({components: [forwardButton]})]
        });
        if(canFitOnePage) return;

        const collector = embedMessage.createMessageComponentCollector({
            filter: ({user}) => user.id === executor.user.id
        });

        let currentIndex = 0;

        collector.on('collect', async (interaction) => {
            interaction.customId === backId ? (currentIndex -= 5) : (currentIndex += 5);

            await interaction.update({
                embeds: [await generateEmbed(currentIndex)],
                components: [
                    new MessageActionRow({
                        components: [
                            ...(currentIndex ? [backButton] : []),
                            ...(currentIndex + 5 < warns.length ? [forwardButton] : [])
                        ]
                    })
                ]
            })
        });
    }
}

module.exports = Warnlist;
