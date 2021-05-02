'use strict';
const { Telegraf } = require('telegraf')
const bot = new Telegraf(process.env.API_KEY_TELEGRAM)
module.exports = bot