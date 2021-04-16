'use strict';

const bot = require('../config/bot')

module.exports = {
    filterTextForPagination,
    getDomainName,
    isId,
    addParams,
    sendMessage
}

function filterTextForPagination(filterPoemTitle) {
    return filterPoemTitle.includes('?perpage=') && filterPoemTitle.includes('&page=') ? filterPoemTitle.split('?')[0] : filterPoemTitle
}

function getDomainName(url) {
    let domain = (new URL(url))
    return domain.hostname
}

function isId(id) {
    return id.match(/^[0-9a-fA-F]{24}$/)
}

function addParams(search) {
    let params = search.includes('?perpage=') && search.includes('&page=') ? search : search + '?perpage=4&page=1'
    return encodeURI(params)
}

function sendMessage(userId, message, options = { parse_mode: 'Markdown' }) {
    bot.sendMessage(userId, message, options)
}
