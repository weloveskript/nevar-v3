const Command = require('../../core/command');
const { MessageEmbed} = require('discord.js');
const {SlashCommandBuilder} = require("@discordjs/builders");
const moment = require('moment');

class Serverinfo extends Command {

    constructor(client) {
        super(client, {
            name: "serverinfo",
            description: "misc/si:general:description",
            dirname: __dirname,
            aliases: ["si", "server-info"],
            cooldown: 5000,
            slashCommand: {
                addCommand: true,
                data: new SlashCommandBuilder()
            }
        });
    }
    async run(interaction, message, args, data){
        let guild = interaction?.guild || message.guild;
        const channel = interaction?.channel || message.channel;

        let createdDiff = moment.duration(moment(Date.now()).diff(guild.createdAt))._data;
        let createdAgo = [];

        if(createdDiff.years > 0)
            createdAgo.push(createdDiff.years + ' ' + (createdDiff.years > 1 ? guild.translate("timeUnits:years") : guild.translate("timeUnits:year")));
        if(createdDiff.months > 0)
            createdAgo.push(createdDiff.months + ' ' + (createdDiff.months > 1 ? guild.translate("timeUnits:months") : guild.translate("timeUnits:month")));
        if(createdDiff.days > 0)
            createdAgo.push(createdDiff.days + ' ' + (createdDiff.days > 1 ? guild.translate("timeUnits:days") : guild.translate("timeUnits:day")));
        if(createdDiff.hours > 0)
            createdAgo.push(createdDiff.hours + ' ' + (createdDiff.hours > 1 ? guild.translate("timeUnits:hours") : guild.translate("timeUnits:hour")));

        createdAgo = createdAgo.join(', ')

        let boostsForLevel = {
            'NONE': 0,
            'TIER_1': 2,
            'TIER_2': 7,
            'TIER_3': 14
        }

        let createdDate = moment.tz(new Date(guild.createdAt), guild.translate("language:timezone")).format(guild.translate("language:dateformat"));
        let owner = await guild.members.fetch(guild.ownerId);


        let embed = new MessageEmbed()
            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
            .setThumbnail(guild.iconURL({dynamic: true}))

            .addField(guild.translate("misc/si:main:fields:name:name")
                .replace('{emotes.pencil}', this.client.emotes.pencil),
                guild.translate("misc/si:main:fields:name:value")
                    .replace('{guildName}', guild.name), true)

            .addField(guild.translate("misc/si:main:fields:id:name")
                .replace('{emotes.id}', this.client.emotes.id),
                guild.translate("misc/si:main:fields:id:value")
                    .replace('{guildId}', guild.id), true)

            .addField(guild.translate("misc/si:main:fields:owner:name")
                    .replace('{emotes.crown}', this.client.emotes.crown),
                guild.translate("misc/si:main:fields:owner:value")
                    .replace('{guildOwner}', owner.user.tag))

            .addField(guild.translate("misc/si:main:fields:members:name")
                    .replace('{emotes.people}', this.client.emotes.members),
                guild.translate("misc/si:main:fields:members:value")
                    .replace('{memberCount}', guild.memberCount), true)

            .addField(guild.translate("misc/si:main:fields:channels:name")
                    .replace('{emotes.channel}', this.client.emotes.channels),
                guild.translate("misc/si:main:fields:channels:value")
                    .replace('{channelCount}', guild.channels.cache.filter(c => c.type === "GUILD_TEXT" || c.type === "GUILD_NEWS" || c.type === "GUILD_VOICE").size)
                    .replace('{text}', guild.channels.cache.filter(c => c.type === "GUILD_TEXT" || c.type === "GUILD_NEWS").size)
                    .replace('{voice}', guild.channels.cache.filter(c => c.type === "GUILD_VOICE").size), true)

            .addField(guild.translate("misc/si:main:fields:members:name")
                    .replace('{emotes.people}', this.client.emotes.members),
                guild.translate("misc/si:main:fields:members:value")
                    .replace('{memberCount}', guild.memberCount), true)

            .addField(guild.translate("misc/si:main:fields:createdAt:name")
                    .replace('{emotes.calendar}', this.client.emotes.calendar),
                guild.translate("misc/si:main:fields:createdAt:value")
                    .replace('{createdAt}', createdDate))

            .addField(guild.translate("misc/si:main:fields:createdBefore:name")
                    .replace('{emotes.calendar}', this.client.emotes.calendar),
                guild.translate("misc/si:main:fields:createdBefore:value")
                    .replace('{createdBefore}', createdAgo))

            .addField(guild.translate("misc/si:main:fields:boosts:name")
                    .replace('{emotes.boost}', this.client.emotes.boost),
                guild.translate("misc/si:main:fields:boosts:value")
                    .replace('{boosts}', guild.premiumSubscriptionCount), true)

            .addField(guild.translate("misc/si:main:fields:boostLevel:name")
                    .replace('{emotes.boost}', this.client.emotes.boost),
                guild.translate("misc/si:main:fields:boostLevel:value")
                    .replace('{boostLevel}', guild.premiumTier
                        .replace('NONE', '0')
                        .replace('TIER_1', '1')
                        .replace('TIER_2', '2')
                        .replace('TIER_3', '3')), true)

            .addField(guild.translate("misc/si:main:fields:boostsUntil:name")
                    .replace('{emotes.boost}', this.client.emotes.boost)
                    .replace('{level}', guild.premiumTier
                        .replace('NONE', '1')
                        .replace('TIER_1', '2')
                        .replace('TIER_2', '3')
                        .replace('TIER_3', '3')),
                guild.translate("misc/si:main:fields:boostsUntil:value")
                    .replace('{boostsUntil}', (boostsForLevel[guild.premiumTier.replace('NONE', 'TIER_1')] - guild.premiumSubscriptionCount)), true)

            .setColor(this.client.embedColor)
            .setFooter(data.guild.footer);
        if(message) return message.send(embed);
        if(interaction) return interaction.send(embed);


    }
}

module.exports = Serverinfo;
