'use strict';

const bot = require('../config/bot')
const axios = require('../config/axios')
const cheerio = require('cheerio')

module.exports = {
    author
}

async function author(msg, match, list = false) {

    const authorName = match[1].trim()

    let message = ''
    let options = { parse_mode: 'Markdown' }

    let data = await authorSearch(authorName)

    if (!data.authors.length) {
        message = 'Disculpa, no se ha podido encontrar una referencia sobre ***' + authorName + '***.'

    } else if (data.authors.length == 1) {
        let name = data.authors[0].name
        message = await showAuthor(msg, name)
    } else {
        let { messageList, optionsList } = await listAuthor(msg, authorName, data)
        message = messageList
        options = optionsList
    }

    if (!list) {
        if (options.hasOwnProperty('reply_markup')) {
            bot.removeListener('callback_query')
                .on('callback_query', res => {
                    author(msg, ['', res.data], true)
                })
        }
    }

    return bot.sendMessage(msg.chat.id, message, options)
}

async function authorWiki(authorName) {

    let name = authorName.replace(' ', '_')
    const url = name.normalize("NFD").replace(/[\u0300-\u036f]/g, '')

    const a = await axios.get('https://es.wikipedia.org/wiki/' + url).then(res => {
        const $ = cheerio.load(res.data)
        let info = $('.infobox')

        let authorImage = $(info).find('a.image img').attr('src').replace('//', '')

        return authorImage

    }).catch(e => [])

    return a
}

async function showAuthor(msg, name) {
    let message = 'Sobre ' + name
    let image = await authorWiki(name);
    bot.sendPhoto(msg.chat.id, image)
    return message
}

async function listAuthor(msg, authorName, data) {
    let list = data.authors.map(author => [{ text: author.name, callback_data: author.name }])

    if (data.hasOwnProperty('pagination')) {
        list.push([{
            text: 'Mas autores',
            callback_data: authorName + '?perpage=' + data.pagination.perPage + '&page=' + data.pagination.page
        }])
    }

    let messageList = 'Quizás estes buscando:'
    let optionsList = {}

    optionsList.reply_to_message_id = msg.message_id
    optionsList.reply_markup = {
        resize_keyboard: true,
        one_time_keyboard: true,
        inline_keyboard: list
    }
    return { messageList, optionsList }
}

async function getURLAuthor(author) {
    let url = author + '?perpage=3&page=1'
    if (author.includes('?perpage=') && author.includes('&page=')) {
        url = author
    }
    return encodeURI(url)
}

async function authorSearch(name) {

    let authorName = await getURLAuthor(name)
    let authors = await axios.get('author/search/' + authorName).then(res => {
        return res
    }).catch(err => err)
    return authors.data
}
