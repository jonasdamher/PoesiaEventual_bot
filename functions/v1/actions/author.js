'use strict';

const axios = require('../config/axios')
const helper = require('../helpers/functions')
const helperAuthor = require('../helpers/author')

module.exports = {
    discover,
    get
}

async function discover(msg) {

    msg.reply('Espera un momento...\nBuscando un autor interesante para ti.')

    return axios.get('author/random').then(author => {

        let authorName = author.data.name
        return helperAuthor.search_author_wiki(msg, authorName)
    }).catch(err => {

        return msg.reply('Hubo un error al tratar de descubrir un autor, disculpa las molestias.')
    })
}

async function get(msg) {

    const data = msg.match[1].trim()

    if (helper.is_id(data)) {
        return helperAuthor.send_author_by_id(msg, data)
    } else {
        return helperAuthor.author_search(msg, data)
    }
}
