const Command = require('../../core/command');
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');
const formatter = new Intl.NumberFormat('de-DE');
const moment = require('moment');

class Covid extends Command {
    constructor(client) {
        super(client, {
            name: "covid",
            description: "misc/covid:description",
            dirname: __dirname,
            aliases: ["corona", "covid19"],
            cooldown: 5000,
            slashCommand: {
                addCommand: true,
                options: [
                    {
                        name: "misc/covid:slashOption1",
                        description: "misc/covid:slashOption1Desc",
                        type: "STRING",
                        required: false,
                    }
                ]
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
        const covidJson = await fetch(covidUrl).then((res) => res.json());

        // get vaccine data
        let vaccineUrl = 'https://disease.sh/v3/covid-19/vaccine/coverage?lastdays=1&fullData=true';
        if(args[0]) vaccineUrl = 'https://disease.sh/v3/covid-19/vaccine/coverage/countries/' + encodeURI(args[0]) + '?lastdays=1&fullData=true';
        let vaccineJson = await fetch(vaccineUrl).then((res) => res.json());
        if(vaccineJson && args[0] && !vaccineJson?.message) vaccineJson = vaccineJson.timeline[0];
        if(vaccineJson && !args[0]) vaccineJson = vaccineJson[0];


        if(covidJson && vaccineJson && !vaccineJson?.message && !covidJson?.message) {


            // get native name
            let country = guild.translate('misc/covid:statsWorldwide');
            if(args[0]) country = guild.translate('misc/covid:statsIn')
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
                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                .setTitle(general.country)
                .setThumbnail(general.countryFlag)

                // disclaimer
                .setDescription(guild.translate("misc/covid:disclaimer")
                    .replace('{emotes.warn}', this.client.emotes.warn))
                // cases
                .addField('🦠 ' + guild.translate("misc/covid:infections"),
                    '```' + cases.total + ' ' + guild.translate("misc/covid:infectionsPercent").replace('{percent}', cases.totalPercent) + '```')
                // active cases
                .addField('🦠 ' + guild.translate("misc/covid:activeInfections"),
                    '```' + cases.activeCases + ' ' + guild.translate("misc/covid:activeInfectionsPercent").replace('{percent}', cases.activeCasesPercent) + '```')
                // recoveries
                .addField('🩹 ' + guild.translate("misc/covid:recoveries"),
                    '```' + cases.recovered + ' ' + guild.translate("misc/covid:recoveriesPercent").replace('{percent}', cases.recoveredPercent) + '```')
                // deaths
                .addField('🕊️ ' + guild.translate("misc/covid:deaths"),
                    '```' + cases.deaths + ' ' + guild.translate("misc/covid:deathsPercent").replace('{percent}', cases.deathsPercent) + '```')
                // today cases
                .addField('🦠 ' + guild.translate("misc/covid:infectionsToday"), '```' + cases.today + '```', true)
                // today recoveries
                .addField('🩹 ' + guild.translate("misc/covid:recoveredToday"), '```' + cases.todayRecovered + '```', true)
                // today deaths
                .addField('🕊️ ' + guild.translate("misc/covid:deathsToday"), '```' + cases.todayDeaths + '```', true)
                // cases per million
                .addField('📊 ' + guild.translate("misc/covid:infectionsPerMillion"), '```' + cases.casesPerMillion + '```', true)
                // deaths per million
                .addField('📊 ' + guild.translate("misc/covid:deathsPerMillion"), '```' + cases.deathsPerMillion + '```', true)
                // vaccines total
                .addField('💉 ' + guild.translate("misc/covid:vaccines"), '```' + vaccines.total + '```')
                // vaccines today
                .addField('💉 ' + guild.translate("misc/covid:vaccinesToday"), '```' + vaccines.today + '```')
                .setColor(this.client.embedColor)
                .setFooter(guild.translate("misc/covid:stayHealthy")
                    .replace('{date}', general.lastUpdated), 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Twemoji_1f637.svg/1024px-Twemoji_1f637.svg.png');

            // send embed
            if(interaction) interaction.editReply({embeds:[embed]});
            if(message) message.send(embed);
        }else{
            //country does not exist or any other error
            let embed = new MessageEmbed()
                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                .setDescription(guild.translate("misc/covid:usage")
                        .replace('{prefix}', data.guild.prefix)
                        .replace('{emotes.use}', this.client.emotes.use) + '\n' +
                    guild.translate("misc/covid:example")
                        .replace('{prefix}', data.guild.prefix)
                        .replace('{emotes.example}', this.client.emotes.example))
                .setColor(this.client.embedColor)
                .setFooter(data.guild.footer);
            if(message) return message.send(embed, false);
            if(interaction) return interaction.editReply({embeds:[embed]});
        }
    }
}
module.exports = Covid;
