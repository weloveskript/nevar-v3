const { Message, Interaction } = require('discord.js');


Message.prototype.send = async function(embed, ping = false, buttons){
    let sent;
    if(buttons){
        if(ping) sent = await this.reply(({embeds: [embed], components: buttons})).catch((e) => {});
        else sent = await this.reply({embeds:[embed], components: buttons, allowedMentions: ['user']}).catch((e) => {});
    }else{
        if(ping) sent = await this.reply({embeds:[embed]}).catch((e) => {});
        else sent = await this.reply({embeds:[embed], allowedMentions: ['user']}).catch((e) => {});
    }
    return sent;
}

Interaction.prototype.send = async function(embed, ephemeral = false, buttons){
    let sent;
    if(buttons){
        if(ephemeral) sent = await this.reply(({embeds: [embed], components: buttons, ephemeral: true})).catch((e) => {console.log(e)});
        else sent = await this.reply({embeds: [embed], components: buttons, ephemeral: false, fetchReply: true}).catch((e) => {console.log(e)});
    }else{
        if(ephemeral) sent = await this.reply({embeds: [embed], ephemeral: true}).catch((e) => {console.log(e)});
        else sent = await this.reply({embeds: [embed], ephemeral: false, fetchReply: true}).catch((e) => {console.log(e)});
    }
    return sent;
}
