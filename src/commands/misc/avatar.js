const Command = require('../../core/command');
const {SlashCommandBuilder} = require("@discordjs/builders");
const {MessageEmbed} = require("discord.js");
const Resolver = require('../../helper/finder');

class Avatar extends Command {
    constructor(client) {
        super(client, {
            name: "avatar",
            dirname: __dirname,
            description: "misc/avatar:general:description",
            cooldown: 3000,
            slashCommand: {
                addCommand: true,
                data:
                    new SlashCommandBuilder()
                        .addUserOption(option =>
                            option.setRequired(false))
            }
        });
    }

    async run(interaction, message, args, data) {

        let guild = interaction?.guild || message?.guild;
        let member = interaction?.member || message?.member;

        let user = args[0] ? await guild.members.fetch(args[0]).catch(() => {}) : undefined;
        if(message && args[0]) user = await Resolver.resolveMember({
            message: message,
            search: args[0]
        });
        if(!user) user = member;

        let embed = new MessageEmbed()
            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
            .setTitle(guild.translate('misc/avatar:main:avatar')
                .replace('{user}', user.user.tag))
            .setImage(user.user.displayAvatarURL({dynamic: true, size: 2048}))
            .setColor(this.client.embedColor)
            .setFooter({text: data.guild.footer});
        if (message) return message.send(embed);
        if (interaction) return interaction.send(embed);
    }
}

module.exports = Avatar;
