import { HeatingService } from '../services/heatingservice';
import { TimedEvent } from '../models/timedevent';
import { Room } from '../models/room';

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

    public updateRoom = function(req, res) {
        console.log("HeatingController.updateRoom");
        let newRoom = new Room(req.body);
        res.json(this.heatingService.updateRoom(newRoom));
    };

    public getAllGroups = function(req, res) {
        console.log("HeatingController.getAllGroups");
        res.json(this.heatingService.getAllGroups());
    };

    public getGroupById = function(req, res) {
        console.log("HeatingController.getGroupById");
        res.json(this.heatingService.getGroupById(req.params.groupId));
    };

    public createEvent = function(req, res) {
        console.log("HeatingController.createEvent");
        let newEvent = new TimedEvent(req.body);
        res.json(this.heatingService.createEvent(newEvent));
    };

    public getAllEvents = function(req, res) {
        console.log("HeatingController.getAllEvents");
        res.json(this.heatingService.getAllEvents());
    };

    public getEventById = function(req, res) {
        console.log("HeatingController.getEventById");
        res.json(this.heatingService.getEventById(req.params.sensorId));
    };

    public updateEvent = function(req, res) {
        console.log("HeatingController.updateEvent");
        let newEvent = new TimedEvent(req.body);
        res.json(this.heatingService.updateEvent(newEvent));
    };

    public deleteEvent = function(req, res) {
        console.log("HeatingController.deleteEvent");
        res.json(this.heatingService.deleteEvent(req.params.eventId));
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
