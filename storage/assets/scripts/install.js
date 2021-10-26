/**
 * Installs all the files necessary for the bot to run perfectly
 * Installs all the files necessary for the bot to run perfectly
 */

const logger = require('../../../src/helper/log')
    , fs = require('fs');

logger.log('Installation started..', "debug");


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

    channelDesigns: {
        serverChannel: "\uD83D\uDCBB ➜ {count} servers",
        userChannel: "\uD83D\uDC65 ➜ {count} users",
        voteCountChannel: "\uD83E\uDD0D ➜ {count} votes"
    },

    transferData: {
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
};
fs.writeFile('./config-sample.json', JSON.stringify(conf, null, 4), function(err){
    if(err) {
        logger.log('Couldn\'t create config', "error")
        console.error(new Error(err))
    }else{
        logger.log('Successfully generated config', "success")

    }
});

let DisabledCmds = {}
    , Giveaways = []
    , Keys = {}
    , Partners = {};

fs.writeFile('./storage/disabledcmds.json', JSON.stringify(DisabledCmds, null, 4), function(err){
    if(err){
        logger.log("Couldn't create storage/disabledcmds.json", "error");
        console.error(new Error(err));
    }else{
        logger.log('Successfully created storage/disabledcmds.json', "success");
    }
});


fs.writeFile('./storage/giveaways.json', JSON.stringify(Giveaways, null, 4), function(err){
    if(err){
        logger.log("Couldn't create storage/giveaways.json", "error");
        console.error(new Error(err));
    }else{
        logger.log('Successfully created storage/giveaways.json', "success");
    }
});

fs.writeFile('./storage/premiumKeys.json', JSON.stringify(Keys, null, 4), function(err){
    if(err){
        logger.log("Couldn't create storage/premiumKeys.json", "error");
        console.error(new Error(err));
    }else{
        logger.log('Successfully created storage/premiumKeys.json', "success");
    }
});

fs.writeFile('./storage/partners.json', JSON.stringify(Partners, null, 4), function(err){
    if(err){
        logger.log("Couldn't create storage/partners.json", "error");
        console.error(new Error(err));
    }else{
        logger.log('Successfully created storage/partners.json', "success");
    }
});

fs.mkdirSync('./storage/images', {}, function(err){
    if(err){
        logger.log("Couldn't create storage/images/", "error");
        console.error(new Error(err));
    }else{
        logger.log('Successfully created storage/images/', 'success');
    }
})
