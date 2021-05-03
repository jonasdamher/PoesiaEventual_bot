'use strict';

module.exports = {
    filter_text_of_pagination,
    get_domain_name,
    is_id,
    add_params
}

function filter_text_of_pagination(filterPoemTitle) {
    return filterPoemTitle.includes('?perpage=') && filterPoemTitle.includes('&page=') ? filterPoemTitle.split('?')[0] : filterPoemTitle
}

function get_domain_name(url) {
    let domain = (new URL(url))
    return domain.hostname
}

function is_id(id) {
    return id.match(/^[0-9a-fA-F]{24}$/)
}

function add_params(search) {
    let params = search.includes('?perpage=') && search.includes('&page=') ? search : search + '?perpage=4&page=1'
    return encodeURI(params)
}
