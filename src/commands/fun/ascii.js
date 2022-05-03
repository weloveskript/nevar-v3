const Command = require("../../core/command");
const {SlashCommandBuilder} = require("@discordjs/builders");
const figlet = require('figlet');
const figletAsync = require('util').promisify(figlet);

class Ascii extends Command {
    constructor(client) {
        super(client, {
            name: "ascii",
            dirname: __dirname,
            description: "fun/ascii:general:description",
            cooldown: 3000,
            slashCommand: {
                addCommand: true,
                data:
                    new SlashCommandBuilder()
                        .addStringOption(option =>
                            option.setRequired(true))
            }
        });
    }

    async run(interaction, message, args, data) {

        let guild = interaction?.guild || message?.guild;
        let channel = interaction?.channel || message?.channel;
        let member = interaction?.member || message?.member;

        let text = args.join(" ");

        if(!text || text.length > 15){
            if(message) return message.send(this.client.usageEmbed(guild, this, data));
            if(interaction) return interaction.send(this.client.usageEmbed(guild, this, data));
        }

        let rendered = await figletAsync(text);

        channel.send({content:'```' + rendered + '```'});
    }
}

module.exports = Ascii;
