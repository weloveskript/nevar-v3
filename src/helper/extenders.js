const { Guild } = require('discord.js');

Guild.prototype.translate = function (key, args) {
    const language = this.client.translations.get((this.data?.language ? this.data.language : 'de-DE'));
    if(!language) console.error(new Error("Invalid language given"))
    return language(key, args)
};

