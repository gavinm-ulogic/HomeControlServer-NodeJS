"use strict";
var FS = require('fs');
var heatingdata_1 = require('../models/heatingdata');
// import { Relay } from '../models/relay';
var HeatingService = (function () {
    function HeatingService() {
        this.OLDFILE = "./appdata.json";
        this.DATAFILE = "./heatingdata.json";
        this.heatingData = new heatingdata_1.HeatingData();
        this.holidayMode = false;
        this.floorHeatActive = true;
        this.towelRadsActive = true;
        this.nextGroupId = 1;
        this.nextEventId = 1;
        if (HeatingService._instance) {
            throw new Error("Error: Instantiation failed. Singleton module! Use .getInstance() instead of new.");
        }
        HeatingService._instance = this;
        this.loadFromFile();
    }
    HeatingService.getInstance = function () {
        if (HeatingService._instance === null) {
            HeatingService._instance = new HeatingService();
        }
        return HeatingService._instance;
    };
    HeatingService.prototype.loadFromFile = function () {
        var self = this;
        FS.readFile(this.DATAFILE, "", function (err, data) {
            if (err) {
                console.log("HeatingService.loadFromFile: " + err.message);
            }
            else {
                self.heatingData.loadData(data);
                for (var _i = 0, _a = self.heatingData.groups; _i < _a.length; _i++) {
                    var eventGroup = _a[_i];
                    if (eventGroup.id >= self.nextGroupId) {
                        self.nextGroupId = eventGroup.id + 1;
                    }
                }
                for (var _b = 0, _c = self.heatingData.events; _b < _c.length; _b++) {
                    var timedEvent = _c[_b];
                    if (timedEvent.id >= self.nextEventId) {
                        self.nextEventId = timedEvent.id + 1;
                    }
                }
            }
        });
    };
    HeatingService.prototype.saveToFile = function () {
        var self = this;
        var jsonFilter = function (key, value) {
            if (key == "heaters")
                return undefined;
            else if (key == "sensors")
                return undefined;
            else
                return value;
        };
        FS.writeFile(self.DATAFILE, JSON.stringify(self.heatingData, jsonFilter));
    };
    HeatingService.prototype.getAllRooms = function () {
        return this.heatingData.rooms;
    };
    HeatingService.prototype.getRoomById = function (roomId) {
        for (var _i = 0, _a = this.heatingData.rooms; _i < _a.length; _i++) {
            var room = _a[_i];
            if (room.id == roomId) {
                return room;
            }
        }
        return null;
    };
    HeatingService.prototype.updateRoom = function (room) {
        var theRoom = this.getRoomById(room.id);
        if (!theRoom) {
            return null;
        }
        ;
        return theRoom.update(room);
    };
    HeatingService.prototype.getAllGroups = function () {
        return this.heatingData.groups;
    };
    HeatingService.prototype.getGroupById = function (groupId) {
        for (var _i = 0, _a = this.heatingData.groups; _i < _a.length; _i++) {
            var group = _a[_i];
            if (group.id == groupId) {
                return group;
            }
        }
        return null;
    };
    HeatingService.prototype.createEvent = function (timedEvent) {
        timedEvent.id = this.nextEventId;
        this.nextEventId++;
        this.heatingData.events.push(timedEvent);
        return timedEvent;
    };
    HeatingService.prototype.getAllEvents = function () {
        return this.heatingData.events;
    };
    HeatingService.prototype.getEventById = function (eventId) {
        for (var _i = 0, _a = this.heatingData.events; _i < _a.length; _i++) {
            var event_1 = _a[_i];
            if (event_1.id == eventId) {
                return event_1;
            }
        }
        return null;
    };
    HeatingService.prototype.updateEvent = function (timedEvent) {
        var updateEvent = this.getEventById(timedEvent.id);
        if (!updateEvent) {
            return null;
        }
        ;
        return updateEvent.update(timedEvent);
    };
    HeatingService.prototype.deleteEvent = function (timedEvent) {
        for (var i in this.heatingData.events) {
            if (this.heatingData.events[i].id == timedEvent.id) {
                this.heatingData.events.splice(parseInt(i), 1);
            }
        }
    };
    HeatingService.prototype.getAllSensors = function () {
        return this.heatingData.roomSensors;
    };
    HeatingService.prototype.getSensorById = function (sensorId) {
        for (var _i = 0, _a = this.heatingData.roomSensors; _i < _a.length; _i++) {
            var sensor = _a[_i];
            if (sensor.id == sensorId) {
                return sensor;
            }
        }
        return null;
    };
    HeatingService.prototype.getMinutesOfDay = function (date) {
        return date.getHours() * 60 + date.getMinutes();
    };
    HeatingService.prototype.updateTempSensors = function (sensors) {
        for (var _i = 0, sensors_1 = sensors; _i < sensors_1.length; _i++) {
            var sensor = sensors_1[_i];
            var foundSensor = this.heatingData.getSensorBySensorId(sensor.name);
            if (foundSensor) {
                var currentTime_1 = new Date();
                var roundTemp = Math.round(sensor.value);
                if (roundTemp > 60 || roundTemp < -60 || (roundTemp === 0 && foundSensor.reading > 5)) {
                    roundTemp = foundSensor.reading; // Invalid reading, keep same temp but don't update last read
                }
                else {
                    foundSensor.lastRead = currentTime_1;
                    if (roundTemp != foundSensor.reading) {
                        foundSensor.lastChange = currentTime_1;
                    }
                }
                foundSensor.reading = roundTemp;
            }
            var logStr = "Sensor " + sensor.name + " value: " + sensor.value;
            logStr += (foundSensor) ? ", " + foundSensor.name + " previous: " + foundSensor.reading + " last read: " + foundSensor.lastRead : ", not found";
            console.log(logStr);
        }
        // Check if reading is out of date (more than 30 mins old)
        var currentTime = new Date();
        console.log("Minutes of day: " + this.getMinutesOfDay(currentTime));
        var errorTemp = (this.getMinutesOfDay(currentTime) < 4 * 60 || this.getMinutesOfDay(currentTime) > 7 * 60) ? HeatingService.ERRORTEMP : 1;
        var testTime = new Date(currentTime.getTime() - 30 * 60000);
        for (var _a = 0, _b = this.heatingData.roomSensors; _a < _b.length; _a++) {
            var sensor = _b[_a];
            if (sensor.lastRead < testTime) {
                console.log("Sensor " + sensor.name + " TIMEOUT - last read: " + sensor.lastRead);
                sensor.reading = errorTemp;
            }
        }
        for (var _c = 0, _d = this.heatingData.floorSensors; _c < _d.length; _c++) {
            var sensor = _d[_c];
            if (sensor.lastRead < testTime) {
                console.log("Sensor " + sensor.name + " TIMEOUT");
                sensor.reading = errorTemp;
            }
        }
    };
    HeatingService.HOLIDAYDELTA = -5;
    HeatingService.ERRORTEMP = 99;
    HeatingService._instance = null;
    return HeatingService;
}());
exports.HeatingService = HeatingService;
//# sourceMappingURL=heatingservice.js.map