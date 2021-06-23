'use strict';

const { Markup } = require('telegraf')
const axios = require('../config/axios')
const helper = require('../helpers/functions')

module.exports = {
    discover,
    get_poem,
    get_poems_author
}

async function discover(msg) {

    msg.reply('Espera un momento...\nBuscando un poema interesante para ti.')

    return axios.get('poems/random').then(res => {

        let poem = res.data.data
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

async function get_poems_author(msg) {

    let data = msg.match[1].trim()

    const filter_data = helper.filter_text_of_pagination(data)

    if (helper.is_id(filter_data)) {

        return send_poems_of_author(msg, data)
    } else {

        return author_search(msg, data)
    }
}

async function send_poem_by_id(msg, id) {

    return axios.get('poems/get/' + id).then(res => {

        let poem = res.data.data
        return msg.replyWithMarkdown('*' + poem.title + '*\n' + poem.text + '\n_Autor: ' + poem.author.name + '_')
    }).catch(err => {

        return msg.reply('Disculpa, hubo un error al tratar de encontrar una referencia sobre el título.')
    })
}

async function poem_search(msg, poem_title) {

    let search = helper.add_params(poem_title)

    return axios.get('poems/search/' + search).then(res => {

        let { poems, pagination } = res.data.data

        if (helper.is_data_unique(poems, pagination)) {

            let poem = poems[0]
            return msg.replyWithMarkdown('*' + poem.title + '*\n' + poem.text + '\n_Autor: ' + poem.author.name + '_')

        } else if (poems.length > 0) {

            let { message, list } = create_poems_list(poem_title, res.data.data)
            return msg.replyWithMarkdown(message, Markup.inlineKeyboard(list))

        } else if (!poems.length) {

            return msg.replyWithMarkdown('Disculpa, no se ha podido encontrar una referencia sobre el título *' + poem_title + '*.')
        }

    }).catch(err => {
        return msg.replyWithMarkdown('Disculpa, hubo un error al tratar de encontrar una referencia sobre el título *' + poem_title + '*.')
    })
}

async function send_poems_of_author(msg, author_id) {
    let search = helper.add_params(author_id)

    return axios.get('authors/poems/' + search).then(res => {
        let { message, list } = create_poems_list_of_author(author_id, res.data.data)
        console.log(message, list)
        return msg.replyWithMarkdown(message, Markup.inlineKeyboard(list))

    }).catch(err => {
        console.log(err)
        return msg.reply('Disculpa, hubo un error al tratar de encontrar una referencia sobre los poemas.')
    })
}

function create_poems_list(poemTitle, data) {

    // add poems
    let { poems, pagination } = data

    let list = poems.map(poem => [Markup.button.callback(poem.title + '\n' + 'Autor: ' + poem.author.name, 'get_poem:' + poem._id)])

    // add pagination
    let filterPoemTitle = helper.filter_text_of_pagination(poemTitle)

    let currentPage = pagination.page

    if (currentPage < pagination.lastPage) {
        ++currentPage

        let url = filterPoemTitle + '?perpage=' + pagination.perPage + '&page=' + currentPage
        let messagePagination = 'Mas poemas ' + pagination.page + '/' + pagination.lastPage

        list.push([Markup.button.callback(messagePagination, 'get_poem:' + url)])
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

    let list = authors.map(author => [Markup.button.callback(author.name, 'get_poems_author:' + author._id)])

    let filter_author_name = helper.filter_text_of_pagination(author_name)

    let currentPage = pagination.page

    if (currentPage < pagination.lastPage) {
        ++currentPage

        let url = filter_author_name + '?perpage=' + pagination.perPage + '&page=' + currentPage
        let messagePagination = 'Mas autores ' + pagination.page + '/' + pagination.lastPage
        list.push([Markup.button.callback(messagePagination, 'get_poems_author:' + url)])
    }

    let message = ''
    if (!author_name.includes('?perpage=')) {
        message = 'He encontrado ' + pagination.total + ' coincidencias,\nquizás estas buscando:'
    } else {
        message = 'Página ' + pagination.page + ':'
    }
    return { message, list }
}

function create_poems_list_of_author(author_id, data) {

    let { poems, pagination } = data
    let list = poems.map(poem => [Markup.button.callback(poem.title, 'get_poem:' + poem._id)])

    let filter_author_id = helper.filter_text_of_pagination(author_id)

    let currentPage = pagination.page

    if (currentPage < pagination.lastPage) {
        ++currentPage

        let url = filter_author_id + '?perpage=' + pagination.perPage + '&page=' + currentPage
        let messagePagination = 'Mas poemas ' + pagination.page + '/' + pagination.lastPage

        list.push([Markup.button.callback(messagePagination, 'get_poems_author:' + url)])
    }

    let message = ''
    if (!author_id.includes('?perpage=')) {
        message = 'He encontrado ' + pagination.total + ' poemas:'
    } else {
        message = 'Página ' + pagination.page + ':'
    }

    return { message, list }
}

async function author_search(msg, author_name) {

    let search = helper.add_params(author_name)

    return axios.get('authors/search/' + search).then(res => {

        let { authors, pagination } = res.data.data

        if (helper.is_data_unique(authors, pagination)) {

            let first_author = authors[0]
            return send_poems_of_author(msg, first_author._id)

        } else if (authors.length > 0) {

            let { message, list } = create_author_list(author_name, res.data.data)
            return msg.replyWithMarkdown(message, Markup.inlineKeyboard(list))

        } else if (!authors.length) {
            return msg.replyWithMarkdown('Disculpa, no se ha podido encontrar una referencia sobre *' + author_name + '*.')
        }

    }).catch(err => {
        return msg.replyWithMarkdown('Disculpa, hubo un error al tratar de encontrar una referencia sobre *' + author_name + '*.')
    })
}