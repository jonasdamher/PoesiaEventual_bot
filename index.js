'use strict';

const dotenv = require('dotenv')
dotenv.config()

// for warning message deprecated of api telegram.
process.env.NTBA_FIX_319 = 1;

const routes = './src/bot/' + process.env.VERSION + '/routes'
require(routes)
