const {MessageEmbed, Permissions} = require("discord.js");
const cmdCooldown = {};
const toml = require('toml');
const fs = require("fs");
const {QueryType} = require("discord-player");
const config = toml.parse(fs.readFileSync('./config.toml', 'utf-8'));
const axios = require('axios');

module.exports = class {
    constructor(client) {
        this.client = client;
    }

    async run(interaction) {
        if(!interaction.isCommand()){
            let customIdSplitted = interaction.customId.split('_');
            let guild = this.client.guilds.cache.get(interaction.guildId);
            const data = {
                config: this.client.config,
                guild: await this.client.findOrCreateGuild({id: interaction.guildId}),
                memberData: await this.client.findOrCreateMember({id: interaction.member.user.id}),
                userData: await this.client.findOrCreateUser({id: interaction.member.user.id})
            };
            for(let idSplit of customIdSplitted){
                if(parseInt(idSplit) && (interaction.user.id.toString() !== idSplit.toString())) {
                    let embed = new MessageEmbed()
                        .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                        .setDescription(guild.translate("commandHandler:notYourInteraction")
                            .replace('{emotes.error}', this.client.emotes.error))
                        .setColor(this.client.embedColor)
                        .setFooter({text: data.guild.footer});
                    return interaction.send(embed, true);
                }
            }
        }
        if(!interaction) return;
        if(!interaction.isCommand()) {
            if(interaction.isAutocomplete()){
                if(interaction.commandName === 'play'){
                    const searchResult = await this.client.player
                        .search(interaction.options.getFocused(), {
                            requestedBy: interaction.user,
                            searchEngine: QueryType.AUTO,
                        })
                        .catch(() => {});
                    let results = [];
                    for(let track of searchResult.tracks){
                        if(results.length >= 8) continue;
                        results.push({
                            name: track.title,
                            value: track.url,
                        });
                    }
                    interaction.respond(results).catch(() => {});
                }
                if(interaction.commandName === 'lyrics'){
                    let hits = (await axios.get('https://api.genius.com/search?q=' + encodeURIComponent(interaction.options.getFocused()), {
                        headers: {
                            'Authorization': 'Bearer ' + this.client.config.apikeys.genius
                        },
                        validateStatus: false
                    })).data.response.hits;

                    let results = [];
                    for(let track of hits){
                        if(results.length >= 5) continue;
                        if(track.result?.artist_names && track.result?.title){
                            results.push({
                                name: track.result.artist_names + ' » ' + track.result.title,
                                value: track.result.id.toString(),
                            });
                        }
                    }
                    interaction.respond(results).catch(() => {});
                }
            }
            return;
        }

        let command = interaction.commandName;
        let args = [];

        if(interaction.options._hoistedOptions.length > 0){
            for(let arg of interaction.options._hoistedOptions){
                args.push(arg.value);
            }
        }

        let cmd = this.client.commands.get(command);
        if(!cmd) return;

        const data = {
            config: this.client.config,
            guild: await this.client.findOrCreateGuild({id: interaction.guildId}),
            memberData: await this.client.findOrCreateMember({id: interaction.member.user.id}),
            userData: await this.client.findOrCreateUser({id: interaction.member.user.id})
        };

        interaction.guild.data = data.guild;

        let cachedGuild = this.client.guilds.cache.get(interaction.guildId);

        if(data.guild.plugins.disabledCommands?.includes(cmd.help.name)){
            let embed = new MessageEmbed()
                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                .setDescription(cachedGuild.translate("commandHandler:ignoredCmd")
                    .replace('{emotes.error}', this.client.emotes.error))
                .setColor(this.client.embedColor)
                .setFooter({text: data.guild.footer});
            return interaction.send(embed, true);
        }

        let neededPermissions = [];
        if (!cmd.conf.botPermissions.includes("EMBED_LINKS")) {
            cmd.conf.botPermissions.push("EMBED_LINKS");
        }
        let channel = cachedGuild.channels.cache.get(interaction.channelId);
        const me = await cachedGuild.members.fetch(this.client.user.id);

        cmd.conf.botPermissions.forEach((perm) => {
            if (!channel.permissionsFor(me).has(Permissions.FLAGS[perm])) {
                neededPermissions.push(perm);
            }
        });

        if (neededPermissions.length > 0) {
            let perms = neededPermissions.map((p) => `|- ${p}`).join("\n");
            let embed = new MessageEmbed()
                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                .setDescription(cachedGuild.translate("commandHandler:botPermsMissing")
                    .replace('{perms}', perms)
                    .replace('{emotes.error}', this.client.emotes.error)
                    .replace('{emotes.arrow}', this.client.emotes.arrow))
                .setColor(this.client.embedColor)
                .setFooter({text: data.guild.footer});
            return interaction.send(embed, true);
        }

        let member = await cachedGuild.members.fetch(interaction.member.user.id);

        neededPermissions = [];
        cmd.conf.memberPermissions.forEach((perm) => {
            if (!channel.permissionsFor(member).has(Permissions.FLAGS[perm])) {
                neededPermissions.push(perm);
            }
        });

        if (neededPermissions.length > 0) {
            let perms = neededPermissions.map((p) => `|- ${p}`).join("\n")
            let embed = new MessageEmbed()
                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                .setDescription(cachedGuild.translate("commandHandler:memberPermsMissing")
                    .replace('{perms}', perms)
                    .replace('{emotes.error}', this.client.emotes.error))
                .setColor(this.client.embedColor)
                .setFooter({text: data.guild.footer});
            return interaction.send(embed, true);
        }

        if (!channel.nsfw && cmd.conf.nsfw) {
            let embed = new MessageEmbed()
                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                .setDescription(cachedGuild.translate("commandHandler:nsfwCommand")
                    .replace('{emotes.error}', this.client.emotes.error))
                .setColor(this.client.embedColor)
                .setFooter({text: data.guild.footer});
            return interaction.send(embed, true);
        }

        let disabled = false;
        let file = JSON.parse(fs.readFileSync("./storage/disabledcmds.json"));
        for (let attributename in file) {
            if (file[attributename].toLowerCase() === cmd.help.name) {
                disabled = true;
            }
        }

        if (disabled) {
            let staffs = JSON.parse(fs.readFileSync('./storage/staffs.json'));
            if (member.user.id !== config.team.owner_id || !staffs[member.user.id] && member.user.id !== config.team.owner_id){
                let embed = new MessageEmbed()
                    .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                    .setDescription(cachedGuild.translate("commandHandler:disabledCommand")
                        .replace('{emotes.error}', this.client.emotes.error)
                        .replace('{emotes.arrow}', this.client.emotes.arrow)
                        .replace('{support}', this.client.supportUrl))
                    .setColor(this.client.embedColor)
                    .setFooter({text: data.guild.footer});
                return interaction.send(embed);
            }
        }

        if (cmd.conf.ownerOnly && (member.user.id !== config.team.owner_id)) {
            let embed = new MessageEmbed()
                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                .setDescription(cachedGuild.translate("commandHandler:ownerCommand")
                    .replace('{emotes.error}', this.client.emotes.error))
                .setColor(this.client.embedColor)
                .setFooter({text: data.guild.footer});
            return interaction.send(embed);
        }

        let staffs = JSON.parse(fs.readFileSync('./storage/staffs.json'));
        if(cmd.conf.staffOnly && !staffs[member.user.id] && member.user.id !== config.team.owner_id){
            let embed = new MessageEmbed()
                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                .setDescription(cachedGuild.translate("commandHandler:staffCommand")
                    .replace('{emotes.error}', this.client.emotes.error)
                    .replace('{client}', this.client.user.username))
                .setColor(this.client.embedColor)
                .setFooter({text: data.guild.footer});
            return interaction.send(embed);
        }

        if(cmd.conf.premium && !data.guild.premium) {
            let embed = new MessageEmbed()
                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                .setDescription(cachedGuild.translate("commandHandler:premiumCommand")
                    .replace('{emotes.error}', this.client.emotes.error)
                    .replace('{client}', this.client.user.username)
                    .replace('{emotes.arrow}', this.client.emotes.arrow)
                    .replace('{support}', this.client.supportUrl))
                .setColor(this.client.embedColor)
                .setFooter({text: data.guild.footer});
            return interaction.send(embed);
        }

        let uCooldown = cmdCooldown[member.user.id];
        if (!uCooldown) {
            cmdCooldown[member.user.id] = {};
            uCooldown = cmdCooldown[member.user.id];
        }

        const time = uCooldown[cmd.help.name] || 0;
        if (time && (time > Date.now())) {
            let staffs = JSON.parse(fs.readFileSync('./storage/staffs.json'));
            if (member.user.id !== config.team.owner_id || !staffs[member.user.id] && member.user.id !== config.team.owner_id) {
                let seconds = Math.ceil((time - Date.now()) / 1000)
                let desc = cachedGuild.translate("commandHandler:remainingCooldown").split('?')[0]
                    .replace('{emotes.error}', this.client.emotes.error)
                    .replace('{time}', seconds);
                if(seconds> 1){
                    desc += cachedGuild.translate("commandHandler:remainingCooldown").split('?')[2]
                }else{
                    desc += cachedGuild.translate("commandHandler:remainingCooldown").split('?')[1]
                }
                desc += cachedGuild.translate("commandHandler:remainingCooldown").split('?')[3]
                let embed = new MessageEmbed()
                    .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                    .setDescription(desc)
                    .setColor(this.client.embedColor)
                    .setFooter({text: data.guild.footer});
                return interaction.send(embed, true);
            }
        }

        cmdCooldown[member.user.id][cmd.help.name] = Date.now() + cmd.conf.cooldown;

        const log = new this.client.logs({
            command: cmd.help.name,
            args: args,
            type: 'Slash',
            executor: {
                username: member.user.username,
                discriminator: member.user.discriminator,
                id: member.user.id,
                createdAt: member.user.createdAt,
            },
            guild: {
                name: interaction.guild.name,
                id: interaction.guild.id,
                createdAt: interaction.guild.createdAt,
            },
            channel: {
                name: channel.name,
                id: channel.id,
                createdAt: channel.createdAt
            }
        });
        log.save();

        try {
            cmd.run(interaction, undefined, args, data)
        }catch (e) {
            let embed = new MessageEmbed()
                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                .setDescription(g.translate("commandHandler:unknownError")
                    .replace('{support}', this.client.supportUrl)
                    .replace('{emotes.error}', this.client.emotes.error))
                .setColor(this.client.embedColor)
                .setFooter({text: data.guild.footer});
            return await interaction.send(embed, true);
        }
    }
}
