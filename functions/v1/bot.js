'use strict';

const generic = require('./actions/generic')
const author = require('./actions/author')
const poem = require('./actions/poem')
const bot = require('./config/bot')

bot.on('callback_query', msg => {
    let json = JSON.parse(msg.update.callback_query.data)
    msg.match = ['', json.data]

    if (author[json.method]) {
        return author[json.method](msg)
    } else if (poem[json.method]) {
        return poem[json.method](msg)
    } else {
        return msg.reply('Hubo un error al coger la información, disculpe las molestias.')
    }
})

bot.hears(/^\/iniciar|\/start$/, msg => generic.start(msg))
bot.hears(/^\/ayuda$/, msg => generic.help(msg))

bot.hears(/^\/descubrir_autor$/, msg => author.discover(msg))
bot.hears(/^\/autor([\s]{1,}.+[a-zA-Z-0-9])/, msg => author.get(msg))

// bot.hears(/^\/descubrir_poema$/, msg => poem.discover(msg))
// bot.hears(/^\/poema([\s]{1,}.+[a-zA-Z-0-9])/, msg => poem.get(msg))
// bot.hears(/^\/poemas([\s]{1,}.+[a-zA-Z-0-9])/, msg => poem.get_all_poems_of_author(msg))

exports.handler = async event => {
    try {
        await bot.handleUpdate(JSON.parse(event.body));
        return { statusCode: 200, body: '' };
    } catch (e) {
        console.log(e)
        return { statusCode: 400, body: 'This endpoint is meant for bot and telegram communication' };
    }
}