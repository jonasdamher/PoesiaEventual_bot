'use strict';

const TelegramBot = require('node-telegram-bot-api')
const bot = new TelegramBot(process.env.API_KEY_TELEGRAM, { polling: true })
module.exports = bot