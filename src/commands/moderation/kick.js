const Command = require('../../core/command');
const { MessageEmbed} = require('discord.js');
const {SlashCommandBuilder} = require("@discordjs/builders");
const moment = require("moment");
const Resolver = require('../../helper/finder');


class Kick extends Command {

    constructor(client) {
        super(client, {
            name: "kick",
            description: "moderation/kick:general:description",
            dirname: __dirname,
            memberPermissions: ["KICK_MEMBERS"],
            botPermissions: ["KICK_MEMBERS"],
            cooldown: 5000,
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
        let author = interaction?.member || message?.member;
        let channel = interaction?.channel || message?.channel;

        if(!args[0]){
            if (message) return message.send(this.client.usageEmbed(guild, this, data));
            if (interaction) return interaction.send(this.client.usageEmbed(guild, this, data));
        }
        let member = await guild.members.fetch(args[0]).catch(() => {});
        if(message) member = await Resolver.resolveMember({
            message: message,
            search: args[0]
        });

        if(!member){
            if (message) return message.send(this.client.usageEmbed(guild, this, data));
            if (interaction) return interaction.send(this.client.usageEmbed(guild, this, data));
        }

        if(member.user.id === author.user.id){
            let embed = new MessageEmbed()
                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                .setDescription(guild.translate("moderation/kick:main:errors:cantKickYourself")
                    .replace('{emotes.error}', this.client.emotes.error))
                .setColor(this.client.embedColor)
                .setFooter({text: data.guild.footer});
            if (message) return message.send(embed, false);
            if (interaction) return interaction.send(embed);
        }

        if(!member.kickable){
            let embed = new MessageEmbed()
                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                .setDescription(guild.translate("moderation/kick:main:errors:cantKick")
                    .replace('{emotes.error}', this.client.emotes.error)
                    .replace('{emotes.arrow}', this.client.emotes.arrow)
                    .replaceAll('{user}', member.user.tag))
                .setColor(this.client.embedColor)
                .setFooter({text: data.guild.footer});
            if (message) return message.send(embed, false);
            if (interaction) return interaction.send(embed);
        }

        let moderatorPosition = author.roles.highest.position;
        let victimPosition = member.roles.highest.position;
        if(guild.ownerId !== author.user.id && moderatorPosition < victimPosition){
            let embed = new MessageEmbed()
                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                .setDescription(guild.translate("moderation/kick:main:errors:cantKick")
                    .replace('{emotes.error}', this.client.emotes.error)
                    .replace('{emotes.arrow}', this.client.emotes.arrow)
                    .replaceAll('{user}', member.user.tag))
                .setColor(this.client.embedColor)
                .setFooter({text: data.guild.footer});
            if (message) return message.send(embed, false);
            if (interaction) return interaction.send(embed);
        }

        let reason = args.slice(1).join(' ');
        if(!reason) reason = guild.translate("moderation/kick:main:noReason")

        let kickReason = guild.translate("moderation/kick:main:reason")
            .replace('{moderator}', author.user.tag)
            .replace('{date}', moment.tz(new Date(Date.now()), guild.translate("language:timezone")).format(guild.translate("language:dateformat")))
            .replace('{reason}', reason);

        member.kick(kickReason)
            .then(() => {
                let embed = new MessageEmbed()
                    .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                    .setDescription(guild.translate("moderation/kick:main:kicked")
                        .replace('{user}', member.user.tag)
                        .replace('{moderator}', author.user.tag)
                        .replace('{reason}', reason)
                        .replace('{emotes.success}', this.client.emotes.success)
                        .replaceAll('{user}', member.user.tag))
                    .setColor(this.client.embedColor)
                    .setFooter({text: data.guild.footer});
                if (message) return message.send(embed, false);
                if (interaction) return interaction.send(embed);
            })
            .catch(() => {
                let embed = new MessageEmbed()
                    .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                    .setDescription(guild.translate("moderation/kick:main:errors:cantKick")
                        .replace('{emotes.error}', this.client.emotes.error)
                        .replace('{emotes.arrow}', this.client.emotes.arrow)
                        .replaceAll('{user}', member.user.tag))
                    .setColor(this.client.embedColor)
                    .setFooter({text: data.guild.footer});
                if (message) return message.send(embed, false);
                if (interaction) return interaction.send(embed);
            })
    }
}

module.exports = Kick;
