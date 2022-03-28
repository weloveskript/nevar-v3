const Command = require('../../core/command');
const { MessageEmbed, MessageActionRow, MessageButton} = require('discord.js');
const premium = require('../../managers/premiumkeys');

class Premiumkeys extends Command {

    constructor(client) {
        super(client, {
            name: "premiumkeys",
            description: "staff/premiumkeys:general:description",
            dirname: __dirname,
            staffOnly: true,
            cooldown: 2000,
            slashCommand: {
                addCommand: false
            }
        });
    }

    async run(interaction, message, args, data) {

        const guild = message?.guild || interaction?.guild;
        const channel = message?.channel || interaction?.channel;
        const member = message?.member || interaction?.member;

        let embed = new MessageEmbed()
            .setAuthor({
                name: this.client.user.username,
                iconURL: this.client.user.displayAvatarURL(),
                url: this.client.website
            })
            .setDescription(guild.translate("language:collectors:action")
                .replace('{emotes.arrow}', this.client.emotes.arrow))
            .setColor(this.client.embedColor)
            .setFooter({text: data.guild.footer});
        let id = message?.member?.user?.id || interaction?.member?.user?.id
        let row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('key_' + id + '_create')
                    .setLabel(guild.translate("staff/premiumkeys:main:actions:1"))
                    .setEmoji('➕')
                    .setStyle('SUCCESS'),
                new MessageButton()
                    .setCustomId('key_' + id + '_list')
                    .setLabel(guild.translate("staff/premiumkeys:main:actions:2"))
                    .setDisabled(premium.getKeys().length < 1)
                    .setEmoji('📝')
                    .setStyle('PRIMARY'),
                new MessageButton()
                    .setCustomId('key_' + id + '_delete')
                    .setLabel(guild.translate("staff/premiumkeys:main:actions:3"))
                    .setDisabled(premium.getKeys().length < 1)
                    .setEmoji('➖')
                    .setStyle('DANGER'),
            )
        let sent;
        if (message) sent = await message.send(embed, false, [row]);
        if (interaction) sent = await interaction.send(embed, false, [row]);

        const filter = i => i.customId.startsWith('key_' + id) && i.user.id === id;

        const clicked = await sent.awaitMessageComponent({filter, time: 120000}).catch(() => {})

        if (clicked) {
            if (clicked.customId === 'key_' + id + '_create') {
                let embed = new MessageEmbed()
                    .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                    .setDescription(guild.translate("staff/premiumkeys:main:create:collectors:key")
                        .replace('{emotes.arrow}', this.client.emotes.arrow))
                    .setColor(this.client.embedColor)
                    .setFooter({text: data.guild.footer});
                let row = new MessageActionRow()
                    .addComponents(
                        new MessageButton()
                            .setCustomId('key_' + id + '_random')
                            .setLabel(guild.translate("staff/premiumkeys:main:create:actions:1"))
                            .setEmoji('🍀')
                            .setStyle('SUCCESS'),
                        new MessageButton()
                            .setCustomId('key_' + id + '_manually')
                            .setLabel(guild.translate("staff/premiumkeys:main:create:actions:2"))
                            .setEmoji('✏️')
                            .setStyle('PRIMARY'),
                    )
                await clicked.update({embeds: [embed], components: [row]});

                const filter = i => i.customId.startsWith('key_' + id) && i.user.id === id;

                const clicked2 = await sent.awaitMessageComponent({filter, time: 120000}).catch(() => {})

                if(clicked2){
                    if(clicked2.customId === 'key_' + id + '_random'){
                        let key = premium.createKey();
                        let embed = new MessageEmbed()
                            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                            .setDescription(guild.translate("staff/premiumkeys:main:create:created")
                                .replace('{emotes.success}', this.client.emotes.success)
                                .replace('{key}', key.key)
                                .replace('{maxUses}', key.maxUses))
                            .setColor(this.client.embedColor)
                            .setFooter({text: data.guild.footer});
                        clicked2.update({embeds: [embed], components: []});
                    }
                    if(clicked2.customId === 'key_' + id + '_manually'){
                        let embed = new MessageEmbed()
                            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                            .setDescription(guild.translate("staff/premiumkeys:main:create:collectors:keyText")
                                .replace('{emotes.arrow}', this.client.emotes.arrow))
                            .setColor(this.client.embedColor)
                            .setFooter({text: data.guild.footer});
                        await clicked2.update({embeds: [embed], components: []});

                        const collectMessage = channel.createMessageCollector(
                            {
                                filter: m => m.author.id === member.user.id,
                                time: 120000
                            }
                        );
                        collectMessage.on("collect", async (msg) => {
                            collectMessage.stop();
                            msg.delete().catch(() => {});
                            if(!msg.content) return;
                            let keyName = msg.content;
                            let embed = new MessageEmbed()
                                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                                .setDescription(guild.translate("staff/premiumkeys:main:create:collectors:maxUses")
                                    .replace('{emotes.arrow}', this.client.emotes.arrow))
                                .setColor(this.client.embedColor)
                                .setFooter({text: data.guild.footer});
                            sent.edit({embeds: [embed]});

                            const collectMaxUses = channel.createMessageCollector(
                                {
                                    filter: m => m.author.id === member.user.id,
                                    time: 120000
                                }
                            );
                            collectMaxUses.on("collect", async (msg) => {
                                collectMaxUses.stop();
                                msg.delete().catch(() => {});
                                if(!parseInt(msg.content)) return;
                                let maxUses = parseInt(msg.content);

                                let key = premium.createKey(keyName, maxUses);
                                let embed = new MessageEmbed()
                                    .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                                    .setDescription(guild.translate("staff/premiumkeys:main:create:created")
                                        .replace('{emotes.success}', this.client.emotes.success)
                                        .replace('{key}', key.key)
                                        .replace('{maxUses}', key.maxUses))
                                    .setColor(this.client.embedColor)
                                    .setFooter({text: data.guild.footer});
                                sent.edit({embeds: [embed]});
                            });
                        })
                    }
                }
            }
            if (clicked.customId === 'key_' + id + '_list') {

                let keys = premium.getKeys();
                let formattedKeys = [];
                for(let key of keys){
                    formattedKeys.push('|- ' + key.key + ' | ' + key.uses + '/' + key.maxUses + ' ' + guild.translate("staff/premiumkeys:main:list:uses"))
                }
                let embed = new MessageEmbed()
                    .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                    .setDescription(guild.translate("staff/premiumkeys:main:list:message")
                        .replace('{emotes.arrow}', this.client.emotes.arrow)
                        .replace('{list}', formattedKeys.join('\n')))
                    .setColor(this.client.embedColor)
                    .setFooter({text: data.guild.footer});
                clicked.update({embeds: [embed], components: []});
            }
            if (clicked.customId === 'key_' + id + '_delete') {
                let embed = new MessageEmbed()
                    .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                    .setDescription(guild.translate("staff/premiumkeys:main:delete:collectors:key")
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
                    if(!msg.content) return;
                    if(premium.validateKey(msg.content)){
                        premium.deleteKey(msg.content);
                        let embed = new MessageEmbed()
                            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                            .setDescription(guild.translate("staff/premiumkeys:main:delete:deleted")
                                .replace('{emotes.success}', this.client.emotes.success))
                            .setColor(this.client.embedColor)
                            .setFooter({text: data.guild.footer});
                        sent.edit({embeds:[embed]});
                    }
                });
            }
        }
    }
}
module.exports = Premiumkeys;
