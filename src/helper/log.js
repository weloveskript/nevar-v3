const { black, green, magenta, yellow, red, blue } = require("chalk");

function dateTimePad(value, digits) {
    let number = value;
    while (number.toString()
        .length < digits) {
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

            case "log":
            {
                return console.log(`${date} ${magenta(type.toUpperCase())} ${content} `);
            }
            case "warn":
            {
                return console.log(`${date} ${yellow(type.toUpperCase())} ${content} `);
            }
            case "error":
            {
                return console.log(`${date} ${red(type.toUpperCase())} ${content} `);
            }
            case "debug":
            {
                return console.log(`${date} ${black(type.toUpperCase())} ${content} `);
            }
            case "ready":
            {
                return console.log(`${date} ${green(type.toUpperCase())} ${content}`);
            }
            case "success":
            {
                return console.log(`${date} ${green(type.toUpperCase())} ${content}`)
            }
            case "info":
            {
                return console.log(`${date} ${blue(type.toUpperCase())} ${content}`)
            }
            default:
                return console.log(`${date} ${magenta(type.toUpperCase())} ${content} `);
        }
    }
};
