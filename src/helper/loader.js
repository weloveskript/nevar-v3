const toml = require("toml");
const fs = require("fs");
const mongoose = require("mongoose");
const readdir = require('util').promisify(fs.readdir);

function loadConfig(){
    let config;
    try {
        config = toml.parse(fs.readFileSync('./config.toml', 'utf-8'));
    } catch (err) {
        require('./log')
            .log("NO VALID CONFIG FOUND", "error");
        require('./log')
            .log("To create the config, run npm install or node storage/assets/scripts/install.js", "error");
        process.exit();
    }
    return config;
}

async function loadCommands(client){
    const directories = await readdir("./src/commands/");
    for (let directory of directories) {
        const commands = await readdir('./src/commands/' + directory + '/');
        commands.forEach((cmd) => {
            if (cmd.split('.')[1] === 'js') {
                let response = client.loadCommand('../commands/' + directory, cmd);
                if (response) client.logger.log(response, 'error');
            }
        });
    }
}

async function loadPlayerEvents(client){
    const playerFiles = fs.readdirSync('./src/events/player/');
    for (let file of playerFiles) {
        const playerEvent = require('../events/player/' + file);
        client.player.on(file.split('.')[0], playerEvent.bind(null, client));
    }
    return playerFiles;
}
async function loadGiveawaysEvents(client){
    const giveawayEventFiles = fs.readdirSync('./src/events/giveawayManager/');
    for(let file of giveawayEventFiles){
        if(!file.endsWith('.js')) continue;
        let eventName = file.split('.')[0];
        let event = new(require('../events/giveawayManager/' + file))(client);
        client.giveawaysManager.on(eventName, (...args) => event.run(...args));
    }
}

async function loadEvents(client){
    const evtFiles = fs.readdirSync("./src/events/");
    for (let file of evtFiles) {
        if(!file.endsWith('.js')) continue;
        let eventName = file.split('.')[0];
        let event = new(require('../events/' + file))(client);
        client.on(eventName, (...args) => event.run(...args));
    }
    return evtFiles.filter(file => file.endsWith('.js'));
}

async function connectMongo(config, client){
    mongoose
        .connect(config.general.mongodb_url, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        .then(() => {
            client.logger.log('Connected to MongoDB', 'info');
        })
        .catch((err) => {
            client.logger.log('Couldn\'t connect to MongoDB: ' + err, 'error');
        });
    client.mongoose = mongoose;
}

async function loadLanguages(client){
    const languages = require('./languages.js');
    client.translations = await languages();
}

async function loadClient(init){

}
module.exports = {
    loadConfig,
    loadCommands,
    loadPlayerEvents,
    loadEvents,
    connectMongo,
    loadLanguages,
    loadGiveawaysEvents
}
