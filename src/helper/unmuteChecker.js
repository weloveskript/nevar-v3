module.exports = {
    async init(client){
        client.membersData.find({ "mute.muted": true }).then((members) => {
            members.forEach((member) => {
                client.databaseCache.mutedUsers.set(`${member.id}${member.guildID}`, member);
            });
        });
        setInterval(async () => {
            for (const memberData of [...client.databaseCache.mutedUsers.values()].filter((m) => m.mute.endDate <= Date.now())) {
                const guild = client.guilds.cache.get(memberData.guildID);
                if(!guild) continue;
                const member = guild.members.cache.get(memberData.id) || await guild.members.fetch(memberData.id).catch(() => {
                    memberData.mute = {
                        muted: false,
                        endDate: null,
                        case: null
                    };
                    memberData.save();
                    return null;
                });
                if(member){
                    guild.channels.cache.forEach((channel) => {
                        const permOverwrites = channel.permissionOverwrites.get(member.id).catch(() => {});
                        if(permOverwrites) permOverwrites.delete().catch(() => {});
                    });
                }
                memberData.mute = {
                    muted: false,
                    endDate: null,
                    case: null
                };
                client.databaseCache.mutedUsers.delete(`${memberData.id}${memberData.guildID}`);
                await memberData.save();
            }
        }, 1000);
    }
};
