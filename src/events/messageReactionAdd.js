module.exports = class {
    constructor(client) {
        this.client = client;
    }

    async run(messageReaction, user){
        console.log('hmpf')
        if(!user || !messageReaction || user.bot) return;

        const data = {};
        const client = this.client;
        data.config = client.config;
        const guild = await this.client.findOrCreateGuild({ id: messageReaction.message.guild.id });
        messageReaction.message.guild.data = data.guild = guild;
        for(let value of data.guild.reactionRoles){
            let msgId = value.split(' | ')[0];
            let emote = value.split(' | ')[1];
            let roleId = value.split(' | ')[2];
            if(messageReaction.message.id === msgId){
                let state = false;
                if(messageReaction.emoji.id && messageReaction.emoji.id === emote){
                    state = true;
                }else{
                    if(messageReaction.emoji.name === emote){
                        state = true;
                    }
                }
                if(state){
                    let member = await messageReaction.message.guild.members.fetch(user.id);
                    member.roles.add(roleId).catch(() => {});
                }
            }
        }
    }
}
