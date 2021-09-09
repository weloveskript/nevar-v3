const Command = require('../../structure/Command')
    , { MessageEmbed } = require('discord.js')
    , Discord = require('discord.js');

class Addemoji extends Command {
    constructor(client) {
        super(client, {
            name: "addemoji",
            description: "administration/addemoji:description",
            dirname: __dirname,
            aliases: ["addemoji", "createemoji", "add-emoji", "addemote"],
            memberPermissions: ["MANAGE_EMOJIS_AND_STICKERS"],
            botPermissions: ["MANAGE_EMOJIS_AND_STICKERS"],
            premium: true,
            ownerOnly: false,
            cooldown: 20000,
            slashCommand: {
                addCommand: true,
                options: [
                    {
                        name: "administration/addemoji:slashOption1",
                        description: "administration/addemoji:slashOption1Desc",
                        type: "STRING",
                        required: true,
                    },
                    {
                        name: "administration/addemoji:slashOption2",
                        description: "administration/addemoji:slashOption2Desc",
                        type: "STRING",
                        required: true,
                    }


                ]
            }
        });
    }
    async run(interaction, message, args, data){

        let guild = message?.guild || interaction?.guild;
        let arg = args[0];
        if(!arg){
            let embed = new MessageEmbed()
                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                .setDescription(guild.translate("administration/addemoji:usage")
                        .replace('{prefix}', data.guild.prefix)
                        .replace('{emotes.use}', this.client.emotes.use) + '\n' +
                    guild.translate("administration/addemoji:example")
                        .replace('{prefix}', data.guild.prefix)
                        .replace('{emotes.example}', this.client.emotes.example))
                .setColor(this.client.embedColor)
                .setFooter(data.guild.footer);

            if(message) return message.send(embed, false);
            if(interaction) return interaction.send(embed);
        }

        function isUrl(string){
            let res = string.match(new RegExp('(https?:\\/\\/)?'+ // protocol
                '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain
                '((\\d{1,3}\\.){3}\\d{1,3}))'+ // ipv4
                '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port
                '(\\?[;&a-z\\d%_.~+=-]*)?'+ // querystring
                '(\\#[-a-z\\d_]*)?','i'))
            return (res !== null)
        }

        if(!isUrl(arg)){
            let emote = Discord.Util.parseEmoji(args[0]);
            if(emote){
                arg = `https://cdn.discordapp.com/emojis/${emote.id}.${emote.animated ? 'gif' : 'png'}`;
            }
        }

        let name = args[1] ? args[1].replace(/[^a-z0-9]/gi, "") : null;
        if(!name){
            let embed = new MessageEmbed()
                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                .setDescription(guild.translate("administration/addemoji:usage")
                        .replace('{prefix}', data.guild.prefix)
                        .replace('{emotes.use}', this.client.emotes.use) + '\n' +
                    guild.translate("administration/addemoji:example")
                        .replace('{prefix}', data.guild.prefix)
                        .replace('{emotes.example}', this.client.emotes.example))
                .setColor(this.client.embedColor)
                .setFooter(data.guild.footer);
            if(message) return message.send(embed);
            if(interaction) return interaction.send(embed);
        }

        if(name.length < 2 || name.length > 32){
            let embed = new MessageEmbed()
                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                .setDescription(guild.translate("administration/addemoji:length")
                    .replace('{emotes.error}', this.client.emotes.error))
                .setColor(this.client.embedColor)
                .setFooter(data.guild.footer);
            if(message) return message.send(embed);
            if(interaction) return interaction.send(embed, true);
        }

        guild.emojis
            .create(arg, name)
            .then(emoji => {
                let embed = new MessageEmbed()
                    .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                    .setDescription(guild.translate("administration/addemoji:created")
                        .replace('{emotes.success}', this.client.emotes.success)
                        .replace('{name}', (emoji.animated ? 'a:'+emoji.name : ':'+emoji.name))
                        .replace('{id}', emoji.id))
                    .setColor(this.client.embedColor)
                    .setFooter(data.guild.footer);
                if(message) return message.send(embed);
                if(interaction) return interaction.send(embed);
            })
            .catch(async (error) => {
                let embed = new MessageEmbed()
                    .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                    .setDescription(guild.translate("administration/addemoji:cantCreate")
                        .replace('{emotes.error}', this.client.emotes.error)
                        .replace('{emotes.arrow}', this.client.emotes.arrow)
                        .replace('{emotes.arrow}', this.client.emotes.arrow)
                        .replace('{support}', this.client.supportUrl))
                    .setColor(this.client.embedColor)
                    .setFooter(data.guild.footer);
                if(message) message.send(embed);
                if(interaction) interaction.send(embed, true)
                let user = message?.author || interaction?.member.user
                let type = 'Message-Command'
                if(interaction) {
                    type = 'Slash-Command'
                }
                this.client.logError(error, user, guild, `${message ? data.guild.prefix : '/'}addemoji ${args[0]} ${args[1]}`, type)

            })
    }
}

module.exports = Addemoji;
