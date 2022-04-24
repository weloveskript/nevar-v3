const Command = require('../../core/command');
const { MessageEmbed} = require('discord.js');
const {SlashCommandBuilder} = require("@discordjs/builders");
const Resolver = require('../../helper/finder');
const moment = require("moment");

class Warn extends Command {

    constructor(client) {
        super(client, {
            name: "warn",
            description: "moderation/warn:general:description",
            dirname: __dirname,
            cooldown: 5000,
            memberPermissions: ["KICK_MEMBERS"],
            slashCommand: {
                addCommand: true,
                data: new SlashCommandBuilder()
                    .addUserOption(option =>
                        option.setRequired(true))
                    .addStringOption(option =>
                        option.setRequired(false))
            }
        });
    }

    async run(interaction, message, args, data) {
        let guild = interaction?.guild || message?.guild;
        let channel = interaction?.channel || message?.channel;
        let author = interaction?.member || message?.member;

        let member = await guild.members.fetch(args[0]).catch(() => {});
        if(message) member = await Resolver.resolveMember({
            message: message,
            search: args[0]
        });


        if(!member){
            if (message) return message.send(this.client.usageEmbed(guild, this, data));
            if (interaction) return interaction.send(this.client.usageEmbed(guild, this, data));
        }

        if(member.user.bot){
            let embed = new MessageEmbed()
                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                .setDescription(guild.translate("moderation/warn:main:errors:bot")
                    .replace('{emotes.error}', this.client.emotes.error))
                .setColor(this.client.embedColor)
                .setFooter({text: data.guild.footer});
            if (message) return message.send(embed, false);
            if (interaction) return interaction.send(embed);
        }

        if(member.user.id === author.user.id){
            let embed = new MessageEmbed()
                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                .setDescription(guild.translate("moderation/warn:main:errors:yourSelf")
                    .replace('{emotes.error}', this.client.emotes.error))
                .setColor(this.client.embedColor)
                .setFooter({text: data.guild.footer});
            if (message) return message.send(embed, false);
            if (interaction) return interaction.send(embed);
        }

        const victimData = await this.client.findOrCreateMember({
            id: member.user.id,
            guildID: guild.id
        });

        console.log(guild.ownerId)
        let moderatorPosition = author.roles.highest.position;
        let victimPositon = member.roles.highest.position;
        if(guild.ownerId !== author.user.id && moderatorPosition < victimPositon){
            let embed = new MessageEmbed()
                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                .setDescription(guild.translate("moderation/warn:main:errors:cantWarn")
                    .replace('{emotes.error}', this.client.emotes.error)
                    .replace('{emotes.warn}', this.client.emotes.warn)
                    .replaceAll('{user}', member.user.tag))
                .setColor(this.client.embedColor)
                .setFooter({text: data.guild.footer});
            if (message) return message.send(embed, false);
            if (interaction) return interaction.send(embed);
        }

        let reason = args.slice(1).join(' ');
        if(!reason) reason = guild.translate("moderation/warn:main:noReason");

        let warning = {
            date: moment.tz(new Date(Date.now()), guild.translate("language:timezone")).format(guild.translate("language:dateformat")),
            moderator: author.user.tag,
            reason: reason
        }
        victimData.warnings.count++;
        victimData.warnings.list.push(warning);
        victimData.markModified("warnings");
        await victimData.save();

        let privateEmbed = new MessageEmbed()
            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
            .setDescription(guild.translate("moderation/warn:main:embeds:private")
                .replace('{emotes.error}', this.client.emotes.error)
                .replace('{guild}', guild.name)
                .replace('{reason}', reason)
                .replace('{moderator}', author.user.tag)
                .replace('{date}', moment.tz(new Date(Date.now()), guild.translate("language:timezone")).format(guild.translate("language:dateformat"))))
            .setColor(this.client.embedColor)
            .setFooter({text: data.guild.footer});
        await member.user.send({embeds:[privateEmbed]}).catch(() => {});

        let publicEmbed = new MessageEmbed()
            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
            .setDescription(guild.translate("moderation/warn:main:embeds:public")
                .replace('{emotes.error}', this.client.emotes.error)
                .replace('{user}', member.user.tag)
                .replace('{reason}', reason)
                .replace('{moderator}', author.user.tag)
                .replace('{date}', moment.tz(new Date(Date.now()), guild.translate("language:timezone")).format(guild.translate("language:dateformat"))))
            .setColor(this.client.embedColor)
            .setFooter({text: data.guild.footer});
        if (message) return message.send(publicEmbed, false);
        if (interaction) return interaction.send(publicEmbed);
    }
}
module.exports = Warn;
