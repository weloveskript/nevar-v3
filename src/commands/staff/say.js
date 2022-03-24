const Command = require('../../core/command');
const {SlashCommandBuilder} = require("@discordjs/builders");
const Resolver = require('../../helper/resolver');

class Say extends Command {
    constructor(client){
        super(client, {
            name: "say",
            dirname: __dirname,
            description: "staff/say:general:description",
            cooldown: 3000,
            staffOnly: true,
            slashCommand: {
                addCommand: false
            }
        });
    }

    async run(interaction, message, args, data){
        let member = interaction?.member || message?.member;
        let channel = interaction?.channel || message?.channel;
        let guild = interaction?.guild || message?.guild;

        if(!args[0]){
            if(message) return message.send(this.client.usageEmbed(guild, this, data));
            if(interaction) return interaction.send(this.client.usageEmbed(guild, this, data));
        }

        channel.send({content: args.join(' ')}).catch(() => {});
    }
}

module.exports = Say;
