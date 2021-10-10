const { Message, Interaction } = require('discord.js');


/**
 *
 * @param embed
 * @param ping
 * @param buttons
 * @returns {Promise<Message>}
 */
Message.prototype.send = async function(embed, ping = false, buttons){
    let sent;
    if(buttons){
        if(ping) sent = await this.reply(({embeds: [embed], components: buttons})).catch(() => {});
        else sent = await this.reply({embeds:[embed], components: buttons, allowedMentions: ['user']}).catch(() => {});
    }else{
        if(ping) sent = await this.reply({embeds:[embed]}).catch(() => {});
        else sent = await this.reply({embeds:[embed], allowedMentions: ['user']}).catch(() => {});
    }
    return sent;
}

/**
 *
 * @param embed
 * @param ephemeral
 * @param buttons
 * @returns {Promise<*>}
 */
Interaction.prototype.send = async function(embed, ephemeral = false, buttons){
    let sent;
    if(buttons){
        if(ephemeral) sent = await this.reply(({embeds: [embed], components: buttons, ephemeral: true})).catch(() => {});
        else sent = await this.reply({embeds: [embed], components: buttons, ephemeral: false, fetchReply: true}).catch((e) => {console.log(e)});
    }else{
        if(ephemeral) sent = await this.reply({embeds: [embed], ephemeral: true}).catch(() => {});
        else sent = await this.reply({embeds: [embed], ephemeral: false, fetchReply: true}).catch(() => {});
    }
    return sent;
}
