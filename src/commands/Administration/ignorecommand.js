const Command = require('../../core/command')
    , { MessageEmbed } = require('discord.js');

class Ignorecommand extends Command {

    constructor(client) {
        super(client, {
            name: "ignorecommand",
            description: "administration/ignorecommand:description",
            dirname: __dirname,
            memberPermissions: ["MANAGE_GUILD"],
            aliases: ["ignorecommands", "ignore-commands"],
            premium: true,
            slashCommand: {
                addCommand: true,
                options: [
                    {
                        name: "administration/ignorecommand:slashOption1",
                        description: "administration/ignorecommand:slashOption1Desc",
                        type: "STRING",
                        required: true,
                        choices: [
                            {
                                name: "administration/ignorecommand:slashOption1Choice1",
                                value: "add"
                            },
                            {
                                name: "administration/ignorecommand:slashOption1Choice2",
                                value: "remove"

                            },
                            {
                                name: "administration/ignorecommand:slashOption1Choice3",
                                value: "list"
                            }
                        ]
                    },
                    {
                        name: "administration/ignorecommand:slashOption2",
                        description: "administration/ignorecommand:slashOption2Desc",
                        type: "STRING",
                        required: false
                    }
                ]
            }
        });
    }

    async run(interaction, message, args, data){

        let guild = message?.guild || interaction?.guild;

        if(!args[0]){
            let embed = new MessageEmbed()
                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                .setDescription(guild.translate("administration/ignorecommand:usage")
                        .replace('{prefix}', data.guild.prefix)
                        .replace('{emotes.use}', this.client.emotes.use) + '\n' +
                    guild.translate("administration/ignorecommand:example")
                        .replace('{prefix}', data.guild.prefix)
                        .replace('{emotes.example}', this.client.emotes.example))
                .setColor(this.client.embedColor)
                .setFooter(data.guild.footer);
            if (message) return message.send(embed);
            if (interaction) return interaction.send(embed);
        }

        if(args[0].toLowerCase() === "add"){
            if(!args[1]){
                let embed = new MessageEmbed()
                    .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                    .setDescription(guild.translate("administration/ignorecommand:usage")
                            .replace('{prefix}', data.guild.prefix)
                            .replace('{emotes.use}', this.client.emotes.use) + '\n' +
                        guild.translate("administration/ignorecommand:example")
                            .replace('{prefix}', data.guild.prefix)
                            .replace('{emotes.example}', this.client.emotes.example))
                    .setColor(this.client.embedColor)
                    .setFooter(data.guild.footer);
                if (message) return message.send(embed);
                if (interaction) return interaction.send(embed);
            }
            const cmd = this.client.commands.get(args[1]) || this.client.commands.get(this.client.aliases.get(args[1]));
            if(cmd){
                if(data.guild.disabledCommands.includes(cmd.help.name)){
                    let embed = new MessageEmbed()
                        .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                        .setDescription(guild.translate("administration/ignorecommand:alreadyIgnored")
                                .replace('{emotes.error}', this.client.emotes.error))
                        .setColor(this.client.embedColor)
                        .setFooter(data.guild.footer);
                    if (message) return message.send(embed);
                    if (interaction) return interaction.send(embed);
                }else{
                    data.guild.disabledCommands.push(cmd.help.name);
                    data.guild.markModified("disabledCommand");
                    await data.guild.save();
                    let embed = new MessageEmbed()
                        .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                        .setDescription(guild.translate("administration/ignorecommand:ignored")
                            .replace('{cmd}', cmd.help.name.toString().charAt(0).toUpperCase() + cmd.help.name.toString().slice(1))
                            .replace('{emotes.success}', this.client.emotes.success))
                        .setColor(this.client.embedColor)
                        .setFooter(data.guild.footer);
                    if (message) return message.send(embed);
                    if (interaction) return interaction.send(embed);
                }
            }
        }
        if(args[0].toLowerCase() === "remove"){
            if(!args[1]){
                let embed = new MessageEmbed()
                    .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                    .setDescription(guild.translate("administration/ignorecommand:usage")
                            .replace('{prefix}', data.guild.prefix)
                            .replace('{emotes.use}', this.client.emotes.use) + '\n' +
                        guild.translate("administration/ignorecommand:example")
                            .replace('{prefix}', data.guild.prefix)
                            .replace('{emotes.example}', this.client.emotes.example))
                    .setColor(this.client.embedColor)
                    .setFooter(data.guild.footer);
                if (message) return message.send(embed);
                if (interaction) return interaction.send(embed);
            }
            const cmd = this.client.commands.get(args[1]) || this.client.commands.get(this.client.aliases.get(args[1]));
            if(cmd){
                if(!data.guild.disabledCommands.includes(cmd.help.name)){
                    let embed = new MessageEmbed()
                        .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                        .setDescription(guild.translate("administration/ignorecommand:notIgnored")
                            .replace('{emotes.error}', this.client.emotes.error))
                        .setColor(this.client.embedColor)
                        .setFooter(data.guild.footer);
                    if (message) return message.send(embed);
                    if (interaction) return interaction.send(embed);
                }else{
                    data.guild.disabledCommands = data.guild.disabledCommands.filter(val => val !== cmd.help.name);
                    data.guild.markModified("disabledCommand");
                    await data.guild.save();
                    let embed = new MessageEmbed()
                        .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                        .setDescription(guild.translate("administration/ignorecommand:unignored")
                            .replace('{cmd}', cmd.help.name.toString().charAt(0).toUpperCase() + cmd.help.name.toString().slice(1))
                            .replace('{emotes.success}', this.client.emotes.success))
                        .setColor(this.client.embedColor)
                        .setFooter(data.guild.footer);
                    if (message) return message.send(embed);
                    if (interaction) return interaction.send(embed);
                }
            }
        }
        if(args[0].toLowerCase() === "list"){
            let ignored = [];
            for(let command of data.guild.disabledCommands){
                ignored.push(command);
            }
            if(ignored.length < 1){
                ignored = [guild.translate("language:noEntries")];
            }
            let embed = new MessageEmbed()
                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                .setDescription(guild.translate("administration/ignorecommand:list")
                    .replace('{list}', ignored.join('\n|- '))
                    .replace('{emotes.arrow}', this.client.emotes.arrow))
                .setColor(this.client.embedColor)
                .setFooter(data.guild.footer);
            if (message) return message.send(embed);
            if (interaction) return interaction.send(embed);
        }
    }
}

module.exports = Ignorecommand;
