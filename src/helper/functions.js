module.exports = {
    /**
     *
     * @param message
     * @param data
     * @returns {null|boolean}
     */
    getPrefix(message, data) {
        if (message.channel.type !== "dm") {
            const prefixes = [
                `<@!${message.client.user.id}> `,
                `<@${message.client.user.id}> `,
                message.client.user.username.toLowerCase(),
                data.guild.prefix,
                `hey ${message.client.user.username.toLowerCase()}`,
                `hey <@${message.client.user.id}> `,
                `hey <@!${message.client.user.id}> `,
                `moin ${message.client.user.username.toLowerCase()}`,
                `moin <@${message.client.user.id}> `,
                `moin <@!${message.client.user.id}> `
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
    /**
     *
     * @param array
     * @param key
     * @returns {*}
     */
    sortByKey(array, key) {
        return array.sort(function(a, b) {
            const x = a[key];
            const y = b[key];
            return ((x < y) ? 1 : ((x > y) ? -1 : 0));
        });
    },

    /**
     *
     * @param pArray
     * @returns {*[]}
     */
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
    },

    /**
     *
     * @param min
     * @param max
     * @returns {*}
     */
    randomNum(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }
};
