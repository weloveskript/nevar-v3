const Discord = require('discord.js');
const { MessageEmbed } = require('discord.js');

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

        let preferredLang = guild.preferredLocale.split('-')[0]
        for(let lang of this.client.languages){
            if(lang.name.split('-')[0] === preferredLang){
                guildData.language = lang.name;
                guildData.markModified("language");
                await guildData.save();
            }
        }
        if(guildData.blocked) guild.leave().catch(() => {});

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
        mention.delete().catch(() => {});
    }
}
