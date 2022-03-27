const Command = require('../../core/command');

class Evaluate extends Command {
    constructor(client){
        super(client, {
            name: "evaluate",
            dirname: __dirname,
            description: "owner/evaluate:general:description",
            cooldown: 3000,
            ownerOnly: true,
            slashCommand: {
                addCommand: false
            }
        });
    }

    async run(interaction, message, args, data){
        let content = args.join(" ");
        new Promise(async (resolve) => resolve(await eval(content)));
    }
}

module.exports = Evaluate;
