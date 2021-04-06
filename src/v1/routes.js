'use strict';

const bot = require('./config/bot')
const moduleGeneric = require('./functions/generic')
const moduleAuthor = require('./functions/author')

bot.onText(/^\/start$/, moduleGeneric.start);
bot.onText(/^\/author(.+[a-zA-Z])/, moduleAuthor.author)

module.exports= bot