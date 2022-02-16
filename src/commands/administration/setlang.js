const Command = require('../../core/command');
const { MessageEmbed, MessageActionRow, MessageButton} = require('discord.js');
const {SlashCommandBuilder} = require("@discordjs/builders");

class Setlang extends Command {

    constructor(client) {
        super(client, {
            name: "setlang",
            description: "administration/setlang:general:description",
            dirname: __dirname,
            aliases: ["lang"],
            memberPermissions: ["MANAGE_GUILD"],
            cooldown: 5000,
            slashCommand: {
                addCommand: true,
                data: new SlashCommandBuilder()
            }
        });
    }

    async run(interaction, message, args, data){
        let guild = message?.guild || interaction?.guild;

        let embed = new MessageEmbed()
            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
            .setDescription(guild.translate("administration/setlang:main:choose")
                .replace('{emotes.arrow}', this.client.emotes.arrow)
                .replace('{emotes.arrow}', this.client.emotes.arrow))
            .setColor(this.client.embedColor)
            .setFooter({text: data.guild.footer});

        let id = message?.member?.user?.id || interaction?.member?.user?.id
        let row = new MessageActionRow();
        for(let lang of this.client.languages){
            let item = new MessageButton()
                .setCustomId('lang_'+ id + '_' + lang.name)
                .setLabel(lang.nativeName)
                .setStyle('PRIMARY')
                .setDisabled(!lang.active)
                .setEmoji(lang.emoji);
            if(lang.name === data.guild.language){
                item.setStyle('SECONDARY')
                item.setDisabled(true);
                item.setLabel(lang.nativeName + ' ' + guild.translate("administration/setlang:main:active"))
            }
            if(!lang.active){
                item.setStyle('DANGER')
                item.setLabel(lang.nativeName + ' ' + guild.translate("administration/setlang:main:soon"))
            }
            row.components.push(item);
        }

        let sent;
        if (message) sent = await message.send(embed, false, [row]);
        if (interaction) sent = await interaction.send(embed, false, [row]);

        const filter = i => i.customId.startsWith('lang_'+ id) && i.user.id === id;

        const clicked = await sent.awaitMessageComponent({ filter, time: 60000 }).catch(() => {})

        if(clicked){
            let lang = this.client.languages.find((l) => l.name === clicked.customId.toString().split('_')[2]);
            if(!lang){
                let embed = new MessageEmbed()
                    .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                    .setDescription(guild.translate("language:error")
                        .replace('{emotes.error}', this.client.emotes.error)
                        .replace('{support}', this.client.supportUrl))
                    .setColor(this.client.embedColor)
                    .setFooter({text: data.guild.footer});
                return sent.edit({embeds:[embed], components: []});
            }else{
                data.guild.language = lang.name;
                await data.guild.save();
                const slashCommands = require('../../helper/slashCommands.js');
                slashCommands.init(this.client, guild.id);
                let embed = new MessageEmbed()
                    .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                    .setDescription(guild.translate("language:set")
                        .replace('{emotes.error}', this.client.emotes.error))
                    .setColor(this.client.embedColor)
                    .setFooter({text: data.guild.footer});
                return sent.edit({embeds:[embed], components: []});
            }
        }
    }

}

module.exports = Setlang;
