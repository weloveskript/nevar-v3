const util = require('util');
const fs = require('fs');
const readdir = util.promisify(fs.readdir);
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

module.exports = {

    async init(client) {

        const dirs = await readdir('./src/commands/');

        const rest = new REST({ version: '9' }).setToken(client.token);

        let slashCommands = [];
        for (let dir of dirs) {
            const commands = await readdir(`./src/commands/${dir}/`);
            for (let command of commands.filter(file => file.endsWith('.js'))) {
                let clientCommand = client.commands.get(command.split('.')[0]);
                if (!clientCommand || !clientCommand?.slashCommand || !clientCommand?.slashCommand.addCommand) continue;
                let data = clientCommand.slashCommand.data;
                if (data) {
                    data.name = clientCommand.help.name
                    data.description = client.localeString(clientCommand.help.description, 'de-DE')
                    let iOptions = 1;
                    for (let option of data.options) {
                        option.name = client.localeString(clientCommand.help.category + '/' + clientCommand.help.name + ':slash:' + iOptions + ':name', 'de-DE');
                        option.description = client.localeString(clientCommand.help.category + '/' + clientCommand.help.name + ':slash:' + iOptions + ':description', 'de-DE');
                        let iChoices = 1;
                        if (option?.choices) {
                            for (let choice of option?.choices) {
                                choice.name = client.localeString(clientCommand.help.category + '/' + clientCommand.help.name + ':slash:' + iOptions + ':choices:' + iChoices + ':name', 'de-DE');
                                choice.value = client.localeString(clientCommand.help.category + '/' + clientCommand.help.name + ':slash:' + iOptions + ':choices:' + iChoices + ':value', 'de-DE');
                                iChoices++;
                            }
                        }
                        iOptions++;
                    }
                    slashCommands.push(data.toJSON());
                }
            }
        }

        rest.put(Routes.applicationCommands(client.user.id), { body: slashCommands }).catch(() => {});

        let commandCount = 0;
        for(let applicationCommand of await client.application.commands.fetch()) {
            let clientCommand = client.commands.get(applicationCommand[1].name);
            commandCount++;
            if (!clientCommand) {
                client.application.commands.delete(applicationCommand[0]).catch(() => {});
            }else if(!clientCommand?.slashCommand?.addCommand){
                client.application.commands.delete(applicationCommand[0]).catch(() => {});
            }
        }

        client.logger.log('Registered ' + commandCount + ' global commands', "info");
    }
}
