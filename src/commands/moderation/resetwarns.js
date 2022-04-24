const Command = require('../../core/command');
const { MessageEmbed} = require('discord.js');
const {SlashCommandBuilder} = require("@discordjs/builders");
const Resolver = require('../../helper/finder');


class Resetwarns extends Command {

    constructor(client) {
        super(client, {
            name: "resetwarns",
            description: "moderation/resetwarns:general:description",
            dirname: __dirname,
            cooldown: 5000,
            memberPermissions: ["KICK_MEMBERS"],
            slashCommand: {
                addCommand: true,
                data: new SlashCommandBuilder()
                    .addUserOption(option =>
                        option.setRequired(true))
            }
        });
    }

    async run(interaction, message, args, data) {
        let guild = interaction?.guild || message?.guild;
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

        const targetData = await this.client.findOrCreateMember({
            guildID: guild.id,
            id: member.user.id
        });

        targetData.warnings.count = 0;
        targetData.warnings.list = [];
        targetData.markModified("warnings");
        await targetData.save();

        let embed = new MessageEmbed()
            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
            .setDescription(guild.translate("moderation/resetwarns:main:cleared")
                .replace('{emotes.success}', this.client.emotes.success)
                .replace('{user}', member.user.tag))
            .setColor(this.client.embedColor)
            .setFooter({text: data.guild.footer});
        if (message) return message.send(embed, false);
        if (interaction) return interaction.send(embed);
    }
}

module.exports = Resetwarns;
