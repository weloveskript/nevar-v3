const Command = require('../../core/command');
const {mod} = require("mathjs");

class Topic extends Command {
    constructor(client){
        super(client, {
            name: "topic",
            dirname: __dirname,
            description: "misc/topic:description",
            cooldown: 3000,
            slashCommand: {
                addCommand: true
            }
        })
    }

    async run(interaction, message, args, data){

        const fs = require('fs');
        const json = JSON.parse(fs.readFileSync(('./storage/topics.json')));
        const topics = Object.values(json);
        const language = data.guild.language;
        const translator = require('@vitalets/google-translate-api');

        if(language && language === 'de-DE'){
            if(interaction) interaction.reply({content: topics[Math.floor(Math.random() * topics.length)]});
            if(message) message.reply({content: topics[Math.floor(Math.random() * topics.length)], allowedMentions: ['user']});
        }else{
            if(language){
                translator(topics[Math.floor(Math.random() * topics.length)], {to: language.split('-')[0]}).then(res => {
                    if(interaction) interaction.reply({content: res.text});
                    if(message) message.reply({content: res.text});
                }).catch(err => {
                    if(interaction) interaction.reply({content: topics[Math.floor(Math.random() * topics.length)]});
                    if(message) message.reply({content: topics[Math.floor(Math.random() * topics.length)], allowedMentions: ['user']});
                });
            }
        }
    }
}

module.exports = Topic;
