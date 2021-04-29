'use strict';

const bot = require('./config/bot')
const generic = require('./controller/generic')
const author = require('./controller/author')
const poem = require('./controller/poem')

bot.onText(/^\/iniciar|\/start$/, generic.start);
bot.onText(/^\/ayuda$/, generic.help);

bot.onText(/^\/autor([\s]{1,}.+[a-zA-Z-0-9])/, author.author)
bot.onText(/^\/descubrir_autor$/, author.discoverAuthor)

bot.onText(/^\/poema([\s]{1,}.+[a-zA-Z-0-9])/, poem.poem)
bot.onText(/^\/poemas([\s]{1,}.+[a-zA-Z-0-9])/, poem.poems)
bot.onText(/^\/descubrir_poema$/, poem.discoverPoem)

module.exports = bot