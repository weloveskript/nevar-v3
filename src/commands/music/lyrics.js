const Command = require('../../core/command');
const { MessageEmbed } = require('discord.js');
const {SlashCommandBuilder} = require("@discordjs/builders");
const { QueryType } = require('discord-player')
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const axios = require('axios');
const cio = require('cheerio-without-node-native');
const {encode} = require("qs/lib/utils");


async function extractLyrics(url){
    let { data } = await axios.get(url);
    const $ = cio.load(data);
    let lyrics = $('div[class="lyrics"]').text().trim();
    if (!lyrics) {
        lyrics = ''
        $('div[class^="Lyrics__Container"]').each((i, elem) => {
            if($(elem).text().length !== 0) {
                let snippet = $(elem).html()
                    .replace(/<br>/g, '\n')
                    .replace(/<(?!\s*br\s*\/?)[^>]+>/gi, '');
                lyrics += $('<textarea/>').html(snippet).text().trim() + '\n\n';
            }
        })
    }
    if (!lyrics) return null;
    return lyrics.trim();
}

class Lyrics extends Command {

    constructor(client) {
        super(client, {
            name: "lyrics",
            description: "music/lyrics:general:description",
            dirname: __dirname,
            cooldown: 5000,
            slashCommand: {
                addCommand: true,
                data:
                    new SlashCommandBuilder()
                        .addStringOption(option =>
                            option
                                .setRequired(true)
                                .setAutocomplete(true))
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

        let song = (await axios.get('https://api.genius.com/songs/' + encodeURIComponent(args.join(' ')), {
            headers: {
                'Authorization': 'Bearer ' + this.client.config.apikeys.genius
            },
            validateStatus: false
        })).data;


        if(song?.meta?.status === 404){

            let hits = (await axios.get('https://api.genius.com/search?q=' + encodeURIComponent(args.join(' ')), {
                headers: {
                    'Authorization': 'Bearer ' + this.client.config.apikeys.genius
                },
                validateStatus: false
            })).data.response.hits;

            let hit = hits[0];
            song = (await axios.get('https://api.genius.com/songs/' + encodeURIComponent(hit.result.id), {
                headers: {
                    'Authorization': 'Bearer ' + this.client.config.apikeys.genius
                },
                validateStatus: false
            })).data
        }

        if(!song || song?.meta?.status !== 200 && song?.meta?.status !== 404){
            if(message) return message.send(this.client.usageEmbed(guild, this, data));
            if(interaction) return interaction.editReply({embeds:[this.client.usageEmbed(guild, this, data)]});
        }

        let hit = {
            url: song.response.song.url,
            image: song.response.song.song_art_image_thumbnail_url,
            title: song.response.song.title,
            artists: song.response.song.artist_names,
        }

        let lyrics = await extractLyrics(hit.url);
        hit.lyrics = lyrics;

        let embed = new MessageEmbed()
            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
            .setTitle(hit.title)
            .setURL(hit.url)
            .setThumbnail(hit.image)
            .setDescription(hit.lyrics.trim().substring(0, 4090))
            .setColor(this.client.embedColor)
            .setFooter({text: data.guild.footer});
        if(message) message.send(embed);
        if(interaction) await interaction.editReply({embeds:[embed]});
    }
}
module.exports = Lyrics;
