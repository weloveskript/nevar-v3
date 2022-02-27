/**
 * Installs all the files necessary for the bot to run perfectly
 */

const logger = require('../../../src/helper/log')
    , fs = require('fs');

logger.log('Installation started..', "debug");

let config =
    "#             _______ _______ ___ ___ _______ ______ \n" +
    "#             |    |  |    ___|   |   |   _   |   __ \\\n" +
    "#             |       |    ___|   |   |       |      <\n" +
    "#             |__|____|_______|\\_____/|___|___|___|__|\n" +
    "#                                              \n"+
    "#####################################################################################\n" +
    `## Automatically generated config for Nevar-v${require('../../../package.json').version}\n` +
    "#####################################################################################\n\n" +
    "# Don't change anything here except the necessary data\n" +
    "# If you change the wrong things, the bot will not start\n" +
    "# All fields with an * behind are absolutely necessary, all fields without can be left blank\n\n" +
    "#####################################################################################\n" +
    "#####################################################################################\n" +
    "#####################################################################################\n\n" +
    "[ general ]\n" +
    "# Enter your bot token here*\n" +
    "bot_token = \"\"\n" +
    "# Your MongoDB login url*\n" +
    "mongodb_url = \"\"\n" +
    "# Your prefix for commands*\n" +
    "default_prefix = \"\"\n" +
    "# Your website (Discord invitation works too)*\n" +
    "website = \"\"\n" +
    "\n" +
    "[ support ]\n" +
    "# Your support server ID*\n" +
    "id = \"\"\n" +
    "# An invitation from your support server*\n" +
    "invite = \"\"\n" +
    "# ID of the channel where the bot sends its information (server joined, left, etc.)*\n" +
    "bot_log = \"\"\n" +
    "# ID of the channel where the bot displays the current server count\n" +
    "server_count_channel = \"\"\n" +
    "# ID of the channel where the bot displays the current user count (of all servers)\n" +
    "user_count_channel = \"\"\n" +
    "# ID of the channel where the bot displays the current vote count\n" +
    "vote_count_channel = \"\"\n" +
    "# ID of the channel where the bot announces new votes\n" +
    "vote_announce_channel = \"\"\n" +
    "\n" +
    "[ webdashboard ]\n" +
    "# Whether the web interface is activated or not (true/false)*\n" +
    "enabled = false\n" +
    "# The following information is only required if the web dashboard is generally activated\n" +
    "# Port of the web interface\n" +
    "port = 3030\n" +
    "# The base URL of the interface\n" +
    "base_url = \"http://localhost:3030/\"\n" +
    "# The redirect URL of the interface (must be set in the Discord Developer Portal under OAuth2 as a redirect URL)\n" +
    "redirect_uri = \"http://localhost:3030/oauth2\"\n" +
    "# Some long text\n" +
    "session_secret=\"\"\n" +
    "# Client secret of your bot (can be found in the Developer Portal under OAuth2)\n" +
    "client_secret = \"\"\n" +
    "# The scopes that are used (it is best to leave them as they are, so that there are no problems in the code of the interface)\n" +
    "scopes = [\"identify\", \"guilds\", \"guilds.join\"]\n" +
    "# The OAuth2 URL used for the redirect - can simply be left as it is\n" +
    "oauth2_url = \"https://discord.com/api/oauth2/authorize?client_id={clientId}&redirect_uri={redirectUrl}&response_type=code&scope={scopes}\"\n" +
    "# The URL to which you will be redirected after successful authorization \n" +
    "authorized_url = \"http://localhost:3030/oauth2/authorized\"\n" +
    "\n" +
    "[ embeds ]\n" +
    "# The default footer text for embeds*\n" +
    "footer = \"nevar.eu · discord.gg/uyYrQG3hkc\"\n" +
    "# The standard color for embeds, RGB, hex or Discord-color keywords (like BLURPLE) are accepted here*\n" +
    "color = \"BLURPLE\"\n" +
    "\n" +
    "[ channels ]\n" +
    "# The design of the channel that displays the server count (the variable in {} is automatically replaced)\n" +
    "design_server_count_channel = \"💻 ➜ {count} servers\"\n" +
    "# The design of the channel that displays the user count (the variable in {} is automatically replaced)\n" +
    "design_user_count_channel = \"👥 ➜ {count} users\"\n" +
    "# The design of the channel that displays the vote count (the variable in {} is automatically replaced)\n" +
    "design_vote_count_channel = \"🤍 ➜ {count} votes\"\n" +
    "\n" +
    "[ team ]\n" +
    "# Your Discord ID*\n" +
    "owner_id = \"\"\n" +
    "\n" +
    "[ datatransfer ]\n" +
    "# Whether current bot data (number of servers, votes, etc.) is written to a file every minute*\n" +
    "state = true\n" +
    "# If so, in which file?\n" +
    "path = \"./data.json\"\n" +
    "\n" +
    "[ music ]\n" +
    "# All available music filters (just leave it like that)\n" +
    "filters = [\"8D\", \"gate\", \"haas\", \"phaser\",\n" +
    "        \"treble\", \"tremolo\", \"vibrato\", \"reverse\",\n" +
    "        \"karaoke\", \"flanger\", \"mcompand\", \"pulsator\",\n" +
    "        \"subboost\", \"bassboost\", \"vaporwave\", \"nightcore\",\n" +
    "        \"normalizer\", \"surrounding\"]\n" +
    "# Your looong YouTube cookie (this is how you get it: https://www.youtube.com/watch?v=qymuvhBetnM)*\n" +
    "youtube_cookie = \"\"\n" +
    "# How long the bot will remain in the voice channel after a song has ended*\n" +
    "stay_time = 25\n" +
    "\n" +
    "[ apikeys ]\n" +
    "# All of the following APIs offer a free API key and no paid subscription is required\n\n" +
    "# docs.top.gg\n" +
    "topgg = \"\"\n" +
    "topgg_webhook_auth = \"\"\n" +
    "# docs.genius.com*\n" +
    "genius = \"\"\n" +
    "# products.wolframalpha.com/api*\n" +
    "wolfram = \"\"\n" +
    "# developers.giphy.com*\n" +
    "giphy = \"\"\n" +
    "# openweathermap.org/api*\n" +
    "weather = \"\"\n" +
    "\n" +
    "# Status Section\n" +
    "\n" +
    "# The different statuses for the bot\n" +
    "\n" +
    "# Every new status must have this structure:\n\n" +
    "#          [[status]]\n" +
    "#          name = \"Status name\"\n" +
    "#          type = \"PLAYING/WATCHING/LISTENING/STREAMING\"\n" +
    "#          url = \"Valid Twitch/YouTube URL (only if STREAMING is specified as type)\"\n" +
    "\n" +
    "# Status 1\n" +
    "[[status]]\n" +
    "name = \"Nevar-Beta\"\n" +
    "type = \"PLAYING\"\n\n" +
    "# Status 2\n" +
    "[[status]]\n" +
    "name = \"nevar.eu\"\n" +
    "type = \"WATCHING\"\n\n" +
    "# Status 3\n" +
    "[[status]]\n" +
    "name = \"nevar.eu\"\n" +
    "type = \"STREAMING\"\n" +
    "url = \"https://youtu.be/dQw4w9WgXcQ\"";

fs.writeFile('config-sample.toml', config, async function(err){
    if(err){
        logger.log('Couldn\'t create config', "error")
        console.error(new Error(err))
    }
    else{
        logger.log('Successfully generated config', "success")
    }
});

let disabledCommands = {};
let giveaways = [];
let keys = {};
let staffs = {};

fs.writeFile('./storage/disabledcmds.json', JSON.stringify(disabledCommands, null, 4), function(err){
    if(err){
        logger.log("Couldn't create storage/disabledcmds.json", "error");
        console.error(new Error(err));
    }else{
        logger.log('Successfully created storage/disabledcmds.json', "success");
    }
});


fs.writeFile('./storage/giveaways.json', JSON.stringify(giveaways, null, 4), function(err){
    if(err){
        logger.log("Couldn't create storage/giveaways.json", "error");
        console.error(new Error(err));
    }else{
        logger.log('Successfully created storage/giveaways.json', "success");
    }
});

fs.writeFile('./storage/premiumKeys.json', JSON.stringify(keys, null, 4), function(err){
    if(err){
        logger.log("Couldn't create storage/premiumKeys.json", "error");
        console.error(new Error(err));
    }else{
        logger.log('Successfully created storage/premiumKeys.json', "success");
    }
});

fs.writeFile('./storage/staffs.json', JSON.stringify(staffs, null, 4), function(err){
    if(err){
        logger.log("Couldn't create storage/staffs.json", "error");
        console.error(new Error(err));
    }else{
        logger.log('Successfully created storage/staffs.json', "success");
    }
});

try {
    fs.mkdirSync('./storage/images', {}, function(err){
        if(err){
            logger.log("Couldn't create storage/images/", "error");
            console.error(new Error(err));
        }else{
            logger.log('Successfully created storage/images/', 'success');
        }
    })
}catch (err) {
    logger.log("Couldn't create storage/images/", "error");
    console.error(new Error(err));
}
