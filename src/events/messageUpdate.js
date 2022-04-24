const {Permissions} = require("discord.js");
module.exports = class {
    constructor(client) {
        this.client = client;
    }

    async run(oldMessage, newMessage) {

        if (!newMessage) return;
        if (!newMessage?.guild) return;
        if (!newMessage?.guild?.available) return;

        const data = {
            config: this.client.config,
            guild: await this.client.findOrCreateGuild({id: newMessage.guild.id}),
            memberData: await this.client.findOrCreateMember({id: newMessage.author.id, guildID: newMessage.guild.id}),
            userData: await this.client.findOrCreateUser({id: newMessage.author.id})
        };

        newMessage.guild.data = data.guild;


        if (data.guild.plugins.blacklist?.list.length > 0) {
            for (let word of data.guild.plugins.blacklist.list) {
                if (newMessage.content.toLowerCase().includes(word)) {
                    if (!newMessage.channel.permissionsFor(newMessage.member).has(Permissions.FLAGS.ADMINISTRATOR) || !newMessage.channel.permissionsFor(newMessage.member).has(Permissions.FLAGS.MANAGE_GUILD) || !newMessage.channel.permissionsFor(newMessage.member).has(Permissions.FLAGS.MANAGE_MESSAGES)) {
                        return newMessage.delete().catch(() => {});
                    }
                }
            }
        }
    }
}
