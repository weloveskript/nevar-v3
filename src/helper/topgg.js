const {  MessageEmbed } = require("discord.js");
const { AutoPoster } = require("topgg-autoposter");
const Topgg = require("@top-gg/sdk");
const express = require("express");
const fetch = require("node-fetch");
const toml = require('toml');
const fs = require('fs');
const config = toml.parse(fs.readFileSync('./config.toml', 'utf-8'));


module.exports = {


    init(client) {
        if (config.apikeys.topgg && config.apikeys.topgg !== "" && config.support.vote_announce_channel && config.support.vote_announce_channel !== "") {

            const ap = AutoPoster(config.apikeys.topgg, client);
            const app = express();

            const webhook = new Topgg.Webhook(config.apikeys.topgg_webhook_auth);
            app.post("/dblwebhook", webhook.listener(async (vote) => {
                const user = await client.users.fetch(vote.user);
                const resp = await fetch("https://discordbots.org/api/bots/" + client.user.id, {
                    headers: {
                        "Authorization": config.apikeys.topgg
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
                    .setAuthor(client.user.username, client.user.displayAvatarURL(), client.website)
                    .setTitle("Thank you for your vote ❤️")
                    .setThumbnail(user.displayAvatarURL())
                    .setDescription(`${client.emotes.boost} | **${user.username}** just voted for our bot!\n${client.emotes.nevar.logo_small_transparent} Here you can vote every 12 hours: **[Click](https://top.gg/bot/${client.user.id}/vote)**`)
                    .setColor(client.embedColor)
                    .setFooter(`${votes} votes in ${month} | Thank you 🖤`);
                client.channels.cache.get(config.support.vote_announce_channel).send({embeds: [embed]});

            }));
            app.listen(3232)
        }
    }
};
