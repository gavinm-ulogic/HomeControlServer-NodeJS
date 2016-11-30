"use strict";
var express = require('express');
var bodyParser = require("body-parser");
var onewire_1 = require('./services/onewire');
var relaycard_1 = require('./services/relaycard');
var heatingservice_1 = require('./services/heatingservice');
var timerservice_1 = require('./services/timerservice');
var heatingcontroller_1 = require('./controllers/heatingcontroller');
var relayCard = relaycard_1.RelayCardService.getInstance();
var oneWire = onewire_1.OneWireService.getInstance();
var heatingService = heatingservice_1.HeatingService.getInstance();
var timerService = timerservice_1.TimerService.getInstance();
var heatingController = new heatingcontroller_1.HeatingController();
var app = express();
// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
var port = process.env.PORT || 8080; // set our port
// ROUTES FOR OUR API
// =============================================================================
var router = express.Router(); // get an instance of the express Router
// middleware to use for all requests
router.use(function (req, res, next) {
    // do logging
    console.log('API request received.');
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next(); // make sure we go to the next routes and don't stop here
});
// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function (req, res) {
    res.json({ message: 'hooray! welcome to our api!' });
});
// api routes
router.route('/rooms')
    .get(function (req, res) { heatingController.getAllRooms(req, res); });
router.route('/rooms/:roomId')
    .post(function (req, res) { }) // create a room
    .get(function (req, res) { heatingController.getRoomById(req, res); });
router.route('/groups')
    .get(function (req, res) { heatingController.getAllGroups(req, res); });
router.route('/groups/:groupId')
    .post(function (req, res) { })
    .get(function (req, res) { heatingController.getGroupById(req, res); });
router.route('/events')
    .get(function (req, res) { heatingController.getAllEvents(req, res); });
router.route('/events/:eventId')
    .post(function (req, res) { heatingController.addEvent(req, res); })
    .put(function (req, res) { heatingController.updateEvent(req, res); })
    .get(function (req, res) { heatingController.getEventById(req, res); });
router.route('/sensors')
    .get(function (req, res) { heatingController.getAllSensors(req, res); });
router.route('/sensors/:sensorId')
    .post(function (req, res) { }) // create a sensor
    .get(function (req, res) { heatingController.getSensorById(req, res); });
// REGISTER THE ROUTES -------------------------------
// all of the routes will be prefixed with /api
app.use('/api', router);
// START THE SERVER
// =============================================================================
oneWire.run();
relayCard.initialise();
timerService.run();
//heatingService.load();
app.listen(port);
console.log('Server running on port ' + port);
//# sourceMappingURL=server.js.map