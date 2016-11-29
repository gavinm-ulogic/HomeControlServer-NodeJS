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
        this.getRoomById = function (roomId) {
            for (var _i = 0, _a = this.heatingData.rooms; _i < _a.length; _i++) {
                var room = _a[_i];
                if (room.id == roomId) {
                    return room;
                }
            }
            return null;
        };
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
    HeatingService.prototype.processSubData = function () {
        // Add heaters to rooms
        for (var i = 0; i < this.heatingData.floorHeats.length; i++) {
            for (var j = 0; j < this.heatingData.rooms.length; j++) {
                if (this.heatingData.rooms[j].id == this.heatingData.floorHeats[i].roomId) {
                    if (!this.heatingData.rooms[j].heaters) {
                        this.heatingData.rooms[j].heaters = [];
                    }
                    this.heatingData.rooms[j].heaters.push(this.heatingData.floorHeats[i]);
                    break;
                }
            }
        }
        for (var i = 0; i < this.heatingData.towelRads.length; i++) {
            for (var j = 0; j < this.heatingData.rooms.length; j++) {
                if (this.heatingData.rooms[j].id == this.heatingData.towelRads[i].roomId) {
                    if (!this.heatingData.rooms[j].heaters) {
                        this.heatingData.rooms[j].heaters = [];
                    }
                    this.heatingData.rooms[j].heaters.push(this.heatingData.towelRads[i]);
                    break;
                }
            }
        }
        // Add sensors to rooms and heaters
        for (var i = 0; i < this.heatingData.roomSensors.length; i++) {
            for (var j = 0; j < this.heatingData.rooms.length; j++) {
                if (this.heatingData.rooms[j].id == this.heatingData.roomSensors[i].roomId) {
                    if (!this.heatingData.rooms[j].sensors) {
                        this.heatingData.rooms[j].sensors = [];
                    }
                    this.heatingData.rooms[j].sensors.push(this.heatingData.roomSensors[i]);
                    if (this.heatingData.rooms[j].heaters) {
                        for (var k = 0; k < this.heatingData.rooms[j].heaters.length; k++) {
                            if (!this.heatingData.rooms[j].heaters[k].sensors) {
                                this.heatingData.rooms[j].heaters[k].sensors = [];
                            }
                            this.heatingData.rooms[j].heaters[k].sensors.push(this.heatingData.roomSensors[i]);
                        }
                    }
                    break;
                }
            }
        }
        for (var i = 0; i < this.heatingData.floorSensors.length; i++) {
            for (var j = 0; j < this.heatingData.rooms.length; j++) {
                if (this.heatingData.rooms[j].id == this.heatingData.floorSensors[i].roomId) {
                    if (!this.heatingData.rooms[j].sensors) {
                        this.heatingData.rooms[j].sensors = [];
                    }
                    this.heatingData.rooms[j].sensors.push(this.heatingData.floorSensors[i]);
                    if (this.heatingData.rooms[j].heaters) {
                        for (var k = 0; k < this.heatingData.rooms[j].heaters.length; k++) {
                            if (!this.heatingData.rooms[j].heaters[k].sensors) {
                                this.heatingData.rooms[j].heaters[k].sensors = [];
                            }
                            this.heatingData.rooms[j].heaters[k].sensors.push(this.heatingData.floorSensors[i]);
                        }
                    }
                    break;
                }
            }
        }
        // // Clear and then populate relay set
        // Relay oRelay;
        // theData.theRelays.Clear();
        // for (int i = 0; i < this.heatingData.floorHeats.length; i++)
        // {
        //     oRelay = new Relay(this.heatingData.floorHeats[i].Name, this.heatingData.floorHeats[i].RelayAddress);
        //     theData.theRelays.Add(oRelay);
        // }
        // for (int i = 0; i < this.heatingData.towelRads.length; i++)
        // {
        //     oRelay = new Relay(this.heatingData.towelRads[i].Name, this.heatingData.towelRads[i].RelayAddress);
        //     theData.theRelays.Add(oRelay);
        // }
        // theData.theRelays.Sort();
    };
    ;
    HeatingService.prototype.loadFromFile = function () {
        var self = this;
        FS.readFile(this.DATAFILE, "", function (err, data) {
            if (err) {
                console.log("HeatingService.loadFromFile: " + err.message);
            }
            else {
                self.heatingData.loadData(data);
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
    HeatingService.prototype.deleteEvent = function (timedEvent) {
        for (var i in this.heatingData.events) {
            if (this.heatingData.events[i].id == timedEvent.id) {
                this.heatingData.events.splice(parseInt(i), 1);
            }
        }
    };
    HeatingService.prototype.updateTempSensors = function (sensors) {
        for (var _i = 0, sensors_1 = sensors; _i < sensors_1.length; _i++) {
            var sensor = sensors_1[_i];
            var foundSensor = this.heatingData.getTempSensor(sensor.name);
            if (foundSensor) {
                foundSensor.reading = sensor.value;
            }
        }
    };
    HeatingService.HOLIDAYDELTA = -5;
    HeatingService._instance = null;
    return HeatingService;
}());
exports.HeatingService = HeatingService;
//# sourceMappingURL=heatingservice.js.map