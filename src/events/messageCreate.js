const cmdCooldown = {};
const fs = require('fs');
const { MessageEmbed, Permissions} = require('discord.js');
const toml = require('toml');
const config = toml.parse(fs.readFileSync('./config.toml', 'utf-8'));
const Levels = require('discord-xp');

Levels.setURL(config.general.mongodb_url);

module.exports = class {
    constructor(client) {
        this.client = client;
        this.timeouts = new Set();
    }

    async run(message) {

        if (!message) return;
        if (!message?.guild) return;
        if (!message?.guild?.available) return;

        const data = {
            config: this.client.config,
            guild: await this.client.findOrCreateGuild({id: message.guild.id}),
            memberData: await this.client.findOrCreateMember({id: message.author.id, guildID: message.guild.id}),
            userData: await this.client.findOrCreateUser({id: message.author.id})
        };

        message.guild.data = data.guild;

        const cachedGuild = message.guild;

        if (!message.member && !message.author.bot) {
            await message.guild.members.fetch(message.author.id);
        }

        if (data.userData.blocked) return;

        if (message.content.match(new RegExp(`^<@!?${this.client.user.id}>( |)$`)) && !message.author.bot) {
            let greetings = cachedGuild.translate("general/commandHandler:botPing").split('[')[1].split(']')[0].split('|');
            let text =
                cachedGuild.translate("general/commandHandler:botPing").split('[')[0] +
                greetings[Math.floor(Math.random() * greetings.length)] +
                cachedGuild.translate("general/commandHandler:botPing").split(']')[1];

            let embed = new MessageEmbed()
                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                .setDescription(text
                    .replace('{emotes.arrow}', this.client.emotes.arrow)
                    .replace('{emotes.arrow}', this.client.emotes.arrow)
                    .replace('{user}', message.member.user.username)
                    .replace('{prefix}', data.guild.prefix)
                    .replace('{emotes.use}', this.client.emotes.use))
                .setColor(this.client.embedColor)
                .setFooter({text: data.guild.footer});
            return message.send(embed, true);
        }

        if (data.guild.plugins?.autoDeleteChannels && data.guild.plugins?.autoDeleteChannels?.length > 0) {
            for (let val of data.guild.plugins.autoDeleteChannels) {
                if (val.split(' | ')[0].toString() === message.channel.id.toString()) {
                    new Promise(resolve => setTimeout(resolve, Number(val.split(' | ')[1]))).then(async () => {
                        message.delete().catch(() => {});
                    })
                }
            }
        }

        if (data.guild?.autoReactChannels && data.guild?.autoReactChannels?.length > 0) {
            for (let val of data.guild.autoReactChannels) {
                if (val.split(' | ')[0] === message.channel.id) {
                    let id = val.split(' | ')[1];
                    let emoji = this.client.emojis.cache.find(emoji => emoji.id === id);
                    if (emoji) {
                        message.react(emoji).catch(() => {})
                    } else {
                        let emoji = val.split(' | ')[1];
                        if (emoji) {
                            message.react(emoji).catch(() => {})
                        }
                    }
                }
            }
        }

        if (message.author.bot) return;

        let prefix = this.client.functions.getPrefix(message, data);
        if (!prefix) {
            if (data.guild.plugins.blacklist?.list.length > 0) {
                for (let word of data.guild.plugins.blacklist.list) {
                    if (message.content.toLowerCase().includes(word)) {
                        if (!message.channel.permissionsFor(message.member).has(Permissions.FLAGS.ADMINISTRATOR) || !message.channel.permissionsFor(message.member).has(Permissions.FLAGS.MANAGE_GUILD) || !message.channel.permissionsFor(message.member).has(Permissions.FLAGS.MANAGE_MESSAGES)) {
                            return message.delete().catch(() => {});
                        }
                    }
                }
            }

            // Leveling
            let randomXp = Math.floor(Math.random() * 30) + 1;
            for (let index of data.guild.plugins.levelsystem.doubleXpRoles) {
                if (message.member.roles.cache.get(index)) {
                    randomXp = Math.floor(Math.random() * 60) + 30;
                }
            }

            if (!this.timeouts.has(message.author.id)) {
                const leveledUp = await Levels.appendXp(message.author.id, message.guild.id, randomXp);
                let user = await Levels.fetch(message.author.id, message.guild.id, true);
                if (leveledUp) {
                    if (message.guild.id === config.support.id && Number(user.level) === 5) {

                        let keyPath = 'storage/premiumKeys.json';
                        let jsonDataKeys = JSON.parse(fs.readFileSync(keyPath));

                        let key = this.client.functions.generatePremiumKey();

                        jsonDataKeys[key] = 1;
                        let newJson = JSON.stringify(jsonDataKeys);
                        fs.writeFileSync(keyPath, newJson);

                        let embed = new MessageEmbed()
                            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                            .setDescription(message.translate("commandHandler:premiumKey")
                                .replace('{emotes.success}', this.client.emotes.success)
                                .replace('{user}', message.member.user.username)
                                .replace('{client}', this.client.user.username)
                                .replace('{key}', key))
                            .setColor(this.client.embedColor)
                            .setFooter({text: data.guild.footer});
                        await message.member.send(embed).catch(() => {});
                    }
                    if (data.guild.plugins?.levelsystem?.levelroles?.length > 0) {
                        for (let val of data.guild.plugins?.levelsystem?.levelroles) {
                            if (parseInt(val.split(' | ')[0]) === parseInt(user.level)) {
                                message.member.roles.add(val.split(' | ')[1]).catch(() => {})
                            }
                        }
                    }
                    if (data.guild.plugins.levelsystem.enabled) {
                        if (data.guild.plugins.levelsystem.channel !== "current") {
                            let channel = this.client.channels.cache.get(data.guild.plugins.levelsystem.channel);
                            let text = data.guild.plugins.levelsystem.message
                                .replace('%%user', message.member)
                                .replace('%%username', message.member.user.username)
                                .replace('%%usertag', message.member.user.tag)
                                .replace('%%level', user.level)
                                .replace('%%rank', user.position);
                            if(channel.permissionsFor(message.guild.me).has(Permissions.FLAGS.SEND_MESSAGES)){
                                channel.send(text).catch(() => {});
                            }
                        } else {
                            let text = data.guild.plugins.levelsystem?.message
                                .replace('%%user', message.member)
                                .replace('%%username', message.member.user.username)
                                .replace('%%usertag', message.member.user.tag)
                                .replace('%%level', user.level)
                                .replace('%%rank', user.position);
                            if (message.channel.permissionsFor(message.guild.me).has(Permissions.FLAGS.SEND_MESSAGES)) {
                                message.channel.send(text).catch(() => {});
                            }
                        }
                    }
                }
                this.timeouts.add(message.author.id);
                setTimeout(() => this.timeouts.delete(message.author.id), 25000);
            }
            return;
        }

        const args = message.content.slice((typeof prefix === "string" ? prefix.length : 0)).trim().split(/ +/g);
        const command = args.shift().toLowerCase();
        const cmd = this.client.commands.get(command) || this.client.commands.get(this.client.aliases.get(command));

        if (!cmd) return;

        if(data.guild.plugins.disabledCommands?.includes(cmd.help.name)) {
            let embed = new MessageEmbed()
                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                .setDescription(message.translate("commandHandler:ignoredCmd")
                    .replace('{emotes.error}', this.client.emotes.error))
                .setColor(this.client.embedColor)
                .setFooter({text: data.guild.footer});
            let sent = await message.send(embed)
            return new Promise(resolve => setTimeout(resolve, 4000)).then(async () => {
                sent.delete().catch(() => {});
            })
        }

        let neededPermissions = [];
        if (!cmd.conf.botPermissions.includes("EMBED_LINKS")) {
            cmd.conf.botPermissions.push("EMBED_LINKS");
        }
        cmd.conf.botPermissions.forEach((perm) => {
            if (!message.channel.permissionsFor(message.guild.me).has(Permissions.FLAGS[perm])) {
                neededPermissions.push(perm);
            }
        });
        if (neededPermissions.length > 0) {
            let perms = neededPermissions.map((p) => `|- ${p}`).join("\n")
            let embed = new MessageEmbed()
                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                .setDescription(message.translate("commandHandler:botPermsMissing")
                    .replace('{perms}', perms)
                    .replace('{emotes.error}', this.client.emotes.error)
                    .replace('{emotes.arrow}', this.client.emotes.arrow))
                .setColor(this.client.embedColor)
                .setFooter({text: data.guild.footer});
            return message.send(embed)
        }
        neededPermissions = [];
        cmd.conf.memberPermissions.forEach((perm) => {
            if (!message.channel.permissionsFor(message.member).has(Permissions.FLAGS[perm])) {
                neededPermissions.push(perm);
            }
        });
        if (neededPermissions.length > 0) {
            let perms = neededPermissions.map((p) => `|- ${p}`).join("\n")
            let embed = new MessageEmbed()
                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                .setDescription(message.translate("commandHandler:memberPermsMissing")
                    .replace('{perms}', perms)
                    .replace('{emotes.error}', this.client.emotes.error))
                .setColor(this.client.embedColor)
                .setFooter({text: data.guild.footer});
            return message.send(embed)
        }
        if (!message.channel.nsfw && cmd.conf.nsfw) {
            let embed = new MessageEmbed()
                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                .setDescription(message.translate("commandHandler:nsfwCommand")
                    .replace('{emotes.error}', this.client.emotes.error))
                .setColor(this.client.embedColor)
                .setFooter({text: data.guild.footer});
            return message.send(embed)
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
            if (message.author.id !== config.team.owner_id || !staffs[message.author.id] && message.author.id !== config.team.owner_id) {
                let embed = new MessageEmbed()
                    .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                    .setDescription(message.translate("commandHandler:disabledCommand")
                        .replace('{emotes.error}', this.client.emotes.error)
                        .replace('{emotes.arrow}', this.client.emotes.arrow)
                        .replace('{support}', this.client.supportUrl))
                    .setColor(this.client.embedColor)
                    .setFooter({text: data.guild.footer});
                return message.send(embed)
            }
        }
        if (cmd.conf.ownerOnly && (message.member.user.id !== config.team_owner_id)) {
            let embed = new MessageEmbed()
                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                .setDescription(message.translate("commandHandler:ownerCommand")
                    .replace('{emotes.error}', this.client.emotes.error))
                .setColor(this.client.embedColor)
                .setFooter({text: data.guild.footer});
            return message.send(embed)
        }
        let staffs = JSON.parse(fs.readFileSync('./storage/staffs.json'));
        if (cmd.conf.staffOnly && !staffs[message.author.id] && message.author.id !== config.team.owner_id) {
            let embed = new MessageEmbed()
                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                .setDescription(message.translate("commandHandler:staffCommand")
                    .replace('{emotes.error}', this.client.emotes.error)
                    .replace('{client}', this.client.user.username))
                .setColor(this.client.embedColor)
                .setFooter({text: data.guild.footer});
            return message.send(embed)
        }
        if (cmd.conf.premium && !data.guild.premium) {
            let embed = new MessageEmbed()
                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                .setDescription(message.translate("commandHandler:premiumCommand")
                    .replace('{emotes.error}', this.client.emotes.error)
                    .replace('{client}', this.client.user.username)
                    .replace('{emotes.arrow}', this.client.emotes.arrow)
                    .replace('{support}', this.client.supportUrl))
                .setColor(this.client.embedColor)
                .setFooter({text: data.guild.footer});
            return message.send(embed, true)
        }
        let uCooldown = cmdCooldown[message.author.id];
        if (!uCooldown) {
            cmdCooldown[message.author.id] = {};
            uCooldown = cmdCooldown[message.author.id];
        }
        const time = uCooldown[cmd.help.name] || 0;
        if (time && (time > Date.now())) {
            let staffs = JSON.parse(fs.readFileSync('./storage/staffs.json'));
            if (message.author.id !== config.team.owner_id || !staffs[message.author.id] && message.author.id !== config.team.owner_id) {
                let seconds = Math.ceil((time - Date.now()) / 1000)
                let desc = message.translate("commandHandler:remainingCooldown").split('?')[0]
                    .replace('{emotes.error}', this.client.emotes.error)
                    .replace('{time}', seconds);

                if (seconds > 1) desc += message.translate("commandHandler:remainingCooldown").split('?')[2]
                else desc += message.translate("commandHandler:remainingCooldown").split('?')[1]

                desc += message.translate("commandHandler:remainingCooldown").split('?')[3]
                let embed = new MessageEmbed()
                    .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                    .setDescription(desc)
                    .setColor(this.client.embedColor)
                    .setFooter({text: data.guild.footer});
                return message.send(embed)
            }
        }

        cmdCooldown[message.author.id][cmd.help.name] = Date.now() + cmd.conf.cooldown;

        const log = new this.client.logs({
            command: cmd.help.name,
            args: args,
            type: 'Message',
            executor: {
                username: message.author.username,
                discriminator: message.author.discriminator,
                id: message.author.id,
                createdAt: message.author.createdAt,
            },
            guild: {
                name: message.guild.name,
                id: message.guild.id,
                createdAt: message.guild.createdAt,
            }
        });
        log.save();
        try {
            cmd.run(undefined, message, args, data);
        } catch (e) {
            let embed = new MessageEmbed()
                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                .setDescription(message.translate("commandHandler:error")
                    .replace('{support}', this.client.supportUrl)
                    .replace('{emotes.error}', this.client.emotes.error))
                .setColor(this.client.embedColor)
                .setFooter({text: data.guild.footer});
            return await message.send(embed, true);
        }
    }
}
