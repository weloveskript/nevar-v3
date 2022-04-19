const Command = require('../../core/command');
const { MessageEmbed} = require('discord.js');
const {SlashCommandBuilder} = require("@discordjs/builders");
const moment = require('moment');
const resolver = require('../../helper/finder');
const packageJson = require("../../../package.json");

class Userinfo extends Command {

    constructor(client) {
        super(client, {
            name: "userinfo",
            description: "misc/userinfo:general:description",
            dirname: __dirname,
            aliases: ["whois", "who-is", "user-info"],
            cooldown: 5000,
            slashCommand: {
                addCommand: true,
                data: new SlashCommandBuilder()
                    .addUserOption(option =>
                        option.setName('misc/userinfo:slash:1:name')
                            .setDescription('misc/userinfo:slash:1:description')
                            .setRequired(false))
            }
        });
    }

    async run(interaction, message, args, data) {
        let guild = interaction?.guild || message?.guild;
        let member = interaction?.member || message?.member;

        const flags = {
            DISCORD_EMPLOYEE: guild.translate("misc/userinfo:main:flags:employee"),
            DISCORD_PARTNER: guild.translate("misc/userinfo:main:flags:partner"),
            BUGHUNTER_LEVEL_1: guild.translate("misc/userinfo:main:flags:bughunter_1"),
            BUGHUNTER_LEVEL_2: guild.translate("misc/userinfo:main:flags:bughunter_2"),
            HYPESQUAD_EVENTS: guild.translate("misc/userinfo:main:flags:hypesquad_events"),
            HOUSE_BRAVERY: guild.translate("misc/userinfo:main:flags:hypesquad_bravery"),
            HOUSE_BRILLIANCE: guild.translate("misc/userinfo:main:flags:hypesquad_brilliance"),
            HOUSE_BALANCE: guild.translate("misc/userinfo:main:flags:hypesquad_balance"),
            EARLY_SUPPORTER: guild.translate("misc/userinfo:main:flags:early_supporter"),
            VERIFIED_BOT: guild.translate("misc/userinfo:main:flags:verified_bot"),
            VERIFIED_DEVELOPER: guild.translate("misc/userinfo:main:flags:verified_dev"),
        }

        let user;
        if(message){
            user = await resolver.resolveMember({
                message: message,
                search: args[0]
            });
        }else if(interaction){
            user = await guild.members.cache.get(args[0]);
        }

        if(!user || Object.values(user).length === 0) user = member;


        let createdDiff = moment.duration(moment(Date.now()).diff(user.user.createdAt))._data;
        let createdAgo = [];
        if(createdDiff.years > 0)
            createdAgo.push(createdDiff.years + ' ' + (createdDiff.years > 1 ? guild.translate("timeUnits:years") : guild.translate("timeUnits:year")));
        if(createdDiff.months > 0)
            createdAgo.push(createdDiff.months + ' ' + (createdDiff.months > 1 ? guild.translate("timeUnits:months") : guild.translate("timeUnits:month")));
        if(createdDiff.days > 0)
            createdAgo.push(createdDiff.days + ' ' + (createdDiff.days > 1 ? guild.translate("timeUnits:days") : guild.translate("timeUnits:day")));
        if(createdDiff.hours > 0)
            createdAgo.push(createdDiff.hours + ' ' + (createdDiff.hours > 1 ? guild.translate("timeUnits:hours") : guild.translate("timeUnits:hour")));
        createdAgo = createdAgo.join(', ');
        let userCreated = moment.tz(new Date(user.user.createdAt), guild.translate("language:timezone")).format(guild.translate("language:dateformat"));


        let joinedDiff = moment.duration(moment(Date.now()).diff(user.joinedAt))._data;
        let joinedAgo = [];
        if(joinedDiff.years > 0)
            joinedAgo.push(joinedDiff.years + ' ' + (joinedDiff.years > 1 ? guild.translate("timeUnits:years") : guild.translate("timeUnits:year")));
        if(joinedDiff.months > 0)
            joinedAgo.push(joinedDiff.months + ' ' + (joinedDiff.months > 1 ? guild.translate("timeUnits:months") : guild.translate("timeUnits:month")));
        if(joinedDiff.days > 0)
            joinedAgo.push(joinedDiff.days + ' ' + (joinedDiff.days > 1 ? guild.translate("timeUnits:days") : guild.translate("timeUnits:day")));
        if(joinedDiff.hours > 0)
            joinedAgo.push(joinedDiff.hours + ' ' + (joinedDiff.hours > 1 ? guild.translate("timeUnits:hours") : guild.translate("timeUnits:hour")));
        if(joinedDiff.minutes > 0)
            joinedAgo.push(joinedDiff.minutes + ' ' + (joinedDiff.minutes > 1 ? guild.translate("timeUnits:minutes") : guild.translate("timeUnits:minute")));
        joinedAgo = joinedAgo.join(', ');
        let userJoined = moment.tz(new Date(user.joinedAt), guild.translate("language:timezone")).format(guild.translate("language:dateformat"));

        let embed = new MessageEmbed()
            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
            .setThumbnail(user.user.displayAvatarURL({dynamic: true}))

            .addField(guild.translate("misc/userinfo:main:fields:name:name")
                    .replace('{emotes.pencil}', this.client.emotes.pencil),
                guild.translate('misc/userinfo:main:fields:name:value')
                    .replace('{name}', user.user.tag))

            .addField(guild.translate("misc/userinfo:main:fields:createdAt:name")
                    .replace('{emotes.calendar}', this.client.emotes.calendar),
                guild.translate('misc/userinfo:main:fields:createdAt:value')
                    .replace('{createdAt}', userCreated))

            .addField(guild.translate("misc/userinfo:main:fields:createdBefore:name")
                    .replace('{emotes.calendar}', this.client.emotes.calendar),
                guild.translate('misc/userinfo:main:fields:createdBefore:value')
                    .replace('{createdBefore}', createdAgo))

            .addField(guild.translate("misc/userinfo:main:fields:nick:name")
                    .replace('{emotes.pencil}', this.client.emotes.pencil),
                guild.translate('misc/userinfo:main:fields:nick:value')
                    .replace('{nick}', user.nickname || user.user.username), true)

            .addField(guild.translate("misc/userinfo:main:fields:bot:name")
                    .replace('{emotes.robot}', this.client.emotes.bot),
                guild.translate('misc/userinfo:main:fields:bot:value')
                    .replace('{bot}', member.bot ? guild.translate("language:yes") : guild.translate("language:no")), true)

            .addField(guild.translate("misc/userinfo:main:fields:joinedAt:name")
                    .replace('{emotes.calendar}', this.client.emotes.calendar),
                guild.translate('misc/userinfo:main:fields:joinedAt:value')
                    .replace('{joinedAt}', userJoined))

            .addField(guild.translate("misc/userinfo:main:fields:joinedBefore:name")
                    .replace('{emotes.calendar}', this.client.emotes.calendar),
                guild.translate('misc/userinfo:main:fields:joinedBefore:value')
                    .replace('{joinedBefore}', joinedAgo))

            .setColor(this.client.embedColor)
            .setFooter({text: data.guild.footer});

        const userFlags = (await user.user.fetchFlags()).toArray();
        if(userFlags.length > 0) {
            embed.addField(guild.translate("misc/userinfo:main:fields:flags:name")
                    .replace('{emotes.flag}', this.client.emotes.badges.earlysupporter),
                guild.translate('misc/userinfo:main:fields:flags:value')
                    .replace('{flags}', userFlags.map(flag => flags[flag]).join('\n')))
        }

        let activities = user.presence?.activities;
        const presences = [];
        if(activities?.length > 0){
            for(let activity of activities){
                let type = activity.type.toString()
                    .replace('PLAYING', guild.translate("misc/userinfo:main:presenceTypes:playing"))
                    .replace('STREAMING', guild.translate("misc/userinfo:main:presenceTypes:streaming"))
                    .replace('LISTENING', guild.translate("misc/userinfo:main:presenceTypes:listening"))
                    .replace('WATCHING', guild.translate("misc/userinfo:main:presenceTypes:watching"))
                    .replace('CUSTOM_STATUS', guild.translate("misc/userinfo:main:presenceTypes:custom"));
                let name = activity.name
                    .replace('Custom Status', '');
                if(type === guild.translate("misc/userinfo:main:presenceTypes:custom")){
                    if(activity.state) presences.push(type + ' - ' + activity.state + (activity.emoji ? ' | ' + guild.translate("misc/userinfo:main:emoji") + activity.emoji.name : ''));
                    else presences.push(type + ' - ' + name + (activity.emoji ? ' | ' + guild.translate("misc/userinfo:main:emoji") + activity.emoji.name : ''));

                }else{
                    let presenceCreatedDiff = moment.duration(moment(Date.now()).diff(activity.createdTimestamp))._data;
                    let presenceCreatedAgo = [];
                    if(presenceCreatedDiff.years > 0)
                        presenceCreatedAgo.push(presenceCreatedDiff.years + ' ' + (presenceCreatedDiff.years > 1 ? guild.translate("timeUnits:years") : guild.translate("timeUnits:year")));
                    if(presenceCreatedDiff.months > 0)
                        presenceCreatedAgo.push(presenceCreatedDiff.months + ' ' + (presenceCreatedDiff.months > 1 ? guild.translate("timeUnits:months") : guild.translate("timeUnits:month")));
                    if(presenceCreatedDiff.days > 0)
                        presenceCreatedAgo.push(presenceCreatedDiff.days + ' ' + (presenceCreatedDiff.days > 1 ? guild.translate("timeUnits:days") : guild.translate("timeUnits:day")));
                    if(presenceCreatedDiff.hours > 0)
                        presenceCreatedAgo.push(presenceCreatedDiff.hours + ' ' + (presenceCreatedDiff.hours > 1 ? guild.translate("timeUnits:hours") : guild.translate("timeUnits:hour")));
                    if(presenceCreatedDiff.minutes > 0)
                        presenceCreatedAgo.push(presenceCreatedDiff.minutes + ' ' + (presenceCreatedDiff.minutes > 1 ? guild.translate("timeUnits:minutes") : guild.translate("timeUnits:minute")));
                    if(presenceCreatedDiff.seconds > 0)
                        presenceCreatedAgo.push(presenceCreatedDiff.seconds + ' ' + (presenceCreatedDiff.seconds > 1 ? guild.translate("timeUnits:seconds") : guild.translate("timeUnits:second")));

                    presenceCreatedAgo = presenceCreatedAgo.join(', ');

                    if(activity.details){
                        if(activity.state){
                            presences.push(type + ' ' + name + ' | ' + (activity.details ? activity.details : '') + ' | ' + (activity.state ? activity.state : '') + ' | ' + presenceCreatedAgo + ' ' + guild.translate("misc/userinfo:main:elapsed"));
                        }else{
                            presences.push(type + ' ' + name + ' | ' + (activity.details ? activity.details : '') + ' | ' + presenceCreatedAgo + ' ' + guild.translate("misc/userinfo:main:elapsed"));
                        }
                    }else{
                        if(activity.state){
                            presences.push(type + ' ' + name + ' | ' + (activity.state ? activity.state : '') + ' | ' + presenceCreatedAgo + ' ' + guild.translate("misc/userinfo:main:elapsed"));
                        }else{
                            presences.push(type + ' ' + name + ' | ' + presenceCreatedAgo + ' ' + guild.translate("misc/userinfo:main:elapsed"));
                        }
                    }

                }
            }
        }
        if(presences?.length > 0) {
            embed.addField(guild.translate("misc/userinfo:main:fields:presences:name")
                    .replace('{emotes.play}', this.client.emotes.playing),
                guild.translate('misc/userinfo:main:fields:presences:value')
                    .replace('{presences}', presences.join('\n\n')))
        }


        if(message) return message.send(embed);
        if(interaction) return interaction.send(embed);



    }
}
module.exports = Userinfo;
