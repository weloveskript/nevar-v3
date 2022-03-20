const Command = require('../../core/command');
const {SlashCommandBuilder} = require("@discordjs/builders");
const {MessageEmbed} = require("discord.js");
const moment = require("moment");

class Afk extends Command {
    constructor(client) {
        super(client, {
            name: "afk",
            dirname: __dirname,
            description: "fun/afk:general:description",
            cooldown: 3000,
            slashCommand: {
                addCommand: true,
                data:
                    new SlashCommandBuilder()
                        .addStringOption(option =>
                            option.setRequired(false))
            }
        });
    }

    async run(interaction, message, args, data) {

        let guild = interaction?.guild || message?.guild;
        let member = interaction?.member || message?.member;

        let reason = args[0] ? args.join(' ') : guild.translate("fun/afk:main:noReason");


        if(!data.userData.afk.status){
            data.userData.afk.status = true;
            data.userData.afk.reason = reason;
            data.userData.afk.since = Date.now();
            data.userData.markModified("afk");
            await data.userData.save();
            let embed = new MessageEmbed()
                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                .setDescription(guild.translate("fun/afk:main:set")
                    .replace('{emotes.success}', this.client.emotes.success)
                    .replace('{reason}', reason))
                .setColor(this.client.embedColor)
                .setFooter({text: data.guild.footer});
            if(message) return message.send(embed);
            if(interaction) return interaction.send(embed);
        }else{
            let since = data.userData.afk.since;
            let afkReason = data.userData.afk.reason;
            data.userData.afk.status = false;
            data.userData.afk.reason = null;
            data.userData.afk.since = null;
            data.userData.markModified("afk");
            await data.userData.save();

            let afkSinceData = moment.duration(moment(Date.now()).diff(since))._data;
            let afkSince = [];
            if(afkSinceData.years > 0)
                afkSince.push(afkSinceData.years + ' ' + (afkSinceData.years > 1 ? guild.translate("timeUnits:years") : guild.translate("timeUnits:year")));
            if(afkSinceData.months > 0)
                afkSince.push(afkSinceData.months + ' ' + (afkSinceData.months > 1 ? guild.translate("timeUnits:months") : guild.translate("timeUnits:month")));
            if(afkSinceData.days > 0)
                afkSince.push(afkSinceData.days + ' ' + (afkSinceData.days > 1 ? guild.translate("timeUnits:days") : guild.translate("timeUnits:day")));
            if(afkSinceData.hours > 0)
                afkSince.push(afkSinceData.hours + ' ' + (afkSinceData.hours > 1 ? guild.translate("timeUnits:hours") : guild.translate("timeUnits:hour")));
            if(afkSinceData.minutes > 0)
                afkSince.push(afkSinceData.minutes + ' ' + (afkSinceData.minutes > 1 ? guild.translate("timeUnits:minutes") : guild.translate("timeUnits:minute")));
            if(afkSinceData.seconds > 0)
                afkSince.push(afkSinceData.seconds + ' ' + (afkSinceData.seconds > 1 ? guild.translate("timeUnits:seconds") : guild.translate("timeUnits:second")));

            afkSince = afkSince.join(', ');

            let embed = new MessageEmbed()
                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                .setDescription(guild.translate("fun/afk:main:reset")
                    .replace('{emotes.success}', this.client.emotes.success)
                    .replace('{reason}', afkReason)
                    .replace('{time}', afkSince))
                .setColor(this.client.embedColor)
                .setFooter({text: data.guild.footer});
            if(message) return message.send(embed);
            if(interaction) return interaction.send(embed);
        }
    }
}
module.exports = Afk;
