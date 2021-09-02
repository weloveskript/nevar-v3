const Command = require('../../structure/Command')
    , backups = require('discord-backup')
    , { MessageEmbed } = require('discord.js');

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
                addCommand: true,
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
                    },
                    {
                        name: "administration/backup:slashOption2",
                        description: "administration/backup:slashOption2Desc",
                        type: "STRING",
                        required: false,
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
            if (message) return message.send(embed);
            if (interaction) return interaction.send(embed);
        }
        if(args[0].toLowerCase() === 'create'){
            let embed = new MessageEmbed()
                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                .setDescription(guild.translate("language:wait")
                    .replace('{emotes.loading}', this.client.emotes.loading))
                .setColor(this.client.embedColor)
                .setFooter(data.guild.footer);
            let answer;
            if (message) answer = await message.send(embed);
            if (interaction) answer = await interaction.send(embed);

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
                if (message) return  message.send(embed);
                if (interaction) return interaction.send(embed);
            }

            backups.fetch(args[1]).then(async () => {
                let embed = new MessageEmbed()
                    .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                    .setDescription(guild.translate("administration/backup:loadBackup")
                            .replace('{emotes.loading}', this.client.emotes.loading))
                    .setColor(this.client.embedColor)
                    .setFooter(data.guild.footer);
                const { MessageButton, MessageActionRow } = require('discord.js');
                let id = message?.member?.user?.id || interaction?.member?.user?.id
                let row = new MessageActionRow()
                    .addComponents(
                        new MessageButton()
                            .setCustomId('backup_'+ id + '_yes')
                            .setLabel(guild.translate("language:yes"))
                            .setStyle('PRIMARY')
                            .setEmoji('✅'),
                        new MessageButton()
                            .setCustomId('backup_'+ id + '_no')
                            .setLabel(guild.translate("language:no"))
                            .setStyle('PRIMARY')
                            .setEmoji('❌')

                    )

                let sent;
                if (message) sent = await message.send(embed, false, [row]);
                if (interaction) sent = await interaction.send(embed, false, [row]);

                const filter = i => i.customId.startsWith('backup_'+ id) && i.user.id === id;

                const clicked = await sent.awaitMessageComponent({ filter, time: 20000 }).catch(() => {})

                if(clicked){
                    if(clicked.customId === 'backup_'+id+'_yes'){
                        let embed = new MessageEmbed()
                            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                            .setDescription(guild.translate("administration/backup:loadNow")
                                .replace('{emotes.loading}', this.client.emotes.loading))
                            .setColor(this.client.embedColor)
                            .setFooter(data.guild.footer);
                        let row = new MessageActionRow()
                            .addComponents(
                                new MessageButton()
                                    .setCustomId('backup_'+ id + '_yes')
                                    .setLabel(guild.translate("language:yes"))
                                    .setStyle('PRIMARY')
                                    .setDisabled(true)
                                    .setEmoji('✅'),
                                new MessageButton()
                                    .setCustomId('backup_'+ id + '_no')
                                    .setLabel(guild.translate("language:no"))
                                    .setStyle('PRIMARY')
                                    .setDisabled(true)
                                    .setEmoji('❌')

                            )
                        await clicked.update({ embeds: [embed], components: [row] });
                        await this.client.wait(4000)
                        backups.load(args[1], guild, {
                            clearGuildBeforeRestore: true
                        }).then(async () => {})
                            .catch(() => {});
                    }else if(clicked.customId === 'backup_'+id+'_no'){
                        let embed = new MessageEmbed()
                            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                            .setDescription(guild.translate("administration/backup:cancelled")
                                .replace('{emotes.error}', this.client.emotes.error))
                            .setColor(this.client.embedColor)
                            .setFooter(data.guild.footer);
                        let row = new MessageActionRow()
                            .addComponents(
                                new MessageButton()
                                    .setCustomId('backup_'+ id + '_yes')
                                    .setLabel(guild.translate("language:yes"))
                                    .setStyle('PRIMARY')
                                    .setDisabled(true)
                                    .setEmoji('✅'),
                                new MessageButton()
                                    .setCustomId('backup_'+ id + '_no')
                                    .setLabel(guild.translate("language:no"))
                                    .setStyle('PRIMARY')
                                    .setDisabled(true)
                                    .setEmoji('❌')

                            )
                        await clicked.update({ embeds: [embed], components: [row] });
                    }
                }else{
                    let embed = new MessageEmbed()
                        .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                        .setDescription(guild.translate("administration/backup:cancelled")
                            .replace('{emotes.error}', this.client.emotes.error))
                        .setColor(this.client.embedColor)
                        .setFooter(data.guild.footer);
                    let row = new MessageActionRow()
                        .addComponents(
                            new MessageButton()
                                .setCustomId('backup_'+ id + '_yes')
                                .setLabel(guild.translate("language:yes"))
                                .setStyle('PRIMARY')
                                .setDisabled(true)
                                .setEmoji('✅'),
                            new MessageButton()
                                .setCustomId('backup_'+ id + '_no')
                                .setLabel(guild.translate("language:no"))
                                .setStyle('PRIMARY')
                                .setDisabled(true)
                                .setEmoji('❌')

                        )
                    await sent.edit({ embeds: [embed], components: [row] });
                }





            }).catch(() => {
                let embed = new MessageEmbed()
                    .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                    .setDescription(guild.translate("administration/backup:notFound")
                        .replace('{emotes.error}', this.client.emotes.error))
                    .setColor(this.client.embedColor)
                    .setFooter(data.guild.footer);
                if (message) return  message.send(embed);
                if (interaction) return interaction.send(embed);
            })



        }

        if(args[0].toLowerCase() === 'info'){
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
                if (message) return  message.send(embed);
                if (interaction) return interaction.send(embed);
            }
            backups.fetch(args[1]).then(async (backupData) => {
                const moment = require('moment')
                    , createdAt = moment.tz(backupData.data.createdTimestamp, guild.translate("language:timezone")).format(guild.translate("language:dateformat"))

                let embed = new MessageEmbed()
                    .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                    .setDescription(guild.translate("administration/backup:info")
                        .replace('{id}', args[1])
                        .replace('{emotes.arrow}', this.client.emotes.arrow)
                        .replace('{emotes.arrow}', this.client.emotes.arrow)
                        .replace('{emotes.arrow}', this.client.emotes.arrow)
                        .replace('{emotes.arrow}', this.client.emotes.arrow)
                        .replace('{guild}', backupData.data.name)
                        .replace('{creationDate}', createdAt)
                        .replace('{size}', backupData.size)
                        .replace('{emotes.loading}', this.client.emotes.loading))
                    .setThumbnail(backupData.data.iconURL)
                    .setColor(this.client.embedColor)
                    .setFooter(data.guild.footer);
                if (message) return  message.send(embed);
                if (interaction) return interaction.send(embed);
            })
                .catch(() => {
                    let embed = new MessageEmbed()
                        .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                        .setDescription(guild.translate("administration/backup:notFound")
                                .replace('{emotes.error}', this.client.emotes.error))
                        .setColor(this.client.embedColor)
                        .setFooter(data.guild.footer);
                    if (message) return  message.send(embed);
                    if (interaction) return interaction.send(embed);
                })
        }


    }
}

module.exports = Backup;
