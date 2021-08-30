const util = require('util')
    , fs = require('fs')
    , readdir = util.promisify(fs.readdir)
    , { MessageEmbed } = require('discord.js')
    , cmdCooldown = {}
    , config = require('../../config.json');

module.exports = {
    /**
     *
     * @param client
     * @returns {Promise<void>}
     */
    async init(client) {

        //Register slash commands
        const directories = await readdir("./src/commands/");
        let cmdCount = 0;
        for(let directory of directories) {
            const commands = await readdir('./src/commands/' + directory + '/');
            for (const cmd of commands) {
                if (cmd.split('.')[1] === 'js') {
                    let response = client.loadCommand('../commands/' + directory, cmd)
                    if (response) client.logger.log(response, 'error')
                    let command = client.commands.get(cmd.split('.')[0]);
                    if(!command?.slashCommand) continue;
                    if(command.slashCommand.addCommand){
                        cmdCount++;
                        for(let guild of client.guilds.cache){
                            try {
                                let options = command.slashCommand.options;
                                let i = 0;
                                for(let option of command.slashCommand.options){
                                    options[i].name = guild[1].translate((options[i].name));
                                    options[i].description = guild[1].translate((options[i].description));
                                    if(options[i].choices){
                                        let i2 = 0;
                                        for(let choice of options[i].choices){
                                            options[i].choices[i2].name = guild[1].translate(options[i].choices[i2].name);
                                            i2++;
                                        }
                                    }
                                    i++;
                                }
                                let data = {
                                    name: command.help.name,
                                    description: guild[1].translate(command.slashCommand.description),
                                    options: options
                                }
                                guild[1]?.commands.create(data).catch((e) => {})
                            }catch (e) {}
                        }
                    }else{
                        for(let guild of client.guilds.cache){
                            let slashCommands = client.api.applications(client.user.id).guilds(guild[0]).commands.get()
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
        client.logger.log('Registered ' + cmdCount + ' slash commands', "debug")

        //Handle slash commands

        client.on('interactionCreate', async (interaction) => {
            if(!interaction) return;
            if(!interaction.isCommand()) return;

            let command = interaction.commandName
                , args = interaction.options._hoistedOptions;

            let arguments = [];
            let i = 0;
            if(args){
                for(let arg of args){
                    arguments.push(args[i].value)
                    i++;
                }
            }


            args = arguments;


            let cmd = client.commands.get(command);

            const data = {};
            data.config = client.config
            const guild = await client.findOrCreateGuild({id: interaction.guildId});
            guild.data = data.guild = guild;
            let g = client.guilds.cache.get(interaction.guildId);

            let userData = await client.findOrCreateUser({id: interaction.member.user.id});
            data.memberData = await client.findOrCreateMember({id: interaction.member.user.id});
            data.userData = userData;

            if(!cmd) return;


            if(data.guild.disabledCommands.includes(cmd.help.name)){
                let embed = new MessageEmbed()
                    .setAuthor(client.user.username, client.user.displayAvatarURL(), client.website)
                    .setDescription(g.translate("general/commandHandler:ignoredCmd")
                        .replace('{emotes.error}', client.emotes.error))
                    .setColor(client.embedColor)
                    .setFooter(data.guild.footer);
                return interaction.send(embed, true);
            }

            let neededPermissions = [];
            if (!cmd.conf.botPermissions.includes("EMBED_LINKS")) {
                cmd.conf.botPermissions.push("EMBED_LINKS");
            }
            let channel = g.channels.cache.get(interaction.channelId)
                , me = await g.members.fetch(client.user.id)
                , { Permissions } = require('discord.js');

            cmd.conf.botPermissions.forEach((perm) => {
                if (!channel.permissionsFor(me).has(Permissions.FLAGS[perm])) {
                    neededPermissions.push(perm);
                }
            });
            if (neededPermissions.length > 0) {
                let perms = neededPermissions.map((p) => `|- ${p}`).join("\n")
                let embed = new MessageEmbed()
                    .setAuthor(client.user.username, client.user.displayAvatarURL(), client.website)
                    .setDescription(g.translate("general/commandHandler:botPermsMissing")
                        .replace('{perms}', perms)
                        .replace('{emotes.error}', client.emotes.error)
                        .replace('{emotes.arrow}', client.emotes.arrow))
                    .setColor(client.embedColor)
                    .setFooter(data.guild.footer);
                return interaction.send(embed, true);
            }

            let member = await g.members.fetch(interaction.member.user.id);

            neededPermissions = [];
            cmd.conf.memberPermissions.forEach((perm) => {
                if (!channel.permissionsFor(member).has(Permissions.FLAGS[perm])) {
                    neededPermissions.push(perm);
                }
            });

            if (neededPermissions.length > 0) {
                let perms = neededPermissions.map((p) => `|- ${p}`).join("\n")
                let embed = new MessageEmbed()
                    .setAuthor(client.user.username, client.user.displayAvatarURL(), client.website)
                    .setDescription(g.translate("general/commandHandler:memberPermsMissing")
                        .replace('{perms}', perms)
                        .replace('{emotes.error}', client.emotes.error))
                    .setColor(client.embedColor)
                    .setFooter(data.guild.footer);
                return interaction.send(embed, true);

            }

            if (!channel.nsfw && cmd.conf.nsfw) {
                let embed = new MessageEmbed()
                    .setAuthor(client.user.username, client.user.displayAvatarURL(), client.website)
                    .setDescription(g.translate("general/commandHandler:nsfwCommand")
                        .replace('{emotes.error}', client.emotes.error))
                    .setColor(client.embedColor)
                    .setFooter(data.guild.footer);
                return interaction.send(embed, true);
            }

            const fs = require('fs');

            let disabled = false;
            let file = JSON.parse(fs.readFileSync("./storage/disabledcmds.json"));
            for (let attributename in file) {
                if (file[attributename].toLowerCase() === cmd.help.name) {
                    disabled = true;
                }
            }

            if (disabled) {
                if (!(member.user.id === config.owner_id)) {
                    let embed = new MessageEmbed()
                        .setAuthor(client.user.username, client.user.displayAvatarURL(), client.website)
                        .setDescription(g.translate("general/commandHandler:disabledCommand")
                            .replace('{emotes.error}', client.emotes.error)
                            .replace('{emotes.arrow}', client.emotes.arrow)
                            .replace('{support}', client.supportUrl))
                        .setColor(client.embedColor)
                        .setFooter(data.guild.footer);
                    return interaction.send(embed);
                }
            }

            if (cmd.conf.ownerOnly && (member.user.id !== config.owner_id)) {
                let embed = new MessageEmbed()
                    .setAuthor(client.user.username, client.user.displayAvatarURL(), client.website)
                    .setDescription(g.translate("general/commandHandler:ownerCommand")
                        .replace('{emotes.error}', client.emotes.error))
                    .setColor(client.embedColor)
                    .setFooter(data.guild.footer);
                return interaction.send(embed);
            }

            if(cmd.conf.staffOnly && !(config.staffs.includes(member.user.id))) {
                let embed = new MessageEmbed()
                    .setAuthor(client.user.username, client.user.displayAvatarURL(), client.website)
                    .setDescription(g.translate("general/commandHandler:staffCommand")
                        .replace('{emotes.error}', client.emotes.error)
                        .replace('{client}', client.user.username))
                    .setColor(client.embedColor)
                    .setFooter(data.guild.footer);
                return interaction.send(embed);
            }

            if(cmd.conf.premium && !data.guild.premium) {
                let embed = new MessageEmbed()
                    .setAuthor(client.user.username, client.user.displayAvatarURL(), client.website)
                    .setDescription(g.translate("general/commandHandler:premiumCommand")
                        .replace('{emotes.error}', client.emotes.error)
                        .replace('{client}', client.user.username)
                        .replace('{emotes.arrow}', client.emotes.arrow)
                        .replace('{support}', client.supportUrl))
                    .setColor(client.embedColor)
                    .setFooter(data.guild.footer);
                return interaction.send(embed);

            }

            let uCooldown = cmdCooldown[member.user.id];
            if (!uCooldown) {
                cmdCooldown[member.user.id] = {};
                uCooldown = cmdCooldown[member.user.id];
            }
            const time = uCooldown[cmd.help.name] || 0;
            if (time && (time > Date.now())) {
                if (!(member.user.id === config.owner_id)) {
                    let seconds = Math.ceil((time - Date.now()) / 1000)
                    let desc = g.translate("general/commandHandler:remainingCooldown").split('?')[0]
                        .replace('{emotes.error}', client.emotes.error)
                        .replace('{time}', seconds);
                    if(seconds> 1){
                        desc += g.translate("general/commandHandler:remainingCooldown").split('?')[2]
                    }else{
                        desc += g.translate("general/commandHandler:remainingCooldown").split('?')[1]
                    }
                    desc += g.translate("general/commandHandler:remainingCooldown").split('?')[3]
                    let embed = new MessageEmbed()
                        .setAuthor(client.user.username, client.user.displayAvatarURL(), client.website)
                        .setDescription(desc)
                        .setColor(client.embedColor)
                        .setFooter(data.guild.footer);
                    return interaction.send(embed, true);
                }
            }

            cmdCooldown[member.user.id][cmd.help.name] = Date.now() + cmd.conf.cooldown;

            let message;

            interaction
                .guild = g
                .channel = channel;
            try {
                cmd.run(interaction, message, args, data)
            }catch (e) {
                let embed = new MessageEmbed()
                    .setAuthor(client.user.username, client.user.displayAvatarURL(), client.website)
                    .setDescription(g.translate("general/commandHandler:unknownError")
                        .replace('{support}', client.supportUrl)
                        .replace('{emotes.error}', client.emotes.error))
                    .setColor(client.embedColor)
                    .setFooter(data.guild.footer);
                await interaction.send(embed, true);
                return client.logError(e, interaction.member.user, g, `/${command} ${args[0] ? args.join(' ') : ''}`, 'Slash-Command')
            }
        });
    }
}
