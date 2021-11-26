const {
    bgBlue,
    black,
    green,
    white
} = require("chalk");

function dateTimePad(value, digits) {
    let number = value;
    while (number.toString().length < digits) {
        number = "0" + number;
    }
    return number;
}

function format(tDate) {
     return (dateTimePad(tDate.getDate(), 2) + "." +
        dateTimePad(tDate.getMonth(), 2) + "." +
        dateTimePad(tDate.getFullYear()) + " " +
        dateTimePad(tDate.getHours(), 2) + ":" +
        dateTimePad(tDate.getMinutes(), 2) + ":" +
        dateTimePad(tDate.getSeconds(), 2))
}


module.exports = class Logger {
    static log(content, type = "log") {
        const date = `[${format(new Date(Date.now()))}]:`;
        switch (type) {
            case "log": {
                return console.log(`${date} ${white.bgWhite('NEVAR')}-${bgBlue(type.toUpperCase())} ${content} `);
            }
            case "warn": {
                return console.log(`${date} ${black.bgYellow(type.toUpperCase())} ${content} `);
            }
            case "error": {
                return console.log(`${date} ${black.bgRed(type.toUpperCase())} ${content} `);
            }
            case "debug": {
                return console.log(`${date} ${green(type.toUpperCase())} ${content} `);
            }
            case "cmd": {
                return console.log(`${date} ${black.bgWhite(type.toUpperCase())} ${content}`);
            }
            case "ready": {
                return console.log(`${date} ${black.bgGreen(type.toUpperCase())} ${content}`);
            }
            case "success": {
                return console.log(`${date} ${black.bgBlue(type.toUpperCase())} ${content}`)
            }
            default:
                throw new TypeError("Invalid type given. Valid types are: Warn, Debug, Log, Ready, Cmd, Success or Error");
        }
    }
};
