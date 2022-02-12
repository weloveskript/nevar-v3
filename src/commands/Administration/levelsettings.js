const Command = require('../../core/command');
const { MessageEmbed, MessageActionRow, MessageButton} = require('discord.js');
const Resolvers = require("../../helper/resolver");
const {SlashCommandBuilder} = require("@discordjs/builders");
const Levels = require("discord-xp");


class Levelsettings extends Command {

    constructor(client) {
        super(client, {
            name: "levelsettings",
            description: "admin/ls:general:description",
            dirname: __dirname,
            aliases: ["levelmessages", "levelroles", "levelsetting"],
            memberPermissions: ["MANAGE_GUILD"],
            premium: true,
            cooldown: 15000,
            slashCommand: {
                addCommand: true,
                data: new SlashCommandBuilder()
                    .addStringOption(option =>
                        option.setName('admin/ls:slash:1:name')
                            .setDescription('admin/ls:slash:1:description')
                            .setRequired(true)
                            .addChoice('admin/ls:slash:1:choices:1:name', 'channel')
                            .addChoice('admin/ls:slash:1:choices:2:name', 'messages')
                            .addChoice('admin/ls:slash:1:choices:3:name', 'roles')
                            .addChoice('admin/ls:slash:1:choices:4:name', 'doublexp'))
            }
        });
    }
    async run(interaction, message, args, data){

        const guild = message?.guild || interaction?.guild;
        const member = message?.member || interaction?.member;
        const channel = message?.channel || interaction?.channel;

        if(!args[0]){
            let embed = new MessageEmbed()
                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                .setDescription(guild.translate("admin/ls:general:usage")
                        .replace('{prefix}', data.guild.prefix)
                        .replace('{emotes.use}', this.client.emotes.use) + '\n' +
                    guild.translate("admin/ls:general:example")
                        .replace('{prefix}', data.guild.prefix)
                        .replace('{emotes.example}', this.client.emotes.example))
                .setColor(this.client.embedColor)
                .setFooter({text: data.guild.footer});
            if (message) return message.send(embed);
            if (interaction) return interaction.send(embed);
        }
        if(args[0].toLowerCase() === "channel"){
            let embed = new MessageEmbed()
                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                .setDescription(guild.translate("admin/ls:channel:collectors:channel")
                    .replace('{emotes.arrow}', this.client.emotes.arrow))
                .setColor(this.client.embedColor)
                .setFooter({text: data.guild.footer});
            let sent;
            if (message) sent = await message.send(embed);
            if (interaction) sent = await interaction.send(embed);

            const collectChannel = channel.createMessageCollector(
                {
                    filter: m => m.author.id === member.user.id,
                    time: 120000
                }
            );
            collectChannel.on("collect", async (msg) => {
                collectChannel.stop();
                let chan;
                if(msg.mentions.channels.first()){
                    chan = msg.mentions.channels.first();
                }else{
                    chan = msg.guild.channels.cache.get(msg.content);
                    if(msg.content.toLowerCase() === 'current'){
                        chan = "current";
                    }
                }
                if(!chan || chan.type !== "GUILD_TEXT" && chan.type !== "GUILD_NEWS"){
                    if(chan === 'current'){
                        msg.delete().catch(() => {});
                        data.guild.plugins.levelsystem.enabled = true;
                        data.guild.plugins.levelsystem.channel = 'current';
                        data.guild.markModified("plugins.levelsystem");
                        await data.guild.save();
                        let embed = new MessageEmbed()
                            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                            .setDescription(guild.translate("admin/ls:channel:set:current")
                                .replace('{emotes.success}', this.client.emotes.success))
                            .setColor(this.client.embedColor)
                            .setFooter({text: data.guild.footer});
                        msg.delete().catch(() => {});
                        return sent.edit({embeds:[embed]});
                    }
                    let embed = new MessageEmbed()
                        .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                        .setDescription(guild.translate("admin/ls:channel:invalid")
                            .replace('{emotes.error}', this.client.emotes.error))
                        .setColor(this.client.embedColor)
                        .setFooter({text: data.guild.footer});
                    msg.delete().catch(() => {});
                    return sent.edit({embeds:[embed]});
                }
                let embed = new MessageEmbed()
                    .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                    .setDescription(guild.translate("admin/ls:channel:set:other")
                        .replace('{emotes.success}', this.client.emotes.success)
                        .replace('{channel}', chan))
                    .setColor(this.client.embedColor)
                    .setFooter({text: data.guild.footer});
                msg.delete().catch(() => {});
                await sent.edit({embeds:[embed]});
                data.guild.plugins.levelsystem.enabled = true;
                data.guild.plugins.levelsystem.channel = chan.id;
                data.guild.markModified("plugins.levelsystem");
                await data.guild.save();
            });
        }
        if(args[0].toLowerCase() === 'messages'){
            let embed = new MessageEmbed()
                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                .setDescription(guild.translate("admin/ls:message:choose")
                    .replace('{emotes.arrow}', this.client.emotes.arrow))
                .setColor(this.client.embedColor)
                .setFooter({text: data.guild.footer});
            let id = message?.member?.user?.id || interaction?.member?.user?.id
            let row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('levelmessages_' + id + '_edit')
                        .setLabel(guild.translate("admin/ls:message:actions:1"))
                        .setEmoji('✏️')
                        .setDisabled(data.guild.plugins.levelsystem.enabled === false)
                        .setStyle('PRIMARY'),
                    new MessageButton()
                        .setCustomId('levelmessages_' + id + '_test')
                        .setLabel(guild.translate("admin/ls:message:actions:2"))
                        .setEmoji('▶️')
                        .setDisabled(data.guild.plugins.levelsystem.enabled === false)
                        .setStyle('PRIMARY'),
                    new MessageButton()
                        .setCustomId('levelmessages_' + id + '_enable')
                        .setLabel(guild.translate("admin/ls:message:actions:3"))
                        .setEmoji('✅')
                        .setDisabled(data.guild.plugins.levelsystem.enabled === true)
                        .setStyle('SUCCESS'),
                    new MessageButton()
                        .setCustomId('levelmessages_' + id + '_disable')
                        .setLabel(guild.translate("admin/ls:message:actions:4"))
                        .setEmoji('❌')
                        .setDisabled(data.guild.plugins.levelsystem.enabled === false)
                        .setStyle('DANGER'),
                )
            let sent;
            if (message) sent = await message.send(embed, false, [row]);
            if (interaction) sent = await interaction.send(embed, false, [row]);

            const filter = i => i.customId.startsWith('levelmessages_' + id) && i.user.id === id;

            const clicked = await sent.awaitMessageComponent({filter, time: 60000}).catch(() => {})

            if (clicked) {
                if (clicked.customId === 'levelmessages_' + id + '_edit') {
                    let embed = new MessageEmbed()
                        .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                        .setDescription(guild.translate("admin/ls:message:collectors:message")
                            .replace('{emotes.arrow}', this.client.emotes.arrow)
                            .replace('{emotes.arrow}', this.client.emotes.arrow))
                        .setColor(this.client.embedColor)
                        .setFooter({text: data.guild.footer});
                    await clicked.update({embeds: [embed], components: []});

                    const collectMessage = channel.createMessageCollector(
                        {
                            filter: m => m.author.id === member.user.id,
                            time: 120000
                        }
                    );
                    collectMessage.on("collect", async (msg) => {
                        collectMessage.stop();
                        data.guild.plugins.levelsystem.message = msg.content;
                        data.guild.markModified("plugins.levelsystem");
                        await data.guild.save();
                        msg.delete().catch(() => {
                        });
                        let embed = new MessageEmbed()
                            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                            .setDescription(guild.translate("admin/ls:message:set")
                                .replace('{emotes.success}', this.client.emotes.success))
                            .setColor(this.client.embedColor)
                            .setFooter({text: data.guild.footer});
                        await sent.edit({embeds: [embed]});
                    });
                }
                if (clicked.customId === 'levelmessages_' + id + '_test') {
                    let embed = new MessageEmbed()
                        .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                        .setDescription(guild.translate("admin/ls:message:test")
                            .replace('{emotes.success}', this.client.emotes.success))
                        .setColor(this.client.embedColor)
                        .setFooter({text: data.guild.footer});
                    await clicked.update({embeds: [embed], components: []});

                    await this.client.wait(2000);
                    let user = await Levels.fetch(member.user.id, guild.id, true);
                    let levelChannel = guild.channels.cache.get(data.guild.plugins.levelsystem.channel);
                    let text = data.guild.plugins.levelsystem.message
                        .replace('%%user', member)
                        .replace('%%username', member.user.username)
                        .replace('%%usertag', member.user.tag)
                        .replace('%%level', user.level)
                        .replace('%%rank', user.position)
                    if(levelChannel){
                        levelChannel.send({content: text}).catch(() => {});
                    }else{
                        if(data.guild.plugins.levelsystem.channel === 'current'){
                            channel.send({content: text})
                        }
                    }
                }
                if (clicked.customId === 'levelmessages_' + id + '_enable') {
                    data.guild.plugins.levelsystem.enabled = true;
                    data.guild.markModified("plugins.levelsystem");
                    await data.guild.save();
                    let embed = new MessageEmbed()
                        .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                        .setDescription(guild.translate("admin/ls:message:enabled")
                            .replace('{emotes.success}', this.client.emotes.success))
                        .setColor(this.client.embedColor)
                        .setFooter({text: data.guild.footer});
                    await clicked.update({embeds: [embed], components: []});
                }
                if (clicked.customId === 'levelmessages_' + id + '_disable') {
                    data.guild.plugins.levelsystem.enabled = false;
                    data.guild.markModified("plugins.levelsystem");
                    await data.guild.save();
                    let embed = new MessageEmbed()
                        .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                        .setDescription(guild.translate("admin/ls:message:disabled")
                            .replace('{emotes.success}', this.client.emotes.success))
                        .setColor(this.client.embedColor)
                        .setFooter({text: data.guild.footer});
                    await clicked.update({embeds: [embed], components: []});

                }
            }

        }
        if(args[0].toLowerCase() === 'roles'){
            let embed = new MessageEmbed()
                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                .setDescription(guild.translate("admin/ls:roles:choose")
                    .replace('{emotes.arrow}', this.client.emotes.arrow))
                .setColor(this.client.embedColor)
                .setFooter({text: data.guild.footer});
            let id = message?.member?.user?.id || interaction?.member?.user?.id
            let row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('levelroles_'+ id + '_create')
                        .setLabel(guild.translate("admin/ls:roles:actions:1"))
                        .setEmoji('➕')
                        .setStyle('PRIMARY'),
                    new MessageButton()
                        .setCustomId('levelroles_'+ id + '_list')
                        .setLabel(guild.translate("admin/ls:roles:actions:2"))
                        .setEmoji('📜')
                        .setDisabled(data.guild.plugins.levelsystem.levelroles.length < 1)
                        .setStyle('PRIMARY'),
                    new MessageButton()
                        .setCustomId('levelroles_'+ id + '_delete')
                        .setLabel(guild.translate("admin/ls:roles:actions:3"))
                        .setEmoji('➖')
                        .setDisabled(data.guild.plugins.levelsystem.levelroles.length < 1)
                        .setStyle('DANGER'),
                    new MessageButton()
                        .setCustomId('levelroles_'+ id + '_reset')
                        .setLabel(guild.translate("admin/ls:roles:actions:4"))
                        .setEmoji('🗑️')
                        .setDisabled(data.guild.plugins.levelsystem.levelroles.length < 1)
                        .setStyle('DANGER'),
                )
            let sent;
            if (message) sent = await message.send(embed, false, [row]);
            if (interaction) sent = await interaction.send(embed, false, [row]);

            const filter = i => i.customId.startsWith('levelroles_'+ id) && i.user.id === id;

            const clicked = await sent.awaitMessageComponent({ filter, time: 60000 }).catch(() => {})

            if(clicked) {
                if (clicked.customId === 'levelroles_' + id + '_create') {
                    let embed = new MessageEmbed()
                        .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                        .setDescription(guild.translate("admin/ls:roles:collectors:role")
                            .replace('{emotes.arrow}', this.client.emotes.arrow))
                        .setColor(this.client.embedColor)
                        .setFooter({text: data.guild.footer});
                    await clicked.update({embeds: [embed], components: []});

                    const collectRole = channel.createMessageCollector(
                        {
                            filter: m => m.author.id === member.user.id,
                            time: 120000
                        }
                    );
                    collectRole.on("collect", async (msg) => {
                        collectRole.stop();
                        let role;
                        if(msg.mentions.roles.first()){
                            role = msg.mentions.roles.first();
                        }else{
                            role = guild.roles.cache.get(msg.content);
                        }
                        if(!role){
                            msg.delete().catch(() => {});
                            let embed = new MessageEmbed()
                                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                                .setDescription(guild.translate("admin/ls:roles:invalid:role")
                                    .replace('{emotes.error}', this.client.emotes.error))
                                .setColor(this.client.embedColor)
                                .setFooter({text: data.guild.footer});
                            return sent.edit({embeds:[embed]});
                        }
                        msg.delete().catch(() => {});
                        let embed = new MessageEmbed()
                            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                            .setDescription(guild.translate("admin/ls:roles:collectors:level")
                                .replace('{emotes.arrow}', this.client.emotes.arrow))
                            .setColor(this.client.embedColor)
                            .setFooter({text: data.guild.footer});
                        await sent.edit({embeds:[embed]});
                        const collectLevel = channel.createMessageCollector(
                            {
                                filter: m => m.author.id === member.user.id,
                                time: 120000
                            }
                        );
                        collectLevel.on("collect", async (msg) => {
                            collectLevel.stop();
                            if(isNaN(Number(msg.content))){
                                let embed = new MessageEmbed()
                                    .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                                    .setDescription(guild.translate("admin/ls:invalid:level")
                                        .replace('{emotes.error}', this.client.emotes.error))
                                    .setColor(this.client.embedColor)
                                    .setFooter({text: data.guild.footer});
                                return sent.edit({embeds:[embed]});
                            }
                            const level = msg.content;
                            msg.delete().catch(() => {});
                            let embed = new MessageEmbed()
                                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                                .setDescription(guild.translate("admin/ls:roles:set")
                                    .replace('{emotes.success}', this.client.emotes.success)
                                    .replace('{level}', level)
                                    .replace('{role}', role))
                                .setColor(this.client.embedColor)
                                .setFooter({text: data.guild.footer});
                            for(let value of data.guild.plugins.levelsystem.levelroles){
                                if(value.split(' | ')[0] === level){
                                    data.guild.plugins.levelsystem.levelroles = data.guild.plugins.levelsystem.levelroles.filter(s => s !== value);
                                    data.guild.markModified("plugins.levelsystem");
                                }
                            }
                            data.guild.plugins.levelsystem.levelroles.push(level + ' | ' + role.id);
                            data.guild.markModified("plugins.levelsystem");
                            await data.guild.save();
                            await sent.edit({embeds:[embed]});
                        });
                    })
                }
                if (clicked.customId === 'levelroles_' + id + '_list') {

                    let roles = [];
                    for(let id of data.guild.plugins.levelsystem.levelroles){
                        let role = guild.roles.cache.get(id.split(' | ')[1])?.name;
                        if(role) roles.push(guild.translate("admin/ls:roles:list:level") + ' ' + id.split(' | ')[0] + ' | @' + role)
                    }

                    if(roles.length < 1) roles = [guild.translate("language:noEntries")];

                    let embed = new MessageEmbed()
                        .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                        .setDescription(guild.translate("admin/ls:roles:list:list")
                            .replace('{emotes.arrow}', this.client.emotes.arrow)
                            .replace('{list}', roles.join('\n|- ')))
                        .setColor(this.client.embedColor)
                        .setFooter({text: data.guild.footer});
                    clicked.update({embeds:[embed], components: []});

                }
                if(clicked.customId === 'levelroles_' + id + '_delete'){
                    let embed = new MessageEmbed()
                        .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                        .setDescription(guild.translate("admin/ls:roles:collectors:level")
                            .replace('{emotes.arrow}', this.client.emotes.arrow))
                        .setColor(this.client.embedColor)
                        .setFooter({text: data.guild.footer});
                    await clicked.update({embeds: [embed], components: []});
                    const collectLevel = channel.createMessageCollector(
                        {
                            filter: m => m.author.id === member.user.id,
                            time: 120000
                        }
                    );
                    collectLevel.on("collect", async (msg) => {
                        collectLevel.stop();
                        if (isNaN(Number(msg.content))) {
                            msg.delete().catch(() => {});
                            let embed = new MessageEmbed()
                                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                                .setDescription(guild.translate("admin/ls:roles:invalid:level")
                                    .replace('{emotes.error}', this.client.emotes.error))
                                .setColor(this.client.embedColor)
                                .setFooter({text: data.guild.footer});
                            return sent.edit({embeds: [embed]});
                        }
                        const level = msg.content;
                        msg.delete().catch(() => {});
                        for(let value of data.guild.plugins.levelsystem.levelroles){
                            if(Number(value.split(' | ')[0]) === Number(level)){
                                data.guild.plugins.levelsystem.levelroles = data.guild.plugins.levelsystem.levelroles.filter(s => s !== value);
                                data.guild.markModified("plugins.levelsystem");
                                await data.guild.save();
                            }
                        }
                        let embed = new MessageEmbed()
                            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                            .setDescription(guild.translate("admin/ls:roles:deleted")
                                .replace('{emotes.success}', this.client.emotes.success)
                                .replace('{level}', msg.content))
                            .setColor(this.client.embedColor)
                            .setFooter({text: data.guild.footer});
                        await sent.edit({embeds: [embed]});
                    });
                }
                if(clicked.customId === 'levelroles_'+ id + '_reset'){
                    data.guild.plugins.levelsystem.levelroles = [];
                    data.guild.markModified("plugins.levelsystem");
                    await data.guild.save();
                    let embed = new MessageEmbed()
                        .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                        .setDescription(guild.translate("admin/ls:roles:resetted")
                            .replace('{emotes.success}', this.client.emotes.success))
                        .setColor(this.client.embedColor)
                        .setFooter({text: data.guild.footer});
                    return clicked.update({embeds: [embed], components: []});
                }
            }
        }
        if(args[0] === 'doublexp'){
            let embed = new MessageEmbed()
                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                .setDescription(guild.translate("admin/ls:doublexp:choose")
                    .replace('{emotes.arrow}', this.client.emotes.arrow))
                .setColor(this.client.embedColor)
                .setFooter({text: data.guild.footer});
            let id = message?.member?.user?.id || interaction?.member?.user?.id
            let row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('doublexp_'+ id + '_create')
                        .setLabel(guild.translate("admin/ls:doublexp:actions:1"))
                        .setEmoji('➕')
                        .setStyle('PRIMARY'),
                    new MessageButton()
                        .setCustomId('doublexp_'+ id + '_list')
                        .setLabel(guild.translate("admin/ls:doublexp:actions:2"))
                        .setEmoji('📜')
                        .setDisabled(data.guild.plugins.levelsystem.doubleXpRoles.length < 1)
                        .setStyle('PRIMARY'),
                    new MessageButton()
                        .setCustomId('doublexp_'+ id + '_delete')
                        .setLabel(guild.translate("admin/ls:doublexp:actions:3"))
                        .setEmoji('➖')
                        .setDisabled(data.guild.plugins.levelsystem.doubleXpRoles.length < 1)
                        .setStyle('DANGER'),
                    new MessageButton()
                        .setCustomId('doublexp_'+ id + '_reset')
                        .setLabel(guild.translate("admin/ls:doublexp:actions:4"))
                        .setEmoji('🗑️')
                        .setDisabled(data.guild.plugins.levelsystem.doubleXpRoles.length < 1)
                        .setStyle('DANGER'),
                )
            let sent;
            if (message) sent = await message.send(embed, false, [row]);
            if (interaction) sent = await interaction.send(embed, false, [row]);

            const filter = i => i.customId.startsWith('doublexp_'+ id) && i.user.id === id;

            const clicked = await sent.awaitMessageComponent({ filter, time: 20000 }).catch(() => {})

            if(clicked) {
                if(clicked.customId === 'doublexp_'+ id + '_create'){
                    let embed = new MessageEmbed()
                        .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                        .setDescription(guild.translate("admin/ls:doublexp:collectors:role")
                            .replace('{emotes.arrow}', this.client.emotes.arrow))
                        .setColor(this.client.embedColor)
                        .setFooter({text: data.guild.footer});
                    await clicked.update({embeds: [embed], components: []});
                    const collectMessage = channel.createMessageCollector(
                        {
                            filter: m => m.author.id === member.user.id,
                            time: 120000
                        }
                    );
                    collectMessage.on("collect", async (msg) => {
                        collectMessage.stop();
                        const role = await Resolvers.resolveRole({
                            message: msg,
                            search: msg.content
                        });
                        if(role) {
                            if (data.guild.plugins.levelsystem.doubleXpRoles.includes(role.id)){
                                data.guild.plugins.levelsystem.doubleXpRoles = data.guild.plugins.levelsystem.doubleXpRoles.filter(r => r !== role.id);
                            }
                            data.guild.plugins.levelsystem.doubleXpRoles.push(role.id);
                            data.guild.markModified("plugins.levelsystem");
                            await data.guild.save();
                            msg.delete().catch(() => {});
                            let embed = new MessageEmbed()
                                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                                .setDescription(guild.translate("admin/ls:doublexp:set")
                                    .replace('{emotes.success}', this.client.emotes.success)
                                    .replace('{role}', role))
                                .setColor(this.client.embedColor)
                                .setFooter({text: data.guild.footer});
                            await sent.edit({embeds: [embed]});
                        }else{
                            msg.delete().catch(() => {});
                            let embed = new MessageEmbed()
                                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                                .setDescription(guild.translate("admin/ls:doublexp:invalid")
                                    .replace('{emotes.error}', this.client.emotes.error))
                                .setColor(this.client.embedColor)
                                .setFooter({text: data.guild.footer});
                            return sent.edit({embeds: [embed]});
                        }
                    });
                }
                if(clicked.customId === 'doublexp_'+ id + '_list'){
                    let doubleXp = [];
                    for(let id of data.guild.plugins.levelsystem.doubleXpRoles){
                        let role = guild.roles.cache.get(id)
                        if(role) doubleXp.push(role.name)
                    }
                    if(doubleXp.length < 1) doubleXp = [guild.translate("language:noEntries")];
                    let embed = new MessageEmbed()
                        .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                        .setDescription(guild.translate("admin/ls:doublexp:list")
                            .replace('{list}', doubleXp.join('\n|- '))
                            .replace('{emotes.arrow}', this.client.emotes.arrow))
                        .setColor(this.client.embedColor)
                        .setFooter({text: data.guild.footer});
                    return clicked.update({embeds: [embed], components: []});
                }
                if(clicked.customId === 'doublexp_'+ id + '_delete') {
                    let embed = new MessageEmbed()
                        .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                        .setDescription(guild.translate("admin/ls:doublexp:collectors:role")
                            .replace('{emotes.arrow}', this.client.emotes.arrow))
                        .setColor(this.client.embedColor)
                        .setFooter({text: data.guild.footer});
                    await clicked.update({embeds: [embed], components: []});
                    const collectMessage = channel.createMessageCollector(
                        {
                            filter: m => m.author.id === member.user.id,
                            time: 120000
                        }
                    );
                    collectMessage.on("collect", async (msg) => {
                        collectMessage.stop();
                        let role = await Resolvers.resolveRole({
                            message: msg,
                            search: msg.content
                        });
                        if (role) {
                            if (data.guild.plugins.levelsystem.doubleXpRoles.includes(role.id)) {
                                data.guild.plugins.levelsystem.doubleXpRoles = data.guild.plugins.levelsystem.doubleXpRoles.filter(r => r !== role.id);
                                data.guild.markModified("plugins.levelsystem");
                                data.guild.save();
                            }
                            msg.delete().catch(() => {});
                            let embed2 = new MessageEmbed()
                                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                                .setDescription(guild.translate("admin/ls:doublexp:deleted")
                                    .replace('{emotes.success}', this.client.emotes.success))
                                .setColor(this.client.embedColor)
                                .setFooter({text: data.guild.footer});
                            await sent.edit({embeds: [embed2]});
                        } else {
                            msg.delete().catch(() => {});
                            let embed = new MessageEmbed()
                                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                                .setDescription(guild.translate("admin/ls:doublexp:invalid")
                                    .replace('{emotes.error}', this.client.emotes.error))
                                .setColor(this.client.embedColor)
                                .setFooter({text: data.guild.footer});
                            return sent.edit({embeds: [embed]});
                        }
                    });
                }
                if(clicked.customId === 'doublexp_'+ id + '_reset'){
                    data.guild.plugins.levelsystem.doubleXpRoles = [];
                    data.guild.markModified("plugins.levelsystem");
                    await data.guild.save();
                    let embed = new MessageEmbed()
                        .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                        .setDescription(guild.translate("admin/ls:doublexp:resetted")
                            .replace('{emotes.success}', this.client.emotes.success))
                        .setColor(this.client.embedColor)
                        .setFooter({text: data.guild.footer});
                    return clicked.update({embeds: [embed], components: []});
                }
            }
        }
    };
}

module.exports = Levelsettings;
