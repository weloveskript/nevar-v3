/**
 * Installs all the files necessary for the bot to run perfectly
 */

const logger = require('../../../src/helper/logger');
const fs = require('fs');


logger.log('Installation started..', "debug");

// -> Create the config file
let configText =
    fs.readFileSync('./storage/assets/sampleconfignevarbot.txt', 'utf8').toString()
        .replace('{version}', require('../../../package.json').version)

fs.writeFile('config-sample.toml', configText, async function(error){
    if(error){
        logger.log("Couldn't create config", "error")
        console.error(new Error(error));
    }
    else{
        logger.log("Successfully generated config", "success")
    }
});


// -> Create all the necessary files to run the bot perfectly

let disabledCommands = [];
let giveaways = [];
let premiumKeys = [];
let staffs = {};
let news = {
    "timestamp": Date.now(),
    "text": "Installed the bot"
}

fs.writeFile('./storage/disabledcmds.json', JSON.stringify(disabledCommands, null, 4), function(error){
    if(error){
        logger.log("Couldn't create storage/disabledcmds.json", "error");
        console.error(new Error(error));
    }else{
        logger.log('Successfully created storage/disabledcmds.json', "success");
    }
});


fs.writeFile('./storage/giveaways.json', JSON.stringify(giveaways, null, 4), function(error){
    if(error){
        logger.log("Couldn't create storage/giveaways.json", "error");
        console.error(new Error(error));
    }else{
        logger.log('Successfully created storage/giveaways.json', "success");
    }
});

fs.writeFile('./storage/premiumkeys.json', JSON.stringify(premiumKeys, null, 4), function(error){
    if(error){
        logger.log("Couldn't create storage/premiumkeys.json", "error");
        console.error(new Error(error));
    }else{
        logger.log('Successfully created storage/premiumkeys.json', "success");
    }
});

fs.writeFile('./storage/staffs.json', JSON.stringify(staffs, null, 4), function(error){
    if(error){
        logger.log("Couldn't create storage/staffs.json", "error");
        console.error(new Error(error));
    }else{
        logger.log('Successfully created storage/staffs.json', "success");
    }
});

fs.writeFile('./storage/news.json', JSON.stringify(news, null, 4), function(error){
    if(error){
        logger.log("Couldn't create storage/news.json", "error");
        console.error(new Error(error));
    }else{
        logger.log('Successfully created storage/news.json', "success");
    }
});

try {
    fs.mkdirSync('./storage/images', {}, function(error){
        if(error){
            logger.log("Couldn't create storage/images/", "error");
            console.error(new Error(error));
        }else{
            logger.log('Successfully created storage/images/', 'success');
        }
    })
}catch (error) {
    logger.log("Couldn't create storage/images/", "error");
     console.error(new Error(error));
}
