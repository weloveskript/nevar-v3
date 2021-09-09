const Command = require('../../structure/Command')
    , Resolvers = require('../../helper/resolver')
    , { MessageEmbed } = require('discord.js');

class Autorole extends Command {

    constructor(client) {
        super(client, {
            name: "autorole",
            description: "administration/autorole:description",
            dirname: __dirname,
            aliases: ["joinrole"],
            memberPermissions: ["MANAGE_GUILD"],
            cooldown: 3000,
            slashCommand: {
                addCommand: true,
                options: [
                    {
                        name: "administration/autorole:slashOption1",
                        description: "administration/autorole:slashOption1Desc",
                        type: "STRING",
                        required: true,
                        choices: [
                            {
                                name: "administration/autorole:slashOption1Choice1",
                                value: "bot"
                            },
                            {
                                name: "administration/autorole:slashOption1Choice2",
                                value: "user"

                            },
                        ]
                    },
                    {
                        name: "administration/autorole:slashOption2",
                        description: "administration/autorole:slashOption2Desc",
                        type: "STRING",
                        required: true,
                        choices: [
                            {
                                name: "administration/autorole:slashOption2Choice1",
                                value: "add"
                            },
                            {
                                name: "administration/autorole:slashOption2Choice2",
                                value: "remove"

                            },
                        ]
                    },
                    {
                        name: "administration/autorole:slashOption3",
                        description: "administration/autorole:slashOption3Desc",
                        type: "ROLE",
                        required: false
                    }
                ]

            }
        });
    }
    async run(interaction, message, args, data){
        if(!data.guild.plugins?.autorole?.user){
            data.guild.plugins.autorole.user = [];
            data.guild.markModified("plugins.autorole");
            await data.guild.save();
        }
        if(!data.guild.plugins?.autorole?.bot){
            data.guild.plugins.autorole.bot = [];
            data.guild.markModified("plugins.autorole");
            await data.guild.save();
        }
        let guild = interaction?.guild || message?.guild;
        if(!args[0]){
            let embed = new MessageEmbed()
                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                .setDescription(guild.translate("administration/autorole:usage")
                        .replace('{prefix}', data.guild.prefix)
                        .replace('{emotes.use}', this.client.emotes.use) + '\n' +
                    guild.translate("administration/autorole:example")
                        .replace('{prefix}', data.guild.prefix)
                        .replace('{emotes.example}', this.client.emotes.example)
                        .replace('{channel}', message?.channel?.name || interaction?.channel?.name))
                .setColor(this.client.embedColor)
                .setFooter(data.guild.footer);
            if (message) return message.send(embed);
            if (interaction) return interaction.send(embed);
        }
        let type = args[0].toLowerCase();
        if(args[0].toLowerCase() === 'list'){
            let botRolesRaw = data.guild.plugins.autorole.bot;
            let userRolesRaw = data.guild.plugins.autorole.user;
            let botRoles = [];
            let userRoles = [];
            for(let id of botRolesRaw){
                let role = guild.roles.cache.get(id);
                if(role) botRoles.push('<@&'+id+'>');
            }
            for(let id of userRolesRaw){
                let role = guild.roles.cache.get(id);
                if(role) userRoles.push('<@&'+id+'>');
            }
            if(botRoles.length === 0 || !botRoles) botRoles = [guild.translate("language:noEntries")]
            if(userRoles.length === 0 || !userRoles) userRoles = [guild.translate("language:noEntries")]
            let embed = new MessageEmbed()
                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                .setDescription(guild.translate("administration/autorole:list")
                    .replace('{emotes.success}', this.client.emotes.success)
                    .replace('{emotes.crown}', this.client.emotes.crown)
                    .replace('{emotes.arrow}', this.client.emotes.arrow)
                    .replace('{userRoles}', userRoles.join(`\n${this.client.emotes.arrow} `))
                    .replace('{emotes.crown}', this.client.emotes.crown)
                    .replace('{emotes.arrow}', this.client.emotes.arrow)
                    .replace('{botRoles}', botRoles.join(`\n${this.client.emotes.arrow} `)))
                .setColor(this.client.embedColor)
                .setFooter(data.guild.footer);
            if (message) return message.send(embed);
            if (interaction) return interaction.send(embed);
            return;
        }
        if(!args[1]){
            let embed = new MessageEmbed()
                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                .setDescription(guild.translate("administration/autorole:usage")
                        .replace('{prefix}', data.guild.prefix)
                        .replace('{emotes.use}', this.client.emotes.use) + '\n' +
                    guild.translate("administration/autorole:example")
                        .replace('{prefix}', data.guild.prefix)
                        .replace('{emotes.example}', this.client.emotes.example)
                        .replace('{channel}', message?.channel?.name || interaction?.channel?.name))
                .setColor(this.client.embedColor)
                .setFooter(data.guild.footer);
            if (message) return message.send(embed);
            if (interaction) return interaction.send(embed);
        }
        if(args[1].toLowerCase() === 'add'){
            if(!args[2]){
                let embed = new MessageEmbed()
                    .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                    .setDescription(guild.translate("administration/autorole:usage")
                            .replace('{prefix}', data.guild.prefix)
                            .replace('{emotes.use}', this.client.emotes.use) + '\n' +
                        guild.translate("administration/autorole:example")
                            .replace('{prefix}', data.guild.prefix)
                            .replace('{emotes.example}', this.client.emotes.example)
                            .replace('{channel}', message?.channel?.name || interaction?.channel?.name))
                    .setColor(this.client.embedColor)
                    .setFooter(data.guild.footer);
                if (message) return message.send(embed);
                if (interaction) return interaction.send(embed);
            }
            let role = guild.roles.cache.get(args[2]);
            if(message) role = await Resolvers.resolveRole({
                message,
                search: args.slice(2).join(" ")
            });
            if(!role){
                let embed = new MessageEmbed()
                    .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                    .setDescription(guild.translate("administration/autorole:usage")
                            .replace('{prefix}', data.guild.prefix)
                            .replace('{emotes.use}', this.client.emotes.use) + '\n' +
                        guild.translate("administration/autorole:example")
                            .replace('{prefix}', data.guild.prefix)
                            .replace('{emotes.example}', this.client.emotes.example)
                            .replace('{channel}', message?.channel?.name || interaction?.channel?.name))
                    .setColor(this.client.embedColor)
                    .setFooter(data.guild.footer);
                if (message) return message.send(embed);
                if (interaction) return interaction.send(embed);
            }
            if(type === 'user'){
                if(data.guild.plugins.autorole.user.includes(role.id)){
                    data.guild.plugins.autorole.user = data.guild.plugins.autorole.user.filter((val) => val !== role.id);
                }
                data.guild.plugins.autorole.user.push(role.id);
                data.guild.markModified("plugins.autorole");
                await data.guild.save();

                let embed = new MessageEmbed()
                    .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                    .setDescription(guild.translate("administration/autorole:userRoleAdded")
                        .replace('{role}', role)
                        .replace('{emotes.success}', this.client.emotes.success))
                    .setColor(this.client.embedColor)
                    .setFooter(data.guild.footer);
                if (message) return message.send(embed);
                if (interaction) return interaction.send(embed);
            }else if(type === 'bot'){
                if(data.guild.plugins.autorole.bot.includes(role.id)){
                    data.guild.plugins.autorole.bot = data.guild.plugins.autorole.bot.filter((val) => val !== role.id);
                }
                data.guild.plugins.autorole.bot.push(role.id);
                data.guild.markModified("plugins.autorole");
                await data.guild.save();

                let embed = new MessageEmbed()
                    .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                    .setDescription(guild.translate("administration/autorole:botRoleAdded")
                        .replace('{role}', role)
                        .replace('{emotes.success}', this.client.emotes.success))
                    .setColor(this.client.embedColor)
                    .setFooter(data.guild.footer);
                if (message) return message.send(embed);
                if (interaction) return interaction.send(embed);
            }

        }
        if(args[1].toLowerCase() === 'remove'){
            if(!args[2]){
                let embed = new MessageEmbed()
                    .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                    .setDescription(guild.translate("administration/autorole:usage")
                            .replace('{prefix}', data.guild.prefix)
                            .replace('{emotes.use}', this.client.emotes.use) + '\n' +
                        guild.translate("administration/autorole:example")
                            .replace('{prefix}', data.guild.prefix)
                            .replace('{emotes.example}', this.client.emotes.example)
                            .replace('{channel}', message?.channel?.name || interaction?.channel?.name))
                    .setColor(this.client.embedColor)
                    .setFooter(data.guild.footer);
                if (message) return message.send(embed);
                if (interaction) return interaction.send(embed);
            }

            let role = guild.roles.cache.get(args[2]);
            if(message) role = await Resolvers.resolveRole({
                message,
                search: args.slice(2).join(" ")
            });
            if(!role){
                let embed = new MessageEmbed()
                    .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                    .setDescription(guild.translate("administration/autorole:usage")
                            .replace('{prefix}', data.guild.prefix)
                            .replace('{emotes.use}', this.client.emotes.use) + '\n' +
                        guild.translate("administration/autorole:example")
                            .replace('{prefix}', data.guild.prefix)
                            .replace('{emotes.example}', this.client.emotes.example)
                            .replace('{channel}', message?.channel?.name || interaction?.channel?.name))
                    .setColor(this.client.embedColor)
                    .setFooter(data.guild.footer);
                if (message) return message.send(embed);
                if (interaction) return interaction.send(embed);
            }
            if(type === 'user'){
                let state;
                if(data.guild.plugins.autorole.user.includes(role.id)){
                    data.guild.plugins.autorole.user = data.guild.plugins.autorole.user.filter((s) => s !== role.id);
                    data.guild.markModified("plugins.autorole");
                    await data.guild.save();
                    state = true;
                }
                if(state){
                    let embed = new MessageEmbed()
                        .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                        .setDescription(guild.translate("administration/autorole:userRoleRemoved")
                            .replace('{role}', role)
                            .replace('{emotes.success}', this.client.emotes.success))
                        .setColor(this.client.embedColor)
                        .setFooter(data.guild.footer);
                    if (message) return message.send(embed);
                    if (interaction) return interaction.send(embed);
                }else{
                    let embed = new MessageEmbed()
                        .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                        .setDescription(guild.translate("administration/autorole:notAdded")
                            .replace('{role}', role)
                            .replace('{emotes.error}', this.client.emotes.error))
                        .setColor(this.client.embedColor)
                        .setFooter(data.guild.footer);
                    if (message) return message.send(embed);
                    if (interaction) return interaction.send(embed);
                }

            }
            if(type === 'bot'){
                let state;
                if(data.guild.plugins.autorole.bot.includes(role.id)){
                    data.guild.plugins.autorole.bot = data.guild.plugins.autorole.bot.filter((s) => s !== role.id);
                    data.guild.markModified("plugins.autorole");
                    await data.guild.save();
                    state = true;
                }
                if(state){
                    let embed = new MessageEmbed()
                        .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                        .setDescription(guild.translate("administration/autorole:botRoleRemoved")
                            .replace('{role}', role)
                            .replace('{emotes.success}', this.client.emotes.success))
                        .setColor(this.client.embedColor)
                        .setFooter(data.guild.footer);
                    if (message) return message.send(embed);
                    if (interaction) return interaction.send(embed);
                }else{
                    let embed = new MessageEmbed()
                        .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                        .setDescription(guild.translate("administration/autorole:notAdded")
                            .replace('{role}', role)
                            .replace('{emotes.error}', this.client.emotes.error))
                        .setColor(this.client.embedColor)
                        .setFooter(data.guild.footer);
                    if (message) return message.send(embed);
                    if (interaction) return interaction.send(embed);
                }
            }
        }
    }
}

module.exports = Autorole;
