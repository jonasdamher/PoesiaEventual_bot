'use strict';

const { Markup } = require('telegraf')
const bot = require('../config/bot')
const axios = require('../config/axios')
const helper = require('../helpers/functions')
const EventEmitter = require('eventemitter3')
const EE = new EventEmitter()

module.exports = {
    discover,
    get,
    get_all_poems_of_author
}

async function discover(msg) {

    msg.reply('Espera un momento...\nBuscando un poema interesante para ti.')

    return axios.get('poem/random').then(res => {

        let poem = res.data
        let message = '*' + poem.title + '*\n' + poem.text + '\nAutor: ' + poem.author.name
        return msg.replyWithMarkdown(message)

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

async function get_all_poems_of_author(msg) {

    let data = msg.match[1].trim()

    const filter_data = helper.filter_text_of_pagination(data)

    if (helper.is_id(filter_data)) {

        return send_poems_of_author(msg, data)
    } else {

        return author_search(msg, data)
    }
}

async function send_poem_by_id(msg, id) {

    return axios.get('poem/get/' + id).then(res => {

        let poem = res.data
        return msg.replyWithMarkdown('*' + poem.title + '*\n' + poem.text + '\n_Autor: ' + poem.author.name + '_')
    }).catch(err => {

        return msg.reply('Disculpa, hubo un error al tratar de encontrar una referencia sobre el título.')
    })
}

async function poem_search(msg, poemTitle) {

    let search = helper.add_params(poemTitle)

    return axios.get('poem/search/' + search).then(res => {

        let { poems, pagination } = res.data

        if (poems.length == 1 &&
            pagination.page == 1 &&
            pagination.lastPage == 1
        ) {

            let poem = poems[0]
            return msg.replyWithMarkdown('*' + poem.title + '*\n' + poem.text + '\n_Autor: ' + poem.author.name + '_')

        } else if (poems.length > 0) {

            let { message, list } = create_poems_list(poemTitle, res.data)
         
             bot.on('callback_query', ctx => {
                msg.match[1] = ctx.update.callback_query.data
                ctx.answerCbQuery()
                return get(msg)

            })

            return msg.replyWithMarkdown(message, Markup.inlineKeyboard(list))

        } else if (!poems.length) {

            return msg.replyWithMarkdown('Disculpa, no se ha podido encontrar una referencia sobre el título *' + poemTitle + '*.')
        }

    }).catch(err => {
        return msg.replyWithMarkdown('Disculpa, hubo un error al tratar de encontrar una referencia sobre el título *' + poemTitle + '*.')
    })
}

async function send_poems_of_author(msg, id) {

    return axios.get('author/poems/' + id).then(res => {

        let { message, list } = create_poems_list_of_author(id, res.data)
        
         bot.on('callback_query', ctx => {
            msg.match[1] = ctx.update.callback_query.data
            ctx.answerCbQuery()

            if (msg.match[1].includes('?perpage=') && msg.match[1].includes('&page=')) {
                return  get_all_poems_of_author(msg)
            } else {
                return send_poem_by_id(msg, msg.match[1])
            }
        })

        return msg.replyWithMarkdown(message, Markup.inlineKeyboard(list))
    }).catch(err => {
        return msg.reply(msg.chat.id, 'Disculpa, hubo un error al tratar de encontrar una referencia sobre los poemas.')
    })
}

function create_poems_list(poemTitle, data) {

    // add poems
    let { poems, pagination } = data

    let list = poems.map(poem => [Markup.button.callback(poem.title + '\n' + 'Autor: ' + poem.author.name, poem._id)])

    // add pagination
    let filterPoemTitle = helper.filter_text_of_pagination(poemTitle)

    let currentPage = pagination.page

    if (currentPage < pagination.lastPage) {
        ++currentPage

        let url = filterPoemTitle + '?perpage=' + pagination.perPage + '&page=' + currentPage
        let messagePagination = 'Mas poemas ' + pagination.page + '/' + pagination.lastPage

        list.push([Markup.button.callback(messagePagination, url)])
    }

    let message = ''
    if (!poemTitle.includes('?perpage=')) {
        message = 'He encontrado ' + pagination.total + ' coincidencias relacionadas con el título *' + filterPoemTitle + '*,\nquizás estas buscando:'
    } else {
        message = 'Página ' + data.pagination.page + ':'
    }

    return { message, list }
}

function create_author_list(authorName, data) {

    let list = data.authors.map(author => [Markup.button.callback(author.name, author._id)])
    let filterAuthorName = helper.filter_text_of_pagination(authorName)

    let currentPage = data.pagination.page

    if (currentPage < data.pagination.lastPage) {
        ++currentPage

        let url = filterAuthorName + '?perpage=' + data.pagination.perPage + '&page=' + currentPage
        let messagePagination = 'Mas autores ' + data.pagination.page + '/' + data.pagination.lastPage

        list.push([Markup.button.callback(messagePagination, url)])
    }

    // Add message and options
    let message = ''
    if (!authorName.includes('?perpage=')) {
        message = 'He encontrado ' + data.pagination.total + ' coincidencias,\nquizás estas buscando:'
    } else {
        message = 'Página ' + data.pagination.page + ':'
    }

    return { message, list }
}

function create_poems_list_of_author(authorId, data) {

    let list = data.poems.map(poem => [Markup.button.callback(poem.title, poem._id)])
    let filterAuthorId = helper.filter_text_of_pagination(authorId)

    let currentPage = data.pagination.page

    if (currentPage < data.pagination.lastPage) {
        ++currentPage

        let url = filterAuthorId + '?perpage=' + data.pagination.perPage + '&page=' + currentPage
        let messagePagination = 'Mas poemas ' + data.pagination.page + '/' + data.pagination.lastPage

        list.push([Markup.button.callback(messagePagination, url)])
    }

    let message = ''
    if (!authorId.includes('?perpage=')) {
        message = 'He encontrado ' + data.pagination.total + ' poemas,\nquizás estas buscando:'
    } else {
        message = 'Página ' + data.pagination.page + ':'
    }

    return { message, list }
}

async function author_search(msg, author_name) {

    let search = helper.add_params(author_name)

    return axios.get('author/search/' + search).then(res => {

        let { authors, pagination } = res.data

        if (authors.length == 1 &&
            pagination.page == 1 &&
            pagination.lastPage == 1
        ) {

            let first_author = authors[0]
            return send_poems_of_author(msg, first_author._id)

        } else if (authors.length > 0) {

            let { message, list } = create_author_list(author_name, res.data)
 
             bot.on('callback_query', ctx => {
                msg.match[1] = ctx.update.callback_query.data
                ctx.answerCbQuery()

                return  get_all_poems_of_author(msg)
 
            })

            return msg.replyWithMarkdown(message, Markup.inlineKeyboard(list))

        } else if (!authors.length) {

            return msg.replyWithMarkdown('Disculpa, no se ha podido encontrar una referencia sobre *' + author_name + '*.')
        }

    }).catch(err => {
        return msg.replyWithMarkdown('Disculpa, hubo un error al tratar de encontrar una referencia sobre *' + author_name + '*.')
    })
}