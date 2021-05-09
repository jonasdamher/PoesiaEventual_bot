'use strict';

const { Markup } = require('telegraf')
const axios = require('../config/axios')
const helper = require('../helpers/functions')


module.exports = {
    discover,
    get_poem,
    get_all_poems_of_author,
    send_poem_by_id
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

async function get_poem(msg) {

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

        return msg.replyWithMarkdown(message, Markup.inlineKeyboard(list))
    }).catch(err => {
        return msg.reply('Disculpa, hubo un error al tratar de encontrar una referencia sobre los poemas.')
    })
}

function create_poems_list(poemTitle, data) {

    // add poems
    let { poems, pagination } = data

    let list = poems.map(poem => {
        let json = JSON.stringify({ method: 'get_poem', data: poem._id })
        return [Markup.button.callback(poem.title + '\n' + 'Autor: ' + poem.author.name, json)]
    })

    // add pagination
    let filterPoemTitle = helper.filter_text_of_pagination(poemTitle)

    let currentPage = pagination.page

    if (currentPage < pagination.lastPage) {
        ++currentPage

        let url = filterPoemTitle + '?perpage=' + pagination.perPage + '&page=' + currentPage
        let messagePagination = 'Mas poemas ' + pagination.page + '/' + pagination.lastPage
        let json = JSON.stringify({ method: 'get_poem', data: url })

        list.push([Markup.button.callback(messagePagination, json)])
    }

    let message = ''
    if (!poemTitle.includes('?perpage=')) {
        message = 'He encontrado ' + pagination.total + ' coincidencias relacionadas con el título *' + filterPoemTitle + '*,\nquizás estas buscando:'
    } else {
        message = 'Página ' + data.pagination.page + ':'
    }

    return { message, list }
}

function create_author_list(author_name, data) {
    let { authors, pagination } = data

    let list = authors.map(author => {
        let json = JSON.stringify({ method: 'get_all_poems_of_author', data: author._id })
        return [Markup.button.callback(author.name, json)]
    })

    let filter_author_name = helper.filter_text_of_pagination(author_name)

    let currentPage = pagination.page

    if (currentPage < pagination.lastPage) {
        ++currentPage

        let url = filter_author_name + '?perpage=' + pagination.perPage + '&page=' + currentPage
        let messagePagination = 'Mas autores ' + pagination.page + '/' + pagination.lastPage
        let json = JSON.stringify({ method: 'get_all_poems_of_author', data: url })

        list.push([Markup.button.callback(messagePagination, json)])
    }

    let message = ''
    if (!poemTitle.includes('?perpage=')) {
        message = 'He encontrado ' + pagination.total + ' coincidencias,\nquizás estas buscando:'
    } else {
        message = 'Página ' + pagination.page + ':'
    }
console.log({ message, list })
    return { message, list }
}

function create_poems_list_of_author(authorId, data) {

    let list = data.poems.map(poem => {

        let json = JSON.stringify({ method: 'send_poem_by_id', data: poem._id })

        return [Markup.button.callback(poem.title, json)]
    })

    let filterAuthorId = helper.filter_text_of_pagination(authorId)

    let currentPage = data.pagination.page

    if (currentPage < data.pagination.lastPage) {
        ++currentPage

        let url = filterAuthorId + '?perpage=' + data.pagination.perPage + '&page=' + currentPage
        let messagePagination = 'Mas poemas ' + data.pagination.page + '/' + data.pagination.lastPage
        let json = JSON.stringify({ method: 'get_all_poems_of_author', data: url })

        list.push([Markup.button.callback(messagePagination, json)])
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

            return msg.replyWithMarkdown(message, Markup.inlineKeyboard(list))

        } else if (!authors.length) {

            return msg.replyWithMarkdown('Disculpa, no se ha podido encontrar una referencia sobre *' + author_name + '*.')
        }

    }).catch(err => {
        return msg.replyWithMarkdown('Disculpa, hubo un error al tratar de encontrar una referencia sobre *' + author_name + '*.')
    })
}