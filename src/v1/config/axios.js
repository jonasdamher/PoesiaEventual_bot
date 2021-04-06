'use strict';

const axios = require('axios');
const config = axios.create({
    baseURL: process.env.URL_API,
    headers: {
        common: {
            'Accept': 'application/json'
        }
    }
})
module.exports = config