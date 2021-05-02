'use strict';
const { Telegraf, Markup } = require('telegraf')
const bot = new Telegraf(process.env.API_KEY_TELEGRAM)
module.exports = {
    Markup,
    bot
}