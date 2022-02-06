module.exports = {

    getPrefix(message, data) {
        if (message.channel.type !== "dm") {
            const prefixes = [
                `<@!${message.client.user.id}> `,
                `<@${message.client.user.id}> `,
                message.client.user.username.toLowerCase(),
                data.guild.prefix,
                `hey ${message.client.user.username.toLowerCase()}`,
                `<@${message.client.user.id}> `,
                `hey <@!${message.client.user.id}> `,
            ];
            let prefix = null;
            prefixes.forEach((p) => {
                if (message.content.startsWith(p) || message.content.toLowerCase()
                    .startsWith(p)) {
                    prefix = p;
                }
            });
            return prefix;
        } else {
            return true;
        }
    },

    generatePremiumKey() {
        const { client } = require('../app');
        return client.user.username.toLowerCase() + '_' + [...Array(12)].map(i => (~~(Math.random() * 36))
            .toString(36))
            .join('');

    }
};
