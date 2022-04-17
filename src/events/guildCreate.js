const Discord = require('discord.js');
const { MessageEmbed } = require('discord.js');
const moment = require("moment");

module.exports = class {
    constructor(client) {
        this.client = client
    }
    async run(guild){
        if(!guild || !guild.available) return
        await guild.fetch();
        let guildData = await this.client.findOrCreateGuild({
            id: guild.id
        });

        // TODO: Hinzufügen wenn alle Übersetzungen für die Sprachen fertig sind
        /**
        let preferredLang = guild.preferredLocale.split('-')[0]
        for(let lang of this.client.languages){
            if(lang.name.split('-')[0] === preferredLang){
                guildData.language = lang.name;
                guildData.markModified("language");
                await guildData.save();
            }
        }
         **/
        // Solange immer Sprache auf Deutsch setzen
        guildData.language = 'de-DE';
        guildData.markModified("language");
        await guildData.save();
        if(guildData.blocked) {
            guild.leave().catch(() => {});
            return;
        }

        let firstChannel = guild.channels.cache.find(c => (c.type === 'GUILD_TEXT' || c.type === 'GUILD_NEWS') && c.permissionsFor(guild.me).has(Discord.Permissions.FLAGS.SEND_MESSAGES));

        let inviter = {
            name: 'Unknown#0000',
            id: '000000000000000000',
            avatar: 'https://cdn.freelogovectors.net/wp-content/uploads/2021/05/discord_logo-freelogovectors.net_-400x400.png'
        };
        let auditLogEntries = await guild.fetchAuditLogs({
            limit: 3,
            type: 'BOT_ADD'
        }).catch(() => {});

        if(auditLogEntries) {
            for (let auditLogEntry of auditLogEntries.entries.values()) {
                if (auditLogEntry.target.id === this.client.user.id) {
                    inviter = {
                        name: auditLogEntry.executor.tag,
                        id: auditLogEntry.executor.id,
                        avatar: auditLogEntry.executor.displayAvatarURL({dynamic: true})
                    };
                }
            }
        }
        let embed = new MessageEmbed()
            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
            .setTitle(guild.translate("welcome:general:title")
                .replace('{emotes.support}', this.client.emotes.badges.earlysupporter))
            .setDescription(guild.translate("welcome:general:description")
                .replaceAll('{emotes.arrow}', this.client.emotes.arrow)
                .replace('{prefix}', guildData.prefix)
                .replace('{support}', this.client.supportUrl)
                .replace('{client}', this.client.user.username))
            .setColor(this.client.embedColor)
            .setThumbnail(this.client.user.displayAvatarURL({dynamic:true}))
            .setFooter({text: guild.translate("welcome:general:footer")
                    .replace('{inviter}', inviter.name), iconURL: inviter.avatar});
        await firstChannel.send({embeds:[embed]}).catch(() => {});
        await firstChannel.send({content: this.client.supportUrl}).catch(() => {});
        let mention = await firstChannel.send({content:'<@' + inviter.id + '>'}).catch(() => {});
        mention?.delete().catch(() => {});

        let supportGuild = this.client.guilds.cache.get(this.client.config.support.id);
        if(!supportGuild) return;

        let logChannel = supportGuild.channels.cache.get(this.client.config.support.bot_log);
        if(!logChannel) return;

        let supportData = await this.client.findOrCreateGuild({
            id: supportGuild.id
        });

        let supportEmbed = new MessageEmbed()
            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
            .setColor('#3dff57')
            .setTitle(this.client.emotes.discord + ' ' + guild.name)
            .setThumbnail(guild.iconURL() ? guild.iconURL({dynamic: true}) : 'https://www.designtagebuch.de/wp-content/uploads/mediathek//2021/05/discord-logo-744x545.jpg')
            .setFooter({text: supportData.footer});

        if(inviter.name !== 'Unknown#0000') {
            supportEmbed.addField(supportGuild.translate("welcome:support:invited:name")
                    .replace('{emotes.support}', this.client.emotes.badges.earlysupporter),
                supportGuild.translate("welcome:support:invited:value")
                    .replace('{inviter}', inviter.name), true)
        }

        let owner = await guild.members.fetch(guild.ownerId);
        supportEmbed.addField(supportGuild.translate("welcome:support:owner:name")
                .replace('{emotes.crown}', this.client.emotes.crown),
            supportGuild.translate("welcome:support:owner:value")
                .replace('{owner}', owner.user.tag), true);

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
}
