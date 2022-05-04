const Command = require('../../core/command');
const { MessageEmbed, MessageActionRow, MessageSelectMenu } = require('discord.js');
const {SlashCommandBuilder} = require("@discordjs/builders");

class Filters extends Command {

    constructor(client) {
        super(client, {
            name: "filters",
            description: "music/filters:general:description",
            dirname: __dirname,
            cooldown: 5000,
            aliases: ["filter"],
            slashCommand: {
                addCommand: true,
                data: new SlashCommandBuilder()
            }
        });
    }

    async run(interaction, message, args, data) {
        if(interaction) await interaction.deferReply();

        let member = message?.member || interaction?.member;
        let channel = message?.channel || interaction?.channel;
        let guild = message?.guild || interaction?.guild;

        if(!args[0]){
            if(message) return message.send(this.client.usageEmbed(guild, this, data));
            if(interaction) return interaction.editReply({embeds:[this.client.usageEmbed(guild, this, data)]});
        }

        const queue = this.client.player.getQueue(guild.id);

        if(!queue || !queue.playing){
            let embed = new MessageEmbed()
                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                .setDescription(guild.translate("music/loop:main:errors:notPlaying")
                    .replace('{emotes.error}', this.client.emotes.error))
                .setColor(this.client.embedColor)
                .setFooter({text: data.guild.footer});
            if(message) return message.send(embed);
            if(interaction) return interaction.editReply({embeds:[embed]});
        }
        if(!member.voice?.channel || queue.connection.channel.id !== member.voice.channel.id){
            let embed = new MessageEmbed()
                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                .setDescription(guild.translate("music/loop:main:errors:sameChannel")
                    .replace('{emotes.error}', this.client.emotes.error))
                .setColor(this.client.embedColor)
                .setFooter({text: data.guild.footer});
            if(message) return message.send(embed);
            if(interaction) return interaction.editReply({embeds:[embed]});
        }

        let filters = this.client.config.music.filters;

        if(args[0].toLowerCase() === "list"){
            let embed = new MessageEmbed()
                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                .setDescription(guild.translate("music/filters:main:list")
                    .replace('{emotes.success}', this.client.emotes.success)
                    .replace('{list}', filters.map(f => `|-  ${f} ${queue.getFiltersDisabled().includes(f) ? '❌' : '✅'}`).join('\n')))
                .setColor(this.client.embedColor)
                .setFooter({text: data.guild.footer});
            if(message) return message.send(embed);
            if(interaction) return interaction.editReply({embeds:[embed]});
        }else{
            let searchedFilter = filters.find((f) => f.toLowerCase() === args[0].toLowerCase());

            if(!searchedFilter){
                if(message) return message.send(this.client.usageEmbed(guild, this, data));
                if(interaction) return interaction.editReply({embeds:[this.client.usageEmbed(guild, this, data)]});
            }

            let newFilters = [];
            for(let filter of filters){
                newFilters[`${filter}`] = !queue.getFiltersDisabled().includes(filter);
            }

            newFilters[`${searchedFilter}`] = queue.getFiltersDisabled().includes(searchedFilter);

            await queue.setFilters(newFilters);

            setTimeout(() => {
                let embed = new MessageEmbed()
                    .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                    .setDescription(guild.translate("music/filters:main:set")
                        .replace('{emotes.success}', this.client.emotes.success)
                        .replace('{filter}', searchedFilter))
                    .setColor(this.client.embedColor)
                    .setFooter({text: data.guild.footer});
                if(message) return message.send(embed);
                if(interaction) return interaction.editReply({embeds:[embed]});
            }, queue.options.bufferingTimeout)
        }
    }
}
module.exports = Filters;
