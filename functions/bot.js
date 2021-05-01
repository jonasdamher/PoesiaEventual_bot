'use strict';

const generic = require('./actions/generic')
// const author = require('./controller/author')
// const poem = require('./controller/poem')

const bot = require('./config/bot')

bot.start(ctx => generic.start(ctx))

bot.help((ctx) =>  generic.help(ctx))

// bot.onText(/^\/iniciar|\/start$/, generic.start);
// bot.onText(/^\/ayuda$/, generic.help);

// bot.onText(/^\/autor([\s]{1,}.+[a-zA-Z-0-9])/, author.author)
// bot.onText(/^\/descubrir_autor$/, author.discoverAuthor)

// bot.onText(/^\/poema([\s]{1,}.+[a-zA-Z-0-9])/, poem.poem)
// bot.onText(/^\/poemas([\s]{1,}.+[a-zA-Z-0-9])/, poem.poems)
// bot.onText(/^\/descubrir_poema$/, poem.discoverPoem)


exports.handler = async event => {
    try {
        await bot.handleUpdate(JSON.parse(event.body));
        return { statusCode: 200, body: '' };
    } catch (e) {
        console.log(e)
        return { statusCode: 400, body: 'This endpoint is meant for bot and telegram communication' };
    }
}
