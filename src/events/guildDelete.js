const Discord = require('discord.js');
const { MessageEmbed } = require('discord.js');
const moment = require("moment");

module.exports = class {
    constructor(client) {
        this.client = client
    }

    async run(guild) {
        if (!guild) return

        let supportGuild = this.client.guilds.cache.get(this.client.config.support.id);
        if(!supportGuild) return;

        let logChannel = supportGuild.channels.cache.get(this.client.config.support.bot_log);
        if(!logChannel) return;

        let supportData = await this.client.findOrCreateGuild({
            id: supportGuild.id
        });

        let supportEmbed = new MessageEmbed()
            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
            .setColor('#ff3d3d')
            .setTitle(this.client.emotes.discord + ' ' + guild.name)
            .setThumbnail(guild.iconURL() ? guild.iconURL({dynamic: true}) : 'https://www.designtagebuch.de/wp-content/uploads/mediathek//2021/05/discord-logo-744x545.jpg')
            .setFooter({text: supportData.footer});

        let owner = await this.client.users.fetch(guild.ownerId);
        supportEmbed.addField(supportGuild.translate("welcome:support:owner:name")
                .replace('{emotes.crown}', this.client.emotes.crown),
            supportGuild.translate("welcome:support:owner:value")
                .replace('{owner}', owner.tag), true);

        supportEmbed.addField(supportGuild.translate("welcome:support:members:name")
                .replace('{emotes.members}', this.client.emotes.members),
            supportGuild.translate("welcome:support:members:value")
                .replace('{members}', this.client.format(guild.memberCount)));

        let createdDiff = moment.duration(moment(Date.now()).diff(guild.createdAt))._data;
        let createdAgo = [];

        if(createdDiff.years > 0)
            createdAgo.push(createdDiff.years + ' ' + (createdDiff.years > 1 ? supportGuild.translate("timeUnits:years") : supportGuild.translate("timeUnits:year")));
        if(createdDiff.months > 0)
            createdAgo.push(createdDiff.months + ' ' + (createdDiff.months > 1 ? supportGuild.translate("timeUnits:months") : supportGuild.translate("timeUnits:month")));
        if(createdDiff.days > 0)
            createdAgo.push(createdDiff.days + ' ' + (createdDiff.days > 1 ? supportGuild.translate("timeUnits:days") : supportGuild.translate("timeUnits:day")));
        if(createdDiff.hours > 0)
            createdAgo.push(createdDiff.hours + ' ' + (createdDiff.hours > 1 ? supportGuild.translate("timeUnits:hours") : supportGuild.translate("timeUnits:hour")));
        if(createdDiff.minutes > 0)
            createdAgo.push(createdDiff.minutes + ' ' + (createdDiff.minutes > 1 ? supportGuild.translate("timeUnits:minutes") : supportGuild.translate("timeUnits:minute")));

        createdAgo = createdAgo.join(', ')

        let createdDate = moment.tz(new Date(guild.createdAt), supportGuild.translate("language:timezone")).format(supportGuild.translate("language:dateformat"));

        supportEmbed.addField(supportGuild.translate("welcome:support:createdAt:name")
                .replace('{emotes.calendar}', this.client.emotes.calendar),
            supportGuild.translate("welcome:support:createdAt:value")
                .replace('{createdAt}', createdDate));

        supportEmbed.addField(supportGuild.translate("welcome:support:createdAgo:name")
                .replace('{emotes.calendar}', this.client.emotes.calendar),
            supportGuild.translate("welcome:support:createdAgo:value")
                .replace('{createdAgo}', createdAgo));

        logChannel.send({embeds: [supportEmbed]}).catch(() => {});

    }
};
