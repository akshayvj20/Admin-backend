const mongoose = require('mongoose');
const { DATABASE_URL } = process.env;
mongoose.connect(DATABASE_URL,{family: 4, useNewUrlParser: true, useUnifiedTopology: true});
const database = mongoose.connection;

database.on('error', (error) => {
    console.log(error)
})

database.once('connected', () => {
    console.log('Database Connected');
})