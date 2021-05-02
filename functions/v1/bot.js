'use strict';

const generic = require('./actions/generic')
const author = require('./actions/author')
const poem = require('./actions/poem')

const { bot } = require('../config/bot')

bot.hears(/^\/iniciar|\/start$/, ctx => generic.start(ctx))
bot.hears(/^\/ayuda$/, ctx => generic.help(ctx))

bot.hears(/^\/descubrir_autor$/, msg => author.discover(msg))
bot.hears(/^\/autor([\s]{1,}.+[a-zA-Z-0-9])/, msg => author.get(msg))

bot.hears(/^\/descubrir_poema$/, msg => poem.discover(msg))
// bot.hears(/^\/poema([\s]{1,}.+[a-zA-Z-0-9])/, msg => poem.get(msg))
// bot.hears(/^\/poemas([\s]{1,}.+[a-zA-Z-0-9])/, poem.poems)

exports.handler = async event => {
    try {
        await bot.handleUpdate(JSON.parse(event.body));
        return { statusCode: 200, body: '' };
    } catch (e) {
        console.log(e)
        return { statusCode: 400, body: 'This endpoint is meant for bot and telegram communication' };
    }
}