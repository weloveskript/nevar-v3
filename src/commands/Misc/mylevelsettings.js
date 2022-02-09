const Command = require('../../core/command');
const { MessageEmbed, MessageActionRow, MessageButton, MessageSelectMenu} = require('discord.js');
const {SlashCommandBuilder} = require("@discordjs/builders");
const fs = require('fs');

class Mylevelsettings extends Command {
    constructor(client) {
        super(client, {
            name: "mylevelsettings",
            description: "misc/mylevelsettings:general:description",
            dirname: __dirname,
            cooldown: 5000,
            slashCommand: {
                addCommand: true,
                data:
                    new SlashCommandBuilder()
            }
        });
    }

    async run(interaction, message, args, data) {
        let guild = message?.guild || interaction?.guild;
        let channel = message?.channel || interaction?.channel;

        let embed = new MessageEmbed()
            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
            .setDescription(guild.translate("misc/mylevelsettings:main:chooseAction")
                .replace('{emotes.arrow}', this.client.emotes.arrow))
            .setColor(this.client.embedColor)
            .setFooter(data.guild.footer);
        let id = message?.member?.user?.id || interaction?.member?.user?.id
        let row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('mylevelsettings_' + id + '_image')
                    .setLabel(guild.translate("misc/mylevelsettings:main:actions:1"))
                    .setEmoji('🖼️')
                    .setStyle('PRIMARY'),
                new MessageButton()
                    .setCustomId('mylevelsettings_' + id + '_color')
                    .setLabel(guild.translate("misc/mylevelsettings:main:actions:2"))
                    .setEmoji('🎨')
                    .setStyle('PRIMARY'),
            )
        let sent;
        if (message) sent = await message.send(embed, false, [row]);
        if (interaction) sent = await interaction.send(embed, false, [row]);

        const filter = i => i.customId.startsWith('mylevelsettings_' + id) && i.user.id === id;

        const clicked = await sent.awaitMessageComponent({filter, time: 60000}).catch(() => {})

        if (clicked) {
            if(clicked.customId === 'mylevelsettings_' + id + '_image'){
                const imageFolder = './storage/levelcards/';
                const backgroundImages = fs.readdirSync(imageFolder).filter(file => file.endsWith('.png'));

                const row = new MessageActionRow()
                    .addComponents(
                        new MessageSelectMenu()
                            .setCustomId('myimage_' + id)
                            .setPlaceholder(guild.translate("misc/mylevelsettings:main:collectors:image"))
                    )
                let embed = new MessageEmbed()
                    .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                    .setDescription(guild.translate("misc/mylevelsettings:main:bgImage:choose")
                        .replace('{emotes.arrow}', this.client.emotes.arrow))
                    .setColor(this.client.embedColor)
                    .setFooter(data.guild.footer);

                row.components[0].options.push({
                    label: guild.translate("misc/mylevelsettings:main:bgImage:image") + ' ' + '0',
                    description: guild.translate("misc/mylevelsettings:main:bgImage:default"),
                    value: '0',
                });

                for(let file of backgroundImages){
                    row.components[0].options.push({
                        label: guild.translate("misc/mylevelsettings:main:bgImage:image") + ' ' + file.split('.')[0],
                        description: guild.translate("misc/mylevelsettings:main:bgImage:desc")
                            .replace('{int}', file.split('.')[0]),
                        value: file.split('.')[0]
                    })
                }
                await clicked.update({embeds: [embed], components: [row]});

                const filter = i => i.customId.startsWith('myimage_' + id) && i.user.id === id;

                const clickedMenu = await sent.awaitMessageComponent({filter, time: 60000}).catch(() => {})

                if(clickedMenu){
                    data.userData.levelBackground = clickedMenu.values[0];
                    data.userData.markModified("levelBackground");
                    await data.userData.save();

                    let embed = new MessageEmbed()
                        .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                        .setDescription(guild.translate("misc/mylevelsettings:main:bgImage:set")
                            .replace('{emotes.success}', this.client.emotes.success))
                        .setColor(this.client.embedColor)
                        .setFooter(data.guild.footer);
                    return clickedMenu.update({embeds: [embed], components: []});
                }
            }
            if(clicked.customId === 'mylevelsettings_' + id + '_color'){
                let embed = new MessageEmbed()
                    .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                    .setDescription(guild.translate("misc/mylevelsettings:main:collectors:color")
                        .replace('{emotes.arrow}', this.client.emotes.arrow))
                    .setColor(this.client.embedColor)
                    .setFooter(data.guild.footer);
                await clicked.update({embeds: [embed], components: []});

                let color;

                const colorCollector = channel.createMessageCollector({
                    filter: m => m.author.id === id,
                    time: 30000
                });

                colorCollector.on("collect", async (msg) => {
                    colorCollector.stop();
                    msg.delete().catch(() => {});

                    function isHexColor(hex) {
                        return typeof hex === 'string' &&
                            hex.length === 6 &&
                            !isNaN(Number('0x' + hex))
                    }

                    if (msg.content !== "/") {
                        if (isHexColor(msg.content.replace('#', ''))) {
                            color = msg.content;
                        } else {
                            let rgbToHex = function (rgb) {
                                let hex = Number(rgb).toString(16);
                                if (hex.length < 2) {
                                    hex = "0" + hex;
                                }
                                return hex;
                            };
                            let fullColorHex = function (r, g, b) {
                                let red = rgbToHex(r);
                                let green = rgbToHex(g);
                                let blue = rgbToHex(b);
                                return red + green + blue;
                            };
                            let r = parseInt(msg.content.split(', ')[0]);
                            let g = parseInt(msg.content.split(', ')[1]);
                            let b = parseInt(msg.content.split(', ')[2]);

                            if (isHexColor(fullColorHex(r, g, b))) {
                                color = fullColorHex(r, g, b);
                            }
                        }
                    } else {
                        color = '5773c9';
                    }
                    if(color){
                        data.userData.levelColor = color;
                        data.userData.markModified("levelColor");
                        await data.userData.save();
                        let embed = new MessageEmbed()
                            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                            .setDescription(guild.translate("misc/mylevelsettings:main:color:set")
                                .replace('{emotes.success}', this.client.emotes.success))
                            .setColor(this.client.embedColor)
                            .setFooter(data.guild.footer);
                        return sent.edit({embeds: [embed]});
                    }else{
                        let embed = new MessageEmbed()
                            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                            .setDescription(guild.translate("misc/mylevelsettings:main:color:invalid")
                                .replace('{emotes.error}', this.client.emotes.error))
                            .setColor(this.client.embedColor)
                            .setFooter(data.guild.footer);
                        return sent.edit({embeds: [embed]});
                    }
                });
            }
        }
    }
}

module.exports = Mylevelsettings;
