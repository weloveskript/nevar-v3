const Command = require('../../core/command');
const Resolvers = require('../../helper/resolver');
const { MessageEmbed, MessageActionRow, MessageButton} = require('discord.js');
const {SlashCommandBuilder} = require("@discordjs/builders");

class Autorole extends Command {

    constructor(client) {
        super(client, {
            name: "autorole",
            description: "administration/autorole:general:description",
            dirname: __dirname,
            aliases: ["joinrole"],
            memberPermissions: ["MANAGE_GUILD"],
            cooldown: 2000,
            slashCommand: {
                addCommand: true,
                data: new SlashCommandBuilder()
            }
        });
    }
    async run(interaction, message, args, data){

        const guild = message?.guild || interaction?.guild;
        const channel = message?.channel || interaction?.channel;
        const member = message?.member || interaction?.member;

        let embed = new MessageEmbed()
            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
            .setDescription(guild.translate("language:collectors:action")
                .replace('{emotes.arrow}', this.client.emotes.arrow))
            .setColor(this.client.embedColor)
            .setFooter({text: data.guild.footer});
        let id = message?.member?.user?.id || interaction?.member?.user?.id
        let row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('autorole_' + id + '_add')
                    .setLabel(guild.translate("administration/autorole:main:actions:1"))
                    .setEmoji('➕')
                    .setStyle('SUCCESS'),
                new MessageButton()
                    .setCustomId('autorole_' + id + '_list')
                    .setLabel(guild.translate("administration/autorole:main:actions:2"))
                    .setEmoji('📝')
                    .setDisabled(data.guild.plugins.autoroles.list.length === 0)
                    .setStyle('PRIMARY'),
                new MessageButton()
                    .setCustomId('autorole_' + id + '_remove')
                    .setLabel(guild.translate("administration/autorole:main:actions:3"))
                    .setEmoji('➖')
                    .setDisabled(data.guild.plugins.autoroles.list.length === 0)
                    .setStyle('DANGER'),
            )
        let sent;
        if (message) sent = await message.send(embed, false, [row]);
        if (interaction) sent = await interaction.send(embed, false, [row]);

        const filter = i => i.customId.startsWith('autorole_' + id) && i.user.id === id;

        const clicked = await sent.awaitMessageComponent({filter, time: 120000}).catch(() => {})

        if (clicked) {
            if (clicked.customId === 'autorole_' + id + '_add') {
                let embed = new MessageEmbed()
                    .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                    .setDescription(guild.translate("language:collectors:role")
                        .replace('{emotes.arrow}', this.client.emotes.arrow))
                    .setColor(this.client.embedColor)
                    .setFooter({text: data.guild.footer});
                await clicked.update({embeds: [embed], components: []});
                const collectMessage = channel.createMessageCollector(
                    {
                        filter: m => m.author.id === member.user.id,
                        time: 120000
                    }
                );
                collectMessage.on("collect", async (msg) => {
                    collectMessage.stop();
                    msg.delete().catch(() => {});
                    const role = await Resolvers.resolveRole({
                        message: msg,
                        search: msg.content
                    });
                    if(role){
                        if(data.guild.plugins.autoroles.list.includes(role.id)) {
                            data.guild.plugins.autoroles.list = data.guild.plugins.autoroles.list.filter(s => s !== role.id);
                        }
                        data.guild.plugins.autoroles.list.push(role.id);
                        data.guild.markModified("plugins.autoroles");
                        await data.guild.save();
                        let embed = new MessageEmbed()
                            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                            .setDescription(guild.translate("administration/autorole:main:added")
                                .replace('{role}', role)
                                .replace('{emotes.success}', this.client.emotes.success))
                            .setColor(this.client.embedColor)
                            .setFooter({text: data.guild.footer});
                        return sent.edit({embeds: [embed]});
                    }else{
                        await data.guild.save();
                        let embed = new MessageEmbed()
                            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                            .setDescription(guild.translate("language:invalid:role")
                                .replace('{emotes.error}', this.client.emotes.error))
                            .setColor(this.client.embedColor)
                            .setFooter({text: data.guild.footer});
                        return sent.edit({embeds: [embed]});
                    }
                });
            }
            if (clicked.customId === 'autorole_' + id + '_list') {
                let roles = [];
                for(let id of data.guild.plugins.autoroles.list){
                    let role = guild.roles.cache.get(id);
                    if(role) roles.push(role.name);
                    else data.guild.plugins.autoroles.list = data.guild.plugins.autoroles.list.filter(s => s !== id);

                }
                data.guild.markModified("plugins.autoroles");
                await data.guild.save();
                let embed = new MessageEmbed()
                    .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                    .setDescription(guild.translate("administration/autorole:main:list")
                        .replace('{emotes.arrow}', this.client.emotes.arrow)
                        .replace('{list}', roles.join('\n|- ')))
                    .setColor(this.client.embedColor)
                    .setFooter({text: data.guild.footer});
                return clicked.update({embeds: [embed], components: []});
            }
            if (clicked.customId === 'autorole_' + id + '_remove') {
                let embed = new MessageEmbed()
                    .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                    .setDescription(guild.translate("language:collectors:role")
                        .replace('{emotes.arrow}', this.client.emotes.arrow))
                    .setColor(this.client.embedColor)
                    .setFooter({text: data.guild.footer});
                await clicked.update({embeds: [embed], components: []});
                const collectMessage = channel.createMessageCollector(
                    {
                        filter: m => m.author.id === member.user.id,
                        time: 120000
                    }
                );
                collectMessage.on("collect", async (msg) => {
                    collectMessage.stop();
                    msg.delete().catch(() => {});
                    const role = await Resolvers.resolveRole({
                        message: msg,
                        search: msg.content
                    });
                    if (role) {
                        if (data.guild.plugins.autoroles.list.includes(role.id)) {
                            data.guild.plugins.autoroles.list = data.guild.plugins.autoroles.list.filter(s => s !== role.id);
                            data.guild.markModified("plugins.autoroles");
                            await data.guild.save();
                        }
                        let embed = new MessageEmbed()
                            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                            .setDescription(guild.translate("administration/autorole:main:removed")
                                .replace('{role}', role)
                                .replace('{emotes.success}', this.client.emotes.success))
                            .setColor(this.client.embedColor)
                            .setFooter({text: data.guild.footer});
                        return sent.edit({embeds: [embed]});
                    } else {
                        await data.guild.save();
                        let embed = new MessageEmbed()
                            .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                            .setDescription(guild.translate("language:invalid:role")
                                .replace('{emotes.error}', this.client.emotes.error))
                            .setColor(this.client.embedColor)
                            .setFooter({text: data.guild.footer});
                        return sent.edit({embeds: [embed]});
                    }
                });
            }
        }
    };
}

module.exports = Autorole;
