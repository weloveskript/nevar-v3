const Command = require('../../core/command');
const { MessageEmbed } = require('discord.js');
const ms = require('ms');

class Autodelete extends Command {

    constructor(client) {
        super(client, {
            name: "autodelete",
            description: "administration/autodelete:slashOption1Desc",
            dirname: __dirname,
            memberPermissions: ["MANAGE_GUILD"],
            premium: true,
            cooldown: 2000,
            slashCommand: {
                addCommand: true,
                description: "administration/autodelete:description",
                options: [
                    {
                        name: "administration/autodelete:slashOption1",
                        description: "administration/autodelete:slashOption1Desc",
                        type: "STRING",
                        required: true,
                        choices: [
                            {
                                name: "administration/autodelete:slashOption1Choice1",
                                value: "set"
                            },
                            {
                                name: "administration/autodelete:slashOption1Choice2",
                                value: "reset"

                            },
                            {
                                name: "administration/autodelete:slashOption1Choice3",
                                value: "list"
                            }
                        ]

                    },
                    {
                        name: "administration/autodelete:slashOption2",
                        description: "administration/autodelete:slashOption2Desc",
                        type: "CHANNEL",
                        required: false,
                    },
                    {
                        name: "administration/autodelete:slashOption3",
                        description: "administration/autodelete:slashOption3Desc",
                        type: "STRING",
                        required: false,
                    }
                ]
            }
        });
    }

    async run(interaction, message, args, data) {
        let guild = message?.guild || interaction?.guild;
        if (!args[0]) {
            let embed = new MessageEmbed()
                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                .setDescription(guild.translate("administration/autodelete:usage")
                        .replace('{prefix}', data.guild.prefix)
                        .replace('{emotes.use}', this.client.emotes.use) + '\n' +
                    guild.translate("administration/autodelete:example")
                        .replace('{prefix}', data.guild.prefix)
                        .replace('{channel}', message ? message?.channel?.name : interaction?.channel?.name)
                        .replace('{emotes.example}', this.client.emotes.example))
                .setColor(this.client.embedColor)
                .setFooter(data.guild.footer);
            if (message) return message.send(embed);
            if (interaction) return interaction.send(embed);
        }
        if (args[0].toLowerCase() === 'set') {
            let channel = guild.channels.cache.filter(ch => ch.type === 'GUILD_TEXT').get(args[1]);
            if (message) channel = message.mentions.channels.filter((ch) => ch.type === "GUILD_TEXT" || ch.type === "GUILD_NEWS" && ch.guild.id === message.guild.id).first();
            if (channel) {
                if (!args[2]) {
                    let embed = new MessageEmbed()
                        .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                        .setDescription(guild.translate("administration/autodelete:usage")
                                .replace('{prefix}', data.guild.prefix)
                                .replace('{emotes.use}', this.client.emotes.use) + '\n' +
                            guild.translate("administration/autodelete:example")
                                .replace('{prefix}', data.guild.prefix)
                                .replace('{channel}', message ? message?.channel?.name : interaction?.channel?.name)
                                .replace('{emotes.example}', this.client.emotes.example))
                        .setColor(this.client.embedColor)
                        .setFooter(data.guild.footer);
                    if (message) return message.send(embed);
                    if (interaction) return interaction.send(embed);
                }
                if (isNaN(ms(args[2]))) {
                    let embed = new MessageEmbed()
                        .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                        .setDescription(guild.translate("administration/autodelete:usage")
                                .replace('{prefix}', data.guild.prefix)
                                .replace('{emotes.use}', this.client.emotes.use) + '\n' +
                            guild.translate("administration/autodelete:example")
                                .replace('{prefix}', data.guild.prefix)
                                .replace('{channel}', message ? message?.channel?.name : interaction?.channel?.name)
                                .replace('{emotes.example}', this.client.emotes.example))
                        .setColor(this.client.embedColor)
                        .setFooter(data.guild.footer);
                    if (message) return message.send(embed);
                    if (interaction) return interaction.send(embed);
                } else {
                    if (ms(args[2]) > ms('7d')) {
                        let embed = new MessageEmbed()
                            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                            .setDescription(guild.translate("administration/autodelete:maxTime")
                                .replace('{emotes.error}', this.client.emotes.error))
                            .setColor(this.client.embedColor)
                            .setFooter(data.guild.footer);
                        if (message) return message.send(embed);
                        if (interaction) return interaction.send(embed);
                    }
                    if (data.guild.plugins.autoDeleteChannels.length > 10) {
                        let embed = new MessageEmbed()
                            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                            .setDescription(guild.translate("administration/autodelete:maxChannels")
                                .replace('{emotes.error}', this.client.emotes.error))
                            .setColor(this.client.embedColor)
                            .setFooter(data.guild.footer);
                        if (message) return message.send(embed);
                        if (interaction) return interaction.send(embed);
                    }

                    for (let val of data.guild.plugins.autoDeleteChannels) {
                        if (val.split(' | ')[0] === channel.id) {
                            data.guild.plugins.autoDeleteChannels = data.guild.plugins.autoDeleteChannels.filter((ch) => ch !== val)
                        }
                    }

                    let time = ms(args[2]);
                    let embed = new MessageEmbed()
                        .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                        .setDescription(guild.translate("administration/autodelete:set")
                            .replace('{emotes.success}', this.client.emotes.success)
                            .replace('{channel}', channel)
                            .replace('{time}', ms(Number(time))))
                        .setColor(this.client.embedColor)
                        .setFooter(data.guild.footer);
                    if (message) await message.send(embed);
                    if (interaction) await interaction.send(embed);
                    await this.client.wait(500);
                    data.guild.plugins.autoDeleteChannels.push(`${channel.id} | ${time}`);
                    await data.guild.save();

                }

            } else {
                let embed = new MessageEmbed()
                    .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                    .setDescription(guild.translate("administration/autodelete:usage")
                            .replace('{prefix}', data.guild.prefix)
                            .replace('{emotes.use}', this.client.emotes.use) + '\n' +
                        guild.translate("administration/autodelete:example")
                            .replace('{prefix}', data.guild.prefix)
                            .replace('{channel}', message ? message?.channel?.name : interaction?.channel?.name)
                            .replace('{emotes.example}', this.client.emotes.example))
                    .setColor(this.client.embedColor)
                    .setFooter(data.guild.footer);
                if (message) return message.send(embed);
                if (interaction) return interaction.send(embed);
            }
        } else if (args[0].toLowerCase() === 'reset') {
            if (!args[1]) {
                let embed = new MessageEmbed()
                    .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                    .setDescription(guild.translate("administration/autodelete:usage")
                            .replace('{prefix}', data.guild.prefix)
                            .replace('{emotes.use}', this.client.emotes.use) + '\n' +
                        guild.translate("administration/autodelete:example")
                            .replace('{prefix}', data.guild.prefix)
                            .replace('{channel}', message ? message?.channel?.name : interaction?.channel?.name)
                            .replace('{emotes.example}', this.client.emotes.example))
                    .setColor(this.client.embedColor)
                    .setFooter(data.guild.footer);
                if (message) return message.send(embed);
                if (interaction) return interaction.send(embed);
            }
            if (args[1].toLowerCase() === 'all') {
                let bool;
                if (data.guild.plugins.autoDeleteChannels.length >= 1) {
                    data.guild.plugins.autoDeleteChannels = [];
                    data.guild.markModified("plugins.autoDeleteChannels");
                    await data.guild.save();
                    bool = true;
                }
                if (bool) {
                    let embed = new MessageEmbed()
                        .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                        .setDescription(guild.translate("administration/autodelete:resettedAll")
                            .replace('{emotes.success}', this.client.emotes.success))
                        .setColor(this.client.embedColor)
                        .setFooter(data.guild.footer);
                    if (message) await message.send(embed);
                    if (interaction) await interaction.send(embed);
                } else {
                    let embed = new MessageEmbed()
                        .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                        .setDescription(guild.translate("administration/autodelete:noAutodelete")
                            .replace('{emotes.error}', this.client.emotes.error))
                        .setColor(this.client.embedColor)
                        .setFooter(data.guild.footer);
                    if (message) await message.send(embed);
                    if (interaction) await interaction.send(embed);

                }
            }else{
                    let channel = guild.channels.cache.filter(ch => ch.type === 'GUILD_TEXT').get(args[1]);
                    if (message) channel = message.mentions.channels.filter((ch) => ch.type === "GUILD_TEXT" || ch.type === "GUILD_NEWS" && ch.guild.id === message.guild.id).first();
                    if (channel) {
                        for (let val of data.guild.plugins.autoDeleteChannels) {
                            if (val.split(' | ')[0] === channel.id) {
                                data.guild.plugins.autoDeleteChannels = data.guild.plugins.autoDeleteChannels.filter((ch) => ch !== val);
                                await data.guild.save();
                                let embed = new MessageEmbed()
                                    .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                                    .setDescription(guild.translate("administration/autodelete:resettedChannel")
                                        .replace('{emotes.success}', this.client.emotes.success)
                                        .replace('{channel}', channel))
                                    .setColor(this.client.embedColor)
                                    .setFooter(data.guild.footer);
                                if (message) await message.send(embed);
                                if (interaction) await interaction.send(embed);
                            }
                        }
                        let embed = new MessageEmbed()
                            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                            .setDescription(guild.translate("administration/autodelete:noAutodeleteInChannel")
                                .replace('{emotes.error}', this.client.emotes.error)
                                .replace('{channel}', channel))
                            .setColor(this.client.embedColor)
                            .setFooter(data.guild.footer);
                        if (message) await message.send(embed);
                        if (interaction) await interaction.send(embed);
                    } else {
                        let embed = new MessageEmbed()
                            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                            .setDescription(guild.translate("administration/autodelete:usage")
                                    .replace('{prefix}', data.guild.prefix)
                                    .replace('{emotes.use}', this.client.emotes.use) + '\n' +
                                guild.translate("administration/autodelete:example")
                                    .replace('{prefix}', data.guild.prefix)
                                    .replace('{channel}', message ? message?.channel?.name : interaction?.channel?.name)
                                    .replace('{emotes.example}', this.client.emotes.example))
                            .setColor(this.client.embedColor)
                            .setFooter(data.guild.footer);
                        if (message) return message.send(embed);
                        if (interaction) return interaction.send(embed);}
            }
        }else if(args[0].toLowerCase() === 'list'){
            let channels = [];
            for(let val of data.guild.plugins.autoDeleteChannels){
                let channel = guild.channels.cache.get(val.split(' | ')[0]);
                if(channel) channels.push('|- #' + channel.name + ' | ' + ms(Number(val.split(' | ')[1])));
            }
            if(channels.length === 0) channels.push('|- '+ guild.translate("language:noEntries"));
            let embed = new MessageEmbed()
                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                .setDescription(guild.translate("administration/autodelete:list")
                    .replace('{emotes.arrow}', this.client.emotes.arrow)
                    .replace('{list}', channels.join('\n')))
                .setColor(this.client.embedColor)
                .setFooter(data.guild.footer);
            if (message) await message.send(embed);
            if (interaction) await interaction.send(embed);
        }
    }
}

module.exports = Autodelete;

