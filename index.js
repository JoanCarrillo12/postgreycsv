const express = require('express');
const app = express();

//middelwares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//routes
app.use(require('./routes/departments'));

app.listen(5000);
console.log('Server up localhost:5000');