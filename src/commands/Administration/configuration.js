const Command = require('../../structure/Command')
    , { MessageEmbed } = require('discord.js');

function msToTime(duration){
    let seconds = Math.floor((duration / 1000) % 60),
        minutes = Math.floor((duration / (1000 * 60)) % 60),
        hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    return hours + ":" + minutes + ":" + seconds;
}


class Configuration extends Command {

    constructor(client) {
        super(client, {
            name: "configuration",
            dirname: __dirname,
            aliases: ["conf", "config"],
            memberPermissions: ["MANAGE_GUILD"],
            slashCommand: {
                addCommand: true,
                description: "administration/configuration:description",
            }
        });
    }
    async run(interaction, message, args, data){
        let guild = message?.guild || interaction?.guild
            , user = message?.author || interaction?.user;

        let embed = new MessageEmbed()
            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
            .setDescription(guild.translate("administration/configuration:overview")
                    .replace('{emotes.arrow}', this.client.emotes.arrow))
            .setThumbnail(guild.iconURL({dynamic: true}))
            .setColor(this.client.embedColor)
            .setFooter(data.guild.footer);
        const { MessageButton, MessageActionRow } = require('discord.js');
        let id = message?.member?.user?.id || interaction?.member?.user?.id
        let identifier = this.client.randomKey(10)
        let row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('conf_'+id+'_'+identifier+'_system')
                    .setLabel(guild.translate("administration/configuration:system"))
                    .setStyle('PRIMARY')
                    .setEmoji('⚙️'),
                new MessageButton()
                    .setCustomId('conf_'+id+'_'+identifier+'_joinsettings')
                    .setLabel(guild.translate("administration/configuration:joinsettings"))
                    .setStyle('PRIMARY')
                    .setEmoji('👋'),
                new MessageButton()
                    .setCustomId('conf_'+id+'_'+identifier+'_levelsettings')
                    .setLabel(guild.translate("administration/configuration:levelsettings"))
                    .setStyle('PRIMARY')
                    .setEmoji('✨'),
                new MessageButton()
                    .setCustomId('conf_'+id+'_'+identifier+'_other')
                    .setLabel(guild.translate("administration/configuration:other"))
                    .setStyle('PRIMARY')
                    .setEmoji('📖'),

            )
        let sent;
        if (message) sent = await message.send(embed, false, [row]);
        if (interaction) sent = await interaction.send(embed, false, [row]);
        let channel = interaction?.channel || message?.channel;
        const filter = i => i.customId.startsWith('conf_'+id+'_'+identifier) && i.user.id === user.id;

        const collector = channel.createMessageComponentCollector({ filter, time: 600000 });

        collector
            .on('collect', async i => {
                if(i.customId === 'conf_'+id+'_'+identifier+'_system'){
                    for(let button of row.components){
                        button.setDisabled(false);
                        button.setStyle('PRIMARY');
                    }
                    let button = row.components.find((button) => button.customId === i.customId)
                    button.setDisabled(true);
                    button.setStyle('SECONDARY');
                    let desc = '';
                    desc += guild.translate("administration/configuration:confSystem:prefix")
                        .replace('{prefix}', data.guild.prefix)
                        .replace('{emotes.arrow}', this.client.emotes.arrow)
                    desc += guild.translate("administration/configuration:confSystem:language")
                        .replace('{lang}', guild.translate("language:language"))
                        .replace('{emotes.arrow}', this.client.emotes.arrow)
                    desc += guild.translate("administration/configuration:confSystem:premium")
                        .replace('{premium}', data.guild.premium ? guild.translate("language:activated") : guild.translate("language:deactivated"))
                        .replace('{emotes.arrow}', this.client.emotes.arrow)

                    desc += guild.translate("administration/configuration:confSystem:footer")
                        .replace('{footer}', data.guild.footer)
                        .replace('{emotes.arrow}', this.client.emotes.arrow)

                    let embed = new MessageEmbed()
                        .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                        .setDescription(desc)
                        .setTitle(guild.translate("administration/configuration:system"))
                        .setThumbnail(guild.iconURL({dynamic: true}))
                        .setColor(this.client.embedColor)
                        .setFooter(data.guild.footer);
                    await i.update({embeds: [embed], components: [row]});
                }

                if(i.customId === 'conf_'+id+'_'+identifier+'_joinsettings'){
                    for(let button of row.components){
                        button.setDisabled(false);
                        button.setStyle('PRIMARY');
                    }
                    let button = row.components.find((button) => button.customId === i.customId)
                    button.setDisabled(true);
                    button.setStyle('SECONDARY');
                    let desc = '';
                    desc += (guild.translate("administration/configuration:confJoinsettings:welcomeMessages")
                            .split('\n')[0]
                            .replace('{emotes.arrow}', this.client.emotes.arrow)) +
                        (data.guild.plugins.welcome.enabled ?
                            '```' + guild.translate("administration/configuration:confJoinsettings:welcomeMessages")
                                .split('\n')[1].split(' || ')[1]
                                .replace('{channel}', guild.channels.cache.get(data.guild.plugins.welcome.channel) ? '#'+guild.channels.cache.get(data.guild.plugins.welcome.channel).name : guild.translate("language:notFound")) +
                            '\n' + guild.translate("administration/configuration:confJoinsettings:welcomeMessages")

                                .split('\n').slice(2).join('\n')
                                .replace('{message}', data.guild.plugins.welcome.message)

                                .replace('{withImage}', data.guild.plugins.welcome.withImage ? guild.translate("language:yes") : guild.translate("language:no")) :
                            guild.translate("administration/configuration:confJoinsettings:welcomeMessages")
                                .split('\n')[1].split(' || ')[0] + '```')
                    desc += '\n';
                    desc += (guild.translate("administration/configuration:confJoinsettings:goodbyeMessages")
                            .split('\n')[0]
                            .replace('{emotes.arrow}', this.client.emotes.arrow)) +
                        (data.guild.plugins.goodbye.enabled ?
                            '```' + guild.translate("administration/configuration:confJoinsettings:goodbyeMessages")
                                .split('\n')[1].split(' || ')[1]
                                .replace('{channel}', guild.channels.cache.get(data.guild.plugins.goodbye.channel) ? '#'+guild.channels.cache.get(data.guild.plugins.goodbye.channel).name : guild.translate("language:notFound")) +
                            '\n' + guild.translate("administration/configuration:confJoinsettings:goodbyeMessages")

                                .split('\n').slice(2).join('\n')
                                .replace('{message}', data.guild.plugins.goodbye.message)

                                .replace('{withImage}', data.guild.plugins.goodbye.withImage ? guild.translate("language:yes") : guild.translate("language:no")) :
                            guild.translate("administration/configuration:confJoinsettings:goodbyeMessages")
                                .split('\n')[1].split(' || ')[0] + '```')

                    let userAutoroles = [];
                    for(let id of data.guild.plugins.autorole.user){
                        let role = guild.roles.cache.get(id)?.name;
                        if(role) userAutoroles.push('@'+role);

                    }
                    if(userAutoroles.length < 1) userAutoroles = [guild.translate("language:noEntries")];
                    desc += guild.translate("administration/configuration:confJoinsettings:userAutoroles")
                        .replace('{emotes.arrow}', this.client.emotes.arrow)
                        .replace('{list}', userAutoroles.join('\n|- '))

                    let botAutoroles = [];
                    for(let id of data.guild.plugins.autorole.bot){
                        let role = guild.roles.cache.get(id)?.name;
                        if(role) botAutoroles.push('@'+role);

                    }
                    if(botAutoroles.length < 1) botAutoroles = [guild.translate("language:noEntries")];
                    desc += guild.translate("administration/configuration:confJoinsettings:botAutoroles")
                        .replace('{emotes.arrow}', this.client.emotes.arrow)
                        .replace('{list}', botAutoroles.join('\n|- '))
                    let embed = new MessageEmbed()
                        .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                        .setDescription(desc)
                        .setTitle(guild.translate("administration/configuration:joinsettings"))

                        .setThumbnail(guild.iconURL({dynamic: true}))
                        .setColor(this.client.embedColor)
                        .setFooter(data.guild.footer);
                    await i.update({embeds: [embed], components: [row]});
                }
                if(i.customId === 'conf_'+id+'_'+identifier+'_levelsettings') {
                    for(let button of row.components){
                        button.setDisabled(false);
                        button.setStyle('PRIMARY');
                    }
                    let button = row.components.find((button) => button.customId === i.customId)
                    button.setDisabled(true);
                    button.setStyle('SECONDARY');
                    let desc = '';
                    desc += guild.translate("administration/configuration:confLevelsystem:levelmessages")
                        .replace('{state}', data.guild.plugins.levelsystem.enabled ? guild.translate("language:activated") : guild.translate("language:deactivated"))
                        .replace('{emotes.arrow}', this.client.emotes.arrow)
                    desc += guild.translate("administration/configuration:confLevelsystem:message")
                        .replace('{message}', data.guild.plugins.levelsystem.message)
                        .replace('{emotes.arrow}', this.client.emotes.arrow)

                    let channel = guild.channels.cache.get(data.guild.plugins.levelsystem.channel)?.name;
                    if(!channel) channel = guild.translate("administration/configuration:confLevelsystem:defaultChannel");
                    else channel = '#'+channel;

                    desc += guild.translate("administration/configuration:confLevelsystem:channel")
                        .replace('{channel}', channel)
                        .replace('{emotes.arrow}', this.client.emotes.arrow)

                    let roles = [];
                    for(let id of data.guild.plugins.levelsystem.levelroles){
                        let role = guild.roles.cache.get(id.split(' | ')[1])?.name;
                        if(role) roles.push(guild.translate("administration/configuration:confLevelsystem:level") + ' ' + id.split(' | ')[0] + ' | @' + role)
                    }
                    if(roles.length < 1) roles = [guild.translate("language:noEntries")];

                    desc += guild.translate("administration/configuration:confLevelsystem:roles")
                        .replace('{list}', roles.join('|- '))
                        .replace('{emotes.arrow}', this.client.emotes.arrow)

                    let doubleXp = [];
                    for(let id of data.guild.doubleXpRoles){
                        let role = guild.roles.cache.get(id)
                        if(role) doubleXp.push(role.name)
                    }
                    if(doubleXp.length < 1) doubleXp = [guild.translate("language:noEntries")];
                    desc += guild.translate("administration/configuration:confLevelsystem:doubleXp")
                        .replace('{list}', doubleXp.join('\n|- '))
                        .replace('{emotes.arrow}', this.client.emotes.arrow)


                    let embed = new MessageEmbed()
                        .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                        .setDescription(desc)
                        .setTitle(guild.translate("administration/configuration:levelsettings"))
                        .setThumbnail(guild.iconURL({dynamic: true}))
                        .setColor(this.client.embedColor)
                        .setFooter(data.guild.footer);
                    await i.update({embeds: [embed], components: [row]});
                }
                if(i.customId === 'conf_'+id+'_'+identifier+'_other') {
                    for(let button of row.components){
                        button.setDisabled(false);
                        button.setStyle('PRIMARY');
                    }
                    let button = row.components.find((button) => button.customId === i.customId)
                    button.setDisabled(true);
                    button.setStyle('SECONDARY');
                    let desc = '';
                    desc += (guild.translate("administration/configuration:confOther:join2create")
                            .split('\n')[0]
                            .replace('{emotes.arrow}', this.client.emotes.arrow)) +
                        (data.guild.joinToCreate.voice ?
                            '```' + guild.translate("administration/configuration:confOther:join2create")
                                .split('\n')[1].split(' || ')[1]
                                .replace('{channel}', guild.channels.cache.get(data.guild.joinToCreate.voice) ? '#'+ guild.channels.cache.get(data.guild.joinToCreate.voice).name : guild.translate("language:notFound")) +
                            '\n' + guild.translate("administration/configuration:confOther:join2create")

                                .split('\n').slice(2).join('\n')
                                .replace('{userlimit}', data.guild.joinToCreate.userLimit)

                                .replace('{bitrate}', data.guild.joinToCreate.bitrate) :
                            guild.translate("administration/configuration:confOther:join2create")
                                .split('\n')[1].split(' || ')[0] + '```')

                    let arr = [];
                    arr = data.guild.plugins.blacklist.list;
                    if(arr.length === 0) arr = [guild.translate("language:noEntries")];
                    if(arr.length > 10){
                        let length = arr.length - 10
                        arr = arr.slice(0, 10)

                        arr.push(guild.translate("administration/configuration:confOther:andMore")
                            .replace('{x}', length))
                    }
                    desc += guild.translate("administration/configuration:confOther:blacklist")
                        .replace('{emotes.arrow}', this.client.emotes.arrow)
                        .replace('{list}', arr.join('\n|- '))

                    desc += guild.translate("administration/configuration:confOther:autoSanctions")
                        .replace('{emotes.arrow}', this.client.emotes.arrow)
                        .replace('{kick}', (data.guild.plugins.autoSanctions.kick !== false ? guild.translate("administration/configuration:confOther:warns").replace('{x}', data.guild.plugins.autoSanctions.kick) : guild.translate("language:deactivated")))
                        .replace('{ban}', (data.guild.plugins.autoSanctions.ban !== false ? guild.translate("administration/configuration:confOther:bans").replace('{x}', data.guild.plugins.autoSanctions.ban) : guild.translate("language:deactivated")))


                    let embed = new MessageEmbed()
                        .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                        .setDescription(desc)
                        .setTitle(guild.translate("administration/configuration:other"))
                        .setThumbnail(guild.iconURL({dynamic: true}))
                        .setColor(this.client.embedColor)
                        .setFooter(data.guild.footer);
                    await i.update({embeds: [embed], components: [row]});


                }

                })
            .on('end', async (i) => {
                for(let button of row.components){
                    button.setDisabled(true);
                    button.setStyle('PRIMARY');
                }
                await sent.edit({embeds: [embed], components: [row]}).catch(() => {});
            })

    }
}

module.exports = Configuration;
