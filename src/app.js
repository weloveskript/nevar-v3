require('./helper/extensions');

const { Intents, Constants } = require('discord.js');
const Nevar = require('./core/nevar');
const { loadConfig, loadCommands, loadPlayerEvents, loadEvents, connectMongo, loadLanguages, loadGiveawaysEvents } = require('./helper/loader');

const client = new Nevar({
    intents: [
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_PRESENCES,
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_VOICE_STATES
    ],
    partials: Object.values(Constants.PartialTypes),
    allowedMention: {
        parse: ["users"]
    },
    restTimeOffset: 1000
});

const config = loadConfig();

const init = async() => {

    const playerFiles = await loadPlayerEvents(client);
    const events = await loadEvents(client);
    const giveawayEvents = await loadGiveawaysEvents(client);
    await loadCommands(client);
    await connectMongo(config, client);
    await loadLanguages(client);

    client.logger.log("Loaded " + playerFiles.length + " player events", "debug");
    client.logger.log("Loaded " + events.length + " discord events", "debug");
    client.logger.log("Loaded " + client.commands.size + ' commands', "debug");

    await client.login(config.general.bot_token);
};

init()
    .then(res => client.logger.log('Initiated client', 'info'))
    .catch(err => client.logger.log('Failed to initiate client: ' + err, 'error'));

module.exports.client = client;
