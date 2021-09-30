const Command = require('../../structure/Command')
    , { MessageEmbed } = require('discord.js')
    , Resolvers = require('../../helper/resolver');

class Doublexp extends Command {

    constructor(client) {
        super(client, {
            name: "doublexp",
            description: "administration/doublexp:description",
            dirname: __dirname,
            aliases: ["doublexproles"],
            memberPermissions: ["MANAGE_GUILD"],
            cooldown: 5000,
            premium: true,
            slashCommand: {
                addCommand: true,
                options: [
                    {
                        name: "administration/doublexp:slashOption1",
                        description: "administration/doublexp:slashOption1Desc",
                        type: "STRING",
                        required: true,
                        choices: [
                            {
                                name: "administration/doublexp:slashOption1Choice1",
                                value: "on"
                            },
                            {
                                name: "administration/doublexp:slashOption1Choice2",
                                value: "off"

                            },
                            {
                                name: "administration/doublexp:slashOption1Choice3",
                                value: "list"
                            }
                        ]

                    },
                    {
                        name: "administration/doublexp:slashOption2",
                        description: "administration/doublexp:slashOption2Desc",
                        type: "ROLE",
                        required: false,
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
                .setDescription(guild.translate("administration/doublexp:usage")
                        .replace('{prefix}', data.guild.prefix)
                        .replace('{emotes.use}', this.client.emotes.use) + '\n' +
                    guild.translate("administration/doublexp:example")
                        .replace('{prefix}', data.guild.prefix)
                        .replace('{emotes.example}', this.client.emotes.example))
                .setColor(this.client.embedColor)
                .setFooter(data.guild.footer);

            if(message) return message.send(embed, false);
            if(interaction) return interaction.send(embed);
        }
        if(args[0].toLowerCase() === 'on'){
            let role = guild.roles.cache.get(args[1]);
            if(message) role = await Resolvers.resolveRole({
                message,
                search: args.slice(1).join(" ")
            });

            if(!role){
                let embed = new MessageEmbed()
                    .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                    .setDescription(guild.translate("administration/doublexp:usage")
                            .replace('{prefix}', data.guild.prefix)
                            .replace('{emotes.use}', this.client.emotes.use) + '\n' +
                        guild.translate("administration/doublexp:example")
                            .replace('{prefix}', data.guild.prefix)
                            .replace('{emotes.example}', this.client.emotes.example))
                    .setColor(this.client.embedColor)
                    .setFooter(data.guild.footer);

                if(message) return message.send(embed, false);
                if(interaction) return interaction.send(embed);
            }

            for(let val of data.guild.doubleXpRoles){
                if(val === role.id){
                    data.guild.doubleXpRoles = data.guild.doubleXpRoles.filter((ch) => ch !== val)
                }
            }
            data.guild.doubleXpRoles.push(role.id);
            data.guild.markModified("doubleXpRoles");
            await data.guild.save();

            let embed = new MessageEmbed()
                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                .setDescription(guild.translate("administration/doublexp:activated")
                        .replace('{role}', role)
                        .replace('{emotes.success}', this.client.emotes.success))
                .setColor(this.client.embedColor)
                .setFooter(data.guild.footer);

            if(message) return message.send(embed, false);
            if(interaction) return interaction.send(embed);
        }
        if(args[0].toLowerCase() === 'off'){
            let role = guild.roles.cache.get(args[1]);
            if(message) role = await Resolvers.resolveRole({
                message,
                search: args.slice(1).join(" ")
            });

            if(!role){
                let embed = new MessageEmbed()
                    .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                    .setDescription(guild.translate("administration/doublexp:usage")
                            .replace('{prefix}', data.guild.prefix)
                            .replace('{emotes.use}', this.client.emotes.use) + '\n' +
                        guild.translate("administration/doublexp:example")
                            .replace('{prefix}', data.guild.prefix)
                            .replace('{emotes.example}', this.client.emotes.example))
                    .setColor(this.client.embedColor)
                    .setFooter(data.guild.footer);

                if(message) return message.send(embed, false);
                if(interaction) return interaction.send(embed);
            }
            data.guild.doubleXpRoles = data.guild.doubleXpRoles.filter((ch) => ch !== role.id);
            data.guild.markModified("doubleXpRoles");
            await data.guild.save();
            let embed = new MessageEmbed()
                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                .setDescription(guild.translate("administration/doublexp:deactivated")
                    .replace('{role}', role)
                    .replace('{emotes.success}', this.client.emotes.success))
                .setColor(this.client.embedColor)
                .setFooter(data.guild.footer);
            if(message) return message.send(embed, false);
            if(interaction) return interaction.send(embed);
        }
        if(args[0].toLowerCase() === 'list'){
            let doubleXp = [];
            for(let id of data.guild.doubleXpRoles){
                let role = guild.roles.cache.get(id)
                if(role) doubleXp.push(role)
            }
            if(doubleXp.length < 1) doubleXp = [guild.translate("language:noEntries")];


            let embed = new MessageEmbed()
                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                .setDescription(guild.translate("administration/doublexp:list")
                    .replace('{list}', doubleXp.join('\n'+this.client.emotes.arrow+' '))
                    .replace('{emotes.arrow}', this.client.emotes.arrow)
                    .replace('{emotes.success}', this.client.emotes.success))
                .setColor(this.client.embedColor)
                .setFooter(data.guild.footer);
            if(message) return message.send(embed, false);
            if(interaction) return interaction.send(embed);
        }
    }
}
module.exports = Doublexp;
