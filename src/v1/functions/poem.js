'use strict';

const bot = require('../config/bot')
const axios = require('../config/axios')

const helper = require('../helpers/functions')

module.exports = {
    discoverPoem,
    poem
}

async function discoverPoem(msg) {

    axios.get('poem/random').then(res => {

        let poem = res.data
        helper.sendMessage(msg.chat.id, '*' + poem.title + '*\n' + poem.text + '\n_Autor: ' + poem.author.name + '_')
    }).catch(err => {

        helper.sendMessage(msg.chat.id, 'Hubo un error al mostrar la información, disculpa las molestias.')
    })

    helper.sendMessage(msg.chat.id, 'Espera un momento...\nBuscando un poema interesante para ti.')
}

async function poem(msg, match) {

    const data = match[1].trim()

    if (helper.isId(data)) {

        sendPoemById(msg, data)
    } else {

        poemSearch(msg, data)
    }
}

async function sendPoemById(msg, id) {

    axios.get('poem/get/' + id).then(res => {

        let poem = res.data
        helper.sendMessage(msg.chat.id, '*' + poem.title + '*\n' + poem.text + '\n_Autor: ' + poem.author.name + '_')
    }).catch(err => {

        helper.sendMessage(msg.chat.id, 'Disculpa, hubo un error al tratar de encontrar una referencia sobre el título *' + poemTitle + '*.')
    })
}

async function poemSearch(msg, poemTitle) {

    let search = helper.addParams(poemTitle)

    axios.get('poem/search/' + search).then(res => {

        let data = res.data
        if (data.poems.length == 1 &&
            data.pagination.page == 1 &&
            data.pagination.lastPage == 1
        ) {

            let poem = data.poems[0]
            helper.sendMessage(msg.chat.id, '*' + poem.title + '*\n' + poem.text + '\n_Autor: ' + poem.author.name + '_')

        } else if (data.poems.length > 0) {
            console.log('a')

            let { message, options } = createPoemList(msg, poemTitle, data)
            console.log('b')

            bot.removeListener('callback_query').on('callback_query', res => {
                let currentData = res.data
                poem(msg, ['', currentData])
            })

            helper.sendMessage(msg.chat.id, message, options)

        } else if (!data.poems.length) {

            helper.sendMessage(msg.chat.id, 'Disculpa, no se ha podido encontrar una referencia sobre el título *' + poemTitle + '*.')
        }

    }).catch(err => {
        helper.sendMessage(msg.chat.id, 'Disculpa, hubo un error al tratar de encontrar una referencia sobre el título *' + poemTitle + '*.')
    })
}

function createPoemList(userId, poemTitle, data) {

    // add poems
    let { poems, pagination } = data

    let list = poems.map(poem => [{ text: poem.title, callback_data: poem._id }])

    // add pagination
    let filterPoemTitle = helper.filterTextForPagination(poemTitle)

    let currentPage = pagination.page

    if (currentPage < pagination.lastPage) {
        ++currentPage

        let url = filterPoemTitle + '?perpage=' + pagination.perPage + '&page=' + currentPage
        let messagePagination = 'Mas poemas ' + pagination.page + '/' + pagination.lastPage

        list.push([{ text: messagePagination, callback_data: url }])
    }

    // Add message and options
    let message = 'He encontrado ' + pagination.total + ' coincidencias relacionadas con el título *' + filterPoemTitle + '*,\nquizás estas buscando:'
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