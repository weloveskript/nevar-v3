const Command = require('../../core/command');
const { MessageEmbed} = require('discord.js');
const {SlashCommandBuilder} = require("@discordjs/builders");
const moment = require('moment');
const systeminformation = require('systeminformation');
const fs = require('fs');

class Stats extends Command {

    constructor(client) {
        super(client, {
            name: "stats",
            description: "misc/stats:general:description",
            dirname: __dirname,
            aliases: ["bot-stats", "botinfo", "info"],
            cooldown: 5000,
            slashCommand: {
                addCommand: true,
                data: new SlashCommandBuilder()
            }
        });
    }

    async run(interaction, message, args, data) {
        let guild = interaction?.guild || message.guild;
        const channel = interaction?.channel || message.channel;

        let uptimeRaw = moment.duration(this.client.uptime)._data;
        let uptime = [];
        if(uptimeRaw.years > 0)
            uptime.push(uptimeRaw.years + ' ' + (uptimeRaw.years > 1 ? guild.translate("timeUnits:years") : guild.translate("timeUnits:year")));
        if(uptimeRaw.months > 0)
            uptime.push(uptimeRaw.months + ' ' + (uptimeRaw.months > 1 ? guild.translate("timeUnits:months") : guild.translate("timeUnits:month")));
        if(uptimeRaw.days > 0)
            uptime.push(uptimeRaw.days + ' ' + (uptimeRaw.days > 1 ? guild.translate("timeUnits:days") : guild.translate("timeUnits:day")));
        if(uptimeRaw.hours > 0)
            uptime.push(uptimeRaw.hours + ' ' + (uptimeRaw.hours > 1 ? guild.translate("timeUnits:hours") : guild.translate("timeUnits:hour")));
        if(uptimeRaw.minutes > 0)
            uptime.push(uptimeRaw.minutes + ' ' + (uptimeRaw.minutes > 1 ? guild.translate("timeUnits:minutes") : guild.translate("timeUnits:minute")));
        if(uptimeRaw.seconds > 0)
            uptime.push(uptimeRaw.seconds + ' ' + (uptimeRaw.seconds > 1 ? guild.translate("timeUnits:seconds") : guild.translate("timeUnits:second")));
        if(uptime.length < 1) uptime = ['1 ' + guild.translate("timeUnits:second")];
        uptime = uptime.join(', ')


        let staffs = [];
        let staffJson = JSON.parse(fs.readFileSync('./storage/staffs.json'));
        let staffIds = Object.keys(staffJson);
        let botOwner = await this.client.users.fetch(this.client.config.team.owner_id);
        staffs.push(guild.translate("misc/stats:main:staffRoles:head_staff") + ' » ' + botOwner.tag)
        for(let id of staffIds){
            staffs.push(guild.translate("misc/stats:main:staffRoles:" + Object.values(staffJson)[staffIds.indexOf(id)]) + ' » ' + (await this.client.users.fetch(id)).tag);
        }

        let totalMembers = 0;
        for(let guild of this.client.guilds.cache){
            totalMembers = totalMembers + (guild[1].memberCount || 0);
        }
        let averageMemberCount = totalMembers / this.client.guilds.cache.size;


        let os = 'Debian 10';
        await systeminformation.osInfo()
            .then(data => os = data.distro + ' ' + data.release)

        const packageJson = require('../../../package.json');

        let embed = new MessageEmbed()
            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
            .setThumbnail(guild.iconURL({dynamic: true}))
            .setTitle(guild.translate("misc/stats:main:title"))

            .addField(guild.translate("misc/stats:main:fields:staffs:name")
                    .replace('{emotes.people}', this.client.emotes.members),
                guild.translate("misc/stats:main:fields:staffs:value")
                    .replace('{staffs}', staffs.join('\n')))

            .addField(guild.translate("misc/stats:main:fields:uptime:name")
                    .replace('{emotes.clock}', this.client.emotes.time),
                guild.translate("misc/stats:main:fields:uptime:value")
                    .replace('{uptime}', uptime))

            .addField(guild.translate("misc/stats:main:fields:os:name")
                    .replace('{emotes.server}', this.client.emotes.server),
                guild.translate("misc/stats:main:fields:os:value")
                    .replace('{os}', os), true)

            .addField(guild.translate("misc/stats:main:fields:memory:name")
                    .replace('{emotes.server}', this.client.emotes.server),
                guild.translate("misc/stats:main:fields:memory:value")
                    .replace('{memory}', (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2) + ' / ' + (process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2) + ' MB'), true)

            .addField(guild.translate("misc/stats:main:fields:guilds:name")
                    .replace('{emotes.server}', this.client.emotes.server),
                guild.translate("misc/stats:main:fields:guilds:value")
                    .replace('{guilds}', this.client.format(this.client.guilds.cache.size)))

            .addField(guild.translate("misc/stats:main:fields:users:name")
                    .replace('{emotes.people}', this.client.emotes.members),
                guild.translate("misc/stats:main:fields:users:value")
                    .replace('{users}', this.client.format(this.client.guilds.cache.reduce((sum, guild) => sum + (guild.available ? guild.memberCount : 0), 0))), true)

            .addField(guild.translate("misc/stats:main:fields:averageMembers:name")
                    .replace('{emotes.people}', this.client.emotes.members),
                guild.translate("misc/stats:main:fields:averageMembers:value")
                    .replace('{averageMembers}', this.client.format(averageMemberCount)), true)

            .addField(guild.translate("misc/stats:main:fields:channels:name")
                    .replace('{emotes.channel}', this.client.emotes.channels),
                guild.translate("misc/stats:main:fields:channels:value")
                    .replace('{channels}', this.client.format(this.client.channels.cache.size)), true)

            .addField(guild.translate("misc/stats:main:fields:commands:name")
                    .replace('{emotes.command}', this.client.emotes.use),
                guild.translate("misc/stats:main:fields:commands:value")
                    .replace('{commands}', this.client.format(this.client.commands.size)))

            .addField(guild.translate("misc/stats:main:fields:nodejs:name")
                    .replace('{emotes.js}', this.client.emotes.js),
                guild.translate("misc/stats:main:fields:nodejs:value")
                    .replace('{nodeVer}', process.version), true)

            .addField(guild.translate("misc/stats:main:fields:library:name")
                    .replace('{emotes.book}', this.client.emotes.books),
                guild.translate("misc/stats:main:fields:library:value")
                    .replace('{library}', 'discord.js'), true)

            .addField(guild.translate("misc/stats:main:fields:botVersion:name")
                    .replace('{emotes.version}', this.client.emotes.logo.transparent),
                guild.translate("misc/stats:main:fields:botVersion:value")
                    .replace('{botVersion}', packageJson.version), true)


            .setColor(this.client.embedColor)
            .setFooter({text: data.guild.footer});
        if(message) return message.send(embed);
        if(interaction) return interaction.send(embed);

    }
}
module.exports = Stats;
