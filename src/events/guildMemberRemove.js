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

        if(guildData.plugins.goodbye.enabled){
            let goodbyeMessage = guildData.plugins.goodbye.message
                .replace('%%user', member)
                .replace('%%username', member.user.username)
                .replace('%%usertag', member.user.tag)
                .replace('%%membercount', guild.memberCount)
                .replace('%%servername', guild.name);

            let channel = guild.channels.cache.get(guildData.plugins.goodbye.channel) || await guild.channels.fetch(guildData.plugins.goodbye.channel).catch(() => {});

            if(!channel) return;

            channel.send({content:goodbyeMessage}).catch(() => {});
        }
    }
}
