const Command = require('../../core/command')
    , { MessageEmbed } = require('discord.js');

class Levelsettings extends Command {

    constructor(client) {
        super(client, {
            name: "levelsettings",
            description: "administration/levelsettings:description",
            dirname: __dirname,
            aliases: ["levelmessages", "levelroles", "levelsetting"],
            memberPermissions: ["MANAGE_GUILD"],
            cooldown: 10000,
            slashCommand: {
                addCommand: true,
                options: [
                    {
                        name: "administration/levelsettings:slashOption1",
                        description: "administration/levelsettings:slashOption1Desc",
                        type: "STRING",
                        required: true,
                        choices: [
                            {
                                name: "administration/levelsettings:slashOption1Choice1",
                                value: "channel"
                            },
                            {
                                name: "administration/levelsettings:slashOption1Choice2",
                                value: "messages"

                            },
                            {
                                name: "administration/levelsettings:slashOption1Choice3",
                                value: "roles"
                            }
                        ]
                    }
                ]
            }
        });
    }
    async run(interaction, message, args, data){

        let guild = message?.guild || interaction?.guild
            , member = message?.member || interaction?.member
            , channel = message?.channel || interaction?.channel;

        if(!args[0]){
            let embed = new MessageEmbed()
                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                .setDescription(guild.translate("administration/levelsettings:usage")
                        .replace('{prefix}', data.guild.prefix)
                        .replace('{emotes.use}', this.client.emotes.use) + '\n' +
                    guild.translate("administration/levelsettings:example")
                        .replace('{prefix}', data.guild.prefix)
                        .replace('{emotes.example}', this.client.emotes.example))
                .setColor(this.client.embedColor)
                .setFooter(data.guild.footer);
            if (message) return message.send(embed);
            if (interaction) return interaction.send(embed);
        }
        if(args[0].toLowerCase() === "channel"){
            let embed = new MessageEmbed()
                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                .setDescription(guild.translate("administration/levelsettings:sendChannel")
                    .replace('{emotes.arrow}', this.client.emotes.arrow))
                .setColor(this.client.embedColor)
                .setFooter(data.guild.footer);
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
                            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                            .setDescription(guild.translate("administration/levelsettings:channelSetToDefault")
                                .replace('{emotes.success}', this.client.emotes.success))
                            .setColor(this.client.embedColor)
                            .setFooter(data.guild.footer);
                        msg.delete().catch(() => {});
                        collectChannel.stop();
                        return  sent.edit({embeds:[embed]});
                    }
                    let embed = new MessageEmbed()
                        .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                        .setDescription(guild.translate("administration/levelsettings:invalidChannel")
                            .replace('{emotes.error}', this.client.emotes.error))
                        .setColor(this.client.embedColor)
                        .setFooter(data.guild.footer);
                    msg.delete().catch(() => {});
                    await sent.edit({embeds:[embed]});
                }
                collectChannel.stop();
                let embed = new MessageEmbed()
                    .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                    .setDescription(guild.translate("administration/levelsettings:channelSet")
                        .replace('{emotes.success}', this.client.emotes.success)
                        .replace('{channel}', chan))
                    .setColor(this.client.embedColor)
                    .setFooter(data.guild.footer);
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
                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                .setDescription(guild.translate("administration/levelsettings:sendMessage")
                    .replace('{emotes.arrow}', this.client.emotes.arrow)
                    .replace('{emotes.arrow}', this.client.emotes.arrow))
                .setColor(this.client.embedColor)
                .setFooter(data.guild.footer);
            let sent;
            if (message) sent = await message.send(embed);
            if (interaction) sent = await interaction.send(embed);

            const collectMessage = channel.createMessageCollector(
                {
                    filter: m => m.author.id === member.user.id,
                    time: 120000
                }
            );
            collectMessage.on("collect", async (msg) => {
                if(msg.content.toLowerCase() === 'off'){
                    data.guild.plugins.levelsystem.enabled = false;
                    data.guild.markModified("plugins.levelsystem");
                    await data.guild.save();
                    msg.delete().catch(() => {});
                    let embed = new MessageEmbed()
                        .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                        .setDescription(guild.translate("administration/levelsettings:messageDeactivated")
                            .replace('{emotes.success}', this.client.emotes.success))
                        .setColor(this.client.embedColor)
                        .setFooter(data.guild.footer);
                    await sent.edit({embeds:[embed]});
                    collectMessage.stop();
                    return;
                }
                data.guild.plugins.levelsystem.message = msg.content;
                data.guild.markModified("plugins.levelsystem");
                await data.guild.save();
                msg.delete().catch(() => {});
                let embed = new MessageEmbed()
                    .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                    .setDescription(guild.translate("administration/levelsettings:messageSet")
                        .replace('{emotes.success}', this.client.emotes.success))
                    .setColor(this.client.embedColor)
                    .setFooter(data.guild.footer);
                await sent.edit({embeds:[embed]});
                collectMessage.stop();
            });
        }
        if(args[0].toLowerCase() === 'roles') {
            let embed = new MessageEmbed()
                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                .setDescription(guild.translate("administration/levelsettings:chooseAction")
                    .replace('{emotes.arrow}', this.client.emotes.arrow))
                .setColor(this.client.embedColor)
                .setFooter(data.guild.footer);
            const { MessageButton, MessageActionRow } = require('discord.js');
            let id = message?.member?.user?.id || interaction?.member?.user?.id
            let row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('levelroles_'+ id + '_create')
                        .setLabel(guild.translate("administration/levelsettings:choose1"))
                        .setStyle('PRIMARY'),
                    new MessageButton()
                        .setCustomId('levelroles_'+ id + '_list')
                        .setLabel(guild.translate("administration/levelsettings:choose3"))
                        .setStyle('PRIMARY'),
                    new MessageButton()
                        .setCustomId('levelroles_'+ id + '_delete')
                        .setLabel(guild.translate("administration/levelsettings:choose2"))
                        .setStyle('DANGER'),

                )
            let sent;
            if (message) sent = await message.send(embed, false, [row]);
            if (interaction) sent = await interaction.send(embed, false, [row]);

            const filter = i => i.customId.startsWith('levelroles_'+ id) && i.user.id === id;

            const clicked = await sent.awaitMessageComponent({ filter, time: 20000 }).catch(() => {})

            if(clicked) {
                if (clicked.customId === 'levelroles_' + id + '_create') {
                    let embed = new MessageEmbed()
                        .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                        .setDescription(guild.translate("administration/levelsettings:sendRole")
                            .replace('{emotes.arrow}', this.client.emotes.arrow))
                        .setColor(this.client.embedColor)
                        .setFooter(data.guild.footer);
                    await clicked.update({embeds: [embed], components: []});

                    const collectRole = channel.createMessageCollector(
                        {
                            filter: m => m.author.id === member.user.id,
                            time: 120000
                        }
                    );
                    collectRole.on("collect", async (msg) => {
                        let role;
                        if(msg.mentions.roles.first()){
                            role = msg.mentions.roles.first();
                        }else{
                            role = guild.roles.cache.get(msg.content);
                        }
                        if(!role){
                            let embed = new MessageEmbed()
                                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                                .setDescription(guild.translate("administration/levelsettings:invalidRole")
                                    .replace('{emotes.error}', this.client.emotes.error))
                                .setColor(this.client.embedColor)
                                .setFooter(data.guild.footer);
                            await sent.edit({embeds:[embed]});
                        }
                        msg.delete().catch(() => {});
                        collectRole.stop();
                        let embed = new MessageEmbed()
                            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                            .setDescription(guild.translate("administration/levelsettings:sendLevel")
                                .replace('{emotes.arrow}', this.client.emotes.arrow)
                                .replace('{role}', role))
                            .setColor(this.client.embedColor)
                            .setFooter(data.guild.footer);
                        await sent.edit({embeds:[embed]});
                        const collectLevel = channel.createMessageCollector(
                            {
                                filter: m => m.author.id === member.user.id,
                                time: 120000
                            }
                        );
                        collectLevel.on("collect", async (msg) => {
                            if(isNaN(Number(msg.content))){
                                let embed = new MessageEmbed()
                                    .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                                    .setDescription(guild.translate("administration/levelsettings:invalidLevel")
                                        .replace('{emotes.error}', this.client.emotes.error))
                                    .setColor(this.client.embedColor)
                                    .setFooter(data.guild.footer);
                                await sent.edit({embeds:[embed]});
                            }
                            msg.delete().catch(() => {});
                            collectLevel.stop();
                            let embed = new MessageEmbed()
                                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                                .setDescription(guild.translate("administration/levelsettings:roleSet")
                                    .replace('{emotes.success}', this.client.emotes.success)
                                    .replace('{level}', msg.content)
                                    .replace('{role}', role))
                                .setColor(this.client.embedColor)
                                .setFooter(data.guild.footer);
                            for(let value of data.guild.plugins.levelsystem.levelroles){
                                if(value.split(' | ')[1] === role.id){
                                    data.guild.plugins.levelsystem.levelroles = data.guild.plugins.levelsystem.levelroles.filter(s => s !== value);
                                    data.guild.markModified("plugins.levelsystem");
                                }
                            }
                            data.guild.plugins.levelsystem.levelroles.push(msg.content + ' | ' + role.id);
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
                        if(role) roles.push(guild.translate("administration/configuration:confLevelsystem:level") + ' ' + id.split(' | ')[0] + ' | @' + role)
                    }
                    if(roles.length < 1) roles = [guild.translate("language:noEntries")];
                    let embed = new MessageEmbed()
                        .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                        .setDescription(guild.translate("administration/levelsettings:list")
                            .replace('{emotes.arrow}', this.client.emotes.arrow)
                            .replace('{list}', roles.join('\n|- ')))
                        .setColor(this.client.embedColor)
                        .setFooter(data.guild.footer);
                    clicked.update({embeds:[embed], components: []});

                }
                if(clicked.customId === 'levelroles_' + id + '_delete'){
                    let embed = new MessageEmbed()
                        .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                        .setDescription(guild.translate("administration/levelsettings:sendDeleteLevel")
                            .replace('{emotes.arrow}', this.client.emotes.arrow))
                        .setColor(this.client.embedColor)
                        .setFooter(data.guild.footer);
                    await clicked.update({embeds: [embed], components: []});
                    const collectLevel = channel.createMessageCollector(
                        {
                            filter: m => m.author.id === member.user.id,
                            time: 120000
                        }
                    );
                    collectLevel.on("collect", async (msg) => {
                        if (isNaN(Number(msg.content))) {
                            let embed = new MessageEmbed()
                                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                                .setDescription(guild.translate("administration/levelsettings:invalidLevel")
                                    .replace('{emotes.error}', this.client.emotes.error))
                                .setColor(this.client.embedColor)
                                .setFooter(data.guild.footer);
                            await sent.edit({embeds: [embed]});
                        }
                        msg.delete().catch(() => {});
                        collectLevel.stop();
                        for(let value of data.guild.plugins.levelsystem.levelroles){
                            if(Number(value.split(' | ')[0]) === Number(msg.content)){
                                data.guild.plugins.levelsystem.levelroles = data.guild.plugins.levelsystem.levelroles.filter(s => s !== value);
                                data.guild.markModified("plugins.levelsystem");
                            }
                        }
                        await data.guild.save();
                        let embed = new MessageEmbed()
                            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                            .setDescription(guild.translate("administration/levelsettings:resettedLevel")
                                .replace('{emotes.success}', this.client.emotes.success)
                                .replace('{level}', msg.content))
                            .setColor(this.client.embedColor)
                            .setFooter(data.guild.footer);
                        await sent.edit({embeds: [embed]});
                    });
                }
            }
        }
    }
}

module.exports = Levelsettings;
