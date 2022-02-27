const Command = require('../../core/command');
const { MessageEmbed} = require('discord.js');
const {SlashCommandBuilder} = require("@discordjs/builders");

class Unban extends Command {

    constructor(client) {
        super(client, {
            name: "unban",
            description: "moderation/unban:general:description",
            dirname: __dirname,
            cooldown: 5000,
            memberPermissions: ["BAN_MEMBERS"],
            slashCommand: {
                addCommand: true,
                data: new SlashCommandBuilder()
                    .addStringOption(option =>
                        option.setRequired(true))
            }
        });
    }

    async run(interaction, message, args, data) {
        let guild = interaction?.guild || message?.guild;
        let channel = interaction?.channel || message?.channel;

        let user = await this.client.users.fetch(args[0]).catch(() => {});
        if(message) user = await this.client.resolveUser(args[0]);

        if(!user){
            if (message) return message.send(this.client.usageEmbed(guild, this, data));
            if (interaction) return interaction.send(this.client.usageEmbed(guild, this, data));
        }

        const guildBans = await guild.bans.fetch();
        if(!guildBans.some((u) => u.user.id === user.id)){
            let embed = new MessageEmbed()
                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                .setDescription(guild.translate("moderation/unban:main:errors:notBanned")
                    .replace('{emotes.error}', this.client.emotes.error)
                    .replace('{user}', user.tag))
                .setColor(this.client.embedColor)
                .setFooter({text: data.guild.footer});
            if (message) return message.send(embed, false);
            if (interaction) return interaction.send(embed);
        }

        guild.members.unban(user.id).catch(() => {});

        let bannedUserData = await this.client.findOrCreateMember({
            guildID: guild.id,
            id: user.id
        });
        bannedUserData.ban.banned = false;
        bannedUserData.ban.reason = null;
        bannedUserData.ban.moderator = {
            id: null,
            tag: null
        };
        bannedUserData.ban.bannedAt = null;
        bannedUserData.ban.endDate = null;
        bannedUserData.markModified("ban");
        await bannedUserData.save();
        this.client.databaseCache.bannedUsers.delete(bannedUserData.id + bannedUserData.guildID);

        let embed = new MessageEmbed()
            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
            .setDescription(guild.translate("moderation/unban:main:unbanned")
                .replace('{emotes.success}', this.client.emotes.success)
                .replace('{user}', user.tag))
            .setColor(this.client.embedColor)
            .setFooter({text: data.guild.footer});
        if (message) return message.send(embed, false);
        if (interaction) return interaction.send(embed);
    }
}
module.exports = Unban;
