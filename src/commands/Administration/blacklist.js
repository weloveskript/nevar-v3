const Command = require('../../core/command');
const { MessageEmbed, MessageActionRow, MessageButton} = require('discord.js');
const {SlashCommandBuilder} = require("@discordjs/builders");

class Blacklist extends Command {

    constructor(client) {
        super(client, {
            name: "blacklist",
            description: "admin/bl:general:description",
            dirname: __dirname,
            aliases: ["bl"],
            memberPermissions: ["MANAGE_GUILD"],
            premium: true,
            cooldown: 3000,
            slashCommand: {
                addCommand: true,
                data: new SlashCommandBuilder()
            }
        });

    }

    async run(interaction, message, args, data){

        const guild = message?.guild || interaction?.guild;
        const channel = message?.channel || interaction?.channel;
        const member = message?.member || interaction?.member;

        let embed = new MessageEmbed()
            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
            .setDescription(guild.translate("admin/bl:main:choose")
                .replace('{emotes.arrow}', this.client.emotes.arrow))
            .setColor(this.client.embedColor)
            .setFooter({text: data.guild.footer});
        let id = message?.member?.user?.id || interaction?.member?.user?.id
        let row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('blacklist_' + id + '_add')
                    .setLabel(guild.translate("admin/bl:main:actions:1"))
                    .setEmoji('➕')
                    .setStyle('SUCCESS'),
                new MessageButton()
                    .setCustomId('blacklist_' + id + '_list')
                    .setLabel(guild.translate("admin/bl:main:actions:2"))
                    .setEmoji('📝')
                    .setDisabled(data.guild.plugins.blacklist.list.length === 0)
                    .setStyle('PRIMARY'),
                new MessageButton()
                    .setCustomId('blacklist_' + id + '_remove')
                    .setLabel(guild.translate("admin/bl:main:actions:3"))
                    .setEmoji('➖')
                    .setDisabled(data.guild.plugins.blacklist.list.length === 0)
                    .setStyle('DANGER'),
            )
        let sent;
        if (message) sent = await message.send(embed, false, [row]);
        if (interaction) sent = await interaction.send(embed, false, [row]);

        const filter = i => i.customId.startsWith('blacklist_' + id) && i.user.id === id;

        const clicked = await sent.awaitMessageComponent({filter, time: 120000}).catch(() => {})

        if (clicked) {
            if (clicked.customId === 'blacklist_' + id + '_add') {
                let embed = new MessageEmbed()
                    .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                    .setDescription(guild.translate("admin/bl:main:collectors:wordAdd")
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
                    msg.delete().catch(() => {})
                    if(data.guild.plugins.blacklist.list.includes(msg.content.toLowerCase())){
                        data.guild.plugins.blacklist.list = data.guild.plugins.blacklist.list.filter(v => v !== msg.content.toLowerCase());
                    }
                    data.guild.plugins.blacklist.list.push(msg.content.toLowerCase());
                    data.guild.markModified("plugins.blacklist");
                    await data.guild.save();
                    let embed = new MessageEmbed()
                        .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                        .setDescription(guild.translate("admin/bl:main:added")
                            .replace('{emotes.success}', this.client.emotes.success)
                            .replace('{word}', msg.content))
                        .setColor(this.client.embedColor)
                        .setFooter({text: data.guild.footer});
                    return sent.edit({embeds: [embed]});
                });

            }
            if (clicked.customId === 'blacklist_' + id + '_list') {
                let embed = new MessageEmbed()
                    .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                    .setDescription(guild.translate("admin/bl:main:list")
                        .replace('{emotes.arrow}', this.client.emotes.arrow)
                        .replace('{list}', data.guild.plugins.blacklist.list.join('\n|- ')))
                    .setColor(this.client.embedColor)
                    .setFooter({text: data.guild.footer});
                await clicked.update({embeds: [embed], components: []});
            }
            if (clicked.customId === 'blacklist_' + id + '_remove') {
                let embed = new MessageEmbed()
                    .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                    .setDescription(guild.translate("admin/bl:main:collectors:wordRemove")
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
                    msg.delete().catch(() => {})
                    if(data.guild.plugins.blacklist.list.includes(msg.content.toLowerCase())){
                        data.guild.plugins.blacklist.list = data.guild.plugins.blacklist.list.filter(v => v !== msg.content.toLowerCase());
                        data.guild.markModified("plugins.blacklist");
                        await data.guild.save();
                    }

                    let embed = new MessageEmbed()
                        .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                        .setDescription(guild.translate("admin/bl:main:removed")
                            .replace('{emotes.success}', this.client.emotes.success)
                            .replace('{word}', msg.content))
                        .setColor(this.client.embedColor)
                        .setFooter({text: data.guild.footer});
                    return sent.edit({embeds: [embed]});
                });
            }
        }
    };
}

module.exports = Blacklist;
