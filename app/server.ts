import * as express from 'express';
import * as bodyParser from "body-parser";
import { OneWireService } from './services/onewire';
import { RelayCardService } from './services/relaycard';
import { HeatingService } from './services/heatingservice';
import { TimerService } from './services/timerservice';
import { HeatingController } from './controllers/heatingcontroller';

let relayCard = RelayCardService.getInstance();
let oneWire = OneWireService.getInstance();
let heatingService = HeatingService.getInstance();
let timerService = TimerService.getInstance();

let heatingController = new HeatingController();

let app = express()

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

let port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
let router = express.Router();              // get an instance of the express Router

// middleware to use for all requests
router.use(function(req, res, next) {
    // do logging
    console.log('API request received.');

    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    next(); // make sure we go to the next routes and don't stop here
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });
});

// api routes

router.route('/rooms/:roomId')
    .post(function(req, res) {})   // create a room
    .get(function(req, res) { heatingController.getRoomById(req, res) });   // get room by id

router.route('/rooms')
    .get(function(req, res) { heatingController.getAllRooms(req, res) });   // get all the rooms

router.route('/groups/:groupId')
    .post(function(req, res) {})    // create a group
    .get(function(req, res) { heatingController.getGroupById(req, res) });    // get group by id

router.route('/groups')
    .get(function(req, res) { heatingController.getAllGroups(req, res) });    // get all the groups

router.route('/events/:eventId')
    .post(function(req, res) {})    // create a event
    .get(function(req, res) { heatingController.getEventById(req, res) });    // get event by id

router.route('/events')
    .get(function(req, res) { heatingController.getAllEvents(req, res) });    // get all the events

router.route('/sensors/:sensorId')
    .post(function(req, res) {})    // create a sensor
    .get(function(req, res) { heatingController.getSensorById(req, res) });    // get sensor by id

router.route('/sensors')
    .get(function(req, res) { heatingController.getAllSensors(req, res) });    // get all the sensors

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