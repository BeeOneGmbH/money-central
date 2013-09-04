/**
 * Starting point for MONEY CentralDB app
 * http-server
 */

// Module dependencies (environment)
var express = require('express')
    http = require('http'),
    path = require('path');

// Read configuration (environment)
var nconf = require('nconf'),
    settingsFilename = path.join(__dirname, '/settings.json');

console.log('Preparing application, configuration file is %s.', settingsFilename);
nconf.argv().env().file({ file: settingsFilename }).defaults({
    'port': 8080,
    'path': '',
    'database': {
        'host': '127.0.0.1',
        'port': 27017
    }
});
var pathPrefix = nconf.get('path');
if (typeof pathPrefix !== 'string' || pathPrefix.indexOf('\\') !== -1) {
    console.error('Illegal value for path: %s. Check your scripts and settings.json file.', nconf.get('path'));
    process.exit(1);
} else {
    if (pathPrefix.length > 1 && pathPrefix[pathPrefix.length - 1] === '/') {
        console.warn('Incorrect value for path: %s. Trailing slash has been removed, please correct your scripts and/or settings.json file.', nconf.get('path'));
        pathPrefix = pathPrefix.slice(0, -1);
    }
}

// Set configuration (database)
var mongoconf = {
    db: {
        host: nconf.get('database:host'),
        port: nconf.get('database:port'),
        auto_reconnect: true
    },
    secret: '22B43ACFBA8972B119A1CB485C7117BA'
};

// Models
require('./models/Client');

// Initialization
var app = express();

// All environments
app.configure(function() {

    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    app.use(express.bodyParser());

    app.use(app.router);

    // Development only
    if ('development' === app.get('env')) {
        app.use(express.errorHandler());
    }

    app.set('port', nconf.get('port'));
    app.set('views', path.join(__dirname, '/views'));
    app.set('view engine', 'jade');
});

// Module dependencies (database)
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

mongoose.connect('mongodb://' + mongoconf.db.host + ':' + mongoconf.db.port + '/moneyfhccdb');
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

// Routes
var IndexController = require('./routes/index');

app.get(pathPrefix || '/', IndexController.indexAction());
app.post(pathPrefix + '/sync', IndexController.syncAction());

// Http server
http.createServer(app).listen(nconf.get('port'), function(){
    console.info('Express server listening on port %d%s.', nconf.get('port'), pathPrefix.length > 1 ? ', path ' + pathPrefix : '');
});