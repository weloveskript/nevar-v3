const Command = require('../../core/command');
const Levels = require('discord-xp');
const Canvas = require('canvas');
const Discord = require('discord.js');
const { CanvasRenderingContext2D } = require('canvas');
const {SlashCommandBuilder} = require("@discordjs/builders");
Canvas.registerFont('./storage/fonts/KeepCalm-Medium.ttf', { family: 'KeepCalm' });



// Function to create rounded rectangles
CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    this.beginPath();
    this.moveTo(x + r, y);
    this.arcTo(x + w, y, x + w, y + h, r);
    this.arcTo(x + w, y + h, x, y + h, r);
    this.arcTo(x, y + h, x, y, r);
    this.arcTo(x, y, x + w, y, r);
    this.closePath();
    return this;
}

// Function to create rounded images
function roundedImage(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

class Level extends Command {
    constructor(client) {
        super(client, {
            name: "level",
            description: "misc/level:general:description",
            dirname: __dirname,
            aliases: ["rank"],
            cooldown: 3000,
            slashCommand: {
                addCommand: true,
                data: new SlashCommandBuilder()
                    .addUserOption(option => option.setRequired(false))
            }
        });
    }
    async run(interaction, message, args, data){

        // Get all needed data
        const channel = interaction?.channel || message?.channel;
        const guild = interaction?.guild || message?.guild;
        let member = interaction?.member || message?.member;
        if(interaction) await interaction.deferReply();
        if(args[0]) member = await this.client.resolveMember(args[0], guild);
        const dbUser = await this.client.findOrCreateUser({id:member.user.id});

        await Levels.createUser(member.user.id, guild.id, true);

        const user = {
            db: dbUser,
            discord: member,
            level: await Levels.fetch(member.user.id, guild.id, true)
        };

        // create image
        const canvas = Canvas.createCanvas(1000, 300);
        const ctx = canvas.getContext('2d');

        // quality settings
        ctx.patternQuality = "best";
        ctx.antialias = "default";
        ctx.filter = "default";

        // draw gray background
        ctx.fillStyle = "#1D2228";
        ctx.roundRect(0, 0, canvas.width, canvas.height, 22).fill();

        // draw black square if no custom image is chosen
        if(user.db.levelBackground === 0){
            ctx.fillStyle = "#090a0b";
            ctx.roundRect(25, 25, 950, 250, 15).fill();
        }else{
            // draw background image
            const background = await Canvas.loadImage("./storage/levelcards/" + user.db.levelBackground + ".png");
            ctx.save();
            roundedImage(ctx, 25, 25, 950, 250, 10);
            ctx.stroke()
            ctx.clip();
            ctx.drawImage(background, 25, 25, 950, 250);
            ctx.restore();

            ctx.strokeStyle = '#1D2228';
            ctx.lineWidth = 3.5;
            ctx.roundRect(25, 25, 950, 250, 10).stroke();
        }

        // write username
        ctx.fillStyle = "#ffffff";
        let text = user.discord.user.username;
        ctx.font = "60px Calibri"
        let size = 60;

        // loop until the text fits within the width of the box
        for(let i = 6; i <= 32; i++){
            size = size-1.36;
            if(text.length === i) ctx.font = size + "px Calibri";
        }
        ctx.fillText(text, 290, 170)

        // write level and rank
        text = user.level.position;
        let rankText1X = 620;
        let rankText2X = 700;
        let rankText = guild.translate("misc/level:main:rank").toUpperCase();

        // loop until the text fits within the width of the box
        for(let i = 1; i <= 7; i++){
            rankText1X = rankText1X-39.5;
            rankText2X = rankText2X-39.5;
            if(text.toString().length === i){
                ctx.font = "31px Calibri";
                ctx.fillStyle = "#ffffff";
                ctx.fillText(rankText, rankText1X, 95);
                ctx.font = "61px Calibri";
                ctx.fillText('#' + text, rankText2X, 95);
            }
        }
        // write level
        ctx.fillStyle = '#' + user.db.levelColor;
        ctx.font = "31px Calibri";
        ctx.fillText(guild.translate("misc/level:main:level").toUpperCase(), 750, 95);
        ctx.font = "61px Calibri";
        ctx.fillText(user.level.level, 830, 95);

        // write current xp / needed xp
        function kFormatter(int){
            return Math.abs(int) > 999 ? Math.sign(int)*((Math.abs(int)/1000).toFixed(1)) + 'K' : Math.sign(int)*Math.abs(int);
        }

        ctx.fillStyle = '#ffffff';
        text = kFormatter(user.level.xp) + ' / ' + kFormatter(Levels.xpFor(user.level.level + 1)) + ' XP';
        ctx.font = "29px Calibri";

        let X = 763;
        // loop until the text fits within the width of the box
        for(let i = 10; i <= 30; i++){
            if(text.length === i){
                ctx.fillText(text, X, 170)
            }
            X = X - 15;
        }

        // draw progress bar
        ctx.roundRect(290, 185, 600, 40, 25).fill();

        // draw progress bar fill
        const xpPercent = (user.level.xp * 100) / Levels.xpFor(user.level.level + 1);
        const neededWidth = (xpPercent * 600) / 100;
        ctx.fillStyle = '#'+user.db.levelColor;
        ctx.roundRect(290, 185, neededWidth, 40, 25).fill();

        // draw profile picture
        const profilePic = await Canvas.loadImage(user.discord.user.displayAvatarURL({ format: 'png', size: 300}));
        ctx.save();
        roundedImage(ctx, 70, 50, 200, 200, 23);
        ctx.stroke()
        ctx.clip();
        ctx.drawImage(profilePic, 70, 50, 200, 200);
        ctx.restore();

        // draw activity circle
        let status = member.presence?.status;
        if(status === 'online') ctx.strokeStyle = '#3ba55d';
        if(status === 'idle') ctx.strokeStyle = '#faa81a';
        if(status === 'dnd') ctx.strokeStyle = '#ed4245';
        if(status === 'offline') ctx.strokeStyle = '#666f7c';
        if(!status) ctx.strokeStyle = '#666f7c';
        ctx.lineWidth = 3.5;
        ctx.roundRect(70, 50, 200, 200, 23).stroke();

        // send the canvas to discord
        const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'level-' + user.discord.user.id + '.png');
        if(interaction) interaction.editReply({files: [attachment] });
        if(message) message.reply({ files: [attachment] });




    }
}

module.exports = Level;
