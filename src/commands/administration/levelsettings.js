const Command = require('../../core/command');
const { MessageEmbed, MessageActionRow, MessageButton} = require('discord.js');
const Resolvers = require("../../helper/finder");
const {SlashCommandBuilder} = require("@discordjs/builders");
const Levels = require("discord-xp");


class Levelsettings extends Command {

    constructor(client) {
        super(client, {
            name: "levelsettings",
            description: "administration/levelsettings:general:description",
            dirname: __dirname,
            aliases: ["levelmessages", "levelroles", "levelsetting"],
            memberPermissions: ["MANAGE_GUILD"],
            premium: true,
            cooldown: 15000,
            slashCommand: {
                addCommand: true,
                data: new SlashCommandBuilder()
                    .addStringOption(option =>
                        option
                            .setRequired(true)
                            .addChoice('1', '5')
                            .addChoice('2', '6')
                            .addChoice('3', '7')
                            .addChoice('4', '8'))
            }
        });
    }
    async run(interaction, message, args, data){

        console.log(args[0])

        const guild = message?.guild || interaction?.guild;
        const member = message?.member || interaction?.member;
        const channel = message?.channel || interaction?.channel;

        if(!args[0]){
            if(message) return message.send(this.client.usageEmbed(guild, this, data));
            if(interaction) return interaction.send(this.client.usageEmbed(guild, this, data));
        }
        if(args[0].toLowerCase() === "channel"){
            let embed = new MessageEmbed()
                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                .setDescription(guild.translate("language:collectors:channel")
                    .replace('{emotes.arrow}', this.client.emotes.arrow) + '. ' + guild.translate("administration/levelsettings:channel:current"))
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
                msg.delete().catch(() => {});
                let channel = await Resolvers.resolveChannel({
                    message: msg,
                    search: msg.content,
                    channelType: "GUILD_TEXT"
                })
                if(!channel){
                    if(msg.content.toLowerCase() === 'current'){
                        data.guild.plugins.levelsystem.enabled = true;
                        data.guild.plugins.levelsystem.channel = 'current';
                        data.guild.markModified("plugins.levelsystem");
                        await data.guild.save();
                        let embed = new MessageEmbed()
                            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                            .setDescription(guild.translate("administration/levelsettings:channel:set:current")
                                .replace('{emotes.success}', this.client.emotes.success))
                            .setColor(this.client.embedColor)
                            .setFooter({text: data.guild.footer});
                        return sent.edit({embeds:[embed]});
                    }
                    let embed = new MessageEmbed()
                        .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                        .setDescription(guild.translate("language:invalid:channel")
                            .replace('{emotes.error}', this.client.emotes.error))
                        .setColor(this.client.embedColor)
                        .setFooter({text: data.guild.footer});
                    return sent.edit({embeds:[embed]});
                }
                let embed = new MessageEmbed()
                    .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                    .setDescription(guild.translate("administration/levelsettings:channel:set:other")
                        .replace('{emotes.success}', this.client.emotes.success)
                        .replace('{channel}', channel))
                    .setColor(this.client.embedColor)
                    .setFooter({text: data.guild.footer});
                await sent.edit({embeds:[embed]});
                data.guild.plugins.levelsystem.enabled = true;
                data.guild.plugins.levelsystem.channel = channel.id;
                data.guild.markModified("plugins.levelsystem");
                await data.guild.save();
            });
        }
        if(args[0].toLowerCase() === 'message'){
            let embed = new MessageEmbed()
                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                .setDescription(guild.translate("language:collectors:action")
                    .replace('{emotes.arrow}', this.client.emotes.arrow))
                .setColor(this.client.embedColor)
                .setFooter({text: data.guild.footer});
            let id = message?.member?.user?.id || interaction?.member?.user?.id
            let row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('levelmessages_' + id + '_edit')
                        .setLabel(guild.translate("administration/levelsettings:message:actions:1"))
                        .setEmoji('✏️')
                        .setDisabled(data.guild.plugins.levelsystem.enabled === false)
                        .setStyle('PRIMARY'),
                    new MessageButton()
                        .setCustomId('levelmessages_' + id + '_test')
                        .setLabel(guild.translate("administration/levelsettings:message:actions:2"))
                        .setEmoji('▶️')
                        .setDisabled(data.guild.plugins.levelsystem.enabled === false)
                        .setStyle('PRIMARY'),
                    new MessageButton()
                        .setCustomId('levelmessages_' + id + '_enable')
                        .setLabel(guild.translate("administration/levelsettings:message:actions:3"))
                        .setEmoji('✅')
                        .setDisabled(data.guild.plugins.levelsystem.enabled === true)
                        .setStyle('SUCCESS'),
                    new MessageButton()
                        .setCustomId('levelmessages_' + id + '_disable')
                        .setLabel(guild.translate("administration/levelsettings:message:actions:4"))
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
                        .setDescription(guild.translate("administration/levelsettings:message:collectors:message")
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
                        msg.delete().catch(() => {});
                        data.guild.plugins.levelsystem.message = msg.content;
                        data.guild.markModified("plugins.levelsystem");
                        await data.guild.save();
                        let embed = new MessageEmbed()
                            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                            .setDescription(guild.translate("administration/levelsettings:message:set")
                                .replace('{emotes.success}', this.client.emotes.success))
                            .setColor(this.client.embedColor)
                            .setFooter({text: data.guild.footer});
                        await sent.edit({embeds: [embed]});
                    });
                }
                if (clicked.customId === 'levelmessages_' + id + '_test') {
                    let embed = new MessageEmbed()
                        .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                        .setDescription(guild.translate("administration/levelsettings:message:test")
                            .replace('{emotes.arrow}', this.client.emotes.arrow))
                        .setColor(this.client.embedColor)
                        .setFooter({text: data.guild.footer});
                    await clicked.update({embeds: [embed], components: []});

                    await this.client.wait(1500);
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
                            channel.send({content: text}).catch(() => {});
                        }
                    }
                }
                if (clicked.customId === 'levelmessages_' + id + '_enable') {
                    data.guild.plugins.levelsystem.enabled = true;
                    data.guild.markModified("plugins.levelsystem");
                    await data.guild.save();
                    let embed = new MessageEmbed()
                        .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                        .setDescription(guild.translate("administration/levelsettings:message:enabled")
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
                        .setDescription(guild.translate("administration/levelsettings:message:disabled")
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
                .setDescription(guild.translate("language:collectors:action")
                    .replace('{emotes.arrow}', this.client.emotes.arrow))
                .setColor(this.client.embedColor)
                .setFooter({text: data.guild.footer});
            let id = message?.member?.user?.id || interaction?.member?.user?.id
            let row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('levelroles_'+ id + '_create')
                        .setLabel(guild.translate("administration/levelsettings:roles:actions:1"))
                        .setEmoji('➕')
                        .setStyle('PRIMARY'),
                    new MessageButton()
                        .setCustomId('levelroles_'+ id + '_list')
                        .setLabel(guild.translate("administration/levelsettings:roles:actions:2"))
                        .setEmoji('📜')
                        .setDisabled(data.guild.plugins.levelsystem.levelroles.length < 1)
                        .setStyle('PRIMARY'),
                    new MessageButton()
                        .setCustomId('levelroles_'+ id + '_delete')
                        .setLabel(guild.translate("administration/levelsettings:roles:actions:3"))
                        .setEmoji('➖')
                        .setDisabled(data.guild.plugins.levelsystem.levelroles.length < 1)
                        .setStyle('DANGER'),
                    new MessageButton()
                        .setCustomId('levelroles_'+ id + '_reset')
                        .setLabel(guild.translate("administration/levelsettings:roles:actions:4"))
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
                        .setDescription(guild.translate("language:collectors:role")
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
                        msg.delete().catch(() => {});
                        let role = await Resolvers.resolveRole({
                            message: msg,
                            search: msg.content
                        })
                        if(!role){
                            let embed = new MessageEmbed()
                                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                                .setDescription(guild.translate("languages:invalid:role")
                                    .replace('{emotes.error}', this.client.emotes.error))
                                .setColor(this.client.embedColor)
                                .setFooter({text: data.guild.footer});
                            return sent.edit({embeds:[embed]});
                        }
                        let embed = new MessageEmbed()
                            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                            .setDescription(guild.translate("administration/levelsettings:roles:collectors:level")
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
                            msg.delete().catch(() => {});
                            if(isNaN(Number(msg.content))){
                                let embed = new MessageEmbed()
                                    .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                                    .setDescription(guild.translate("administration/levelsettings:invalid:level")
                                        .replace('{emotes.error}', this.client.emotes.error))
                                    .setColor(this.client.embedColor)
                                    .setFooter({text: data.guild.footer});
                                return sent.edit({embeds:[embed]});
                            }
                            const level = msg.content;
                            let embed = new MessageEmbed()
                                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                                .setDescription(guild.translate("administration/levelsettings:roles:set")
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
                        if(role) roles.push(guild.translate("administration/levelsettings:roles:list:level") + ' ' + id.split(' | ')[0] + ' | @' + role)
                    }

                    if(roles.length < 1) roles = [guild.translate("language:noEntries")];

                    let embed = new MessageEmbed()
                        .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                        .setDescription(guild.translate("administration/levelsettings:roles:list:list")
                            .replace('{emotes.arrow}', this.client.emotes.arrow)
                            .replace('{list}', roles.join('\n|- ')))
                        .setColor(this.client.embedColor)
                        .setFooter({text: data.guild.footer});
                    clicked.update({embeds:[embed], components: []});

                }
                if(clicked.customId === 'levelroles_' + id + '_delete'){
                    let embed = new MessageEmbed()
                        .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                        .setDescription(guild.translate("administration/levelsettings:roles:collectors:level")
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
                        msg.delete().catch(() => {});
                        if (isNaN(Number(msg.content))) {
                            let embed = new MessageEmbed()
                                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                                .setDescription(guild.translate("administration/levelsettings:roles:invalid:level")
                                    .replace('{emotes.error}', this.client.emotes.error))
                                .setColor(this.client.embedColor)
                                .setFooter({text: data.guild.footer});
                            return sent.edit({embeds: [embed]});
                        }
                        const level = msg.content;
                        for(let value of data.guild.plugins.levelsystem.levelroles){
                            if(Number(value.split(' | ')[0]) === Number(level)){
                                data.guild.plugins.levelsystem.levelroles = data.guild.plugins.levelsystem.levelroles.filter(s => s !== value);
                                data.guild.markModified("plugins.levelsystem");
                                await data.guild.save();
                            }
                        }
                        let embed = new MessageEmbed()
                            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                            .setDescription(guild.translate("administration/levelsettings:roles:deleted")
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
                        .setDescription(guild.translate("administration/levelsettings:roles:resetted")
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
                .setDescription(guild.translate("language:collectors:action")
                    .replace('{emotes.arrow}', this.client.emotes.arrow))
                .setColor(this.client.embedColor)
                .setFooter({text: data.guild.footer});
            let id = message?.member?.user?.id || interaction?.member?.user?.id
            let row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('doublexp_'+ id + '_create')
                        .setLabel(guild.translate("administration/levelsettings:doublexp:actions:1"))
                        .setEmoji('➕')
                        .setStyle('PRIMARY'),
                    new MessageButton()
                        .setCustomId('doublexp_'+ id + '_list')
                        .setLabel(guild.translate("administration/levelsettings:doublexp:actions:2"))
                        .setEmoji('📜')
                        .setDisabled(data.guild.plugins.levelsystem.doubleXpRoles.length < 1)
                        .setStyle('PRIMARY'),
                    new MessageButton()
                        .setCustomId('doublexp_'+ id + '_delete')
                        .setLabel(guild.translate("administration/levelsettings:doublexp:actions:3"))
                        .setEmoji('➖')
                        .setDisabled(data.guild.plugins.levelsystem.doubleXpRoles.length < 1)
                        .setStyle('DANGER'),
                    new MessageButton()
                        .setCustomId('doublexp_'+ id + '_reset')
                        .setLabel(guild.translate("administration/levelsettings:doublexp:actions:4"))
                        .setEmoji('🗑️')
                        .setDisabled(data.guild.plugins.levelsystem.doubleXpRoles.length < 1)
                        .setStyle('DANGER'),
                )
            let sent;
            if (message) sent = await message.send(embed, false, [row]);
            if (interaction) sent = await interaction.send(embed, false, [row]);

            const filter = i => i.customId.startsWith('doublexp_'+ id) && i.user.id === id;

            const clicked = await sent.awaitMessageComponent({ filter, time: 120000 }).catch(() => {})

            if(clicked) {
                if(clicked.customId === 'doublexp_'+ id + '_create'){
                    let embed = new MessageEmbed()
                        .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                        .setDescription(guild.translate("language:collectors:role")
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
                        msg.delete().catch(() => {});
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
                            let embed = new MessageEmbed()
                                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                                .setDescription(guild.translate("administration/levelsettings:doublexp:set")
                                    .replace('{emotes.success}', this.client.emotes.success)
                                    .replace('{role}', role))
                                .setColor(this.client.embedColor)
                                .setFooter({text: data.guild.footer});
                            await sent.edit({embeds: [embed]});
                        }else{
                            let embed = new MessageEmbed()
                                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                                .setDescription(guild.translate("language:invalid:role")
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
                        .setDescription(guild.translate("administration/levelsettings:doublexp:list")
                            .replace('{list}', doubleXp.join('\n|- '))
                            .replace('{emotes.arrow}', this.client.emotes.arrow))
                        .setColor(this.client.embedColor)
                        .setFooter({text: data.guild.footer});
                    return clicked.update({embeds: [embed], components: []});
                }
                if(clicked.customId === 'doublexp_'+ id + '_delete') {
                    let embed = new MessageEmbed()
                        .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                        .setDescription(guild.translate("language:collectors:role")
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
                        msg.delete().catch(() => {});
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
                            let embed2 = new MessageEmbed()
                                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                                .setDescription(guild.translate("administration/levelsettings:doublexp:deleted")
                                    .replace('{role}', role)
                                    .replace('{emotes.success}', this.client.emotes.success))
                                .setColor(this.client.embedColor)
                                .setFooter({text: data.guild.footer});
                            await sent.edit({embeds: [embed2]});
                        } else {
                            let embed = new MessageEmbed()
                                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                                .setDescription(guild.translate("language:invalid:role")
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
                        .setDescription(guild.translate("administration/levelsettings:doublexp:resetted")
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
