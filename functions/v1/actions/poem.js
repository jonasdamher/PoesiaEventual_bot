'use strict';

const { Markup } = require('telegraf')
const bot = require('../config/bot')
const axios = require('../config/axios')
const helper = require('../helpers/functions')

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
        return msg.reply(message)

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


// async function send_poems_of_author(msg, authorId) {

//     axios.get('author/poems/' + authorId).then(res => {

//         let { message, options } = createPoemsAuthorList(msg, authorId, res.data)

//         bot.removeListener('callback_query').on('callback_query', res => {
//             let currentData = res.data

//             if (currentData.includes('?perpage=') && currentData.includes('&page=')) {
//                 poems(msg, ['', currentData])
//             } else {
//                 poem(msg, ['', currentData])
//             }
//         })

//         helper.sendMessage(msg.chat.id, message, options)
//     }).catch(err => {

//         helper.sendMessage(msg.chat.id, 'Disculpa, hubo un error al tratar de encontrar una referencia sobre los poemas.')
//     })
// }

async function send_poem_by_id(msg, id) {

    return axios.get('poem/get/' + id).then(res => {

        let poem = res.data
        return msg.reply('*' + poem.title + '*\n' + poem.text + '\n_Autor: ' + poem.author.name + '_')
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
            return msg.reply('*' + poem.title + '*\n' + poem.text + '\n_Autor: ' + poem.author.name + '_')

        } else if (poems.length > 0) {

            let { message, list } = create_poems_list(poemTitle, res.data)

            bot.removeListener("callback_query");
            bot.on('callback_query', ctx => {
                msg.match[1] = ctx.update.callback_query.data
                return get(msg)
            })

            return msg.reply(message, Markup.inlineKeyboard(list))

        } else if (!poems.length) {

            return msg.reply('Disculpa, no se ha podido encontrar una referencia sobre el título *' + poemTitle + '*.')
        }

    }).catch(err => {
        return msg.reply('Disculpa, hubo un error al tratar de encontrar una referencia sobre el título *' + poemTitle + '*.')
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

// function createAuthorsList(userId, author, data) {

//     // add authors
//     let list = data.authors.map(author => [{ text: author.name, callback_data: author._id }])

//     // add pagination
//     let filterAuthorName = helper.filter_text_of_pagination(author)

//     let currentPage = data.pagination.page

//     if (currentPage < data.pagination.lastPage) {
//         ++currentPage

//         let url = filterAuthorName + '?perpage=' + data.pagination.perPage + '&page=' + currentPage
//         let messagePagination = 'Mas autores ' + data.pagination.page + '/' + data.pagination.lastPage

//         list.push([{ text: messagePagination, callback_data: url }])
//     }

//     // Add message and options
//     let message = ''
//     if (!author.includes('?perpage=')) {
//         message = 'He encontrado ' + data.pagination.total + ' coincidencias,\nquizás estas buscando:'
//     } else {
//         message = 'Página ' + data.pagination.page + ':'
//     }

//     let options = {
//         parse_mode: 'Markdown',
//         reply_to_message_id: userId,
//         reply_markup: {
//             remove_keyboard: true,
//             inline_keyboard: list
//         }
//     }

//     return { message, options }
// }

// function createPoemsAuthorList(msg, authorId, data) {

//     let list = data.poems.map(poem => [{ text: poem.title, callback_data: poem._id }])

//     // add pagination
//     let filterAuthorId = helper.filter_text_of_pagination(authorId)

//     let currentPage = data.pagination.page

//     if (currentPage < data.pagination.lastPage) {
//         ++currentPage

//         let url = filterAuthorId + '?perpage=' + data.pagination.perPage + '&page=' + currentPage
//         let messagePagination = 'Mas poemas ' + data.pagination.page + '/' + data.pagination.lastPage

//         list.push([{ text: messagePagination, callback_data: url }])
//     }

//     let message = ''
//     if (!authorId.includes('?perpage=')) {
//         message = 'He encontrado ' + data.pagination.total + ' poemas,\nquizás estas buscando:'
//     } else {
//         message = 'Página ' + data.pagination.page + ':'
//     }
//     // Add message and options
//     let options = {
//         parse_mode: 'Markdown',
//         reply_to_message_id: msg,
//         reply_markup: {
//             remove_keyboard: true,
//             inline_keyboard: list
//         }
//     }

//     return { message, options }
// }

// async function authorSearch(msg, authorName) {

//     let search = helper.add_params(authorName)

//     axios.get('author/search/' + search).then(res => {

//         let data = res.data

//         if (data.authors.length == 1 &&
//             data.pagination.page == 1 &&
//             data.pagination.lastPage == 1
//         ) {

//             let authorNameOne = data.authors[0]
//             send_poems_of_author(msg, authorNameOne._id)

//         } else if (data.authors.length > 0) {

//             let { message, options } = createAuthorsList(msg, authorName, data)

//             bot.removeListener('callback_query').on('callback_query', res => {
//                 let currentData = res.data
//                 poems(msg, ['', currentData])

//             })

//             helper.sendMessage(msg.chat.id, message, options)

//         } else if (!data.authors.length) {

//             helper.sendMessage(msg.chat.id, 'Disculpa, no se ha podido encontrar una referencia sobre *' + authorName + '*.')
//         }

//     }).catch(err => {
//         helper.sendMessage(msg.chat.id, 'Disculpa, hubo un error al tratar de encontrar una referencia sobre *' + authorName + '*.')
//     })
// }