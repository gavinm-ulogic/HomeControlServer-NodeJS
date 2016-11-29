import { HeatingService } from '../services/heatingservice';

export class HeatingController {

    private heatingService = HeatingService.getInstance();

    constructor() {  }

    public getAllRooms = function(req, res) {
        console.log("HeatingController.getAllRooms");
        res.json(this.heatingService.getAllRooms());
    };

    public getRoomById = function(req, res) {
        console.log("HeatingController.getRoomById");
        res.json(this.heatingService.getRoomById(req.params.roomId));
    };

    public getAllGroups = function(req, res) {
        console.log("HeatingController.getAllGroups");
        res.json(this.heatingService.getAllGroups());
    };

    public getGroupById = function(req, res) {
        console.log("HeatingController.getGroupById");
        res.json(this.heatingService.getGroupById(req.params.groupId));
    };

    public getAllEvents = function(req, res) {
        console.log("HeatingController.getAllEvents");
        res.json(this.heatingService.getAllEvents());
    };

    public getEventById = function(req, res) {
        console.log("HeatingController.getEventById");
        res.json(this.heatingService.getEventById(req.params.sensorId));
    };

    public getAllSensors = function(req, res) {
        console.log("HeatingController.getAllSensors");
        res.json(this.heatingService.getAllSensors());
    };

    public getSensorById = function(req, res) {
        console.log("HeatingController.getSensorById");
        res.json(this.heatingService.getSensorById(req.params.sensorId));
    };

}
