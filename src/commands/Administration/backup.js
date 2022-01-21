const Command = require('../../core/command');
const backups = require('discord-backup');
const { MessageEmbed, MessageActionRow, MessageButton} = require('discord.js');
const {SlashCommandBuilder} = require("@discordjs/builders");
const moment = require("moment");

class Backup extends Command {
    constructor(client) {
        super(client, {
            name: "backup",
            description: "admin/ba:general:description",
            dirname: __dirname,
            memberPermissions: ['MANAGE_GUILD'],
            botPermissions: ['ADMINISTRATOR'],
            cooldown: 20000,
            premium: true,
            slashCommand: {
                addCommand: true,
                data: new SlashCommandBuilder()
            }
        });
    }
    async run(interaction, message, args, data){
        const guild = message?.guild || interaction?.guild;
        const user = message?.author || interaction?.user;
        const channel = message?.channel || interaction?.channel;
        const member = message?.member || interaction?.member;

        let embed = new MessageEmbed()
            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
            .setDescription(guild.translate("admin/ba:main:choose")
                .replace('{emotes.arrow}', this.client.emotes.arrow))
            .setColor(this.client.embedColor)
            .setFooter(data.guild.footer);
        let id = message?.member?.user?.id || interaction?.member?.user?.id
        let row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('backup_' + id + '_create')
                    .setLabel(guild.translate("admin/ba:main:actions:1"))
                    .setEmoji('➕')
                    .setStyle('SUCCESS'),
                new MessageButton()
                    .setCustomId('backup_' + id + '_info')
                    .setLabel(guild.translate("admin/ba:main:actions:2"))
                    .setEmoji('💾')
                    .setStyle('PRIMARY'),
                new MessageButton()
                    .setCustomId('backup_' + id + '_load')
                    .setLabel(guild.translate("admin/ba:main:actions:3"))
                    .setEmoji('⌛')
                    .setStyle('PRIMARY'),
            )
        let sent;
        if (message) sent = await message.send(embed, false, [row]);
        if (interaction) sent = await interaction.send(embed, false, [row]);

        const filter = i => i.customId.startsWith('backup_' + id) && i.user.id === id;

        const clicked = await sent.awaitMessageComponent({filter, time: 120000}).catch(() => {})

        if (clicked) {
            if (clicked.customId === 'backup_' + id + '_create') {
                let embed = new MessageEmbed()
                    .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                    .setDescription(guild.translate("language:wait")
                        .replace('{emotes.loading}', this.client.emotes.loading))
                    .setColor(this.client.embedColor)
                    .setFooter(data.guild.footer);
                await clicked.update({embeds: [embed], components: []});

                let options = {
                    maxMessagesPerChannel: 0,
                    jsonSave: true,
                    jsonBeautify: true,
                    saveImages: "base64"
                }
                await backups.create(guild, options).then(async (backup) => {
                    let embed = new MessageEmbed()
                        .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                        .setDescription(guild.translate("admin/ba:main:created:private")
                            .replace('{emotes.success}', this.client.emotes.success)
                            .replace('{emotes.arrow}', this.client.emotes.arrow)
                            .replace('{id}', backup.id))
                        .setColor(this.client.embedColor)
                        .setFooter(data.guild.footer);
                    let embed2 = new MessageEmbed()
                        .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                        .setDescription(guild.translate("admin/ba:main:created:guild")
                            .replace('{emotes.success}', this.client.emotes.success))
                        .setColor(this.client.embedColor)
                        .setFooter(data.guild.footer);

                    await user.send({embeds: [embed]}).catch(() => {
                        backups.remove(backup.id).catch(() => {})
                        let embed3 = new MessageEmbed()
                            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                            .setDescription(guild.translate("admin/ba:main:created:cannotDm")
                                .replace('{emotes.error}', this.client.emotes.error))
                            .setColor(this.client.embedColor)
                            .setFooter(data.guild.footer);
                        return sent.edit({embeds: [embed3]});
                    });
                    return sent.edit({embeds: [embed2]});
                });
            }
            if (clicked.customId === 'backup_' + id + '_info') {
                let embed = new MessageEmbed()
                    .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                    .setDescription(guild.translate("admin/ba:main:collectors:id")
                        .replace('{emotes.arrow}', this.client.emotes.arrow))
                    .setColor(this.client.embedColor)
                    .setFooter(data.guild.footer);
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
                    backups.fetch(msg.content).then(async (backupData) => {
                        const createdAt = moment.tz(backupData.data.createdTimestamp, guild.translate("language:timezone")).format(guild.translate("language:dateformat"))

                        let embed = new MessageEmbed()
                            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                            .setDescription(guild.translate("admin/ba:main:info")
                                .replace('{id}', msg.content)
                                .replace('{emotes.arrow}', this.client.emotes.arrow)
                                .replace('{emotes.arrow}', this.client.emotes.arrow)
                                .replace('{emotes.arrow}', this.client.emotes.arrow)
                                .replace('{emotes.arrow}', this.client.emotes.arrow)
                                .replace('{guild}', backupData.data.name)
                                .replace('{creationDate}', createdAt)
                                .replace('{size}', backupData.size)
                                .replace('{emotes.arrow}', this.client.emotes.arrow))
                            .setThumbnail(backupData.data.iconURL)
                            .setColor(this.client.embedColor)
                            .setFooter(data.guild.footer);
                        return sent.edit({embeds: [embed]});
                    })
                        .catch(() => {
                            let embed = new MessageEmbed()
                                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                                .setDescription(guild.translate("admin/ba:main:notFound")
                                    .replace('{emotes.error}', this.client.emotes.error))
                                .setColor(this.client.embedColor)
                                .setFooter(data.guild.footer);
                            return sent.edit({embeds: [embed]});
                        })
                });
            }
            if (clicked.customId === 'backup_' + id + '_load') {
                let embed = new MessageEmbed()
                    .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                    .setDescription(guild.translate("admin/ba:main:collectors:id")
                        .replace('{emotes.arrow}', this.client.emotes.arrow))
                    .setColor(this.client.embedColor)
                    .setFooter(data.guild.footer);
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

                    backups.fetch(msg.content).then(async () => {
                        let embed = new MessageEmbed()
                            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                            .setDescription(guild.translate("admin/ba:main:load:consent")
                                .replace('{emotes.loading}', this.client.emotes.loading))
                            .setColor(this.client.embedColor)
                            .setFooter(data.guild.footer);
                        let id = member.user.id;
                        let row = new MessageActionRow()
                            .addComponents(
                                new MessageButton()
                                    .setCustomId('backup_'+ id + '_yes')
                                    .setLabel(guild.translate("language:yes"))
                                    .setStyle('SUCCESS')
                                    .setEmoji('✅'),
                                new MessageButton()
                                    .setCustomId('backup_'+ id + '_no')
                                    .setLabel(guild.translate("language:no"))
                                    .setStyle('DANGER')
                                    .setEmoji('❌')

                            )

                        sent.edit({embeds: [embed], components: [row]});

                        const filter = i => i.customId.startsWith('backup_'+ id) && i.user.id === id;

                        const clicked = await sent.awaitMessageComponent({ filter, time: 20000 }).catch(() => {})

                        if(clicked){
                            if(clicked.customId === 'backup_'+id+'_yes'){
                                let embed = new MessageEmbed()
                                    .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                                    .setDescription(guild.translate("language:wait")
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
                                backups.load(msg.content, guild, {
                                    clearGuildBeforeRestore: true
                                })
                                    .then(() => {})
                                    .catch(() => {});
                            }else if(clicked.customId === 'backup_'+id+'_no'){
                                let embed = new MessageEmbed()
                                    .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                                    .setDescription(guild.translate("admin/ba:main:cancelled")
                                        .replace('{emotes.error}', this.client.emotes.error))
                                    .setColor(this.client.embedColor)
                                    .setFooter(data.guild.footer);

                                await clicked.update({ embeds: [embed], components: [] });
                            }
                        }else{
                            let embed = new MessageEmbed()
                                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                                .setDescription(guild.translate("admin/ba:main:cancelled")
                                    .replace('{emotes.error}', this.client.emotes.error))
                                .setColor(this.client.embedColor)
                                .setFooter(data.guild.footer);

                            await clicked.update({ embeds: [embed], components: [] });
                        }
                    }).catch(() => {
                        let embed = new MessageEmbed()
                            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                            .setDescription(guild.translate("admin/ba:main:notFound")
                                .replace('{emotes.error}', this.client.emotes.error))
                            .setColor(this.client.embedColor)
                            .setFooter(data.guild.footer);
                        return sent.edit({embeds: [embed]});
                    });
                });
            }
        }
    };
}

module.exports = Backup;
