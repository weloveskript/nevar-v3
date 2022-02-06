const util = require('util');
const fs = require('fs');
const readdir = util.promisify(fs.readdir);
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

module.exports = {

    async init(client, givenGuild) {

        let registeredCommand = 0;

        const dirs = await readdir('./src/commands/');
        const rest = new REST({
            version: '9'
        })
            .setToken(client.token);
        for (let guild of client.guilds.cache) {

            let slashCommands = [];
            for (let dir of dirs) {
                const commands = await readdir(`./src/commands/${dir}/`);

                for (let command of commands) {
                    if (command.split('.')[1] === 'js') {
                        let cmd = client.commands.get(command.split('.')[0]);
                        if (!cmd) continue;
                        if (cmd?.slashCommand) {
                            if (cmd.slashCommand.addCommand) {
                                let data = cmd.slashCommand.data;
                                if (data) {
                                    // translate language strings (description, options, choices)
                                    data.name = cmd.help.name
                                    data.description = guild[1].translate(cmd.help.description)
                                    for (let option of data.options) {
                                        option.name = guild[1].translate(option.name);
                                        option.description = guild[1].translate(option.description);
                                        if (option?.choices) {
                                            for (let choice of option?.choices) {
                                                choice.name = guild[1].translate(choice.name);
                                            }
                                        }
                                    }
                                    // push the command to the guild's slash command list
                                    slashCommands.push(data.toJSON());
                                }
                            }
                        }
                    }
                }
            }
            if (slashCommands.length > 0) {
                registeredCommand = slashCommands.length;
                try {
                    // check if one guild is especially selected
                    if (givenGuild) {
                        if (guild[0] === givenGuild) {
                            // if so, update the guild's slash commands
                            rest.put(
                                Routes.applicationGuildCommands(client.user.id, guild[0]), {
                                    body: slashCommands,
                                }
                            );
                        }
                    } else {
                        // if not, update all guilds' slash commands
                        rest.put(
                            Routes.applicationGuildCommands(client.user.id, guild[0]), {
                                body: slashCommands,
                            }
                        );
                    }
                } catch (e) {
                    console.log(e);
                }
            }
        }
        for (let guild of client.guilds.cache) {
            guild[1].commands.fetch()
                .then((guildCommands => {
                    guildCommands = Array.from(guildCommands);
                    for (let guildCommand of guildCommands) {
                        let cmd = client.commands.get(guildCommand[1].name);
                        if (!cmd) {
                            // if the command does not exist anymore, remove it from the guild's slash commands
                            try {
                                guild[1].commands.delete(guildCommand[0])
                                    .catch(() => {});
                            } catch (e) {}
                        }
                        // îf the command exists but is not supposed to be registered, remove it from the guild's slash commands
                        if (!cmd?.slashCommand?.addCommand) {
                            try {
                                guild[1].commands.delete(guildCommand[0])
                                    .catch(() => {});
                            } catch (e) {}
                        }
                    }
                }));
        }
        client.logger.log('Registered ' + registeredCommand + ' slash commands', "info");
    }
}
