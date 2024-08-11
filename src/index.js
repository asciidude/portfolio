require('dotenv').config()

const Logger = require('sharplogger');
module.exports.logger = new Logger(`${__dirname}/logs/log`, 'log', true);
this.logger.initialize();

// Database connection
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
this.logger.info('Set mongoose.Promise to global.Promise');

mongoose.set('strictQuery', false);
this.logger.info('Set Mongoose strictQuery to false');

mongoose.connect(process.env.MONGO_URI)
    .then(() => this.logger.info('Connected to MongoDB database'))
    .catch((e) => this.logger.error(`Unable to connect to MongoDB database:\n${e}`, true))

// Express app
const path = require('path');

const cors = require('cors');
const cookieParser = require('cookie-parser');
const APIRouter = require('./api/routes/router');

const express = require('express');
const verify = require('./api/middleware/verify');
const Project = require('./api/models/Project');
const app = express();

// Set view engine & views directory
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static path
app.use(express.static(path.join(__dirname, 'public')));

// Views :o
app.get('/', verify, async (req, res) => {
    const projects = await Project.find({});
    res.render('index', { admin: req.admin, projects: projects });
});

app.get('/auth', verify, (req, res) => {
    if(req.admin) {
        res.sendStatus(401);
    } else {
        res.render('auth');
    }
});

app.get('/add-project', verify, (req, res) => {
    if(!req.admin) {
        res.sendStatus(401);
    } else {
        res.render('addProject');
    }
});

app.get('/edit-project/:id', verify, async (req, res) => {
    if(!req.admin) {
        res.sendStatus(401);
    } else {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).send('Invalid ID format');
        }

        const project = await Project.findById(id);

        if (!project) {
            return res.status(404).send('Project not found');
        }

        res.render('editProject', { admin: req.admin, project: project });
    }
});

// API
app.use(cors({
    origin: process.env.ORIGIN_URL,
    optionsSuccessStatus: 200
}));

app.disable('x-powered-by');
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

APIRouter(app);

// Listen
app.listen(
    process.env.PORT || 8080,
    () => this.logger.info(`Listening on port ${process.env.PORT || 8080}`)
);