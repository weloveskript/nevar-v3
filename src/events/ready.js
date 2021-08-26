const config = require('../../config.json');

module.exports = class {
    constructor(client) {
        this.client = client;
    }

    async run() {
        const client = this.client;

        client.logger.log("Loaded " + client.commands.size + ' commands', "debug");

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
        //const topgg = require('../helper/topgg');
        //topgg.init(client);

        //Register & handle slash commands
        const slashCommands = require('../helper/slashCommands');
        await slashCommands.init(client);

        client.logger.log("Successfully logged in as " + client.user.tag, "ready");

        //Unmute & Unban Checker

        const unmuteChecker = require('../helper/unmuteChecker')
            , unbanChecker = require('../helper/unbanChecker');
        await unmuteChecker.init(client);
        await unbanChecker.init(client);

        let status = require('../../config.json').status
            , i = 0;

        if(config.support.id && config.support.voteChannel && config.support.userChannel && config.support.serverChannel && config.support.logChannel&& config.support.partnerChannel){
            setInterval(async function(){

                let guild = client.guilds.cache.get(config.support.id)
                    , serverChannel = guild.channels.cache.get(config.support.serverChannel)
                    , voteChannel = guild.channels.cache.get(config.support.voteChannel)
                    , userChannel = guild.channels.cache.get(config.support.userChannel);

                //set channel names
                serverChannel.setName(`┏💻 ${client.guilds.cache.size} servers`);
                await client.wait(2000);
                userChannel.setName(`│ 👥 ${client.format(client.guilds.cache.reduce((sum, guild) => sum + (guild.available ? guild.memberCount : 0), 0))} users`);

                if(config.apiKeys.dbl && config.apiKeys.dbl !== ""){
                    let res = await fetch("https://discordbots.org/api/bots/"+client.user.id, {
                        headers: { "Authorization": config.apiKeys.dbl }
                    })
                        , data = await res.json()
                        , votes = 0
                        , date = new Date()
                        , month = date.toLocaleString('en-GB', { month: "long" });

                    if(!data.error){
                        votes = data.monthlyPoints;
                        client.wait(200);
                        voteChannel.setName(`│ 💜 ${client.format(votes)} votes in ${month.toLowerCase()}`)
                    }

                }
            }, 650000)
        }

        const cron = require('cron')
        if(config.webApi.transfer){
            const transferData = new cron.CronJob('* * * * *', async() => {
                let staffs = [];
                for(let id of config.staffs){

                    console.log(id)
                }
                let serverCount = client.guilds.cache.size
                    , userCount = client.guilds.cache.reduce((sum, guild) => sum + (guild.available ? guild.memberCount : 0), 0)
                    , channelCount = client.channels.cache.size
                    , commandCount = client.commands.size
                    , obj = {
                    servers: serverCount,
                    users: userCount,
                    channels: channelCount,
                    commands: commandCount
                }
                    , fs = require('fs');

                fs.writeFile(config.webApi.path, JSON.stringify(obj), function(err){
                    if(err) {}
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


        //await require('../interface/app')();


    }
};
