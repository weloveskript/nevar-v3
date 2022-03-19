const Command = require('../../core/command');
const { MessageEmbed, MessageActionRow, MessageButton} = require('discord.js');
const {SlashCommandBuilder} = require("@discordjs/builders");

class Setfooter extends Command {

    constructor(client) {
        super(client, {
            name: "setfooter",
            description: "administration/setfooter:general:description",
            dirname: __dirname,
            memberPermissions: ["MANAGE_GUILD"],
            premium: true,
            cooldown: 2000,
            slashCommand: {
                addCommand: true,
                data: new SlashCommandBuilder(),
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
                    .setCustomId('setfooter_' + id + '_edit')
                    .setLabel(guild.translate("administration/setfooter:main:actions:1"))
                    .setEmoji('✏️')
                    .setStyle('PRIMARY'),
                new MessageButton()
                    .setCustomId('setfooter_' + id + '_reset')
                    .setLabel(guild.translate("administration/setfooter:main:actions:2"))
                    .setEmoji('♻️')
                    .setDisabled(data.guild.plugins.autoDeleteChannels.length === 0)
                    .setStyle('PRIMARY'),
            )
        let sent;
        if (message) sent = await message.send(embed, false, [row]);
        if (interaction) sent = await interaction.send(embed, false, [row]);

        const filter = i => i.customId.startsWith('setfooter_' + id) && i.user.id === id;

        const clicked = await sent.awaitMessageComponent({filter, time: 120000}).catch(() => {})

        if (clicked) {
            if (clicked.customId === 'setfooter_' + id + '_edit') {
                let embed = new MessageEmbed()
                    .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                    .setDescription(guild.translate("administration/setfooter:main:collectors:footer")
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
                    data.guild.footer = msg.content.slice(0, 32);
                    data.guild.markModified("footer");
                    await data.guild.save();
                    let embed = new MessageEmbed()
                        .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                        .setDescription(guild.translate("administration/setfooter:main:updated")
                            .replace('{emotes.success}', this.client.emotes.success))
                        .setColor(this.client.embedColor)
                        .setFooter({text: data.guild.footer});
                    sent.edit({embeds:[embed]});
                });

            }
            if (clicked.customId === 'setfooter_' + id + '_reset') {
                data.guild.footer = this.client.config.embeds.footer;
                data.guild.markModified("footer");
                await data.guild.save();
                let embed = new MessageEmbed()
                    .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                    .setDescription(guild.translate("administration/setfooter:main:updated")
                        .replace('{emotes.success}', this.client.emotes.success))
                    .setColor(this.client.embedColor)
                    .setFooter({text: data.guild.footer});
                clicked.update({embeds:[embed], components: []});
            }
        }
    }
}
module.exports = Setfooter;
