module.exports = class {
    constructor(client){
        this.client = client;
    }

    async run(member){
        if(!member || !member.guild) return;

        let guild = member.guild;

        const guildData = await this.client.findOrCreateGuild({
            id: guild.id
        });

        for(let roleId of guildData.plugins.autoroles.list){
            let role = guild.roles.cache.get(roleId) || await guild.roles.fetch(roleId).catch(() => {});
            if(!role) continue;

            member.roles.add(role, 'Autorole').catch(() => {});
        }

        if(guildData.plugins.welcome.enabled){
            let welcomeMessage = guildData.plugins.welcome.message
                .replace('%%user', member)
                .replace('%%username', member.user.username)
                .replace('%%usertag', member.user.tag)
                .replace('%%membercount', guild.memberCount)
                .replace('%%servername', guild.name);

            let channel = guild.channels.cache.get(guildData.plugins.welcome.channel) || await guild.channels.fetch(guildData.plugins.welcome.channel).catch(() => {});

            if(!channel) return;

            channel.send({content:welcomeMessage}).catch(() => {});
        }
    }
}
