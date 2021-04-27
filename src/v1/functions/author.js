'use strict';

const bot = require('../config/bot')
const axios = require('../config/axios')

const helper = require('../helpers/functions')

module.exports = {
    discoverAuthor,
    author
}

async function discoverAuthor(msg) {

    axios.get('author/random').then(author => {

        let authorName = author.data.name
        searchAuthorWiki(msg.chat.id, authorName)
    }).catch(err => {

        helper.sendMessage(msg.chat.id, 'Hubo un error al tratar de descubrir un autor, disculpa las molestias.')
    })

    helper.sendMessage(msg.chat.id, 'Espera un momento...\nBuscando un autor interesante para ti.')
}

async function author(msg, match) {

    const data = match[1].trim()

    if (helper.isId(data)) {

        sendAuthorById(msg, data)
    } else {

        authorSearch(msg, data)
    }
}

async function sendAuthorById(msg, id) {

    axios.get('author/get/' + id).then(res => {

        searchAuthorWiki(msg.chat.id, res.data.name)
    }).catch(err => {

        helper.sendMessage(msg.chat.id, 'Disculpa, hubo un error al tratar de encontrar una referencia sobre *' + authorName + '*.')
    })
}

async function authorSearch(msg, authorName) {

    let search = helper.addParams(authorName)

    axios.get('author/search/' + search).then(res => {

        let data = res.data

        if (data.authors.length == 1 &&
            data.pagination.page == 1 &&
            data.pagination.lastPage == 1
        ) {

            let authorNameOne = data.authors[0].name
            searchAuthorWiki(msg.chat.id, authorNameOne)

        } else if (data.authors.length > 0) {

            let { message, options } = createAuthorsList(msg, authorName, data)

            bot.removeListener('callback_query').on('callback_query', res => {
                let currentData = res.data
                author(msg, ['', currentData])
            })

            helper.sendMessage(msg.chat.id, message, options)

        } else if (!data.authors.length) {

            helper.sendMessage(msg.chat.id, 'Disculpa, no se ha podido encontrar una referencia sobre *' + authorName + '*.')
        }

    }).catch(err => {
        helper.sendMessage(msg.chat.id, 'Disculpa, hubo un error al tratar de encontrar una referencia sobre *' + authorName + '*.')
    })
}

async function searchAuthorWiki(userId, authorName, i = 0) {

    let message = 'No se ha encontrado información sobre *' + authorName + '*, disculpe las molestias.'

    let urls = [
        process.env.URL_API_WIKI,
        process.env.URL_API_ECURED,
        process.env.URL_API_CADIZ
    ]

    const url = urls[i] + encodeURI(authorName)

    axios.get(url).then(res => {

        let page = res.data.query.pages
        let key = Object.keys(page)[0]

        let author = page[key]
        let information = ''

        if (author.hasOwnProperty('extract')) {
            let domain = '_Fuente: ' + helper.getDomainName(urls[i]) + '_'
            information = '*' + author.title + '*\n' + author.extract + '\n' + domain
        }
        if (!information.length && urls.length > i) {
            ++i
            return searchAuthorWiki(userId, authorName, i)
        } else {

            if (information.length > 0) {
                message = information
            }

            helper.sendMessage(userId, message)
        }

    }).catch(e => {
        helper.sendMessage(userId, 'Hubo un error al buscar información sobre *' + authorName + '*, disculpe las molestias.')
    })
}

function createAuthorsList(userId, authorName, data) {

    // add authors
    let list = data.authors.map(author => [{ text: author.name, callback_data: author._id }])

    // add pagination
    let filterAuthorName = helper.filterTextForPagination(authorName)

    let currentPage = data.pagination.page

    if (currentPage < data.pagination.lastPage) {
        ++currentPage

        let url = filterAuthorName + '?perpage=' + data.pagination.perPage + '&page=' + currentPage
        let messagePagination = 'Mas autores ' + data.pagination.page + '/' + data.pagination.lastPage

        list.push([{ text: messagePagination, callback_data: url }])
    }

    // Add message and options
    let message = 'He encontrado ' + data.pagination.total + ' coincidencias relacionadas con *' + filterAuthorName + '*,\nquizás estas buscando:'
    let options = {
        parse_mode: 'Markdown',
        reply_to_message_id: userId,
        reply_markup: {
            remove_keyboard: true,
            inline_keyboard: list
        }
    }

    return { message, options }
}