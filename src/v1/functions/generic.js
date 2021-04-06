'use strict';

const bot = require('../config/bot')

module.exports = {
    start
}

async function start(msg) {
    let welcomeMessage = `Bienvenido ${msg.chat.first_name}.\nAquí puedes consultar mas de <b>12000</b> poema de mas de <b>1300</b> autores de habla hispana.`
    return bot.sendMessage(msg.chat.id, welcomeMessage, { parse_mode: "HTML" })
}
