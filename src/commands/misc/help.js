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
                    .addStringOption(option => option.setRequired(false))
            }
        });
    }

    async run(interaction, message, args, data) {
        const guild = interaction?.guild || message.guild;
        const channel = interaction?.channel || message.channel;
        const member = interaction?.member || message.member;

        let cmd;
        if(args[0]) cmd = this.client.commands.get(args[0].toString().toLowerCase()) || this.client.commands.get(this.client.aliases.get(args[0].toString().toLowerCase()));

        if(cmd){
            const embed = new MessageEmbed()
                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                .setColor(this.client.embedColor)
                .setTitle(guild.translate("misc/help:main:command:helpFor")
                    .replace('{emoji}', guild.translate(cmd.help.category + '/' + cmd.help.name + ':general:emoji'))
                    .replace('{command}', cmd.help.name.charAt(0).toUpperCase() + cmd.help.name.slice(1))
                    .replace('{category}', guild.translate("misc/help:main:categoriesList:" + cmd.help.category)))
                .setDescription('```' + guild.translate(cmd.help.description) + '```')
                .addField(guild.translate("misc/help:main:command:syntax:name"), '```' + guild.translate("misc/help:main:command:syntax:value")
                    .replace('{syntax}', guild.translate(cmd.help.category + '/' + cmd.help.name + ':general:syntax')) + '```')
                .addField(guild.translate("misc/help:main:command:examples:name"), '```' + guild.translate("misc/help:main:command:examples:value")
                    .replace('{examples}', guild.translate(cmd.help.category + '/' + cmd.help.name + ':general:examples')) + '```')
                .addField(guild.translate("misc/help:main:command:premium:name"), '```' + guild.translate("misc/help:main:command:premium:value")
                    .replace('{state}', cmd.conf.premium ? guild.translate("language:yes") : guild.translate("language:no")) + '```', true)
                .addField(guild.translate("misc/help:main:command:cooldown:name"), '```' + guild.translate("misc/help:main:command:cooldown:value")
                    .replace('{cooldown}', cmd.conf.cooldown/1000) + '```', true)
                .addField(guild.translate("misc/help:main:command:permissions:name"), '```' + guild.translate("misc/help:main:command:permissions:value")
                    .replace('{permissions}', cmd.conf.memberPermissions.length > 0 ? cmd.conf.memberPermissions.join('\n') : guild.translate("language:noEntries")) + '```')
                .addField(guild.translate("misc/help:main:command:slashcommand:name"), '```' + guild.translate("misc/help:main:command:slashcommand:value")
                    .replace('{state}', cmd.slashCommand.addCommand ? guild.translate("language:yes") : guild.translate("language:no")) + '```')
                .addField(guild.translate("misc/help:main:command:aliases:name"), '```' + guild.translate("misc/help:main:command:aliases:value")
                    .replace('{aliases}', cmd.help.aliases.length > 0 ? cmd.help.aliases.join('\n') : guild.translate("language:noEntries")) + '```')
                .setThumbnail(this.client.user.displayAvatarURL())
                .setFooter({text: data.guild.footer});
            return channel.send({embeds:[embed]});
        }


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
        let mainEmbed = new MessageEmbed()
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
        if(message) sent = await message.send(mainEmbed, false, [row]);
        if(interaction) sent = await interaction.send(mainEmbed, false, [row]);

        const collector = sent.createMessageComponentCollector({
            filter: (i) => i.customId === member.user.id + '_helpmenu',
        });

        collector.on("collect", async (chooseCategory) => {
            if(chooseCategory.customId !== chooseCategory.user.id + '_helpmenu') return;
            let currentIndex = 0;
            let category = chooseCategory.values[0].split('_')[1];
            let commands = this.client.commands.filter((command) => command.help.category === category);


            let backId = member.user.id + '_back';
            let forwardId = member.user.id + '_forward';
            let homeId = member.user.id + '_home';

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

            let homeButton = new MessageButton({
                style: "DANGER",
                label: guild.translate("misc/help:main:home"),
                emoji: "🏠",
                custom_id: homeId
            });

            const cmds = [... commands.values()];

            let generateEmbed = async start => {
                const current = cmds.slice(start, start + 10);
                let text = '{text}'.replace('{text}',
                    current.map(cmd => (

                        guild.translate(cmd.help.category + '/' + cmd.help.name + ':general:emoji') + ' `' + data.guild.prefix + cmd.help.name + '`' +
                        '\n» ' + guild.translate(cmd.help.description).replace(/[^\p{L}\p{N}\p{P}\p{Z}^$\n]/gu, '') + '\n\n'

                    )).join(''));

                let embed = new MessageEmbed()
                    .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                    .setTitle(guild.translate("misc/help:main:showing")
                        .replace('{index}', start + 1)
                        .replace('{indexEnd}', start + current.length)
                        .replace('{total}', cmds.length)
                        .replace('{category}', this.client.emotes.categories[category] + ' ' + guild.translate("misc/help:main:categoriesList:" + category)))
                    .setDescription(text)
                    .setColor(this.client.embedColor)
                    .setFooter({text: data.guild.footer});

                return embed;
            }

            const canFitOnePage = cmds.length <= 10;
            await chooseCategory.update({
                embeds : [await generateEmbed(0)],
                components: canFitOnePage
                    ? [new MessageActionRow({components: [homeButton]})]
                    : [new MessageActionRow({components: [forwardButton, homeButton]})]
            })
            if(canFitOnePage) return;

            const collector2 = sent.createMessageComponentCollector({
                filter: ({user}) => user.id === member.user.id
            });

            currentIndex = 0;

            collector2.on('collect', async (collectPagination) => {
                if(collectPagination.customId === backId || collectPagination.customId === forwardId){
                    collectPagination.customId === backId ? (currentIndex -= 10) : (currentIndex += 10);

                    await collectPagination.deferUpdate().catch(() => {});
                    await sent.edit({
                        embeds: [await generateEmbed(currentIndex)],
                        components: [
                            new MessageActionRow({
                                components: [
                                    ...(currentIndex ? [backButton, homeButton] : []),
                                    ...(currentIndex + 10 < cmds.length ? [forwardButton, homeButton] : [])
                                ]
                            })
                        ]
                    })
                }
            })

            const homeCollector = sent.createMessageComponentCollector({
                filter: (i) => i.customId === member.user.id + '_home',
            });

            homeCollector.on("collect", async (homeInteraction) => {
                if(homeInteraction.customId !== homeInteraction.user.id + '_home') return;
                await homeInteraction.deferUpdate().catch(() => {});
                sent.edit({
                   embeds: [mainEmbed],
                   components: [row]
                });
            });
        })
    }
}

module.exports = Help;
