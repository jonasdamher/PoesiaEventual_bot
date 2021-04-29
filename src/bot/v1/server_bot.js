'use strict';

const express = require('express');
const app = express();

app.get('/', function (req, res) {
    res.json({ bot: 'poesiaeventual' });
});

app.listen(process.env.PORT);