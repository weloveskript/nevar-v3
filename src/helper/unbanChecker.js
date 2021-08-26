const Discord = require('discord.js');

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
                const guildData = await client.findOrCreateGuild({ id: guild.id });
                guild.data = guildData;
                guild.members.unban(memberData.id, guild.translate("general/checker:autoUnbanReason")).catch()
                const user = await client.users.fetch(memberData.id);
                const embed = new Discord.MessageEmbed()
                    .setDescription(guild.translate("general/checker:autoUnban")
                        .replace('{emotes.arrow}', client.emotes.arrow)
                        .replace('{user}', user.tag)
                        .replace('{case}', memberData.ban.case))
                    .setColor("#f44271")
                    .setFooter(footer);
                const channel = guild.channels.cache.get(guildData.plugins.logchannel.moderation);
                if(channel){
                    channel.send({embeds: [embed]});
                }
                memberData.ban = {
                    banned: false,
                    endDate: null,
                    case: null
                };
                client.databaseCache.bannedUsers.delete(`${memberData.id}${memberData.guildID}`);
                await memberData.save();
            }
        }, 1000);
    }

};
