'use strict';

const { Markup } = require('telegraf')
const axios = require('../config/axios')
const helper = require('../helpers/functions')

module.exports = {
    discover,
    get_author
}

async function discover(msg) {

    msg.reply('Espera un momento...\nBuscando un autor interesante para ti.')

    return axios.get('authors/random').then(author => {

        let name = author.data.result.personal.name;
        let lastname = author.data.result.personal.lastname;
        let description = author.data.result.short_description;

        let info = name + ' ' + lastname + '\n' + description;

        return msg.reply(info);

    }).catch(err => {

        return msg.reply('Hubo un error al tratar de descubrir un autor, disculpa las molestias.')
    })
}

async function get_author(msg) {

    const data = msg.match[1].trim()

    if (helper.is_id(data)) {
        return send_author_by_id(msg, data)
    } else {
        return author_search(msg, data)
    }
}

async function send_author_by_id(msg, id) {

    return axios.get('authors/get/' + id).then(author => {

        let name = author.data.result.personal.name;
        let lastname = author.data.result.personal.lastname;
        let description = author.data.result.short_description;

        let info = name + ' ' + lastname + '\n' + description;
        return msg.reply(info);

    }).catch(err => {
        return msg.replyWithMarkdown('Disculpa, hubo un error al tratar de encontrar una referencia sobre el autor.')
    })
}

function create_authors_list(author_name, data) {

    let list = data.authors.map(author => [Markup.button.callback(author.personal.name, 'get_author:' + author._id)])

    let filter_author_name = helper.filter_text_of_pagination(author_name)

    let currentPage = data.pagination.page

    if (currentPage < data.pagination.lastPage) {
        ++currentPage

        let url = filter_author_name + '?perpage=' + data.pagination.perPage + '&page=' + currentPage
        let messagePagination = 'Mas autores ' + data.pagination.page + '/' + data.pagination.lastPage

        list.push([Markup.button.callback(messagePagination, 'get_author:' + url)])
    }

    let message = ''
    if (!author_name.includes('?perpage=')) {
        message = 'He encontrado ' + data.pagination.total + ' coincidencias relacionadas con *' + filter_author_name + '*,\nquizás estas buscando:'
    } else {
        message = 'Página ' + data.pagination.page + ':'
    }
    return { message, list }
}

async function author_search(msg, author_name) {

    let search = helper.add_params(author_name)

    return axios.get('authors/search/' + search).then(res => {

        let { authors, pagination } = res.data.result

        if (helper.is_data_unique(authors, pagination)) {

            let first_author = authors[0]
            let name = first_author.personal.name;
            let lastname = first_author.personal.lastname;
            let description = first_author.short_description;

            let info = name + ' ' + lastname + '\n' + description;
            return msg.reply(info);

        } else if (authors.length > 0) {

            let { message, list } = create_authors_list(author_name, res.data.result)
            return msg.replyWithMarkdown(message, Markup.inlineKeyboard(list))

        } else if (!authors.length) {

            return msg.replyWithMarkdown('Disculpa, no se ha podido encontrar una referencia sobre *' + author_name + '*.')
        }

    }).catch(err => {
        return msg.replyWithMarkdown('Disculpa, hubo un error al tratar de encontrar una referencia sobre *' + author_name + '*.')
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