const {  MessageEmbed } = require("discord.js"),
    { AutoPoster } = require("topgg-autoposter"),
    Topgg = require("@top-gg/sdk"),
    express = require("express"),
    fetch = require("node-fetch"),
    config = require('../../config.json')


module.exports = {

    init(client) {
        if (config.apiKeys.dbl && config.apiKeys.dbl !== "") {

            const { AutoPoster } = require('topgg-autoposter');

            const ap = AutoPoster(client.config.apiKeys.dbl, client);

            const Topgg = require('@top-gg/sdk')
                , express = require('express');

            const app = express();

            const webhook = new Topgg.Webhook(config.apiKeys.dblwebhookauth);
            app.post("/dblwebhook", webhook.listener(async (vote) => {
                console.log(vote.user);
                const user = await client.users.fetch(vote.user);
                const resp = await fetch("https://discordbots.org/api/bots/" + client.user.id, {
                    headers: {
                        "Authorization": client.config.apiKeys.dbl
                    }
                });
                const data = await resp.json();

                let votes = 0;
                const date = new Date();
                const month = date.toLocaleString('en-GB', {
                    month: 'long'
                });
                if (!data.error) {
                    votes = data.monthlyPoints;
                }
                let embed = new MessageEmbed()
                    .setAuthor(client.user.username, client.user.displayAvatarURL(), website)
                    .setTitle("Thank you for your vote ❤️")
                    .setThumbnail(user.displayAvatarURL())
                    .setDescription(`${client.emojis.boost} | **${user.username}** just voted for our bot!\n${client.emojis.nevar.logo_small_transparent} Here you can vote every 12 hours: **[Click](https://top.gg/bot/${client.user.id}/vote)**`)
                    .setColor(client.embedColor)
                    .setFooter(`${votes} votes in ${month} | Thank you 🖤`);
                client.channels.cache.get(config.support.voteChannel).send(embed);

            }));
            app.listen(3232)

        }
    }

};
