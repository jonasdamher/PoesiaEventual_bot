'use strict';

const generic = require('./actions/generic')
const author = require('./actions/author')
const poem = require('./actions/poem')

const bot = require('./config/bot')

bot.on(/^\/iniciar|\/start$/, msg => generic.start(msg))
bot.on(/^\/ayuda$/, msg => generic.help(msg))

bot.on(/^\/descubrir_autor$/, msg => author.discover(msg))
// bot.on(/^\/autor([\s]{1,}.+[a-zA-Z-0-9])/, msg => author.get(msg))

bot.on(/^\/descubrir_poema$/, msg => poem.discover(msg))
// bot.on(/^\/poema([\s]{1,}.+[a-zA-Z-0-9])/, msg => poem.poem(msg))
// bot.on(/^\/poemas([\s]{1,}.+[a-zA-Z-0-9])/, poem.poems)

exports.handler = async event => {
    try {
        await bot.handleUpdate(JSON.parse(event.body));
        return { statusCode: 200, body: '' };
    } catch (e) {
        console.log(e)
        return { statusCode: 400, body: 'This endpoint is meant for bot and telegram communication' };
    }
}