'use strict';

const dotenv = require('dotenv')
dotenv.config()

// for warning message deprecated of api telegram.
process.env.NTBA_FIX_319 = 1;

const routes = './src/bot/' + process.env.VERSION + '/routes'
const server = './src/bot/' + process.env.VERSION + '/server_bot'

require(routes)
require(server)
