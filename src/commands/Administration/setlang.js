const Command = require('../../core/command');
const { MessageEmbed, MessageActionRow, MessageButton} = require('discord.js');

class Setlang extends Command {

    constructor(client) {
        super(client, {
            name: "setlang",
            description: "administration/setlang:description",
            dirname: __dirname,
            aliases: ["lang"],
            memberPermissions: ["MANAGE_GUILD"],
            cooldown: 5000,
            slashCommand: {
                addCommand: true
            }
        });
    }

    async run(interaction, message, args, data){
        let guild = message?.guild || interaction?.guild;

        let embed = new MessageEmbed()
            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
            .setDescription(guild.translate("administration/setlang:chooseLang")
                .replace('{emotes.arrow}', this.client.emotes.arrow))
            .setColor(this.client.embedColor)
            .setFooter(data.guild.footer);

        let id = message?.member?.user?.id || interaction?.member?.user?.id
        let row = new MessageActionRow();
        for(let lang of this.client.languages){
            let item = new MessageButton()
                .setCustomId('lang_'+ id + '_' + lang.name)
                .setLabel(lang.nativeName)
                .setStyle('PRIMARY')
                .setEmoji(lang.emoji);
           if(lang.name === data.guild.language){
               item.setStyle('SECONDARY')
              item.setDisabled(true);
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
                    .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                    .setDescription(guild.translate("language:error")
                        .replace('{emotes.error}', this.client.emotes.error))
                    .setColor(this.client.embedColor)
                    .setFooter(data.guild.footer);
                return sent.edit({embeds:[embed], components: []});
            }else{
                data.guild.language = lang.name;
                await data.guild.save();
                const slashCommands = require('../../helper/slashCommands.js');
                await slashCommands.init(this.client, guild.id);
                let embed = new MessageEmbed()
                    .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                    .setDescription(guild.translate("language:set")
                        .replace('{emotes.error}', this.client.emotes.error))
                    .setColor(this.client.embedColor)
                    .setFooter(data.guild.footer);
                return sent.edit({embeds:[embed], components: []});

            }
        }

    }

}

module.exports = Setlang;
