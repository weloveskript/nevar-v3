const Command = require('../../core/command');
const { MessageEmbed } = require('discord.js');
const { MessageActionRow, MessageSelectMenu } = require('discord.js');

class Systemmessages extends Command {

    constructor(client) {
        super(client, {
            name: "systemmessages",
            description: "administration/systemmessages:description",
            dirname: __dirname,
            memberPermissions: ["MANAGE_GUILD"],
            aliases: ["goodbye", "welcome", "system-messages", "systemmessage"],
            cooldown: 10000,
            slashCommand: {
                addCommand: true,
                options: [
                    {
                        name: "administration/systemmessages:slashOption1",
                        description: "administration/systemmessages:slashOption1Desc",
                        type: "STRING",
                        required: true,
                        choices: [
                            {
                                name: "administration/systemmessages:slashOption1Choice1",
                                value: "welcome"
                            },
                            {
                                name: "administration/systemmessages:slashOption1Choice2",
                                value: "goodbye"

                            },
                        ]
                    },
                    {
                        name: "administration/systemmessages:slashOption2",
                        description: "administration/systemmessages:slashOption2Desc",
                        type: "STRING",
                        required: false,
                        choices: [
                            {
                                name: "administration/systemmessages:slashOption2Choice1",
                                value: "test"
                            },
                            {
                                name: "administration/systemmessages:slashOption2Choice2",
                                value: "reset"
                            },
                        ]
                    }
                ]
            }
        });
    }

    async run(interaction, message, args, data){

        let guild = message?.guild || interaction?.guild
            , channel = message?.channel || interaction?.channel
            , member = message?.member || interaction?.member;

        if(!args[0]){
            let embed = new MessageEmbed()
                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                .setDescription(guild.translate("administration/systemmessages:usage")
                        .replace('{prefix}', data.guild.prefix)
                        .replace('{emotes.use}', this.client.emotes.use) + '\n' +
                    guild.translate("administration/systemmessages:example")
                        .replace('{prefix}', data.guild.prefix)
                        .replace('{emotes.example}', this.client.emotes.example))
                .setColor(this.client.embedColor)
                .setFooter(data.guild.footer);
            if (message) return message.send(embed);
            if (interaction) return interaction.send(embed);
        }

        if(args[0].toLowerCase() === "goodbye"){
            if(args[1] && args[1].toLowerCase() === "test"){
                if(data.guild.plugins.goodbye.enabled){
                    let member = interaction?.member || message?.member;
                    this.client.emit("guildMemberRemove", member);
                    let embed = new MessageEmbed()
                        .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                        .setDescription(guild.translate("administration/systemmessages:test")
                            .replace('{emotes.arrow}', this.client.emotes.arrow))
                        .setColor(this.client.embedColor)
                        .setFooter(data.guild.footer);
                    if (message) return message.send(embed);
                    if (interaction) return interaction.send(embed);
                }else{
                    let embed = new MessageEmbed()
                        .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                        .setDescription(guild.translate("administration/systemmessages:notEnabled")
                            .replace('{emotes.error}', this.client.emotes.error))
                        .setColor(this.client.embedColor)
                        .setFooter(data.guild.footer);
                    if (message) return message.send(embed);
                    if (interaction) return interaction.send(embed);
                }
            }
            if(args[1] && args[1].toLowerCase() === "reset"){
                data.guild.plugins.goodbye = {
                    enabled: false,
                    message: null,
                    channel: null,
                }
                data.guild.markModified("plugins.goodbye");
                await data.guild.save();
                let embed = new MessageEmbed()
                    .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                    .setDescription(guild.translate("administration/systemmessages:reset")
                        .replace('{emotes.success}', this.client.emotes.success))
                    .setColor(this.client.embedColor)
                    .setFooter(data.guild.footer);
                if (message) return message.send(embed);
                if (interaction) return interaction.send(embed);
            }

            if(!args[1]) {
                let embed = new MessageEmbed()
                    .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                    .setDescription(guild.translate("administration/systemmessages:sendMessage")
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
                    if (msg.content.length > 1800) {
                        let embed = new MessageEmbed()
                            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                            .setDescription(guild.translate("administration/systemmessages:tooLong")
                                .replace('{emotes.error}', this.client.emotes.error))
                            .setColor(this.client.embedColor)
                            .setFooter(data.guild.footer);
                        if (message) return message.send(embed);
                        if (interaction) return interaction.send(embed);
                    }
                    data.guild.plugins.goodbye.message = msg.content;
                    data.guild.markModified("plugins.goodbye")
                    collectMessage.stop();

                    let embed = new MessageEmbed()
                        .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                        .setDescription(guild.translate("administration/systemmessages:sendChannel")
                            .replace('{emotes.arrow}', this.client.emotes.arrow))
                        .setColor(this.client.embedColor)
                        .setFooter(data.guild.footer);


                    msg.delete().catch(() => {});
                    if (message) await sent.edit({embeds: [embed]});
                    if (interaction) await sent.edit({embeds: [embed]});

                    const collectChannel = channel.createMessageCollector(
                        {
                            filter: m => m.author.id === member.user.id,
                            time: 120000
                        }
                    );
                    collectChannel.on("collect", async (msg) => {
                        let chan;
                        if (msg.mentions.channels.first()) {
                            chan = msg.mentions.channels.first();
                        } else {
                            chan = msg.guild.channels.cache.get(msg.content);
                        }
                        if(!chan || chan.type !== "GUILD_TEXT" && chan.type !== "GUILD_NEWS"){
                            let embed = new MessageEmbed()
                                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                                .setDescription(guild.translate("administration/systemmessages:invalidChannel")
                                    .replace('{emotes.error}', this.client.emotes.error))
                                .setColor(this.client.embedColor)
                                .setFooter(data.guild.footer);
                            msg.delete().catch(() => {});
                            await sent.edit({embeds:[embed]});
                            collectChannel.stop();
                            return;
                        }
                        msg.delete().catch(() => {});
                        collectChannel.stop();

                        data.guild.plugins.goodbye.channel = chan.id;
                        let embed = new MessageEmbed()
                            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                            .setDescription(guild.translate("administration/systemmessages:configuredGoodbye")
                                .replace('{emotes.success}', this.client.emotes.success))
                            .setColor(this.client.embedColor)
                            .setFooter(data.guild.footer);
                        await sent.edit({embeds: [embed]});
                        data.guild.plugins.goodbye.enabled = true;
                        data.guild.markModified("plugins.goodbye");
                        await data.guild.save();
                    });
                })
            }
        }
        if(args[0].toLowerCase() === "welcome"){
            if(args[1] && args[1].toLowerCase() === "test"){
                if(data.guild.plugins.welcome.enabled){
                    let member = interaction?.member || message?.member;
                    this.client.emit("guildMemberAdd", member);
                    let embed = new MessageEmbed()
                        .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                        .setDescription(guild.translate("administration/systemmessages:test")
                            .replace('{emotes.arrow}', this.client.emotes.arrow))
                        .setColor(this.client.embedColor)
                        .setFooter(data.guild.footer);
                    if (message) return message.send(embed);
                    if (interaction) return interaction.send(embed);
                }else{
                    let embed = new MessageEmbed()
                        .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                        .setDescription(guild.translate("administration/systemmessages:notEnabled")
                            .replace('{emotes.error}', this.client.emotes.error))
                        .setColor(this.client.embedColor)
                        .setFooter(data.guild.footer);
                    if (message) return message.send(embed);
                    if (interaction) return interaction.send(embed);
                }
            }
            if(args[1] && args[1].toLowerCase() === "reset"){
                data.guild.plugins.welcome = {
                    enabled: false,
                    message: null,
                    channel: null,
                }
                data.guild.markModified("plugins.welcome");
                await data.guild.save();
                let embed = new MessageEmbed()
                    .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                    .setDescription(guild.translate("administration/systemmessages:reset")
                        .replace('{emotes.success}', this.client.emotes.success))
                    .setColor(this.client.embedColor)
                    .setFooter(data.guild.footer);
                if (message) return message.send(embed);
                if (interaction) return interaction.send(embed);
            }

            if(!args[1]){
                let embed = new MessageEmbed()
                    .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                    .setDescription(guild.translate("administration/systemmessages:sendMessage")
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
                    if(msg.content.length > 1800){
                        let embed = new MessageEmbed()
                            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                            .setDescription(guild.translate("administration/systemmessages:tooLong")
                                .replace('{emotes.error}', this.client.emotes.error))
                            .setColor(this.client.embedColor)
                            .setFooter(data.guild.footer);
                        if (message) return message.send(embed);
                        if (interaction) return interaction.send(embed);
                    }
                    data.guild.plugins.welcome.message = msg.content;
                    data.guild.markModified("plugins.welcome")
                    collectMessage.stop();

                    let embed = new MessageEmbed()
                        .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                        .setDescription(guild.translate("administration/systemmessages:sendChannel")
                            .replace('{emotes.arrow}', this.client.emotes.arrow))
                        .setColor(this.client.embedColor)
                        .setFooter(data.guild.footer);

                    msg.delete().catch(() => {});
                    if (message) await sent.edit({embeds: [embed]});
                    if (interaction) await sent.edit({embeds: [embed]});
                    const collectChannel = channel.createMessageCollector(
                        {
                            filter: m => m.author.id === member.user.id,
                            time: 120000
                        }
                    );
                    collectChannel.on("collect", async (msg) => {
                        let chan;
                        if (msg.mentions.channels.first()) {
                            chan = msg.mentions.channels.first();
                        } else {
                            chan = msg.guild.channels.cache.get(msg.content);
                        }
                        if(!chan || chan.type !== "GUILD_TEXT" && chan.type !== "GUILD_NEWS"){
                            let embed = new MessageEmbed()
                                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                                .setDescription(guild.translate("administration/systemmessages:invalidChannel")
                                    .replace('{emotes.error}', this.client.emotes.error))
                                .setColor(this.client.embedColor)
                                .setFooter(data.guild.footer);
                            msg.delete().catch(() => {});
                            await sent.edit({embeds:[embed]});
                            collectChannel.stop();
                            return;
                        }
                        msg.delete().catch(() => {});
                        collectChannel.stop();

                        data.guild.plugins.welcome.channel = chan.id;
                        let embed = new MessageEmbed()
                            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                            .setDescription(guild.translate("administration/systemmessages:configuredWelcome")
                                .replace('{emotes.success}', this.client.emotes.success))
                            .setColor(this.client.embedColor)
                            .setFooter(data.guild.footer);
                        await sent.edit({embeds: [embed]});
                        data.guild.plugins.welcome.enabled = true;
                        data.guild.markModified("plugins.welcome");
                        await data.guild.save();
                    });
                });
            }
        }
    }
}

module.exports = Systemmessages;
