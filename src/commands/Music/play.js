const Command = require('../../core/command');
const { MessageEmbed } = require('discord.js');
const {SlashCommandBuilder} = require("@discordjs/builders");
const { QueryType } = require('discord-player')

class Play extends Command {

    constructor(client) {
        super(client, {
            name: "play",
            description: "music/play:general:description",
            dirname: __dirname,
            cooldown: 5000,
            slashCommand: {
                addCommand: true,
                data:
                    new SlashCommandBuilder()
                        .addStringOption(option =>
                            option.setName('music/play:slash:1:name')
                                .setDescription('music/play:slash:1:description')
                                .setRequired(true)
                        )
            }
        });
    }
    async run(interaction, message, args, data){
        if(interaction) await interaction.deferReply();
        let member = message?.member || interaction?.member;
        let channel = message?.channel || interaction?.channel;
        let guild = message?.guild || interaction?.guild;

        if(!args[0]){
            let embed = new MessageEmbed()
                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                .setDescription(guild.translate("music/play:general:usage")
                        .replace('{prefix}', data.guild.prefix)
                        .replace('{emotes.use}', this.client.emotes.use) + '\n' +
                    guild.translate("music/play:general:example")
                        .replace('{prefix}', data.guild.prefix)
                        .replace('{emotes.example}', this.client.emotes.example))
                .setColor(this.client.embedColor)
                .setFooter(data.guild.footer);
            if(message) return message.send(embed);
            if(interaction) return interaction.editReply({embeds:[embed]});
        }

        const searchResult = await this.client.player
            .search(args.join(' '), {
                requestedBy: member.user,
                searchEngine: QueryType.AUTO,
            })
            .catch(() => {});

        if (!searchResult || !searchResult.tracks.length) {
            let embed = new MessageEmbed()
                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                .setDescription(guild.translate("music/play:main:notFound")
                        .replace('{emotes.error}', this.client.emotes.error))
                .setColor(this.client.embedColor)
                .setFooter(data.guild.footer);
            if(message) return message.send(embed);
            if(interaction) return interaction.editReply({embeds:[embed]});
        }

        const queue = await this.client.player.createQueue(guild, {
            ytdlOptions: {
                filter: 'audioonly',
                highWaterMark: 1 << 30,
                dlChunkSize: 0,
            },
            metadata: channel,
            leaveOnEmpty: true,
            leaveOnEmptyCooldown: 10000,
            autoSelfDeaf: false,
        });

        try {
            if (!queue.connection) await queue.connect(member.voice.channel);
        } catch {
            let embed = new MessageEmbed()
                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                .setDescription(guild.translate("music/play:main:errors:notConnected")
                    .replace('{emotes.error}', this.client.emotes.error))
                .setColor(this.client.embedColor)
                .setFooter(data.guild.footer);
            if(message) message.send(embed);
            if(interaction) await interaction.editReply({embeds: [embed]});
            return void this.client.player.deleteQueue(guild.id);
        }

        if(!member.voice?.channel || queue.connection.channel.id !== member.voice.channel.id){
            let embed = new MessageEmbed()
                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                .setDescription(guild.translate("music/play:main:errors:sameChannel")
                    .replace('{emotes.error}', this.client.emotes.error))
                .setColor(this.client.embedColor)
                .setFooter(data.guild.footer);
            if(message) return message.send(embed);
            if(interaction) return interaction.editReply({embeds: [embed]});
        }

        let embed = new MessageEmbed()
            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
            .setDescription(guild.translate("player/messages:trackAdded")
                .replace('{emotes.play}', this.client.emotes.play)
                .replace('{track}', searchResult?.playlist ? searchResult.playlist.title : searchResult.tracks[0].title))
            .setColor(this.client.embedColor)
            .setFooter(data.guild.footer);
        if(message) message.send(embed);
        if(interaction) await interaction.editReply({embeds: [embed]});
        searchResult.playlist ? queue.addTracks(searchResult.tracks) : queue.addTrack(searchResult.tracks[0]);
        if (!queue.playing) await queue.play();
    }
}

module.exports = Play;
