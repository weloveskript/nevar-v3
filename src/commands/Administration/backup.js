const Command = require('../../structure/Command')
    , backups = require('discord-backup')
    , Sentry = require('@sentry/node')
    , { MessageEmbed } = require('discord.js')
    , reply = require('../../helper/simpleReply');


//backup create | load <id> | info <id>
class Backup extends Command {
    constructor(client) {
        super(client, {
            name: "backup",
            dirname: __dirname,
            memberPermissions: ['MANAGE_GUILD'],
            botPermissions: ['ADMINISTRATOR'],
            cooldown: 10000,
            premium: true,
            slashCommand: {
                addCommand: false,
                description: "administration/backup:description",
                options: [
                    {
                        name: "administration/backup:slashOption1",
                        description: "administration/backup:slashOption1Desc",
                        type: "STRING",
                        required: true,
                        choices: [
                            {
                                name: "administration/backup:slashOption1Choice1",
                                value: "create"
                            },
                            {
                                name: "administration/backup:slashOption1Choice2",
                                value: "load"

                            },
                            {
                                name: "administration/backup:slashOption1Choice3",
                                value: "info"
                            },
                        ]
                    }
                ]
            }
        });
    }
    async run(interaction, message, args, data){
        let guild = message?.guild || interaction?.guild
            , user = message?.author || interaction?.user;

        if(!args[0]){
            let embed = new MessageEmbed()
                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                .setDescription(guild.translate("administration/backup:usage")
                        .replace('{prefix}', data.guild.prefix)
                        .replace('{emotes.use}', this.client.emotes.use) + '\n' +
                    guild.translate("administration/backup:example")
                        .replace('{prefix}', data.guild.prefix)
                        .replace('{emotes.example}', this.client.emotes.example)
                        .replace('{channel}', message?.channel?.name || interaction?.channel?.name))
                .setColor(this.client.embedColor)
                .setFooter(data.guild.footer);
            if (message) return reply.message(message, embed);
            if (interaction) return reply.interaction(interaction, embed);
        }
        if(args[0].toLowerCase() === 'create'){
            let embed = new MessageEmbed()
                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                .setDescription(guild.translate("language:wait")
                    .replace('{emotes.loading}', this.client.emotes.loading))
                .setColor(this.client.embedColor)
                .setFooter(data.guild.footer);
            let answer;
            if (message) answer = await reply.message(message, embed);
            if (interaction) answer = await reply.interaction(interaction, embed);

            let options = {
                maxMessagesPerChannel: 0,
                jsonSave: true,
                jsonBeautify: true,
                saveImages: "base64"
            }
            await backups.create(guild, options).then(async (backup) => {
                let embed = new MessageEmbed()
                    .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                    .setDescription(guild.translate("administration/backup:created")
                        .replace('{emotes.success}', this.client.emotes.success)
                        .replace('{id}', backup.id))
                    .setColor(this.client.embedColor)
                    .setFooter(data.guild.footer);
                let embed2 = new MessageEmbed()
                    .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                    .setDescription(guild.translate("administration/backup:createdGuild")
                        .replace('{emotes.success}', this.client.emotes.success))
                    .setColor(this.client.embedColor)
                    .setFooter(data.guild.footer);

                let error;
                await user.send({embeds:[embed]}).catch(() => {
                    backups.remove(backup.id).catch(() => {})
                    let embed3 = new MessageEmbed()
                        .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                        .setDescription(guild.translate("administration/backup:cantDm")
                            .replace('{emotes.error}', this.client.emotes.error))
                        .setColor(this.client.embedColor)
                        .setFooter(data.guild.footer);
                    error = true;
                    if(interaction) return answer.react(this.client.emotes.error)
                    if(message) return answer.edit({embeds:[embed3]});
                });
                if(!error){
                    if(interaction) answer.react(this.client.emotes.success)
                    if(message) answer.edit({embeds:[embed2]});
                }
            })
        }
        if(args[0].toLowerCase() === 'load'){

            if(!args[1]){
                let embed = new MessageEmbed()
                    .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                    .setDescription(guild.translate("administration/backup:usage")
                            .replace('{prefix}', data.guild.prefix)
                            .replace('{emotes.use}', this.client.emotes.use) + '\n' +
                        guild.translate("administration/backup:example")
                            .replace('{prefix}', data.guild.prefix)
                            .replace('{emotes.example}', this.client.emotes.example)
                            .replace('{channel}', message?.channel?.name || interaction?.channel?.name))
                    .setColor(this.client.embedColor)
                    .setFooter(data.guild.footer);
                if (message) return message.send(embed);
                const { MessageButton, MessageActionRow } = require('discord.js');


                let row = new MessageActionRow()
                    .addComponents(
                        new MessageButton()
                            .setCustomId('yay')
                            .setLabel('Finally')
                            .setStyle('PRIMARY')
                    )
                if (interaction) return interaction.send(embed, true, [row]);
            }
            backups.fetch(args[1]).then(async () => {

            })




            message.send(embed, [row], true)


        }


    }
}

module.exports = Backup;
