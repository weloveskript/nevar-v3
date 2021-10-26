const Command = require('../../core/command')
    , { MessageEmbed } = require('discord.js');

class Blacklist extends Command {

    constructor(client) {
        super(client, {
            name: "blacklist",
            description: "administration/blacklist:description",
            dirname: __dirname,
            aliases: ["bl"],
            memberPermissions: ["MANAGE_GUILD"],
            premium: true,
            cooldown: 3000,
            slashCommand: {
                addCommand: true,
                options: [
                    {
                        name: "administration/blacklist:slashOption1",
                        description: "administration/blacklist:slashOption1Desc",
                        type: "STRING",
                        required: true,
                        choices: [
                            {
                                name: "administration/blacklist:slashOption1Choice1",
                                value: "add"
                            },
                            {
                                name: "administration/blacklist:slashOption1Choice2",
                                value: "remove"

                            },
                            {
                                name: "administration/blacklist:slashOption1Choice3",
                                value: "reset"
                            },
                            {
                                name: "administration/blacklist:slashOption1Choice4",
                                value: "list"
                            }
                        ]
                    },
                    {
                        name: "administration/blacklist:slashOption2",
                        description: "administration/blacklist:slashOption2Desc",
                        type: "STRING",
                        required: false
                    }
                ]
            }
        });

    }

    async run(interaction, message, args, data){

        if(!data.guild.plugins.blacklist?.list){
            data.guild.plugins.blacklist = {
                list: []
            }
            data.guild.markModified("plugins.blacklist");
            await data.guild.save();
        }

        let guild = message?.guild || interaction?.guild;
        if(!args[0]){
            let embed = new MessageEmbed()
                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                .setDescription(guild.translate("administration/blacklist:usage")
                        .replace('{prefix}', data.guild.prefix)
                        .replace('{emotes.use}', this.client.emotes.use) + '\n' +
                    guild.translate("administration/blacklist:example")
                        .replace('{prefix}', data.guild.prefix)
                        .replace('{emotes.example}', this.client.emotes.example))
                .setColor(this.client.embedColor)
                .setFooter(data.guild.footer);
            if (message) return message.send(embed);
            if (interaction) return interaction.send(embed);
        }
        if(args[0].toLowerCase() === 'add'){
            if(!args[1]){
                let embed = new MessageEmbed()
                    .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                    .setDescription(guild.translate("administration/blacklist:usage")
                            .replace('{prefix}', data.guild.prefix)
                            .replace('{emotes.use}', this.client.emotes.use) + '\n' +
                        guild.translate("administration/blacklist:example")
                            .replace('{prefix}', data.guild.prefix)
                            .replace('{emotes.example}', this.client.emotes.example))
                    .setColor(this.client.embedColor)
                    .setFooter(data.guild.footer);
                if (message) return message.send(embed);
                if (interaction) return interaction.send(embed);
            }else{
                if(data.guild.plugins.blacklist.list.includes(args[1].toLowerCase())){
                    data.guild.plugins.blacklist.list = data.guild.plugins.blacklist.list.filter((val) => val !== args[1].toLowerCase())
                }
                data.guild.plugins.blacklist.list.push(args[1].toLowerCase());
                data.guild.markModified("plugins.blacklist");
                await data.guild.save();
                let embed = new MessageEmbed()
                    .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                    .setDescription(guild.translate("administration/blacklist:added")
                        .replace('{word}', args[1])
                        .replace('{emotes.success}', this.client.emotes.success))
                    .setColor(this.client.embedColor)
                    .setFooter(data.guild.footer);
                if (message) return message.send(embed);
                if (interaction) return interaction.send(embed);

            }
        }
        if(args[0].toLowerCase() === 'remove'){
            if(!args[1]){
                let embed = new MessageEmbed()
                    .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                    .setDescription(guild.translate("administration/blacklist:usage")
                            .replace('{prefix}', data.guild.prefix)
                            .replace('{emotes.use}', this.client.emotes.use) + '\n' +
                        guild.translate("administration/blacklist:example")
                            .replace('{prefix}', data.guild.prefix)
                            .replace('{emotes.example}', this.client.emotes.example))
                    .setColor(this.client.embedColor)
                    .setFooter(data.guild.footer);
                if (message) return message.send(embed);
                if (interaction) return interaction.send(embed);
            }else{
                if(data.guild.plugins.blacklist.list.includes(args[1].toLowerCase())){
                    data.guild.plugins.blacklist.list = data.guild.plugins.blacklist.list.filter((val) => val !== args[1].toLowerCase())
                    data.guild.markModified("plugins.blacklist");
                    await data.guild.save();
                    let embed = new MessageEmbed()
                        .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                        .setDescription(guild.translate("administration/blacklist:removed")
                            .replace('{word}', args[1])
                            .replace('{emotes.success}', this.client.emotes.success))
                        .setColor(this.client.embedColor)
                        .setFooter(data.guild.footer);
                    if (message) return message.send(embed);
                    if (interaction) return interaction.send(embed);
                }else{
                    let embed = new MessageEmbed()
                        .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                        .setDescription(guild.translate("administration/blacklist:isNotAdded")
                            .replace('{word}', args[1])
                            .replace('{emotes.error}', this.client.emotes.error))
                        .setColor(this.client.embedColor)
                        .setFooter(data.guild.footer);
                    if (message) return message.send(embed);
                    if (interaction) return interaction.send(embed);
                }


            }
        }
        if(args[0].toLowerCase() === 'reset'){
            data.guild.plugins.blacklist.list = [];
            data.guild.markModified("plugins.blacklist");
            await data.guild.save();
            let embed = new MessageEmbed()
                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                .setDescription(guild.translate("administration/blacklist:resetted")
                    .replace('{emotes.success}', this.client.emotes.success))
                .setColor(this.client.embedColor)
                .setFooter(data.guild.footer);
            if (message) return message.send(embed);
            if (interaction) return interaction.send(embed);
        }
        if(args[0].toLowerCase() === 'list'){
            let filter = data.guild.plugins.blacklist.list.join(`\n${this.client.emotes.arrow} `);

            if(filter.length === 0) filter = [guild.translate("administration/blacklist:noWords")];

            let embed = new MessageEmbed()
                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                .setDescription(guild.translate("administration/blacklist:list")
                    .replace('{emotes.success}', this.client.emotes.success)
                    .replace('{list}', this.client.emotes.arrow + ' ' + filter))
                .setColor(this.client.embedColor)
                .setFooter(data.guild.footer);
            if (message) return message.send(embed);
            if (interaction) return interaction.send(embed);
        }

    }
}

module.exports = Blacklist;
