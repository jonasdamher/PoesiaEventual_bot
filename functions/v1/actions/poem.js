'use strict';

const axios = require('../config/axios')
// const helper = require('../helpers/functions')

module.exports = {
    discover
    // poem,
    // poems
}

async function discover(msg) {

    axios.get('poem/random').then(res => {

        let poem = res.data
        let message = poem.title + '\n' + poem.text + '\nAutor: ' + poem.author.name
        msg.reply(message)

        callback(null, {
            statusCode: 200,
            body: JSON.stringify(res.data)
        });

    }).catch(err => {

        msg.reply('Hubo un error al mostrar la información, disculpa las molestias.')

        callback(err);
    });

    msg.reply('Espera un momento...\nBuscando un poema interesante para ti.')
}

// async function poems(msg, match) {

//     let data = match[1].trim()

//     const filterParams = helper.filterTextForPagination(data)

//     if (helper.isId(filterParams)) {

//         sendPoemsOfAuthor(msg, data)
//     } else {

//         authorSearch(msg, data)
//     }
// }

// async function poem(msg, match) {

//     const data = match[1].trim()

//     if (helper.isId(data)) {

//         sendPoemById(msg, data)
//     } else {

//         poemSearch(msg, data)
//     }
// }

// async function sendPoemsOfAuthor(msg, authorId) {

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

// async function sendPoemById(msg, id) {

//     axios.get('poem/get/' + id).then(res => {

//         let poem = res.data
//         helper.sendMessage(msg.chat.id, '*' + poem.title + '*\n' + poem.text + '\n_Autor: ' + poem.author.name + '_')
//     }).catch(err => {

//         helper.sendMessage(msg.chat.id, 'Disculpa, hubo un error al tratar de encontrar una referencia sobre el título.')
//     })
// }

// async function poemSearch(msg, poemTitle) {

//     let search = helper.addParams(poemTitle)

//     axios.get('poem/search/' + search).then(res => {

//         let data = res.data
//         if (data.poems.length == 1 &&
//             data.pagination.page == 1 &&
//             data.pagination.lastPage == 1
//         ) {

//             let poem = data.poems[0]
//             helper.sendMessage(msg.chat.id, '*' + poem.title + '*\n' + poem.text + '\n_Autor: ' + poem.author.name + '_')

//         } else if (data.poems.length > 0) {

//             let { message, options } = createPoemList(msg, poemTitle, data)
//             bot.removeListener('callback_query').on('callback_query', res => {
//                 let currentData = res.data
//                 poem(msg, ['', currentData])
//             })

//             helper.sendMessage(msg.chat.id, message, options)

//         } else if (!data.poems.length) {

//             helper.sendMessage(msg.chat.id, 'Disculpa, no se ha podido encontrar una referencia sobre el título *' + poemTitle + '*.')
//         }

//     }).catch(err => {
//         helper.sendMessage(msg.chat.id, 'Disculpa, hubo un error al tratar de encontrar una referencia sobre el título *' + poemTitle + '*.')
//     })
// }

// function createPoemList(userId, poemTitle, data) {

//     // add poems
//     let { poems, pagination } = data

//     let list = poems.map(poem => [{
//         text: poem.title + '\n' +
//             'Autor: ' + poem.author.name, callback_data: poem._id
//     }])

//     // add pagination
//     let filterPoemTitle = helper.filterTextForPagination(poemTitle)

//     let currentPage = pagination.page

//     if (currentPage < pagination.lastPage) {
//         ++currentPage

//         let url = filterPoemTitle + '?perpage=' + pagination.perPage + '&page=' + currentPage
//         let messagePagination = 'Mas poemas ' + pagination.page + '/' + pagination.lastPage

//         list.push([{ text: messagePagination, callback_data: url }])
//     }

//     let message = ''
//     if (!poemTitle.includes('?perpage=')) {
//         message = 'He encontrado ' + pagination.total + ' coincidencias relacionadas con el título *' + filterPoemTitle + '*,\nquizás estas buscando:'
//     } else {
//         message = 'Página ' + data.pagination.page + ':'
//     }
//     // Add message and options
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

// function createAuthorsList(userId, author, data) {

//     // add authors
//     let list = data.authors.map(author => [{ text: author.name, callback_data: author._id }])

//     // add pagination
//     let filterAuthorName = helper.filterTextForPagination(author)

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
//     let filterAuthorId = helper.filterTextForPagination(authorId)

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

//     let search = helper.addParams(authorName)

//     axios.get('author/search/' + search).then(res => {

//         let data = res.data

//         if (data.authors.length == 1 &&
//             data.pagination.page == 1 &&
//             data.pagination.lastPage == 1
//         ) {

//             let authorNameOne = data.authors[0]
//             sendPoemsOfAuthor(msg, authorNameOne._id)

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
