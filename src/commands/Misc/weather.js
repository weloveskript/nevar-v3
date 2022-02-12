const Command = require('../../core/command');
const { MessageEmbed} = require('discord.js');
const {SlashCommandBuilder} = require("@discordjs/builders");
const fetch = require('node-fetch');
const moment = require('moment');

class Weather extends Command {

    constructor(client) {
        super(client, {
            name: "weather",
            description: "misc/weather:general:description",
            dirname: __dirname,
            cooldown: 5000,
            slashCommand: {
                addCommand: true,
                data: new SlashCommandBuilder()
                    .addStringOption(option =>
                        option.setName('misc/weather:slash:1:name')
                            .setDescription('misc/weather:slash:1:description')
                            .setRequired(true))
            }
        });
    }

    async run(interaction, message, args, data) {
        let guild = interaction?.guild || message?.guild;
        let member = interaction?.member || message?.member;

        if(!args[0]){
            let embed = new MessageEmbed()
                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                .setDescription(guild.translate("misc/weather:general:usage")
                        .replace('{prefix}', data.guild.prefix)
                        .replace('{emotes.use}', this.client.emotes.use) + '\n' +
                    guild.translate("misc/weather:general:example")
                        .replace('{prefix}', data.guild.prefix)
                        .replace('{emotes.example}', this.client.emotes.example))
                .setColor(this.client.embedColor)
                .setFooter(data.guild.footer);
            if(message) return message.send(embed, false);
            if(interaction) return interaction.send(embed);
        }

        const res = await fetch('https://api.openweathermap.org/data/2.5/weather?q=' + encodeURI(args[0]) + '&appid=' + this.client.config.apikeys.weather + '&lang=' + data.guild.language.split('-')[0] + '&units=metric')
            .then(res => res.json());

        if(res.cod !== 200){
            let embed = new MessageEmbed()
                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                .setDescription(guild.translate("misc/weather:general:usage")
                        .replace('{prefix}', data.guild.prefix)
                        .replace('{emotes.use}', this.client.emotes.use) + '\n' +
                    guild.translate("misc/weather:general:example")
                        .replace('{prefix}', data.guild.prefix)
                        .replace('{emotes.example}', this.client.emotes.example))
                .setColor(this.client.embedColor)
                .setFooter(data.guild.footer);
            if(message) return message.send(embed, false);
            if(interaction) return interaction.send(embed);
        }
        console.log(res)
        let weather = {
            description: res.weather[0].description,
            temp: res.main.temp,
            tempMin: res.main.temp_min,
            tempMax: res.main.temp_max,
            tempFeelsLike: res.main.feels_like,
            humidity: res.main.humidity,
            wind: {
                ms: res.wind.speed,
                kmh: (res.wind.speed * 3.618).toFixed(2)
            },
            sunrise: res.sys.sunrise,
            sunset: res.sys.sunset
        };
        console.log(weather)

        let sunriseDate = new Date(weather.sunrise * 1000);
        let sunriseHours = sunriseDate.getHours();
        let sunriseMinutes = '0' + sunriseDate.getMinutes();
        let sunrise = sunriseHours + ':' + sunriseMinutes.substr(-2);

        let sunsetDate = new Date(weather.sunset * 1000);
        let sunsetHours = sunsetDate.getHours();
        let sunsetMinutes = '0' + sunsetDate.getMinutes();
        let sunset = sunsetHours + ':' + sunsetMinutes.substr(-2);

        let embed = new MessageEmbed()
            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
            .setTitle(weather.description)
            .setThumbnail('http://openweathermap.org/img/w/' + res.weather[0].icon + '.png')

            .addField(guild.translate("misc/weather:main:fields:temp:name")
                .replace('{emotes.temp}', this.client.emotes.temp),
                guild.translate("misc/weather:main:fields:temp:value")
                    .replace('{temp}', weather.temp))

            .addField(guild.translate("misc/weather:main:fields:tempFeels:name")
                    .replace('{emotes.temp}', this.client.emotes.temp),
                guild.translate("misc/weather:main:fields:tempFeels:value")
                    .replace('{tempFeels}', weather.tempFeelsLike), true)

            .addField(guild.translate("misc/weather:main:fields:tempMin:name")
                    .replace('{emotes.temp}', this.client.emotes.temp),
                guild.translate("misc/weather:main:fields:tempMin:value")
                    .replace('{tempMin}', weather.tempMin), true)

            .addField(guild.translate("misc/weather:main:fields:tempMax:name")
                    .replace('{emotes.temp}', this.client.emotes.temp),
                guild.translate("misc/weather:main:fields:tempMax:value")
                    .replace('{tempMax}', weather.tempMax), true)

            .addField(guild.translate("misc/weather:main:fields:humidity:name")
                    .replace('{emotes.humidity}', this.client.emotes.humidity),
                guild.translate("misc/weather:main:fields:humidity:value")
                    .replace('{humidity}', weather.humidity))

            .addField(guild.translate("misc/weather:main:fields:windSpeed:name")
                    .replace('{emotes.wind}', this.client.emotes.wind),
                guild.translate("misc/weather:main:fields:windSpeed:value")
                    .replace('{windSpeedkmh}', weather.wind.kmh)
                    .replace('{windSpeedms}', weather.wind.ms))

            .addField(guild.translate("misc/weather:main:fields:sunrise:name")
                    .replace('{emotes.sunrise}', this.client.emotes.sun),
                guild.translate("misc/weather:main:fields:sunrise:value")
                    .replace('{sunrise}', sunrise), true)

            .addField(guild.translate("misc/weather:main:fields:sunset:name")
                    .replace('{emotes.sunset}', this.client.emotes.moon),
                guild.translate("misc/weather:main:fields:sunset:value")
                    .replace('{sunset}', sunset), true)



            .setColor(this.client.embedColor)
            .setFooter(data.guild.footer);
        if(message) return message.send(embed, false);
        if(interaction) return interaction.send(embed);


    }
}

module.exports = Weather;
