const util = require('util');
const fs = require('fs');
const readdir = util.promisify(fs.readdir);

module.exports = {

    async init(client, givenGuild) {

        //Register slash commands
        const directories = await readdir("./src/commands/");
        let cmdCount = 0;
        for(let directory of directories) {
            const commands = await readdir('./src/commands/' + directory + '/');
            for (const cmd of commands) {
                if (cmd.split('.')[1] === 'js') {
                    let command = client.commands.get(cmd.split('.')[0]);
                    if(!command) continue;
                    if(!command?.slashCommand) continue;
                    if(command.slashCommand.addCommand){
                        cmdCount++;
                        for(let guild of client.guilds.cache){
                            try {
                                let options = [];
                                if (command.slashCommand?.options) options = command.slashCommand.options;
                                let i = 0;
                                if (options.length > 0) {
                                    for (let option of command.slashCommand.options) {
                                        options[i].name = guild[1].translate((options[i].name));
                                        options[i].description = guild[1].translate((options[i].description));
                                        if (options[i].choices) {
                                            let i2 = 0;
                                            for (let choice of options[i].choices) {
                                                options[i].choices[i2].name = guild[1].translate(options[i].choices[i2].name);
                                                i2++;
                                            }
                                        }
                                        i++;
                                    }
                                }
                                let data = {
                                    name: command.help.name,
                                    description: guild[1].translate(command.help.description),
                                    options: options
                                };
                                if(givenGuild){
                                    if(givenGuild === guild[0]){
                                        guild[1]?.commands.create(data).catch((e) => {
                                            if(!e.toString().startsWith('DiscordAPIError: Missing Access')){
                                                console.log(e)
                                            }
                                        })
                                    }
                                }else{
                                    guild[1]?.commands.create(data).catch((e) => {
                                        if(!e.toString().startsWith('DiscordAPIError: Missing Access')){
                                            console.log(e)
                                        }
                                    })
                                }
                            }catch (e) {}
                        }
                    }else{
                        for(let guild of client.guilds.cache){
                            client.api.applications(client.user.id).guilds(guild[0]).commands.get()
                                .then((slashCommands) => {
                                    for(let slashCommand of slashCommands){
                                        if(slashCommand.name === command.help.name){
                                            try {
                                                guild[1]?.commands.delete(slashCommand.id).delete().catch((e) => {})
                                            }catch(e){}
                                        }
                                    }
                                }).catch((e) => {});
                        }
                    }
                }
            }
        }
        client.logger.log('Registered ' + cmdCount + ' slash commands', "info");
    }
}
