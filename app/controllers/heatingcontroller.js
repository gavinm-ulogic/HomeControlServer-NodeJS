"use strict";
var heatingservice_1 = require('../services/heatingservice');
var timedevent_1 = require('../models/timedevent');
var HeatingController = (function () {
    function HeatingController() {
        this.heatingService = heatingservice_1.HeatingService.getInstance();
        this.getAllRooms = function (req, res) {
            console.log("HeatingController.getAllRooms");
            res.json(this.heatingService.getAllRooms());
        };
        this.getRoomById = function (req, res) {
            console.log("HeatingController.getRoomById");
            res.json(this.heatingService.getRoomById(req.params.roomId));
        };
        this.getAllGroups = function (req, res) {
            console.log("HeatingController.getAllGroups");
            res.json(this.heatingService.getAllGroups());
        };
        this.getGroupById = function (req, res) {
            console.log("HeatingController.getGroupById");
            res.json(this.heatingService.getGroupById(req.params.groupId));
        };
        this.createEvent = function (req, res) {
            console.log("HeatingController.createEvent");
            var newEvent = new timedevent_1.TimedEvent(req.body);
            res.json(this.heatingService.createEvent(newEvent));
        };
        this.getAllEvents = function (req, res) {
            console.log("HeatingController.getAllEvents");
            res.json(this.heatingService.getAllEvents());
        };
        this.getEventById = function (req, res) {
            console.log("HeatingController.getEventById");
            res.json(this.heatingService.getEventById(req.params.sensorId));
        };
        this.updateEvent = function (req, res) {
            console.log("HeatingController.updateEvent");
            var newEvent = new timedevent_1.TimedEvent(req.body);
            res.json(this.heatingService.updateEvent(newEvent));
        };
        this.deleteEvent = function (req, res) {
            console.log("HeatingController.deleteEvent");
            res.json(this.heatingService.deleteEvent(req.params.eventId));
        };
        this.getAllSensors = function (req, res) {
            console.log("HeatingController.getAllSensors");
            res.json(this.heatingService.getAllSensors());
        };
        this.getSensorById = function (req, res) {
            console.log("HeatingController.getSensorById");
            res.json(this.heatingService.getSensorById(req.params.sensorId));
        };
    }
    return HeatingController;
}());
exports.HeatingController = HeatingController;
//# sourceMappingURL=heatingcontroller.js.map