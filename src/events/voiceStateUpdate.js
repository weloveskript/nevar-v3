const { Permissions } = require('discord.js');

module.exports = class {

    constructor(client) {
        this.client = client
    }

    async run(oldMember, newMember){
        if(!oldMember || !newMember) return;

        let newChannel = newMember.channel;
        let oldChannel = oldMember.channel;

        if(newChannel){
            const data = {};
            data.config = this.client.config;
            if(newMember.guild){
                const guild = await this.client.findOrCreateGuild({id: newMember.guild.id});
                newMember.guild.data = data.guild = guild;
                if(!data.guild.plugins.joinToCreate.enabled || !data.guild.plugins.joinToCreate.voice) return;

                if(newMember.channel.id === data.guild.plugins.joinToCreate.voice){
                    let tempChannel = await newMember.guild.channels.create('· ' + newMember.member.user.username.split(' ')[0] + '#' + newMember.member.user.discriminator, {
                        reason: 'Join to create',
                        type: 'GUILD_VOICE',
                        parent: newMember.channel.parentId,
                        bitrate: parseInt(data.guild.plugins.joinToCreate.bitrate)*1000,
                        position: newMember.channel.position + 1,
                        userLimit: (data.guild.plugins.joinToCreate.userLimit > 1 ? data.guild.plugins.joinToCreate.userLimit : 0),
                        permissionOverwrites: [
                            {
                                id: newMember.member.user.id,
                                allow: [
                                    Permissions.FLAGS.CONNECT,
                                    Permissions.FLAGS.SPEAK,
                                    Permissions.FLAGS.VIEW_CHANNEL,
                                    Permissions.FLAGS.MANAGE_CHANNELS,
                                    Permissions.FLAGS.STREAM,
                                    Permissions.FLAGS.MUTE_MEMBERS,
                                    Permissions.FLAGS.DEAFEN_MEMBERS,
                                    Permissions.FLAGS.MOVE_MEMBERS,
                                    Permissions.FLAGS.MANAGE_ROLES
                                ],
                                deny: [
                                    Permissions.FLAGS.MANAGE_EVENTS
                                ]
                            }
                        ]
                    }).catch(undefined);


                    await newMember.member.voice.setChannel(tempChannel)
                        .catch(() => { tempChannel.delete().catch(undefined) })
                        .then(async () => {
                            data.guild.plugins.joinToCreate.tempChannels.push(tempChannel.id);
                            data.guild.markModified("plugins.joinToCreate");
                            await data.guild.save();
                        });
                }
            }

        }
        if(oldChannel){
            const data = {};
            data.config = this.client.config;
            if(newMember.guild){
                const guild = await this.client.findOrCreateGuild({id: newMember.guild.id});
                newMember.guild.data = data.guild = guild;
                if(data.guild.plugins.joinToCreate.tempChannels.includes(oldChannel.id)){
                    if(oldChannel.members.size >= 1) return;
                    oldChannel.delete().catch(undefined);
                    data.guild.plugins.joinToCreate.tempChannels = data.guild.plugins.joinToCreate.tempChannels.filter(c => c !== oldChannel.id);
                    data.guild.markModified("plugins.joinToCreate");
                    await data.guild.save();
                }
            }
        }
    }
}
