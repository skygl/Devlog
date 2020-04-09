import mongoose from 'mongoose';
import './env';

const MONGO_DB_HOST = process.env.MONGO_DB_HOST;
const MONGO_DB_PORT = process.env.MONGO_DB_PORT;
const MONGO_DB_DATABASE = process.env.MONGO_DB_DATABASE;
const MONGO_DB_URL = 'mongodb://' + MONGO_DB_HOST + ':' + MONGO_DB_PORT + '/' + MONGO_DB_DATABASE;

mongoose.Promise = global.Promise;
mongoose.set("useNewUrlParser", true);
mongoose.set("useUnifiedTopology", true);

console.log("Try to Connect to MongoDB Server :", MONGO_DB_URL, "\n");
mongoose.connect(MONGO_DB_URL)
    .then(() => {
        console.log('\n', '=================================');
        console.log('Successfully Connected to MongoDB');
    })
    .catch(e => {
        console.log('\n', '=================================');
        console.error('Failed to Connect to MongoDB', e);
    });