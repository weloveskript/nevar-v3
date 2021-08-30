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

        if(config.support.id){
            setInterval(async function(){

                let guild = client.guilds.cache.get(config.support.id);

                let serverChannel;
                let voteChannel;
                let userChannel;
                if(config.support.serverChannel) serverChannel = guild.channels.cache.get(config.support.serverChannel);
                if(config.support.voteCountChannel) voteChannel = guild.channels.cache.get(config.support.voteCountChannel);
                if(config.support.userChannel) userChannel = guild.channels.cache.get(config.support.userChannel);


                //set channel names
                if(serverChannel) serverChannel.setName(config.channelDesigns.serverChannel
                    .replace('{count}', client.guilds.cache.size));
                await client.wait(2000);
                if(userChannel) userChannel.setName(config.channelDesigns.userChannel
                    .replace('{count}', client.format(client.guilds.cache.reduce((sum, guild) => sum + (guild.available ? guild.memberCount : 0), 0))));

                if(config.apiKeys.top_gg && config.apiKeys.top_gg !== ""){
                    let res = await fetch("https://discordbots.org/api/bots/"+client.user.id, {
                        headers: { "Authorization": config.apiKeys.top_gg}
                    })
                        , data = await res.json()
                        , votes = 0
                        , date = new Date()
                        , month = date.toLocaleString('en-GB', { month: "long" });

                    if(!data.error){
                        votes = data.monthlyPoints;
                        await client.wait(200);
                        if(voteChannel) voteChannel.setName(config.channelDesigns.voteCountChannel
                            .replace('{count}', client.format(votes))
                            .replace('{month}', month.toLowerCase))
                    }

                }
            }, 650000)
        }

        const cron = require('cron')
        if(config.webApi.transfer){
            const transferData = new cron.CronJob('* * * * *', async() => {
                let staffs = [];
                for(let id of config.staffs){
                    let user = await client.users.fetch(id);
                    staffs.push(user.username + '#'+user.discriminator + ' | ' + user.id + ' | ' + user.displayAvatarURL());
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
                    lastUpdated: Date.now(),
                }
                    , fs = require('fs');

                fs.writeFile(config.webApi.path, JSON.stringify(obj, null, 4), function(err){
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


        //await require('../interface/app')();


    }
};
