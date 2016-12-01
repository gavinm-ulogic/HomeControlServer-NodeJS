"use strict";
var eventgroup_1 = require('../models/eventgroup');
var room_1 = require('../models/room');
var heater_1 = require('../models/heater');
var sensor_1 = require('../models/sensor');
var timedevent_1 = require('../models/timedevent');
var HeatingData = (function () {
    function HeatingData() {
        this.groups = [];
        this.rooms = [];
        this.floorHeats = [];
        this.towelRads = [];
        this.roomSensors = [];
        this.floorSensors = [];
        this.events = [];
        this.relays = [];
    }
    HeatingData.prototype.loadData = function (data) {
        var loadedData = JSON.parse(data);
        this.groups = [];
        for (var _i = 0, _a = loadedData.groups; _i < _a.length; _i++) {
            var objData = _a[_i];
            this.groups.push(new eventgroup_1.EventGroup(objData));
        }
        this.roomSensors = [];
        for (var _b = 0, _c = loadedData.roomSensors; _b < _c.length; _b++) {
            var objData = _c[_b];
            this.roomSensors.push(new sensor_1.Sensor(objData));
        }
        this.floorSensors = [];
        for (var _d = 0, _e = loadedData.floorSensors; _d < _e.length; _d++) {
            var objData = _e[_d];
            this.floorSensors.push(new sensor_1.Sensor(objData));
        }
        this.floorHeats = [];
        for (var _f = 0, _g = loadedData.floorHeats; _f < _g.length; _f++) {
            var objData = _g[_f];
            this.floorHeats.push(new heater_1.Heater(objData, this.roomSensors));
        }
        this.towelRads = [];
        for (var _h = 0, _j = loadedData.towelRads; _h < _j.length; _h++) {
            var objData = _j[_h];
            this.towelRads.push(new heater_1.Heater(objData, this.roomSensors));
        }
        this.rooms = [];
        for (var _k = 0, _l = loadedData.rooms; _k < _l.length; _k++) {
            var objData = _l[_k];
            this.rooms.push(new room_1.Room(objData, this.floorHeats, this.towelRads, this.roomSensors));
        }
        this.events = [];
        for (var _m = 0, _o = loadedData.events; _m < _o.length; _m++) {
            var objData = _o[_m];
            var newEvent = new timedevent_1.TimedEvent(objData);
            if (!newEvent.isExpired()) {
                this.events.push(newEvent);
            }
        }
        console.log("HeatingData.loadData done");
    };
    HeatingData.prototype.getSensorBySensorId = function (sensorId) {
        var testStart = (sensorId.length == 12) ? 2 : 0;
        var testLen = (sensorId.length == 12) ? 12 : undefined;
        for (var _i = 0, _a = this.roomSensors; _i < _a.length; _i++) {
            var sensor = _a[_i];
            if (sensor.sensorId.substr(testStart, testLen).toUpperCase() == sensorId.toUpperCase()) {
                return sensor;
            }
        }
        for (var _b = 0, _c = this.floorSensors; _b < _c.length; _b++) {
            var sensor = _c[_b];
            if (sensor.sensorId.substr(testStart, testLen).toUpperCase() == sensorId.toUpperCase()) {
                return sensor;
            }
        }
        return null;
    };
    return HeatingData;
}());
exports.HeatingData = HeatingData;
//# sourceMappingURL=heatingdata.js.map