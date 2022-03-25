const Command = require('../../core/command');
const { MessageEmbed} = require('discord.js');
const {SlashCommandBuilder} = require("@discordjs/builders");
const moment = require('moment');
const axios = require('axios');

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
                    .addStringOption(option => option .setRequired(true))
            }
        });
    }

    async run(interaction, message, args, data) {
        let guild = interaction?.guild || message?.guild;
        let member = interaction?.member || message?.member;

        if(!args[0]){
            if(message) return message.send(this.client.usageEmbed(guild, this, data));
            if(interaction) return interaction.send(this.client.usageEmbed(guild, this, data));
        }

        const res = (await axios.get('https://api.openweathermap.org/data/2.5/weather?q=' + encodeURI(args[0]) +'&appid=' + this.client.config.apikeys.weather + '&lang=' + data.guild.language.split('-')[0] + '&units=metric')).data;
        if(res.cod !== 200){
            if(message) return message.send(this.client.usageEmbed(guild, this, data));
            if(interaction) return interaction.send(this.client.usageEmbed(guild, this, data));
        }
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

        let sunriseDate = new Date(weather.sunrise * 1000);
        let sunriseHours = sunriseDate.getHours();
        let sunriseMinutes = '0' + sunriseDate.getMinutes();
        let sunrise = sunriseHours + ':' + sunriseMinutes.substr(-2);

        let sunsetDate = new Date(weather.sunset * 1000);
        let sunsetHours = sunsetDate.getHours();
        let sunsetMinutes = '0' + sunsetDate.getMinutes();
        let sunset = sunsetHours + ':' + sunsetMinutes.substr(-2);

        let embed = new MessageEmbed()
            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
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
            .setFooter({text: data.guild.footer});
        if(message) return message.send(embed, false);
        if(interaction) return interaction.send(embed);
    }
}

module.exports = Weather;
