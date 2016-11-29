"use strict";
var Sensor = (function () {
    function Sensor(data) {
        if (data) {
            this.id = parseInt(data.id);
            this.lastChange = new Date(data.lastChange);
            this.lastRead = new Date(data.lastRead);
            this.name = data.name;
            this.reading = parseInt(data.reading);
            this.roomId = parseInt(data.roomId);
            this.sensorId = data.sensorId;
            this.type = parseInt(data.type);
        }
    }
    return Sensor;
}());
exports.Sensor = Sensor;
//# sourceMappingURL=sensor.js.map