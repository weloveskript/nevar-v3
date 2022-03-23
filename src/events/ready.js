const config = require('../helper/loader').loadConfig();
const fs = require('fs');
const schedule = require('node-schedule');
const connect = require('connect');
const http = require('http');
const bodyParser = require('body-parser');
const {Permissions} = require("discord.js");


module.exports = class {
    constructor(client) {
        this.client = client;
    }

    async run() {
        const client = this.client;

        // Start http server for uptime monitoring
        const app = connect();
        app.use(bodyParser.urlencoded({ extended: false }));
        app.use(function(req, res){
            res.end(this.client.user.tag + ' is up and running');
        });
        http.createServer(app).listen(5757)

        //Update slash commands every day at 00:00
        schedule.scheduleJob('0 0 * * *', async () => {
            await require('../helper/slashCommands').init(this.client);
        })

        // Init top.gg webhook
        require('../helper/topgg').init(this.client);

        // Init automatic unbans
        require('../helper/unbanChecker').init(this.client);

        // Start channel renaming
        if(config.support.id){
            setInterval(async function(){
                let supportGuild = client.guilds.cache.get(config.support.id);
                let serverChannel, voteChannel, userChannel;
                if(config.support.server_count_channel) serverChannel = supportGuild.channels.cache.get(config.support.server_count_channel);
                if(config.support.vote_count_channel) voteChannel = supportGuild.channels.cache.get(config.support.vote_count_channel);
                if(config.support.user_count_channel) userChannel = supportGuild.channels.cache.get(config.support.user_count_channel);

                if(serverChannel)
                    serverChannel.setName(config.channels.design_server_count_channel
                        .replace('{count}', client.guilds.cache.size));

                if(userChannel)
                    userChannel.setName(config.channels.design_user_count_channel
                        .replace('{count}', client.format(client.guilds.cache.reduce((sum, guild) => sum + (guild.available ? guild.memberCount : 0), 0))));

                if(config.apikeys.topgg && config.apikeys.topgg !== ""){
                    let res = await fetch("https://discordbots.org/api/bots/"+ client.user.id, {
                        headers: { "Authorization": config.apikeys.topgg}
                    });
                    const data = await res.json();
                    let votes = 0;
                    const date = new Date();
                    const month = date.toLocaleString('en-GB', { month: "long" });

                    if(!data.error){
                        votes = data.monthlyPoints;
                        if(voteChannel)
                            voteChannel.setName(config.channels.design_vote_count_channel
                                .replace('{count}', client.format(votes))
                                .replace('{month}', month.toLowerCase))
                    }
                }
            }, 120 * 1000)
        }

        // Start data transfer
        if(config.datatransfer.state){
            schedule.scheduleJob('* * * * *', async () => {
                let staffs = [];
                let staffJson = JSON.parse(fs.readFileSync('./storage/staffs.json'));
                let staffIds = Object.keys(staffJson);
                let botOwner = await this.client.users.fetch(this.client.config.team.owner_id).catch(() => {});
                staffs.push(botOwner.tag + ' |?| ' + botOwner.id + ' |?| ' + botOwner.displayAvatarURL() + ' |?| ' + 'head_staff')
                for(let id of staffIds){
                    let staffMember = await this.client.users.fetch(id);
                    staffs.push(staffMember.tag + ' |?| ' + staffMember.id + ' |?| ' + staffMember.displayAvatarURL() + ' |?| ' + Object.values(staffJson)[staffIds.indexOf(id)]);
                }

                let votes = 0;
                if(config.apikeys.topgg && config.apikeys.topgg !== "") {
                    let res = await fetch("https://discordbots.org/api/bots/" + this.client.user.id, {
                        headers: {"Authorization": config.apikeys.topgg}
                    })
                    const data = await res.json();
                    if (!data.error) votes = data.monthlyPoints;
                }

                let serverCount = this.client.guilds.cache.size;
                let userCount = this.client.guilds.cache.reduce((sum, guild) => sum + (guild.available ? guild.memberCount : 0), 0);
                let channelCount = this.client.channels.cache.size;
                let commandCount = this.client.commands.size;
                let obj = {
                    servers: serverCount,
                    users: userCount,
                    channels: channelCount,
                    commands: commandCount,
                    staffs: staffs,
                    wsPing: this.client.ws.ping,
                    votes: votes,
                    support: this.client.support,
                    lastUpdated: Date.now(),
                };

                fs.writeFile(config.datatransfer.path, JSON.stringify(obj, null, 4), function(err){
                    if(err) {
                        this.client.logger.log('Couldn\'t transfer the bot data', "error")
                        throw new Error(err)
                    }
                });
            });
        }

        // Start status update
        let status = config.status;
        let i = 0;
        let text = status[parseInt(i, 10)].name.replace('{servercount}', this.client.guilds.cache.size);

        this.client.user.setActivity({
            name: text,
            type: status[parseInt(i, 10)].type.toUpperCase(),
            url: status[parseInt(i, 10)]?.url
        });
        if(status[parseInt(i+1, 10)]) i++;
        else i = 0;

        setInterval(async function(){
            let text = status[parseInt(i, 10)].name.replace('{servercount}', client.guilds.cache.size);
            client.user.setActivity({
                name: text,
                type: status[parseInt(i, 10)].type.toUpperCase(),
                url: status[parseInt(i, 10)]?.url
            })
            if(status[parseInt(i+1, 10)]) i++;
            else i = 0;
        }, 25000)

        // Some debug info
        this.client.logger.log("Loaded " + this.client.guilds.cache.size + " guilds", "info")

        // Start dashboard, if enabled
        if(config.webdashboard.enabled){
            await require("../interface/app.js")();
        }

        // Some debug info
        this.client.logger.log("Logged in as " + this.client.user.tag, "ready");

        // Set client invite property
        this.client.invite = this.client.generateInvite({
            permissions: [
                Permissions.FLAGS.VIEW_AUDIT_LOG, Permissions.FLAGS.MANAGE_ROLES,
                Permissions.FLAGS.MANAGE_CHANNELS, Permissions.FLAGS.KICK_MEMBERS,
                Permissions.FLAGS.BAN_MEMBERS, Permissions.FLAGS.MANAGE_EMOJIS_AND_STICKERS,
                Permissions.FLAGS.MANAGE_WEBHOOKS, Permissions.FLAGS.VIEW_CHANNEL,
                Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.MANAGE_MESSAGES,
                Permissions.FLAGS.ATTACH_FILES, Permissions.FLAGS.EMBED_LINKS,
                Permissions.FLAGS.READ_MESSAGE_HISTORY, Permissions.FLAGS.USE_EXTERNAL_EMOJIS,
                Permissions.FLAGS.ADD_REACTIONS, Permissions.FLAGS.SPEAK,
                Permissions.FLAGS.CONNECT
            ],
            scopes: [
                'bot',
                'applications.commands'
            ]
        });
    }
};
