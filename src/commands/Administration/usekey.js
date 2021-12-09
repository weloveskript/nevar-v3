const Command = require('../../core/command');
const { MessageEmbed } = require('discord.js');
const fs = require('fs');

class Usekey extends Command {

    constructor(client) {
        super(client, {
            name: "usekey",
            description: "administration/usekey:description",
            dirname: __dirname,
            aliases: ["redeemcode", "redeem-code", "redeen", "redeemkey", "redeem-key"],
            memberPermissions: ["MANAGE_GUILD"],
            cooldown: 10000,
            slashCommand: {
                addCommand: true,
                options: [
                    {
                        name: "administration/usekey:slashOption1",
                        description: "administration/usekey:slashOption1Desc",
                        type: "STRING",
                        required: true,
                    },
                ]
            }
        });
    }

    async run(interaction, message, args, data){
        let guild = message?.guild || interaction?.guild;

        if(!args[0]){
            let embed = new MessageEmbed()
                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                .setDescription(guild.translate("administration/usekey:usage")
                        .replace('{prefix}', data.guild.prefix)
                        .replace('{emotes.use}', this.client.emotes.use) + '\n' +
                    guild.translate("administration/usekey:example")
                        .replace('{prefix}', data.guild.prefix)
                        .replace('{emotes.example}', this.client.emotes.example))
                .setColor(this.client.embedColor)
                .setFooter(data.guild.footer);
            if(message) return message.send(embed, false);
            if(interaction) return interaction.send(embed);
        }

        let path = 'storage/premiumKeys.json';
        let json = JSON.parse(fs.readFileSync(path));
        let key = args[0];

        if(json[key]){
            let i = 1;
            let uses = 0;

            if(isNaN(json[key])){
                i = parseInt(json[key].split('|')[0]);
                uses = parseInt(json[key].split('|')[1]);
            }else{
                i = parseInt(json[key]);
            }

            json[key] = i + '|' + parseInt(uses);

            let newJson = JSON.stringify(json);
            fs.writeFileSync(path, newJson);

            if(uses > i){
                delete json[key];
                let newJson = JSON.stringify(json);
                fs.writeFileSync(path, newJson);
                let embed = new MessageEmbed()
                    .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                    .setDescription(guild.translate("administration/usekey:invalidKey")
                            .replace('{emotes.error}', this.client.emotes.error)
                        .replace('{emotes.arrow}', this.client.emotes.arrow)
                        .replace('{emotes.arrow}', this.client.emotes.arrow)
                        .replace('{support}', this.client.supportUrl))
                    .setColor(this.client.embedColor)
                    .setFooter(data.guild.footer);
                if(message) return message.send(embed, false);
                if(interaction) return interaction.send(embed);
            }else{
                if(!data.guild.premium){
                    json[key] = i + '|' + parseInt(i + 1);
                    let newJson = JSON.stringify(json);
                    fs.writeFileSync(path, newJson);
                    data.guild.premium = true;
                    await data.guild.save();
                    if(uses+1 === i){
                        delete json[key];
                        let newJson = JSON.stringify(json);
                        fs.writeFileSync(path, newJson);
                    }
                    let embed = new MessageEmbed()
                        .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                        .setDescription(guild.translate("administration/usekey:redeemed")
                            .replace('{emotes.success}', this.client.emotes.success))
                        .setColor(this.client.embedColor)
                        .setFooter(data.guild.footer);
                    if(message) await message.send(embed);
                    if(interaction) await interaction.send(embed);
                }else{
                    let embed = new MessageEmbed()
                        .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                        .setDescription(guild.translate("administration/usekey:alreadyPremium")
                            .replace('{emotes.error}', this.client.emotes.error))
                        .setColor(this.client.embedColor)
                        .setFooter(data.guild.footer);
                    if(message) return message.send(embed);
                    if(interaction) return  interaction.send(embed);
                }
            }
        }else{
            let embed = new MessageEmbed()
                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL(), this.client.website)
                .setDescription(guild.translate("administration/usekey:invalidKey")
                    .replace('{emotes.error}', this.client.emotes.error)
                    .replace('{emotes.arrow}', this.client.emotes.arrow)
                    .replace('{emotes.arrow}', this.client.emotes.arrow)
                    .replace('{support}', this.client.supportUrl))
                .setColor(this.client.embedColor)
                .setFooter(data.guild.footer);
            if(message) return message.send(embed, false);
            if(interaction) return interaction.send(embed, true);
        }

    }
}

module.exports = Usekey;
