'use strict';

const { Markup } = require('telegraf')
const bot = require('../config/bot')
const axios = require('../config/axios')
const helper = require('../helpers/functions')
const EventEmitter = require('eventemitter3')
const EE = new EventEmitter()

module.exports = {
    discover,
    get
}

async function discover(msg) {

    msg.reply('Espera un momento...\nBuscando un autor interesante para ti.')

    return axios.get('author/random').then(author => {

        let authorName = author.data.name
        return search_author_wiki(msg, authorName)
    }).catch(err => {

        return msg.reply('Hubo un error al tratar de descubrir un autor, disculpa las molestias.')
    })
}

async function get(msg) {

    const data = msg.match[1].trim()

    if (helper.is_id(data)) {
        return send_author_by_id(msg, data)
    } else {
        return author_search(msg, data)
    }
}

async function send_author_by_id(msg, id) {

    return axios.get('author/get/' + id).then(res => {
        return search_author_wiki(msg, res.data.name)
    }).catch(err => {
        return msg.replyWithMarkdown('Disculpa, hubo un error al tratar de encontrar una referencia sobre el autor.')
    })
}

function create_authors_list(authorName, data) {

    let list = data.authors.map(author => [Markup.button.callback(author.name,  '{method:'+author._id)])
    let filterAuthorName = helper.filter_text_of_pagination(authorName)

    let currentPage = data.pagination.page

    if (currentPage < data.pagination.lastPage) {
        ++currentPage

        let url = filterAuthorName + '?perpage=' + data.pagination.perPage + '&page=' + currentPage
        let messagePagination = 'Mas autores ' + data.pagination.page + '/' + data.pagination.lastPage
 
        list.push([Markup.button.callback(messagePagination, '/autor '+url)])
    }

    let message = ''
    if (!authorName.includes('?perpage=')) {
        message = 'He encontrado ' + data.pagination.total + ' coincidencias relacionadas con *' + filterAuthorName + '*,\nquizás estas buscando:'
    } else {
        message = 'Página ' + data.pagination.page + ':'
    }
    return { message, list }
}

async function author_search(msg, authorName) {

    let search = helper.add_params(authorName)

    return axios.get('author/search/' + search).then(res => {

        let { authors, pagination } = res.data
        console.log('ok search authors')
        if (authors.length == 1 &&
            pagination.page == 1 &&
            pagination.lastPage == 1
        ) {

            let authorNameOne = authors[0].name
            return search_author_wiki(msg, authorNameOne)

        } else if (authors.length > 0) {
            let { message, list } = create_authors_list(authorName, res.data)
            console.log('create list')
            return msg.replyWithMarkdown(message, Markup.inlineKeyboard(list))

        } else if (!authors.length) {

            return msg.replyWithMarkdown('Disculpa, no se ha podido encontrar una referencia sobre *' + authorName + '*.')
        }

    }).catch(err => {
        return msg.replyWithMarkdown('Disculpa, hubo un error al tratar de encontrar una referencia sobre *' + authorName + '*.')
    })
}

async function search_author_wiki(msg, authorName, i = 0) {

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
            let domain = '_Fuente: ' + helper.get_domain_name(urls[i]) + '_'
            information = '*' + author.title + '*\n' + author.extract + '\n' + domain
        }

        if (!information.length && urls.length > i) {
            ++i
            return search_author_wiki(msg, authorName, i)
        } else {

            if (information.length > 0) {
                message = information
            }
            return msg.replyWithMarkdown(message)
        }

    }).catch(e => {
        return msg.replyWithMarkdown('Hubo un error al buscar información sobre *' + authorName + '*, disculpe las molestias.')
    })
}