const Command = require('../../core/command');
const {SlashCommandBuilder} = require("@discordjs/builders");
const Resolver = require('../../helper/finder');

class Op extends Command {
    constructor(client){
        super(client, {
            name: "op",
            dirname: __dirname,
            description: "staff/op:general:description",
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
        if(args[0]){
            member = await Resolver.resolveMember(({
                message: message,
                search: args[0],
            }));
        }
        if(!member) member = interaction?.member || message?.member
        let userName = member.user.username;

        channel.send({content: guild.translate("staff/op:main:message")
                .replace('{user}', userName)})


    }
}

module.exports = Op;
