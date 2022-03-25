const Command = require('../../core/command');
const { MessageEmbed } = require('discord.js');
const formatter = new Intl.NumberFormat('de-DE');
const moment = require('moment-timezone');
const { SlashCommandBuilder } = require("@discordjs/builders");
const axios = require('axios');

class Covid extends Command {
    constructor(client) {
        super(client, {
            name: "covid",
            description: "misc/covid:general:description",
            dirname: __dirname,
            aliases: ["corona", "covid19"],
            cooldown: 5000,
            slashCommand: {
                addCommand: true,
                data:
                    new SlashCommandBuilder()
                        .addStringOption(option => option.setRequired(false))
            }
        });
    }

    async run(interaction, message, args, data) {

        // defer the interaction if the request takes more than 3 seconds
        if(interaction) await interaction.deferReply();

        const guild = interaction?.guild || message.guild;
        const countryNames = new Intl.DisplayNames([data.guild.language.split('-')[0]], {type: 'region'});

        // get covid data
        let covidUrl = 'https://disease.sh/v3/covid-19/all';
        if(args[0]) covidUrl = 'https://disease.sh/v3/covid-19/countries/' + encodeURI(args[0]) + '?strict=true';
        const covidJson = (await axios.get(covidUrl)).data;

        // get vaccine data
        let vaccineUrl = 'https://disease.sh/v3/covid-19/vaccine/coverage?lastdays=1&fullData=true';
        if(args[0]) vaccineUrl = 'https://disease.sh/v3/covid-19/vaccine/coverage/countries/' + encodeURI(args[0]) + '?lastdays=1&fullData=true';
        let vaccineJson = (await axios.get(vaccineUrl)).data
        if(vaccineJson && args[0] && !vaccineJson?.message) vaccineJson = vaccineJson.timeline[0];
        if(vaccineJson && !args[0]) vaccineJson = vaccineJson[0];

        if(covidJson && vaccineJson && !vaccineJson?.message && !covidJson?.message) {

            // get country name in the guild's language
            let country = guild.translate('misc/covid:main:stats:worldwide');
            if(args[0]) country = guild.translate('misc/covid:main:stats:in')
                .replace('{country}', countryNames.of(covidJson.countryInfo.iso2));

            const vaccines = {
                total: formatter.format(vaccineJson.total),
                today: formatter.format(vaccineJson.daily)
            };

            const cases = {
                total: formatter.format(covidJson.cases),
                totalPercent: ((covidJson.cases * 100) / covidJson.population).toFixed(2),
                today: formatter.format(covidJson.todayCases),
                activeCases: formatter.format(covidJson.active),
                activeCasesPercent: ((covidJson.active * 100) / covidJson.cases).toFixed(2),
                deaths: formatter.format(covidJson.deaths),
                deathsPercent: ((covidJson.deaths * 100) / covidJson.cases).toFixed(2),
                todayDeaths: formatter.format(covidJson.todayDeaths),
                recovered: formatter.format(covidJson.recovered),
                recoveredPercent: ((covidJson.recovered * 100) / covidJson.cases).toFixed(2),
                todayRecovered: formatter.format(covidJson.todayRecovered),
                casesPerMillion: formatter.format(covidJson.casesPerOneMillion),
                deathsPerMillion: formatter.format(covidJson.deathsPerOneMillion),
            };

            const general = {
                country: country,
                countryFlag: (covidJson.countryInfo?.flag ? covidJson.countryInfo.flag : 'https://fems-microbiology.org/wp-content/uploads/2020/03/2019-nCoV-CDC-23312_without_background-pubic-domain.png'),
                lastUpdated: moment.tz(covidJson.updated, guild.translate('language:timezone')).format(guild.translate('language:dateformat'))
            };

            // build embed
            let embed = new MessageEmbed()
                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                .setTitle(general.country)
                .setThumbnail(general.countryFlag)

                // disclaimer
                .setDescription(guild.translate("misc/covid:main:disclaimer")
                    .replace('{emotes.warn}', this.client.emotes.warn))
                // cases
                .addField('🦠 ' + guild.translate("misc/covid:main:infections:total"),
                    '```' + cases.total + ' ' + guild.translate("misc/covid:main:percentPopulation").replace('{percent}', cases.totalPercent) + '```')
                // active cases
                .addField('🦠 ' + guild.translate("misc/covid:main:infections:active"),
                    '```' + cases.activeCases + ' ' + guild.translate("misc/covid:main:percentInfections").replace('{percent}', cases.activeCasesPercent) + '```')
                // recoveries
                .addField('🩹 ' + guild.translate("misc/covid:main:recoveries:total"),
                    '```' + cases.recovered + ' ' + guild.translate("misc/covid:main:percentInfections").replace('{percent}', cases.recoveredPercent) + '```')
                // deaths
                .addField('🕊️ ' + guild.translate("misc/covid:main:deaths:total"),
                    '```' + cases.deaths + ' ' + guild.translate("misc/covid:main:percentInfections").replace('{percent}', cases.deathsPercent) + '```')
                // today cases
                .addField('🦠 ' + guild.translate("misc/covid:main:infections:today"), '```' + cases.today + '```', true)
                // today recoveries
                .addField('🩹 ' + guild.translate("misc/covid:main:recoveries:today"), '```' + cases.todayRecovered + '```', true)
                // today deaths
                .addField('🕊️ ' + guild.translate("misc/covid:main:deaths:today"), '```' + cases.todayDeaths + '```', true)
                // cases per million
                .addField('📊 ' + guild.translate("misc/covid:main:infections:perMillion"), '```' + cases.casesPerMillion + '```', true)
                // deaths per million
                .addField('📊 ' + guild.translate("misc/covid:main:deaths:perMillion"), '```' + cases.deathsPerMillion + '```', true)
                // vaccines total
                .addField('💉 ' + guild.translate("misc/covid:main:vaccines:total"), '```' + vaccines.total + '```')
                // vaccines today
                .addField('💉 ' + guild.translate("misc/covid:main:vaccines:today"), '```' + vaccines.today + '```')
                .setColor(this.client.embedColor)
                .setFooter({text:guild.translate("misc/covid:main:footer")
                    .replace('{date}', general.lastUpdated), iconURL: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Twemoji_1f637.svg/1024px-Twemoji_1f637.svg.png'});

            // send embed
            if(interaction) interaction.editReply({embeds:[embed]});
            if(message) message.send(embed);
        }else{
            //country does not exist or any other error
            if(message) return message.send(this.client.usageEmbed(guild, this, data));
            if(interaction) return interaction.editReply({embeds: [this.client.usageEmbed(guild, this, data)]});
        }
    }
}
module.exports = Covid;
