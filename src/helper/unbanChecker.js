module.exports = {
    async init(client){
        client.membersData.find({ "ban.banned": true }).then((members) => {
            members.forEach((member) => {
                client.databaseCache.bannedUsers.set(`${member.id}${member.guildID}`, member);
            });
        });
        setInterval(async () => {
            for (const memberData of [...client.databaseCache.bannedUsers.values()].filter((m) => m.ban.endDate <= Date.now())) {
                const guild = client.guilds.cache.get(memberData.guildID);
                if(!guild) continue;
                guild.members.unban(memberData.id, guild.translate("general/checker:autoUnbanReason")).catch(() => {});
                memberData.ban = {
                    banned: false,
                    endDate: null,
                    case: null
                };
                client.databaseCache.bannedUsers.delete(`${memberData.id}${memberData.guildID}`);
                await memberData.save();
                //Logging einbauen
            }
        }, 1000);
    }
};
