const fs = require('fs');
const { client } = require('../app');

function generatePremiumKey(length){
    let result = client.user.username + '-';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for(let i = 0; i < length; i++){
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
const createKey = function(string = null, maxUses = 1){
    let key = string;
    if(!string) key = generatePremiumKey(10);
    let keys = JSON.parse(fs.readFileSync('./storage/premiumkeys.json'));
    let keyObject = {
        key: key,
        uses: 0,
        maxUses: maxUses
    };
    keys.push(keyObject);
    fs.writeFileSync('./storage/premiumkeys.json', JSON.stringify(keys, null, 4));
    return keyObject;
}

const validateKey = function(key){
    let keys = JSON.parse(fs.readFileSync('./storage/premiumkeys.json'));
    let keyFound = keys.find(k => k.key === key);
    return !!keyFound;
}

const getKey = function(key){
    if(validateKey(key)){
        let keys = JSON.parse(fs.readFileSync('./storage/premiumkeys.json'));
        return keys.find(k => k.key === key);
    }
    return undefined;
}

const getKeys = function(){
    return JSON.parse(fs.readFileSync('./storage/premiumkeys.json'));
}

const deleteKey = function(key){
    let keys = JSON.parse(fs.readFileSync('./storage/premiumkeys.json'));
    if(validateKey(key)){
        keys = keys.filter(k => k.key !== key);
        fs.writeFileSync('./storage/premiumkeys.json', JSON.stringify(keys, null, 4));
        return true;
    }
    return false;
}

const redeemKey = function(key){
    if(validateKey(key)){
        let keyObject = getKey(key);
        let uses = keyObject.uses;
        let maxUses = keyObject.maxUses;
        if(uses < maxUses){
            keyObject.uses++;
            if(keyObject.uses >= maxUses){
                deleteKey(key);
            }else{
                let keys = getKeys();
                keys = keys.filter(k => k.key !== key);
                keys.push(keyObject);
                fs.writeFileSync('./storage/premiumkeys.json', JSON.stringify(keys, null , 4))
            }
            return true;
        }else{
            deleteKey(key);
            return false;
        }
    }
    return false;
}

module.exports = {
    createKey,
    validateKey,
    getKey,
    getKeys,
    deleteKey,
    redeemKey
};
