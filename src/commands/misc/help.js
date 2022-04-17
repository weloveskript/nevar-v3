const Command = require('../../core/command');
const { MessageEmbed, MessageActionRow, MessageSelectMenu, MessageButton} = require('discord.js');
const {SlashCommandBuilder} = require("@discordjs/builders");
const moment = require('moment');
const fs = require("fs");
const Discord = require('discord.js');

class Help extends Command {

    constructor(client) {
        super(client, {
            name: "help",
            description: "misc/help:general:description",
            dirname: __dirname,
            cooldown: 5000,
            slashCommand: {
                addCommand: true,
                data: new SlashCommandBuilder()
            }
        });
    }

    async run(interaction, message, args, data) {
        const guild = interaction?.guild || message.guild;
        const channel = interaction?.channel || message.channel;
        const member = interaction?.member || message.member;

        let desc = guild.translate("misc/help:main:links")
            .replace('{emotes.discord}', this.client.emotes.discord)
            .replace('{support}', this.client.supportUrl)
            .replace('{emotes.logo}', this.client.emotes.logo.normal)
            .replace('{invite}', this.client.invite)
            .replace('{emotes.web}', this.client.emotes.url)
            .replace('{website}', this.client.website)
            .replace('{emotes.settings}', this.client.emotes.custom)
            .replace('{dashboard}', this.client.config.webdashboard.base_url)

        desc += guild.translate("misc/help:main:prefix")
            .replace('{prefix}', data.guild.prefix)

        const categories = [];
        const commands = this.client.commands;
        let staffs = JSON.parse(fs.readFileSync('./storage/staffs.json'));

        commands.forEach((command) => {
            if (!categories.includes(command.help.category)) {
                if (command.help.category === "owner" && member.user.id !== this.client.config.team.owner_id) return;
                if (command.help.category === "staff" && (!staffs[member.user.id] && member.user.id !== this.client.config.team.owner_id)) return;

                categories.push(command.help.category);
            }
        });

        categories.sort();

        let row = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId(member.user.id + '_helpmenu')
                    .setPlaceholder(guild.translate("misc/help:main:placeholder"))
            )
        let sortedCategories = [];

        for(let category of categories){
            row.components[0].options.push({
                label: guild.translate("misc/help:main:categoriesList:" + category),
                value: member.user.id + '_' + category,
                emoji: this.client.emojis.cache.find((emoji) => emoji.toString() === this.client.emotes.categories[category])
            })
            sortedCategories.push(this.client.emotes.categories[category] + ' **' + guild.translate("misc/help:main:categoriesList:" + category) + '**');
        }


        let sent;
        let news = JSON.parse(fs.readFileSync('./storage/news.json'))
        let embed = new MessageEmbed()
            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
            .setDescription(desc)
            .setColor(this.client.embedColor)
            .setThumbnail(this.client.user.displayAvatarURL())
            .addField(guild.translate("misc/help:main:categories"), guild.translate("misc/help:main:categories_value")
                .replace('{categories}', sortedCategories.join('\n')), true)
            .addField(
                guild.translate("misc/help:main:news:title")
                    .replace('{date}', moment.tz(new Date(news.timestamp), guild.translate("language:timezone")).format(guild.translate("language:onlyDateFormat"))),
                guild.translate("misc/help:main:news:news")
                    .replace('{news}', news.text), true)
            .setFooter({text: guild.translate("misc/help:main:footer")});
        if(message) sent = await message.send(embed, false, [row]);
        if(interaction) sent = await interaction.send(embed, false, [row]);

        const collector = sent.createMessageComponentCollector({
            filter: (i) => i.customId === member.user.id + '_helpmenu',
        });

        collector.on("collect", async (chooseCategory) => {
            let currentIndex = 0;
            let category = chooseCategory.values[0].split('_')[1];
            let commands = this.client.commands.filter((command) => command.help.category === category);


            let backId = member.user.id + '_back';
            let forwardId = member.user.id + '_forward';

            let backButton = new MessageButton({
                style: "SECONDARY",
                label: guild.translate("misc/help:main:back"),
                emoji: '⬅️',
                custom_id: backId
            });

            let forwardButton = new MessageButton({
                style: "SECONDARY",
                label: guild.translate("misc/help:main:forward"),
                emoji: '➡️',
                custom_id: forwardId
            });

            const cmds = [... commands.values()];

            let generateEmbed = async start => {
                const current = cmds.slice(start, start + 10);
                let text = '{text}'.replace('{text}',
                    await Promise.all(current.map(cmd => (

                        '**' + cmd.help.name.charAt(0).toUpperCase() + cmd.help.name.slice(1) + '**' +
                        '\n' + guild.translate(cmd.help.description).replace(/[^\p{L}\p{N}\p{P}\p{Z}^$\n]/gu, '') + '\n\n'

                    ))));

                let embed = new MessageEmbed()
                    .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                    .setTitle(guild.translate("misc/help:main:showing")
                        .replace('{index}', start + 1)
                        .replace('{indexEnd}', start + current.length)
                        .replace('{total}', cmds.length)
                        .replace('{emotes.dev}', this.client.emotes.badges.verifieddev))
                    .setDescription(text)
                    .setColor(this.client.embedColor)
                    .setFooter({text: data.guild.footer});

                return embed;
            }

            const canFitOnePage = cmds.length <= 10;
            await chooseCategory.update({
                embeds : [await generateEmbed(0)],
                components: canFitOnePage
                    ? []
                    : [new MessageActionRow({components: [forwardButton]})]
            })
            if(canFitOnePage) return;

            const collector2 = sent.createMessageComponentCollector({
                filter: ({user}) => user.id === member.user.id
            });

            currentIndex = 0;

            collector2.on('collect', async (collectPagination) => {
                collectPagination.customId === backId ? (currentIndex -= 10) : (currentIndex += 10);

                    await collectPagination.update({
                        embeds: [await generateEmbed(currentIndex)],
                        components: [
                            new MessageActionRow({
                                components: [
                                    ...(currentIndex ? [backButton] : []),
                                    ...(currentIndex + 10 < cmds.length ? [forwardButton] : [])
                                ]
                            })
                        ]
                    })
                }
            )
        })
    }
}

module.exports = Help;
