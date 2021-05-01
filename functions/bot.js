'use strict';

const dotenv = require('dotenv')
dotenv.config()

const { Telegraf } = require('telegraf')
const bot = new Telegraf(process.env.API_KEY_TELEGRAM)

bot.start((ctx) => ctx.reply('Welcome'))
bot.help((ctx) => ctx.reply('Send me a sticker'))

exports.handler = async event => {
    try {
        await bot.handleUpdate(JSON.parse(event.body));
        return { statusCode: 200, body: '' };
    } catch (e) {
        console.log(e)
        return { statusCode: 400, body: 'This endpoint is meant for bot and telegram communication' };
    }
}

// const bot = require('./config/bot')

// const generic = require('./controller/generic')
// const author = require('./controller/author')
// const poem = require('./controller/poem')

// bot.onText(/^\/iniciar|\/start$/, generic.start);
// bot.onText(/^\/ayuda$/, generic.help);

// bot.onText(/^\/autor([\s]{1,}.+[a-zA-Z-0-9])/, author.author)
// bot.onText(/^\/descubrir_autor$/, author.discoverAuthor)

// bot.onText(/^\/poema([\s]{1,}.+[a-zA-Z-0-9])/, poem.poem)
// bot.onText(/^\/poemas([\s]{1,}.+[a-zA-Z-0-9])/, poem.poems)
// bot.onText(/^\/descubrir_poema$/, poem.discoverPoem)

// module.exports = bot