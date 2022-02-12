const Command = require('../../core/command');
const { MessageEmbed } = require('discord.js');
const Discord = require('discord.js');
const {SlashCommandBuilder} = require("@discordjs/builders");

class Addemoji extends Command {
    constructor(client) {
        super(client, {
            name: "addemoji",
            description: "admin/ae:general:description",
            dirname: __dirname,
            aliases: ["addemoji", "createemoji", "add-emoji", "addemote"],
            memberPermissions: ["MANAGE_EMOJIS_AND_STICKERS"],
            botPermissions: ["MANAGE_EMOJIS_AND_STICKERS"],
            premium: true,
            cooldown: 10000,
            slashCommand: {
                addCommand: true,
                data: new SlashCommandBuilder()
                    .addStringOption(option =>
                        option.setName('admin/ae:slash:1:name')
                            .setDescription('admin/ae:slash:1:description')
                            .setRequired(true)
                    )
                    .addStringOption(option =>
                        option.setName('admin/ae:slash:2:name')
                            .setDescription('admin/ae:slash:2:description')
                            .setRequired(false)
                    )
            }
        });
    }
    async run(interaction, message, args, data){


        let guild = message?.guild || interaction?.guild;
        let arg = args[0];
        if(!arg){
            let embed = new MessageEmbed()
                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                .setDescription(guild.translate("admin/ae:general:usage")
                        .replace('{prefix}', data.guild.prefix)
                        .replace('{emotes.use}', this.client.emotes.use) + '\n' +
                    guild.translate("admin/ae:general:example")
                        .replace('{prefix}', data.guild.prefix)
                        .replace('{emotes.example}', this.client.emotes.example))
                .setColor(this.client.embedColor)
                .setFooter({text: data.guild.footer});
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

        function isImage(string){
            return(string.match(/\.(jpeg|jpg|gif|png|webp)$/) != null);
        }

        let emoji = {
            url: undefined,
            name: undefined
        };

        if(isUrl(arg)){
            if(isImage(arg)){
                if(!args[1]){
                    let embed = new MessageEmbed()
                        .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                        .setDescription(guild.translate("admin/ae:main:errors:urlButNoName")
                            .replace('{emotes.error}', this.client.emotes.error))
                        .setColor(this.client.embedColor)
                        .setFooter({text: data.guild.footer});
                    if(message) return message.send(embed);
                    if(interaction) return interaction.send(embed, true)
                }else{
                    emoji.name = args[1];
                    emoji.url = arg;
                }
            }else{
                let embed = new MessageEmbed()
                    .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                    .setDescription(guild.translate("admin/ae:main:errors:invalidUrl")
                        .replace('{emotes.error}', this.client.emotes.error))
                    .setColor(this.client.embedColor)
                    .setFooter({text: data.guild.footer});
                if(message) return message.send(embed);
                if(interaction) return interaction.send(embed, true)
            }
        }else{
            let dEmoji = Discord.Util.parseEmoji(arg);
            if(dEmoji){
                emoji.name = dEmoji.name;
                emoji.url = 'https://cdn.discordapp.com/emojis/' + dEmoji.id + '.' + (dEmoji.animated ? 'gif' : 'png');
                if(args[1]) emoji.name = args[1];
            }
        }

        if(emoji.name.toString().length < 2 || emoji.name.toString().length > 32){
            let embed = new MessageEmbed()
                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                .setDescription(guild.translate("admin/ae:main:errors:length")
                    .replace('{emotes.error}', this.client.emotes.error))
                .setColor(this.client.embedColor)
                .setFooter({text: data.guild.footer});
            if(message) return message.send(embed);
            if(interaction) return interaction.send(embed, true)
        }

        guild.emojis.create(emoji.url, emoji.name)
            .then(async (emote) => {
                let embed = new MessageEmbed()
                    .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                    .setDescription(guild.translate("admin/ae:main:created")
                        .replace('{emotes.success}', this.client.emotes.success)
                        .replace('{name}', (emote.animated ? 'a:'+emote.name : ':'+emote.name))
                        .replace('{id}', emote.id))
                    .setColor(this.client.embedColor)
                    .setFooter({text: data.guild.footer});
                if(message) return message.send(embed);
                if(interaction) return interaction.send(embed);

            })
            .catch(async (error) => {
                let embed = new MessageEmbed()
                    .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                    .setDescription(guild.translate("admin/ae:main:cantCreate")
                        .replace('{emotes.error}', this.client.emotes.error)
                        .replace('{emotes.arrow}', this.client.emotes.arrow)
                        .replace('{emotes.arrow}', this.client.emotes.arrow)
                        .replace('{support}', this.client.supportUrl))
                    .setColor(this.client.embedColor)
                    .setFooter({text: data.guild.footer});
                if(message) message.send(embed);
                if(interaction) interaction.send(embed, true)
            });
    }
}

module.exports = Addemoji;
