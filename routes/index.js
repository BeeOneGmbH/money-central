var jade = require('jade'),
    mongoose = require('mongoose'),
    clients = mongoose.model('Client');

module.exports = {

    indexAction: function() {
        return function(req, res) {
            clients.prettyPrint(function (err, clientList) {
                return res.render('index', {
                    clients: clientList
                });
            });
        };
    },

    syncAction: function() {
        return function(req, res) {
            var client = {id: req.body.id, country: req.body.country, url: req.headers['referer'], result: req.body.result},
                renderJson = function(httpCode, json) {
                    var jsonText = JSON.stringify(json);
                    res.writeHead(httpCode, {'Content-Type': 'application/json', 'Content-Length': jsonText.length });
                    res.end(jsonText);
                };
            if (typeof client.id !== 'string' ||
                typeof client.country !== 'string') {
                console.warn('REPLY %d %j', 400, client);
                renderJson(400, {}); // missing parameters
                return;
            }
            try {
                if (!/^[A-Z]{2}$/.test(client.country)) {
                    throw new Error('ISO country code must be two uppercase characters!');
                }
                if (client.result !== undefined) {
                    if (typeof client.result !== 'string') {
                        throw new Error('Result must be stringified JSON object!');
                    }
                    var parsedJson,
                        isAllowed = {SuperHero: true, Nonbeliever: true, JollyJoker: true, SmartCookie: true, BeanCounter: true};
                    try {
                        parsedJson = JSON.parse(client.result);
                    } catch (err) {
                        throw new Error('Result does not contain a parseable JSON object!');
                    }
                    client.result = {};
                    Object.keys(parsedJson).forEach(function(key) {
                        if (!isAllowed[key]){
                            throw new Error('Result contains keys that are not valid!');
                        }
                    });
                    Object.keys(isAllowed).forEach(function(persona) {
                        if (parsedJson[persona] !== 'number') {
                            throw new Error('Result does not contain all needed values!');
                        }
                        var value = parseInt(parsedJson[persona], 10);
                        if (value !== parsedJson[persona] || value < 0) {
                            throw new Error('Result contains values that are not valid!');
                        }
                        client.result[persona] = value;
                    });
                }
            } catch (err) {
                console.warn('REPLY %d %j - %s', 400, client, err.message);
                renderJson(400, {}); // illegal parameter values
                return;
            }
            clients.accomodate(client, function () {
                clients.aggregate(function (err, sendBack) {
                    if (err) {
                        console.error('REPLY %d %j', 500, err);
                        renderJson(500, {}); // whoopsie daisy
                    } else {
                        console.log('REPLY %d %j', 200, client);
                        renderJson(200, sendBack);
                    }
                });
            });
        };
    }

};