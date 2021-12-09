require('./helper/extenders');
require('./helper/replier');

const util = require('util');
const fs = require('fs');
const mongoose = require('mongoose');
const Discord = require('discord.js');
const Nevar = require('./core/nevar');
const toml = require('toml');
const readdir = util.promisify(fs.readdir);

// Load the config
let config;
try {
    config = toml.parse(fs.readFileSync('./config.toml', 'utf-8'));
} catch (err) {
    require('./helper/log').log("NO VALID CONFIG FOUND", "error");
    require('./helper/log').log("To create the config, run npm install or node storage/assets/scripts/install.js", "error");
    process.exit();
}

// Configure the client
const client = new Nevar({
    intents: Discord.Intents.FLAGS.GUILD_MEMBERS |
        Discord.Intents.FLAGS.GUILD_PRESENCES |
        Discord.Intents.FLAGS.GUILDS |
        Discord.Intents.FLAGS.GUILD_MESSAGES |
        Discord.Intents.FLAGS.DIRECT_MESSAGES |
        Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    partials: Object.values(Discord.Constants.PartialTypes),
    restTimeOffset: 200,
    allowedMention: {
        parse: ["users"]
    },
    presence: {
        status: "online",
        activities: [{
            name: "⌛ starting up...",
            type: "PLAYING"
        }]
    }
});

module.exports.client = client;
const init = async () => {

    // Load directories
    const directories = await readdir("./src/commands/");

    // Load commands
    for (let directory of directories) {
        const commands = await readdir('./src/commands/' + directory + '/');
        commands.forEach((cmd) => {
            if (cmd.split('.')[1] === 'js') {
                let response = client.loadCommand('../commands/' + directory, cmd);
                if (response) client.logger.log(response, 'error')
            }
        })
    }

    // Load player events
    const playerFiles = fs.readdirSync('./src/helper/player/');
    for (let file of playerFiles) {
        const playerEvent = require('./helper/player/' + file)
        client.player.on(file.split('.')[0], playerEvent.bind(null, client))
    }

    // Load discord events
    const evtFiles = await readdir("./src/events/");
    for (let file of evtFiles) {
        let eventName = file.split('.')[0];
        let event = new(require('./events/' + file))(client);
        client.on(eventName, (...args) => event.run(...args));
    }

    client.logger.log("Loaded " + playerFiles.length + " player events", "debug")
    client.logger.log("Loaded " + evtFiles.length + " discord events", "debug");
    client.logger.log("Loaded " + client.commands.size + ' commands', "debug");

    // Login
    client.login(config.general.bot_token);

    // Connect to MongoDB
    mongoose
        .connect(config.general.mongodb_url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        .then(() => {
            client.logger.log('Connected to MongoDB', 'info');
        })
        .catch((err) => {
            client.logger.log('Couldn\'t connect to MongoDB: ' + err, 'error');
        });
    client.mongoose = mongoose;

    // Load the languages
    const languages = require('./helper/languages.js');
    client.translations = await languages();
};

// Init client
init().then(res => {
    if (!res) client.logger.log("Initiated client", "info");

}).catch((err) => {
    client.logger.log("Failed to initiate client: " + err, "error");
});
