const Command = require('../../core/command');
const { MessageEmbed } = require('discord.js');
const {SlashCommandBuilder} = require("@discordjs/builders");
const premium = require('../../managers/premiumkeys');

class Usekey extends Command {

    constructor(client) {
        super(client, {
            name: "usekey",
            description: "administration/usekey:general:description",
            dirname: __dirname,
            aliases: ["redeemcode", "redeem-code", "redeem", "redeemkey", "redeem-key"],
            memberPermissions: ["MANAGE_GUILD"],
            cooldown: 10000,
            slashCommand: {
                addCommand: true,
                data:
                    new SlashCommandBuilder()
                        .addStringOption(option => option.setRequired(true))
            }
        });
    }

    async run(interaction, message, args, data){
        const guild = message?.guild || interaction?.guild;

        if(!args[0]){
            if(message) return message.send(this.client.usageEmbed(guild, this, data));
            if(interaction) return interaction.send(this.client.usageEmbed(guild, this, data));
        }

        if(premium.validateKey(args[0])){
            if(!data.guild.premium){
                let redeemed = premium.redeemKey(args[0]);
                if(redeemed){
                    data.guild.premium = true;
                    data.guild.markModified("premium");
                    await data.guild.save();
                    let embed = new MessageEmbed()
                        .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                        .setDescription(guild.translate("administration/usekey:main:redeemed")
                            .replace('{emotes.success}', this.client.emotes.success))
                        .setColor(this.client.embedColor)
                        .setFooter({text: data.guild.footer});
                    if(message) await message.send(embed);
                    if(interaction) await interaction.send(embed);
                }else{
                    let embed = new MessageEmbed()
                        .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                        .setDescription(guild.translate("administration/usekey:main:invalid")
                            .replace('{emotes.error}', this.client.emotes.error)
                            .replace('{emotes.arrow}', this.client.emotes.arrow)
                            .replace('{emotes.arrow}', this.client.emotes.arrow)
                            .replace('{support}', this.client.supportUrl))
                        .setColor(this.client.embedColor)
                        .setFooter({text: data.guild.footer});
                    if(message) return message.send(embed, false);
                    if(interaction) return interaction.send(embed);
                }
            }else{
                let embed = new MessageEmbed()
                    .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                    .setDescription(guild.translate("administration/usekey:main:alreadyActivated")
                        .replace('{emotes.error}', this.client.emotes.error))
                    .setColor(this.client.embedColor)
                    .setFooter({text: data.guild.footer});
                if(message) return message.send(embed);
                if(interaction) return  interaction.send(embed);
            }
        }else{
            let embed = new MessageEmbed()
                .setAuthor({name: this.client.user.username, iconURL: this.client.user.displayAvatarURL(), url: this.client.website})
                .setDescription(guild.translate("administration/usekey:main:invalid")
                    .replace('{emotes.error}', this.client.emotes.error)
                    .replace('{emotes.arrow}', this.client.emotes.arrow)
                    .replace('{emotes.arrow}', this.client.emotes.arrow)
                    .replace('{support}', this.client.supportUrl))
                .setColor(this.client.embedColor)
                .setFooter({text: data.guild.footer});
            if(message) return message.send(embed, false);
            if(interaction) return interaction.send(embed);
        }
    }
}

module.exports = Usekey;
