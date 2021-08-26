const cmdCooldown = {}
    , { MessageEmbed } = require('discord.js')
    , config = require('../../config.json')
    , Levels = require('discord-xp')
    , fs = require('fs');
Levels.setURL(config.mongoDB_url);

module.exports = class {
    constructor(client) {
        this.client = client;
        this.timeouts = new Set();
    }

    async run(message){

        if(!message) return;

        const data = {}
            , client = this.client;

        data.config = client.config;

        if(message.guild){

            const g = message.guild
                , guild = await client.findOrCreateGuild( {id: message.guild.id} );

            message.guild.data = data.guild = guild;

            if(message.guild && !message.member){
                if(!message.author.bot){
                    await message.guild.members.fetch(message.author.id);
                }
            }

            let userDataRaw = await client.findOrCreateUser( {id: message.author.id} );

            if(userDataRaw.blocked) return;

            if (message.content.match(new RegExp(`^<@!?${client.user.id}>( |)$`))) {
                if (message.guild) {
                    let greetings = g.translate("general/commandHandler:botPing").split('[')[1].split(']')[0].split('|');
                    let text = g.translate("general/commandHandler:botPing").split('[')[0] + greetings[Math.floor(Math.random() * greetings.length)] + g.translate("general/commandHandler:botPing").split(']')[1];
                    let embed = new MessageEmbed()
                        .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), client.website)
                        .setDescription(text
                            .replace('{emotes.arrow}', client.emotes.arrow)
                            .replace('{user}', message.member.user.username)
                            .replace('{prefix}', data.guild.prefix)
                            .replace('{emotes.use}', client.emotes.use))
                        .setColor(client.embedColor)
                        .setFooter(data.guild.footer);
                    return message.send(embed, true);
                }
            }

            if(message.author.bot){
                const memberData = await client.findOrCreateMember({id: message.author.id, guildID: message.guild.id})
                    , userData = await client.findOrCreateUser({id:message.author.id});

                data.memberData = memberData;
                data.userData = userData;
            }


            if(data.guild.autoDeleteChannels){
                if(!(data.guild?.autoDeleteChannels?.length === 0)){
                    for(let val of data.guild.autoDeleteChannels){
                        if((val.split(' | ')[0]).toString() === (message.channel.id).toString()){
                            let time = Number(val.split(' | ')[1]);
                            new Promise(resolve => setTimeout(resolve, time)).then(async () => {
                                message.delete()
                                    .catch(() => {});
                            })

                        }
                    }
                }
            }

            if(data.guild.autoReactChannels) {
                if(!(data.guild?.autoReactChannels?.length === 0)) {
                    for(let val of data.guild.autoReactChannels) {
                        if(val.split(' | ')[0] === message.channel.id) {
                            let id = val.split(' | ')[1];
                            let emoji = this.client.emojis.cache.find(emoji => emoji.id === id);
                            if(emoji) {
                                message.react(emoji).catch(() => {})
                            }else{
                                let emoji = val.split(' | ')[1];
                                if(emoji) {
                                    message.react(emoji).catch(() => {})
                                }
                            }
                        }
                    }
                }
            }

            if(message.author.bot) return;

            let prefix = client.functions.getPrefix(message, data);
            if (!prefix) {
                if(data.guild.plugins.blacklist?.list.length > 0){
                    for(let word of data.guild.plugins.blacklist.list){
                        if(message.content.toLowerCase().includes(word)){
                            return message.delete().catch(()=>{});
                        }
                    }
                }

                let randomXp = Math.floor(Math.random() * 30) + 1;
                for (let index of data.guild.doubleXpRoles) {
                    if(message.member.roles.cache.get(index)) {
                        randomXp = Math.floor(Math.random() * 60) + 30;
                    }
                }

                if (!this.timeouts.has(message.author.id)) {
                    const leveledUp = await Levels.appendXp(message.author.id, message.guild.id, randomXp);
                    let user = await Levels.fetch(message.author.id, message.guild.id);
                    let role = message.guild.me.roles.highest;
                    if (leveledUp) {
                        if(message.guild.id === config.support.id){
                            if(Number(user.level) === 5){
                                function generateKey(length) {
                                    let result           = [];
                                    let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                                    let charactersLength = characters.length;
                                    for ( var i = 0; i < length; i++ ) {
                                        result.push(characters.charAt(Math.floor(Math.random() *
                                            charactersLength)));
                                    }
                                    return result.join('');
                                }

                                let keyPath = 'storage/premiumKeys.json'
                                let rawKeys = fs.readFileSync(keyPath)
                                let jsonDataKeys = JSON.parse(rawKeys)

                                let randomKey = generateKey(12)

                                jsonDataKeys[randomKey] = 1;
                                let newJson = await JSON.stringify(jsonDataKeys)
                                fs.writeFileSync(keyPath, newJson)
                                let embed = new MessageEmbed()
                                    .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), client.website)
                                    .setDescription(message.translate("general/commandHandler:premiumKey")
                                        .replace('{emotes.success}', this.client.emotes.success)
                                        .replace('{user}', message.member.user.username)
                                        .replace('{client}', client.user.username)
                                        .replace('{key}', randomKey))
                                    .setColor(client.embedColor)
                                    .setFooter(data.guild.footer);
                                await message.member.send(embed);
                            }
                        }
                        if (data.guild.levelRoles.length > 0) {
                            for (let val of data.guild.levelRoles) {
                                if(parseInt(val.split(' | ')[0]) === parseInt(user.level)){
                                    let id = val
                                        .replace(user.level, "")
                                        .replace(" | ", "");
                                    message.member.roles.add(id).catch(async e => {
                                        user = await Levels.fetch(message.author.id, message.guild.id);
                                        if (data.guild.plugins.logchannel.moderation) {
                                            const channel = message.guild.channels.cache.get(data.guild.plugins.logchannel.moderation);
                                            let role = message.guild.roles.cache.get(id);
                                            let embed = new MessageEmbed()
                                                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), client.website)
                                                .setDescription(g.translate("general/commandHandler:cantGiveRole")
                                                    .replace('{user}', message.author.tag)
                                                    .replace('{level}', user.level)
                                                    .replace('{role}', '@'+role.name)
                                                    .replace('{emotes.error}', client.emotes.error))
                                                .setColor(client.embedColor)
                                                .setFooter(data.guild.footer);
                                            channel.send(embed);
                                        }
                                    })
                                }
                            }
                        }
                        if (data.guild.plugins.levelmessages.enabled) {
                            if (message.channel.permissionsFor(role).has("SEND_MESSAGES", false)) {
                                if (data.guild.plugins.levelmessages.channel) {
                                    let channel = this.client.channels.cache.get(data.guild.plugins.levelmessages.channel);
                                    let text = data.guild.plugins.levelmessages.message
                                        .replace('%username', message.author.username)
                                        .replace('%user', message.author)
                                        .replace('%usertag', message.author.tag)
                                        .replace('%level', user.level);
                                    await channel.send(text);
                                } else {
                                    let text = data.guild.plugins.levelmessages?.message
                                        .replace('%username', message.author.username)
                                        .replace('%user', message.author)
                                        .replace('%usertag', message.author.tag)
                                        .replace('%level', user.level);
                                    await message.channel.send(text);
                                }
                            }
                        }
                    }

                    this.timeouts.add(message.author.id);
                    setTimeout(() => this.timeouts.delete(message.author.id), 25000);
                }
                return;
            }

            const args = message.content.slice((typeof prefix === "string" ? prefix.length : 0)).trim().split(/ +/g)
                , command = args.shift().toLowerCase()
                , cmd = client.commands.get(command) || client.commands.get(client.aliases.get(command));

            if(!cmd) return;

            if(data.guild.disabledCommands.includes(cmd.help.name)){
                let embed = new MessageEmbed()
                    .setAuthor(client.user.username, client.user.displayAvatarURL(), client.website)
                    .setDescription(g.translate("general/commandHandler:ignoredCmd")
                        .replace('{emotes.error}', client.emotes.error))
                    .setColor(client.embedColor)
                    .setFooter(data.guild.footer);
                let sent = await message.send(embed)
                return new Promise(resolve => setTimeout(resolve, 4000)).then(async () => {
                    sent.delete()
                        .catch(() => {});
                })

            }

            let neededPermissions = []
                , { Permissions } = require('discord.js');
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
                    .setAuthor(client.user.username, client.user.displayAvatarURL(), client.website)
                    .setDescription(g.translate("general/commandHandler:botPermsMissing")
                        .replace('{perms}', perms)
                        .replace('{emotes.error}', client.emotes.error)
                        .replace('{emotes.arrow}', client.emotes.arrow))
                    .setColor(client.embedColor)
                    .setFooter(data.guild.footer);
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
                    .setAuthor(client.user.username, client.user.displayAvatarURL(), client.website)
                    .setDescription(g.translate("general/commandHandler:memberPermsMissing")
                        .replace('{perms}', perms)
                        .replace('{emotes.error}', client.emotes.error))
                    .setColor(client.embedColor)
                    .setFooter(data.guild.footer);
                return message.send(embed)
            }

            if (!message.channel.nsfw && cmd.conf.nsfw) {
                let embed = new MessageEmbed()
                    .setAuthor(client.user.username, client.user.displayAvatarURL(), client.website)
                    .setDescription(g.translate("general/commandHandler:nsfwCommand")
                        .replace('{emotes.error}', client.emotes.error))
                    .setColor(client.embedColor)
                    .setFooter(data.guild.footer);
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
                if (!(message.author.id === client.config.owner_id)) {
                    let embed = new MessageEmbed()
                        .setAuthor(client.user.username, client.user.displayAvatarURL(), client.website)
                        .setDescription(g.translate("general/commandHandler:disabledCommand")
                            .replace('{emotes.error}', client.emotes.error)
                            .replace('{emotes.arrow}', client.emotes.arrow)
                            .replace('{support}', client.supportUrl))
                        .setColor(client.embedColor)
                        .setFooter(data.guild.footer);
                    return message.send(embed)
                }
            }

            if (cmd.conf.ownerOnly && (member.user.id !== config.owner_id)) {
                let embed = new MessageEmbed()
                    .setAuthor(client.user.username, client.user.displayAvatarURL(), client.website)
                    .setDescription(g.translate("general/commandHandler:ownerCommand")
                        .replace('{emotes.error}', client.emotes.error))
                    .setColor(client.embedColor)
                    .setFooter(data.guild.footer);
                return message.send(embed)
            }
            if(cmd.conf.staffOnly && !(client.config.staffs.includes(message.author.id))) {
                let embed = new MessageEmbed()
                    .setAuthor(client.user.username, client.user.displayAvatarURL(), client.website)
                    .setDescription(g.translate("general/commandHandler:staffCommand")
                        .replace('{emotes.error}', client.emotes.error)
                        .replace('{client}', client.user.username))
                    .setColor(client.embedColor)
                    .setFooter(data.guild.footer);
                return message.send(embed)
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
                return message.send(embed, true)

            }


            let uCooldown = cmdCooldown[message.author.id];
            if (!uCooldown) {
                cmdCooldown[message.author.id] = {};
                uCooldown = cmdCooldown[message.author.id];
            }
            const time = uCooldown[cmd.help.name] || 0;
            if (time && (time > Date.now())) {
                if (!(message.author.id === config.owner_id)) {
                    let seconds = Math.ceil((time - Date.now()) / 1000)
                    let desc = g.translate("general/commandHandler:remainingCooldown").split('?')[0]
                        .replace('{emotes.error}', client.emotes.error)
                        .replace('{time}', seconds);
                    if(seconds> 1) desc += g.translate("general/commandHandler:remainingCooldown").split('?')[2]
                    else desc += g.translate("general/commandHandler:remainingCooldown").split('?')[1]

                    desc += g.translate("general/commandHandler:remainingCooldown").split('?')[3]
                    let embed = new MessageEmbed()
                        .setAuthor(client.user.username, client.user.displayAvatarURL(), client.website)
                        .setDescription(desc)
                        .setColor(client.embedColor)
                        .setFooter(data.guild.footer);
                    return message.send(embed)
                }
            }

            cmdCooldown[message.author.id][cmd.help.name] = Date.now() + cmd.conf.cooldown;


            let interaction;
            try {
                cmd.run(interaction, message, args, data);
            } catch (e) {
                let embed = new MessageEmbed()
                    .setAuthor(client.user.username, client.user.displayAvatarURL(), client.website)
                    .setDescription(g.translate("general/commandHandler:error")
                        .replace('{support}', client.supportUrl)
                        .replace('{emotes.error}', client.emotes.error))
                    .setColor(client.embedColor)
                    .setFooter(data.guild.footer);
                await message.send(embed, true);
                return client.logError(e, message.member.user, g, `${data.guild.prefix}${command} ${args[0] ? args.join(' ') : ''}`, 'Message-Command')
            }
        }
    }
}
