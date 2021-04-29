'use strict';

const dotenv = require('dotenv')
dotenv.config()

// for warning message deprecated of api telegram.
process.env.NTBA_FIX_319 = 1;

const express = require('express')
const app = express()
app.listen(process.env.PORT)

const routes = './src/bot/' + process.env.VERSION + '/routes'
require(routes)
