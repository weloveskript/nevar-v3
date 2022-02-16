const Command = require('../../core/command');
const { MessageEmbed} = require('discord.js');
const {SlashCommandBuilder} = require("@discordjs/builders");
const Resolver = require('../../helper/resolver');
const ms = require('ms');

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

        let fetchUser;

        if(interaction) fetchUser = (await guild.members.fetch(args[0])).id;
        if(message) {
            fetchUser = await Resolver.resolveMember({
                message: message,
                search: args[0]
            });
            fetchUser = fetchUser?.user?.id;
        }


        let banData = {
            user: fetchUser,
            time: ms(args.slice(-1)[0]) ? args.slice(-1)[0] : null,
            reason: ms(args.slice(-1)[0]) ? args.slice(1).join(' ').replace(ms(args.slice(-1)[0]) ? args.slice(-1)[0] : null, '').trim() : args.slice(1).join(' ')
        }

        if(!banData.user || banData.user.length !== 18 || !parseInt(banData.user)){
            if(message) return message.send(this.client.usageEmbed(guild, this, data));
            if(interaction) return interaction.send(this.client.usageEmbed(guild, this, data));
        }
        console.log(banData)

    }
}

module.exports = Ban;
