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
                if (message.content.startsWith(p) || message.content.toLowerCase().startsWith(p)) {
                    prefix = p;
                }
            });
            return prefix;
        } else {
            return true;
        }
    },

    sortByKey(array, key) {
        return array.sort(function(a, b) {
            const x = a[key];
            const y = b[key];
            return ((x < y) ? 1 : ((x > y) ? -1 : 0));
        });
    },

    generatePremiumKey() {
        const { client } = require('../app');
        return client.user.username.toLowerCase() + '_' + [...Array(12)].map(i=>(~~(Math.random()*36)).toString(36)).join('');

    },

    getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    },

    shuffle(pArray) {
        const array = [];
        pArray.forEach(element => array.push(element));
        let currentIndex = array.length,
            temporaryValue, randomIndex;
        while (0 !== currentIndex) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }
        return array;
    }
};
