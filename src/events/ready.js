const toml = require('toml');
const fs = require('fs');
const config = toml.parse(fs.readFileSync('./config.toml', 'utf-8'));

module.exports = class {
    constructor(client) {
        this.client = client;
    }

    async run() {
        const client = this.client;


        const connect = require('connect')
            , http = require('http')
            , app = connect()
            , bodyParser = require('body-parser');

        app.use(bodyParser.urlencoded( { extended: false } ));

        app.use(function(req, res){
            res.end(client.user.tag + ' is running')
        });

        http.createServer(app).listen(3434);

        //Top.GG init
        const topgg = require('../helper/topgg');
        topgg.init(client);

        //Register & handle slash commands
        const slashCommands = require('../helper/slashCommands');
        await slashCommands.init(client, undefined);

        client.logger.log("Loaded " + client.guilds.cache.size + " guilds", "info")
        client.logger.log("Logged in as " + client.user.tag, "ready");


        //Unmute & Unban Checker

        const unmuteChecker = require('../helper/unmuteChecker')
            , unbanChecker = require('../helper/unbanChecker');
        await unmuteChecker.init(client);
        await unbanChecker.init(client);

        let status = config.status
            , i = 0;

        if(config.support.id){
            setInterval(async function(){

                let guild = client.guilds.cache.get(config.support.id);

                let serverChannel;
                let voteChannel;
                let userChannel;
                if(config.support.server_count_channel) serverChannel = guild.channels.cache.get(config.support.server_count_channel);
                if(config.support.vote_count_channel) voteChannel = guild.channels.cache.get(config.support.vote_count_channel);
                if(config.support.user_count_channel) userChannel = guild.channels.cache.get(config.support.user_count_channel);


                //set channel names
                if(serverChannel) serverChannel.setName(config.channels.design_server_count_channel
                    .replace('{count}', client.guilds.cache.size));
                await client.wait(2000);
                if(userChannel) userChannel.setName(config.channels.design_user_count_channel
                    .replace('{count}', client.format(client.guilds.cache.reduce((sum, guild) => sum + (guild.available ? guild.memberCount : 0), 0))));

                if(config.apikeys.topgg && config.apikeys.topgg !== ""){
                    let res = await fetch("https://discordbots.org/api/bots/"+client.user.id, {
                        headers: { "Authorization": config.apikeys.topgg}
                    })
                        , data = await res.json()
                        , votes = 0
                        , date = new Date()
                        , month = date.toLocaleString('en-GB', { month: "long" });

                    if(!data.error){
                        votes = data.monthlyPoints;
                        await client.wait(200);
                        if(voteChannel) voteChannel.setName(config.channels.design_vote_count_channel
                            .replace('{count}', client.format(votes))
                            .replace('{month}', month.toLowerCase))
                    }

                }
            }, 650000)
        }

        const cron = require('cron')
        if(config.datatransfer.state){
            const transferData = new cron.CronJob('* * * * *', async() => {
                let staffs = [];
                for(let id of config.team.staff_ids){
                    let user = await client.users.fetch(id);
                    staffs.push(user.username + '#'+user.discriminator + ' |?| ' + user.id + ' |?| ' + user.displayAvatarURL());
                }
                let votes = 0;
                if(config.apikeys.topgg && config.apikeys.topgg !== "") {
                    let res = await fetch("https://discordbots.org/api/bots/" + client.user.id, {
                        headers: {"Authorization": config.apikeys.topgg}
                    })
                        , data = await res.json();

                    if (!data.error) votes = data.monthlyPoints;
                }


                let serverCount = client.guilds.cache.size
                    , userCount = client.guilds.cache.reduce((sum, guild) => sum + (guild.available ? guild.memberCount : 0), 0)
                    , channelCount = client.channels.cache.size
                    , commandCount = client.commands.size
                    , obj = {
                        servers: serverCount,
                        users: userCount,
                        channels: channelCount,
                        commands: commandCount,
                        staffs: staffs,
                        wsPing: client.ws.ping,
                        votes: votes,
                        support: client.support,
                        lastUpdated: Date.now(),
                }
                    , fs = require('fs');

                fs.writeFile(config.datatransfer.path, JSON.stringify(obj, null, 4), function(err){
                    if(err) {
                        client.logger.log('Couldn\'t transfer the bot data', "error")
                        throw new Error(err)
                    }
                });
            }, null, true, 'Europe/Berlin');
            transferData.start();
        }


        setInterval(function(){
            let text = status[parseInt(i, 10)].name.replace('{servercount}', client.guilds.cache.size);

            //set activity
            client.user.setActivity(text, { type: status[parseInt(i, 10)].type });
            if(status[parseInt(i+1, 10)]) i++;
            else i = 0;
        }, 20000)


        if(config.webdashboard.enabled){
            await require("../interface/app.js")();
        }


    }
};
