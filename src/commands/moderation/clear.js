const Command = require('../../core/command');
const { MessageEmbed} = require('discord.js');
const {SlashCommandBuilder} = require("@discordjs/builders");

class Clear extends Command {

    constructor(client) {
        super(client, {
            name: "clear",
            description: "moderation/clear:general:description",
            dirname: __dirname,
            memberPermissions: ["MANAGE_MESSAGES"],
            botPermissions: ["MANAGE_MESSAGES"],
            cooldown: 5000,
            slashCommand: {
                addCommand: true,
                data: new SlashCommandBuilder()
                    .addIntegerOption(option =>
                        option.setRequired(true))
                    .addUserOption(option =>
                        option.setRequired(false))
            }
        });
    }

    async run(interaction, message, args, data) {
        let guild = interaction?.guild || message?.guild;
        let channel = interaction?.channel || message?.channel;

        if(message) await message.delete().catch(() => {});

        if (!args[0]) {
            if (message) return message.send(this.client.usageEmbed(guild, this, data));
            if (interaction) return interaction.send(this.client.usageEmbed(guild, this, data));
        }

        let amount = args[0];
        if (!amount || isNaN(amount) || parseInt(amount) < 1) {
            if (message) return message.send(this.client.usageEmbed(guild, this, data));
            if (interaction) return interaction.send(this.client.usageEmbed(guild, this, data));
        }

        let user;
        user = await this.client.users.fetch(args[1]).catch(() => {});
        if (message) user = await this.client.resolveUser(args[1]);

        if(parseInt(amount) > 100){
            if (message) return message.send(this.client.usageEmbed(guild, this, data));
            if (interaction) return interaction.send(this.client.usageEmbed(guild, this, data));
        }

        let messages = Array.from((await channel.messages.fetch({limit: parseInt(amount)})).values());

        if (user)
            messages = messages.filter((m) => m.author.id === user.id);
        messages = messages.filter((m) => !m.pinned);

        channel.bulkDelete(messages, true).catch((e) => {});

        let embed = new MessageEmbed()
            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
            .setDescription((user ? guild.translate("moderation/clear:main:deletedUser") : guild.translate("moderation/clear:main:deleted"))
                .replace('{emotes.success}', this.client.emotes.success)
                .replace('{count}', messages.length)
                .replace('{user}', user?.tag))
            .setColor(this.client.embedColor)
            .setFooter({text: data.guild.footer});
        let sent;
        if(message) sent = await channel.send({embeds:[embed]});
        if(interaction) sent = await interaction.send(embed);
        await this.client.wait(7000);
        sent.delete().catch(() => {});
    }
}

module.exports = Clear;
