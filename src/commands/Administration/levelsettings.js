const Command = require('../../core/command')
    , { MessageEmbed } = require('discord.js')
    , { MessageActionRow, MessageSelectMenu } = require('discord.js');

class Levelsettings extends Command {

    constructor(client) {
        super(client, {
            name: "levelsettings",
            description: "administration/levelsettings:description",
            dirname: __dirname,
            aliases: ["levelmessages", "levelroles", "levelsetting"],
            memberPermissions: ["MANAGE_GUILD"],
            cooldown: 10000,
            slashCommand: {
                addCommand: true,
                options: [
                    {
                        name: "administration/levelsettings:slashOption1",
                        description: "administration/levelsettings:slashOption1Desc",
                        type: "STRING",
                        required: true,
                        choices: [
                            {
                                name: "administration/levelsettings:slashOption1Choice1",
                                value: "channel"
                            },
                            {
                                name: "administration/levelsettings:slashOption1Choice2",
                                value: "messages"

                            },
                            {
                                name: "administration/levelsettings:slashOption1Choice3",
                                value: "roles"
                            }
                        ]
                    }
                ]
            }
        });
    }
    async run(interaction, message, args, data){

        let guild = message?.guild || interaction?.guild
            , member = message?.member || interaction?.member
            , channel = message?.channel || interaction?.channel;
        if(!args[0]){
            let embed = new MessageEmbed()
                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                .setDescription(guild.translate("administration/levelsettings:usage")
                        .replace('{prefix}', data.guild.prefix)
                        .replace('{emotes.use}', this.client.emotes.use) + '\n' +
                    guild.translate("administration/levelsettings:example")
                        .replace('{prefix}', data.guild.prefix)
                        .replace('{emotes.example}', this.client.emotes.example))
                .setColor(this.client.embedColor)
                .setFooter(data.guild.footer);
            if (message) return message.send(embed);
            if (interaction) return interaction.send(embed);
        }
        if(args[0].toLowerCase() === "channel"){
            let embed = new MessageEmbed()
                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                .setDescription(guild.translate("administration/levelsettings:sendChannel")
                    .replace('{emotes.arrow}', this.client.emotes.arrow))
                .setColor(this.client.embedColor)
                .setFooter(data.guild.footer);
            let sent;

            let row = new MessageActionRow()
                .addComponents(
                    new MessageSelectMenu()
                        .setCustomId('select_'+member.user.id)
                        .setPlaceholder(guild.translate("administration/levelsettings:chooseChannel"))
                )
            let option = {
                label: "╰ "+guild.translate("administration/levelsettings:current"),
                value: member.user.id + '_' + 'current'
            }
            row.components[0].options.push(option)
            for(let channel of guild.channels.cache){
                let option = {
                    label: channel[1].name,
                    value: member.user.id+'_'+channel[1].id
                }
                if(channel[1].type === "GUILD_TEXT" || channel[1].type === "GUILD_NEWS") row.components[0].options.push(option)
            }
            if (message) sent = await message.send(embed, false, [row]);
            if (interaction) sent = await interaction.send(embed, false, [row]);
        }

    }
}

module.exports = Levelsettings;
