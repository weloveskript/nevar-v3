const logger = require('../../src/helper/log')
    , fs = require('fs')
    , { baseDir } = require('../../src/app');
logger.log('Config generation started..', "debug")


let conf = {
    bot_token: "paste_your_bot_token_here",
    embeds: {
        footer: "Your text for any embed footer",
        support: "Invitation to your support server",
        web: "Link to your website (if you don't have one, you can also enter your support url) -> important: must not be empty",
        color: "Hex or RGB color for the embeds",
    },

    support: {
        id: "Discord ID of your support server",
        logChannel: "ID of the channel where all bot logs are sent",
        partnerChannel: "ID of the channel where new partners are announced -> can be left blank",
        serverChannel: "ID of the channel where the current server count is displayed -> can be left blank",
        userChannel: "ID of the channel where the current user count is displayed -> can be left blank",
        voteCountChannel: "ID of the channel where the current vote count is displayed -> can be left blank",
        newVotesChannel: "ID of the channel where the voters are thanked -> can be left blank"
    },

    webApi: {
        transfer: false,
        path: "/path/to/your/json/file.json",
    },

    mongoDB_url: "mongodb://YOUR_USERNAME:YOUR_PASSWORD@127.0.0.1:27017/YOUR_DATABASE?authMechanism=DEFAULT&authSource=admin",

    prefix: "-",

    music: {
        filters: ["8D", "gate", "haas", "phaser", "treble", "tremolo", "vibrato", "reverse", "karaoke", "flanger", "mcompand", "pulsator", "subboost", "bassboost", "vaporwave", "nightcore", "normalizer", "surrounding"],
        youtube_cookie: "your_youtube_cookie",
        stay_time: 25
    },

    owner_id: "your_discord_id",

    staffs: [
        "all",
        "discord ids",
        "of",
        "your",
        "team members",
        "1 id = 1 new line"
    ],

    apiKeys: {
        top_gg: "Your top.gg API token - can be left blank",
        top_gg_webhook_auth: "Your top.gg webhook key - can be left blank",
        genius: "Your genius API key - get one: https://docs.genius.com/",
        weather: "Your openweathermap API key - get one: https://api.openweathermap.org"
    },

    status: [
        {
            name: "status 1",
            type: "PLAYING"
        },
        {
            name: "status 2",
            type: "LISTENING"
        }
    ]
}

let data = JSON.stringify(conf);
fs.writeFile('./config-sample.json', JSON.stringify(conf, null, 4), function(err){
    if(err) {
        logger.log('Couldn\'t create config', "error")
        throw new Error(err)
    }else{
        console.log('huch')
        console.log(baseDir)
        console.log('ohja')
    }
});
