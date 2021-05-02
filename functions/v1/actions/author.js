'use strict';

const bot = require('../config/bot')
const axios = require('../config/axios')

const helper = require('../helpers/functions')

module.exports = {
    discover,
    get
}

async function discover(msg) {

    msg.reply('Espera un momento...\nBuscando un autor interesante para ti.')

    return axios.get('author/random').then(author => {

        let authorName = author.data.name
        return searchAuthorWiki(msg, authorName)
    }).catch(err => {

        return msg.reply('Hubo un error al tratar de descubrir un autor, disculpa las molestias.')
    })
}

async function get(msg) {

    const data = msg.match[1].trim()

    if (helper.isId(data)) {
        return sendAuthorById(msg, data)
    } else {
        return authorSearch(msg, data)
    }
}

async function sendAuthorById(msg, id) {

    return axios.get('author/get/' + id).then(res => {
        return searchAuthorWiki(msg, res.data.name)
    }).catch(err => {
        return msg.reply('Disculpa, hubo un error al tratar de encontrar una referencia sobre *' + authorName + '*.')
    })
}

function createAuthorsList(authorName, data) {

    // add authors
    let list = data.authors.map(author => {
        return {
            id: author._id,
            title: author.name,
            type: 'article',
            input_message_content: {
                message_text: author.name,
                parse_mode: 'markdown'
            }
        }
    })

    // add pagination
    let filterAuthorName = helper.filterTextForPagination(authorName)

    let currentPage = data.pagination.page

    if (currentPage < data.pagination.lastPage) {
        ++currentPage

        let url = filterAuthorName + '?perpage=' + data.pagination.perPage + '&page=' + currentPage
        let messagePagination = 'Mas autores ' + data.pagination.page + '/' + data.pagination.lastPage

        list.push({
            id: url,
            title: messagePagination,
            type: 'article',
            input_message_content: {
                message_text: messagePagination,
                parse_mode: 'HTML'
            }
        })
    }

    let message = ''
    if (!authorName.includes('?perpage=')) {
        message = 'He encontrado ' + data.pagination.total + ' coincidencias relacionadas con *' + filterAuthorName + '*,\nquizás estas buscando:'
    } else {
        message = 'Página ' + data.pagination.page + ':'
    }
    return { message, list }
}

async function authorSearch(msg, authorName) {

    let search = helper.addParams(authorName)

    return axios.get('author/search/' + search).then(res => {

        let data = res.data

        if (data.authors.length == 1 &&
            data.pagination.page == 1 &&
            data.pagination.lastPage == 1
        ) {

            let authorNameOne = data.authors[0].name
            return searchAuthorWiki(msg, authorNameOne)

        } else if (data.authors.length > 0) {

            let { message, list } = createAuthorsList(authorName, data)

            bot.removeListener('callback_query').on('callback_query', res => {
                msg.match[1] = ['', res.data.trim()]
                return get(msg)
            })

            msg.reply(message)
            return msg.answerInlineQuery(list)

        } else if (!data.authors.length) {

            return msg.reply('Disculpa, no se ha podido encontrar una referencia sobre *' + authorName + '*.')
        }

    }).catch(err => {
        return msg.reply('Disculpa, hubo un error al tratar de encontrar una referencia sobre *' + authorName + '*.')
    })
}

async function searchAuthorWiki(msg, authorName, i = 0) {

    let message = 'No se ha encontrado información sobre *' + authorName + '*, disculpe las molestias.'

    let urls = [
        process.env.URL_API_WIKI,
        process.env.URL_API_ECURED,
        process.env.URL_API_CADIZ
    ]

    const url = urls[i] + encodeURI(authorName)

    return axios.get(url).then(res => {

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
            return searchAuthorWiki(msg, authorName, i)
        } else {

            if (information.length > 0) {
                message = information
            }
            return msg.reply(message)
        }

    }).catch(e => {
        return msg.reply('Hubo un error al buscar información sobre *' + authorName + '*, disculpe las molestias.')
    })
}