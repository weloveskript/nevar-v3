const { Guild, Message, MessageEmbed } = require('discord.js')

/**
 *
 * @param key
 * @param args
 * @returns {*}
 */
Guild.prototype.translate = function (key, args) {
    const language = this.client.translations.get((this.data?.language ? this.data.language : 'de-DE'));
    if(!language) console.error(new Error("Invalid language given"))
    return language(key, args)
}

/**
 *
 * @param key
 * @param lang
 * @param args
 * @returns {*}
 */
Guild.prototype.localeString = function (key, lang, args) {

    const language = this.client.translations.get(lang);
    if(!language) console.error(new Error("Invalid language given"))
    return language(key, args)
}

/**
 *
 * @param key
 * @param args
 * @returns {*}
 */
Message.prototype.translate = function(key, args) {
    const language = this.client.translations.get(
        this.guild ? this.guild.data.language : "de-DE"
    );
    if (!language) console.error(new Error("Invalid language given"))
    return language(key, args);
}

