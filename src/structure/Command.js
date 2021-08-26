const path = require('path');

module.exports = class Command {
    constructor(client, {
        name = null,
        dirname = false,
        aliases = [],
        botPermissions = [],
        memberPermissions = [],
        nsfw = false,
        ownerOnly = false,
        staffOnly = false,
        cooldown = 0,
        premium = false,
        slashCommand = {
            addCommand: true,
            description: null,
            options: []
        }
    })
    {
        const category = (dirname ? dirname.split(path.sep)[parseInt(String(dirname.split(path.sep).length - 1), 10)] : "Other");
        this.client = client;
        this.conf = { memberPermissions, botPermissions, nsfw, ownerOnly, staffOnly, cooldown, premium};
        this.help = { name, category, aliases };
        this.slashCommand = slashCommand;
    }
};
