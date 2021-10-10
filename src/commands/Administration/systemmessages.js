const Command = require('../../structure/Command')
    , { MessageEmbed } = require('discord.js')
    , { MessageActionRow, MessageSelectMenu } = require('discord.js');

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
                    data.guild.plugins.goodbye.message = msg.content;
                    data.guild.markModified("plugins.goodbye")
                    collectMessage.stop();

                    let embed = new MessageEmbed()
                        .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                        .setDescription(guild.translate("administration/systemmessages:sendChannel")
                            .replace('{emotes.arrow}', this.client.emotes.arrow))
                        .setColor(this.client.embedColor)
                        .setFooter(data.guild.footer);

                    let row = new MessageActionRow()
                        .addComponents(
                            new MessageSelectMenu()
                                .setCustomId('select_'+member.user.id)
                                .setPlaceholder(guild.translate("administration/systemmessages:chooseChannel"))
                        )
                    for(let channel of guild.channels.cache){
                        let option = {
                            label: channel[1].name,
                            value: member.user.id+'_'+channel[1].id
                        }
                        if(channel[1].type === "GUILD_TEXT" || channel[1].type === "GUILD_NEWS") row.components[0].options.push(option)
                    }
                    msg.delete().catch(() => {});
                    if (message) await sent.edit({embeds:[embed], components: [row]});
                    if (interaction) await sent.edit({embeds:[embed], components: [row]});

                    this.client.on("interactionCreate", async (interact) => {
                        if(!interact.isSelectMenu()) return;
                        if(interact.values[0].toString().split('_')[0] !== member.user.id) return;
                        data.guild.plugins.goodbye.channel = interact.values[0].toString().split('_')[1];
                        let embed = new MessageEmbed()
                            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                            .setDescription(guild.translate("administration/systemmessages:configuredGoodbye")
                                .replace('{emotes.success}', this.client.emotes.success))
                            .setColor(this.client.embedColor)
                            .setFooter(data.guild.footer);
                        await interact.update({ embeds: [embed], components: [] });
                        data.guild.plugins.goodbye.enabled = true;
                        data.guild.markModified("plugins.goodbye");
                        await data.guild.save();
                    });
                });
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

                    let row = new MessageActionRow()
                        .addComponents(
                            new MessageSelectMenu()
                                .setCustomId('select_'+member.user.id)
                                .setPlaceholder(guild.translate("administration/systemmessages:chooseChannel"))
                        )
                    for(let channel of guild.channels.cache){
                        let option = {
                            label: channel[1].name,
                            value: member.user.id+'_'+channel[1].id
                        }
                        if(channel[1].type === "GUILD_TEXT" || channel[1].type === "GUILD_NEWS") row.components[0].options.push(option)
                    }
                    msg.delete().catch(() => {});
                    if (message) await sent.edit({embeds:[embed], components: [row]});
                    if (interaction) await sent.edit({embeds:[embed], components: [row]});

                    this.client.on("interactionCreate", async (interact) => {
                        if(!interact.isSelectMenu()) return;
                        if(interact.values[0].toString().split('_')[0] !== member.user.id) return;
                        data.guild.plugins.welcome.channel = interact.values[0].toString().split('_')[1];
                        let embed = new MessageEmbed()
                            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                            .setDescription(guild.translate("administration/systemmessages:configuredWelcome")
                                .replace('{emotes.success}', this.client.emotes.success))
                            .setColor(this.client.embedColor)
                            .setFooter(data.guild.footer);
                        await interact.update({ embeds: [embed], components: [] });
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
