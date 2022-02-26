const ms = require("ms");
const moment = require("moment");
module.exports = {
    async init(client){
        client.membersData.find({ "ban.banned": true }).then((members) => {
            members.forEach((member) => {
                client.databaseCache.bannedUsers.set(member.id + member.guildID, member);
            });
        });
        setInterval(async () => {
            for (const memberData of [...client.databaseCache.bannedUsers.values()].filter((m) => m.ban.endDate <= Date.now())) {
                const guild = client.guilds.cache.get(memberData.guildID);
                if(!guild) continue;

                guild.members.unban(memberData.id, guild.translate("moderation/ban:main:autoUnban")
                    .replace('{moderator}', memberData.ban.moderator.tag)
                    .replace('{date}', moment.tz(new Date(memberData.ban.bannedAt), guild.translate("language:timezone")).format(guild.translate("language:dateformat")))
                    .replace('{reason}', memberData.ban.reason)
                ).catch(() => {});

                memberData.ban.banned = false;
                memberData.ban.reason = null;
                memberData.ban.moderator.id = null;
                memberData.ban.moderator.tag = null;
                memberData.ban.bannedAt = null;
                memberData.ban.endDate = null;
                memberData.markModified("ban");
                await memberData.save();
                client.databaseCache.bannedUsers.delete(memberData.id + memberData.guildID);
            }
        }, 1000);
    }
};
