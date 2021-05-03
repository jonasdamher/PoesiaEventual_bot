'use strict';

const axios = require('../config/axios')
const helper = require('../helpers/functions')
const { send_poem_by_id, poem_search } = require('../helpers/poem')

module.exports = {
    discover,
    get
    // get_all_poems_for_author
}

async function discover(msg) {

    msg.reply('Espera un momento...\nBuscando un poema interesante para ti.')

    return axios.get('poem/random').then(res => {

        let poem = res.data
        let message = '*' + poem.title + '*\n' + poem.text + '\nAutor: ' + poem.author.name
        return msg.reply(message, { reply_markup: 'markdown' })

    }).catch(err => {
        return msg.reply('Hubo un error al mostrar la información, disculpa las molestias.')
    })
}

async function get(msg) {

    const data = msg.match[1].trim()

    if (helper.is_id(data)) {

        return send_poem_by_id(msg, data)
    } else {

        return poem_search(msg, data)
    }
}

// async function get_all_poems_for_author(msg, match) {

//     let data = match[1].trim()

//     const filterParams = helper.filter_text_of_pagination(data)

//     if (helper.is_id(filterParams)) {

//         send_poems_of_author(msg, data)
//     } else {

//         authorSearch(msg, data)
//     }
// }