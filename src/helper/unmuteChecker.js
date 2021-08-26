const Discord = require("discord.js");

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
                const guildData = await client.findOrCreateGuild({ id: guild.id });
                guild.data = guildData;
                if(member){
                    guild.channels.cache.forEach((channel) => {
                        const permOverwrites = channel.permissionOverwrites.get(member.id);
                        if(permOverwrites) permOverwrites.delete();
                    });
                }
                const user = member ? member.user : await client.users.fetch(memberData.id);
                const embed = new Discord.MessageEmbed()
                    .setDescription(guild.translate("general/checker:autoUnmute")
                        .replace('{emotes.arrow}', client.emotes.arrow)
                        .replace('{user}', user.tag)
                        .replace('{case}', memberData.mute.case))
                    .setColor("#f44271")
                    .setFooter(footer);
                const channel = guild.channels.cache.get(guildData.plugins.logchannel.moderation);
                if(channel){
                    channel.send(embed);
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
