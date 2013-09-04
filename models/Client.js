var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var clientSchema = Schema({
    id: { type: String, required: true },
    url: String,
    country: { type: String, required: true },
    result: { type: Schema.Types.Mixed, required: true },
    lastSync: { type: Date, required: true, default: Date.now }
});

/**
 * Adds the client information or updates it if it is a returning client
 *
 * @param {Object} data \{ {String} id, {String} url, {String} country \} with parameters identifying the client
 * @param {function} callback Callback function
 */
clientSchema.statics.accomodate = function(data, callback) {
    this.findOne({ id: data.id} ).exec(function(err, addOrUpdate) {
        if (err) return callback(err);
        if (addOrUpdate === null) {
            console.log('[client:new] id=%s', data.id);
            addOrUpdate = new Client(data);
        } else {
            if (addOrUpdate.url !== data.url) {
                console.log('[client:mod] id=%s - referer changed (was=%s,now=%s)', data.id, addOrUpdate.url, data.url);
                addOrUpdate.url = data.url;
            }
            if (addOrUpdate.country !== data.country) {
                console.log('[client:mod] id=%s - country changed (was=%s,now=%s)', data.id, addOrUpdate.country, data.country);
                addOrUpdate.country = data.country;
            }
            if (data.result) {
                addOrUpdate.result = data.result;
            }
            addOrUpdate.lastSync = new Date();
        }
        addOrUpdate.save(callback);
    });
};

/**
 * Aggregates the all client's data for statisstical purposes.
 *
 * @param {function} callback Callback function
 */
clientSchema.statics.aggregate = function(callback) {
    // TODO async.parallel as soon as we sync more than just the results
    this.find({result: { $exists: true }}).exec(function(err, clients) {
        var emptyResult = function () {
                return {SuperHero: 0, Nonbeliever: 0, JollyJoker: 0, SmartCookie: 0, BeanCounter: 0};
            },
            resultsPerCountry = {},
            resultsTotal = emptyResult();
        if (clients.length === 0) {
            callback(err, { result: {total: resultsTotal} });
            return;
        }
        clients.forEach(function (client) {
            if (!resultsPerCountry[client.country]) {
                resultsPerCountry[client.country] = emptyResult();
            }
            Object.keys(client.result || {}).forEach(function(persona) {
                var add = client.result[persona] || 0;
                if (resultsTotal[persona]) {
                    resultsPerCountry[client.country][persona] += add;
                    resultsTotal[persona] += add;
                }
            });
        });
        callback(err, { result: {perCountry: resultsPerCountry, total: resultsTotal} });
    });
};

/**
 * Retrieves the client data for displaying purposes.
 *
 * @param {function} callback Callback function
 */
clientSchema.statics.prettyPrint = function(callback) {
    this.find().sort({url: 'ASC'}).exec(function(err, clients) {
        callback(err, clients);
    });
};

var Client = mongoose.model('Client', clientSchema);