const Command = require('../../core/command');
const { MessageEmbed, MessageActionRow, MessageButton} = require('discord.js');
const {SlashCommandBuilder} = require("@discordjs/builders");
const Resolver = require('../../helper/resolver');
const ms = require('ms');
const moment = require("moment");

class Ban extends Command {

    constructor(client) {
        super(client, {
            name: "ban",
            description: "moderation/ban:general:description",
            dirname: __dirname,
            cooldown: 5000,
            slashCommand: {
                addCommand: true,
                data: new SlashCommandBuilder()
                    .addUserOption(option => option.setRequired(true))
                    .addStringOption(option => option.setRequired(true))
                    .addStringOption(option => option.setRequired(false))
            }
        });
    }

    async run(interaction, message, args, data) {

        let guild = interaction?.guild || message?.guild;
        let member = interaction?.member || message?.member;
        let channel = interaction?.channel || message?.channel;
        let id = interaction?.member?.user?.id || message?.author?.id;

        if(!args[0]){
            if(message) return message.send(this.client.usageEmbed(guild, this, data));
            if(interaction) return interaction.send(this.client.usageEmbed(guild, this, data));
        }

        let fetchUser;
        fetchUser = await this.client.resolveUser(args[0]);

        let banData = {
            user: fetchUser.id,
            time: args[1] ? (ms(args.slice(-1)[0]) ? args.slice(-1)[0] : null) : null,
            reason: args[1] ? ms(args.slice(-1)[0]) ? args.slice(1).join(' ').replace(ms(args.slice(-1)[0]) ? args.slice(-1)[0] : null, '').trim() : args.slice(1).join(' ') : null
        }
        if(!banData.reason || banData.reason === '') banData.reason = guild.translate("moderation/ban:main:notGiven");
        if(!banData.time || banData.time === '') banData.time = (100 * 60 * 60 * 24 * 365 * 1000);

        if(!banData.user || banData.user.length !== 18 || !parseInt(banData.user)){
            if(message) return message.send(this.client.usageEmbed(guild, this, data));
            if(interaction) return interaction.send(this.client.usageEmbed(guild, this, data));
        }

        if(member.user.id === banData.user){
            let embed = new MessageEmbed()
                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                .setDescription(guild.translate("moderation/ban:main:errors:cantBanSelf")
                    .replace('{emotes.error}', this.client.emotes.error))
                .setColor(this.client.embedColor)
                .setFooter({text: data.guild.footer});
            if(message) return message.send(embed);
            if(interaction) return interaction.send(embed);
        }
        let guildBans = await guild.bans.fetch();

        if(guildBans.some((m) => m.user.id === banData.user)){
            let userBan = await guildBans.find((m) => m.user.id === banData.user);
            let embed = new MessageEmbed()
                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                .setDescription(guild.translate("moderation/ban:main:errors:alreadyBanned")
                    .replace('{emotes.error}', this.client.emotes.error)
                    .replace('{user}', fetchUser.tag)
                    .replace('{reason}', userBan.reason ? userBan.reason : guild.translate("moderation/ban:main:notGiven")))
                .setColor(this.client.embedColor)
                .setThumbnail(userBan.user.displayAvatarURL({dynamic:true}))
                .setFooter({text: data.guild.footer});
            if(message) return message.send(embed);
            if(interaction) return interaction.send(embed);
        }
        let victimMember;
        if(interaction) victimMember = await guild.members.fetch(args[0]).catch(() => {});
        if(message) {
            victimMember = await Resolver.resolveMember({
                message: message,
                search: args[0]
            }).catch(() => {});
        }

        let victimPosition = -1;
        if(victimMember){
            victimPosition = victimMember.roles.highest.position;
        }
        let moderatorPosition = member.roles.highest.position;

        if(victimPosition >= moderatorPosition && guild.ownerId !== member.user.id){
            let embed = new MessageEmbed()
                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                .setDescription(guild.translate("moderation/ban:main:errors:cantBan")
                    .replace('{emotes.error}', this.client.emotes.error)
                    .replace('{emotes.arrow}', this.client.emotes.arrow)
                    .replaceAll('{user}', fetchUser.tag))
                .setColor(this.client.embedColor)
                .setFooter({text: data.guild.footer});
            if(message) return message.send(embed);
            if(interaction) return interaction.send(embed);
        }

        if(victimMember && !victimMember?.bannable){
            let embed = new MessageEmbed()
                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                .setDescription(guild.translate("moderation/ban:main:errors:cantBan")
                    .replace('{emotes.error}', this.client.emotes.error)
                    .replace('{emotes.arrow}', this.client.emotes.arrow)
                    .replaceAll('{user}', fetchUser.tag))
                .setColor(this.client.embedColor)
                .setFooter({text: data.guild.footer});
            if(message) return message.send(embed);
            if(interaction) return interaction.send(embed);
        }

        let victimMemberData = await this.client.findOrCreateMember({
            guildID: guild.id,
            id: banData.user
        });

        let duration = banData.time.toString()
            .replace((100 * 60 * 60 * 24 * 365 * 1000).toString(), guild.translate("moderation/ban:main:perma"))

        let confirmEmbed = new MessageEmbed()
            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
            .setDescription(guild.translate("moderation/ban:main:confirm")
                .replace('{emotes.arrow}', this.client.emotes.arrow)
                .replace('{user}', fetchUser.tag))
            .setColor(this.client.embedColor)
            .setFooter({text: data.guild.footer});

        let row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('confirm_' + id + '_yes')
                    .setLabel(guild.translate("language:yes"))
                    .setStyle('SUCCESS')
                    .setEmoji('✅'),
                new MessageButton()
                    .setCustomId('confirm_' + id + '_no')
                    .setLabel(guild.translate("language:no"))
                    .setStyle('DANGER')
                    .setEmoji('❌')
            )

        let sent;
        if (message) sent = await message.send(confirmEmbed, false, [row]);
        if (interaction) sent = await interaction.send(confirmEmbed, false, [row]);

        const filter = i => i.customId.startsWith('confirm_' + id) && i.user.id === id;
        const clicked = await sent.awaitMessageComponent({
            filter,
            time: 20000
        }).catch(() => {});

        if (clicked) {
            if(clicked.customId === 'confirm_' + id + '_yes'){
                guild.members.ban(banData.user, {
                    reason: guild.translate("moderation/ban:main:reason")
                        .replace('{moderator}', member.user.tag)
                        .replace('{date}', moment.tz(new Date(Date.now()), guild.translate("language:timezone")).format(guild.translate("language:dateformat")))
                        .replace('{duration}', duration)
                        .replace('{reason}', banData.reason)
                })
                    .then(async () => {
                        victimMemberData.ban.banned = true;
                        victimMemberData.ban.reason = banData.reason;
                        victimMemberData.ban.moderator = {
                            id: member.user.id,
                            tag: member.user.tag
                        };
                        victimMemberData.ban.duration = duration;
                        victimMemberData.ban.bannedAt = Date.now();
                        victimMemberData.ban.endDate = Date.now() + (duration === guild.translate("moderation/ban:main:perma") ? banData.time : ms(banData.time))

                        victimMemberData.markModified("ban");
                        await victimMemberData.save();

                        let bannedUntil = duration === guild.translate("moderation/ban:main:perma") ? '/' : moment.tz(new Date(
                            Date.now() +
                            (duration === guild.translate("moderation/ban:main:perma") ? banData.time : ms(banData.time))
                        ), guild.translate("language:timezone")).format(guild.translate("language:dateformat"));

                        let bannedDif = moment.duration(moment(Date.now()).diff(victimMemberData.ban.endDate))._data;
                        let bannedDuration = [];
                        if(bannedDif.years < 0)
                            bannedDuration.push(bannedDif.years.toString().replace('-', '') + ' ' + (bannedDif.years < -1 ? guild.translate("timeUnits:years") : guild.translate("timeUnits:year")));
                        if(bannedDif.months < 0)
                            bannedDuration.push(bannedDif.months.toString().replace('-', '') + ' ' + (bannedDif.months < -1 ? guild.translate("timeUnits:months") : guild.translate("timeUnits:month")));
                        if(bannedDif.days < 0)
                            bannedDuration.push(bannedDif.days.toString().replace('-', '') + ' ' + (bannedDif.days < -1 ? guild.translate("timeUnits:days") : guild.translate("timeUnits:day")));
                        if(bannedDif.hours < 0)
                            bannedDuration.push(bannedDif.hours.toString().replace('-', '') + ' ' + (bannedDif.hours < -1 ? guild.translate("timeUnits:hours") : guild.translate("timeUnits:hour")));
                        if(bannedDif.minutes < 0)
                            bannedDuration.push(bannedDif.minutes.toString().replace('-', '') + ' ' + (bannedDif.minutes < -1 ? guild.translate("timeUnits:minutes") : guild.translate("timeUnits:minute")));
                        if(bannedDif.seconds < 0)
                            bannedDuration.push(bannedDif.seconds.toString().replace('-', '') + ' ' + (bannedDif.seconds < -1 ? guild.translate("timeUnits:seconds") : guild.translate("timeUnits:second")));
                        if(duration !== guild.translate("moderation/ban:main:perma")){
                            duration = bannedDuration.slice(0, 2).join(', ');
                        }

                        let privateEmbed = new MessageEmbed()
                            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                            .setDescription(guild.translate("moderation/ban:main:success:private")
                                .replace('{emotes.error}', this.client.emotes.error)
                                .replace('{guild}', guild.name)
                                .replace('{reason}', banData.reason)
                                .replace('{moderator}', member.user.tag)
                                .replace('{duration}', duration)
                                .replace('{bannedUntil}', bannedUntil))
                            .setColor(this.client.embedColor)
                            .setFooter({text: data.guild.footer});
                        fetchUser.send({embeds:[privateEmbed]}).catch(() => {});

                        let publicEmbed = new MessageEmbed()
                            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                            .setDescription(guild.translate("moderation/ban:main:success:public")
                                .replace('{emotes.success}', this.client.emotes.success)
                                .replace('{user}', fetchUser.tag)
                                .replace('{reason}', banData.reason)
                                .replace('{moderator}', member.user.tag)
                                .replace('{duration}', duration)
                                .replace('{bannedUntil}', bannedUntil))
                            .setImage('https://c.tenor.com/SglvezQEKnAAAAAC/discord-ban.gif')
                            .setColor(this.client.embedColor)
                            .setFooter({text: data.guild.footer});
                        await sent.edit({embeds:[publicEmbed], components: []})

                        this.client.databaseCache.bannedUsers.set(fetchUser.id + guild.id, victimMemberData);
                    })
                    .catch(async () => {
                        let embed = new MessageEmbed()
                            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                            .setDescription(guild.translate("moderation/ban:main:errors:unknown")
                                .replace('{emotes.error}', this.client.emotes.error))
                            .setColor(this.client.embedColor)
                            .setFooter({text: data.guild.footer});
                        await sent.edit({embeds:[embed], components: []})
                    });
            }
            if(clicked.customId === 'confirm_' + id + '_no'){
                let embed = new MessageEmbed()
                    .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                    .setDescription(guild.translate("language:cancelled")
                        .replace('{emotes.error}', this.client.emotes.error))
                    .setColor(this.client.embedColor)
                    .setFooter({text: data.guild.footer});
                await sent.edit({embeds:[embed], components: []})

            }


        }
    }
}

module.exports = Ban;
