'use strict';

module.exports = {
    start,
    help
}

async function start(ctx) {

    let startMessage = `Bienvenido ${ctx.chat.first_name}.\nAquí puedes consultar mas de *12.000* poemas de mas de *1.300* autores.`
    ctx.reply(startMessage)
}

async function help(ctx) {

    let welcomeMessage = `Comandos:\n
Muestra información sobre un autor. 
/autor Mario Benedetti\n
Muestra los poemas de un autor.
/poemas Pablo Neruda\n
Muestra un poema específico. 
/poema Te quiero\n
Muestra información de un autor aleatorio. 
/descubrir_autor\n
Muestra un poema aleatorio. 
/descubrir_poema
    `
    ctx.reply(welcomeMessage)
}
