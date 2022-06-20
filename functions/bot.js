'use strict';

const generic = require('./actions/generic')
const author = require('./actions/author')
const poem = require('./actions/poem')
const bot = require('./config/bot')

// Endpoints
// Endpoint for buttons
bot.on('callback_query', msg => {
    
    // 0 = method
    // 1 = value
    let data = msg.update.callback_query.data.split(/:(.*)/)

    msg.match = ['', data[1]]
    if (author[data[0]]) {
        return author[data[0]](msg)
    } else if (poem[data[0]]) {
        return poem[data[0]](msg)
    } else {
        return msg.reply('Hubo un error al coger la información, disculpe las molestias.')
    }
})

// Endpoints generics
bot.hears(/^\/iniciar|\/start$/, msg => generic.start(msg))
bot.hears(/^\/ayuda$/, msg => generic.help(msg))

// Endpoints authors
bot.hears(/^\/descubrir_autor$/, msg => author.discover(msg))
bot.hears(/^\/autor([\s]{1,}.+[a-zA-Z-0-9])/, msg => author.get_author(msg))

// Endpoints poems
bot.hears(/^\/descubrir_poema$/, msg => poem.discover(msg))
bot.hears(/^\/poema([\s]{1,}.+[a-zA-Z-0-9])/, msg => poem.get_poem(msg))
bot.hears(/^\/poemas([\s]{1,}.+[a-zA-Z-0-9])/, msg => poem.get_poems_author(msg))

exports.handler = async event => {
    try {
        await bot.handleUpdate(JSON.parse(event.body));
        return { statusCode: 200, body: '' };
    } catch (e) {
         return { statusCode: 400, body: 'This endpoint is meant for bot and telegram communication' };
    }
}