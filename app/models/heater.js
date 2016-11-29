"use strict";
var Heater = (function () {
    function Heater(data, sensors) {
        if (data) {
            this.groupId = parseInt(data.groupId);
            this.id = parseInt(data.id);
            this.name = data.name;
            this.relayAddress = data.relayAddress;
            this.roomId = parseInt(data.roomId);
            this.state = data.state;
            this.tempMax = parseInt(data.tempMax);
            this.type = parseInt(data.type);
        }
        this.sensors = [];
        if (sensors) {
            for (var _i = 0, sensors_1 = sensors; _i < sensors_1.length; _i++) {
                var sensor = sensors_1[_i];
                if (sensor.roomId == this.roomId) {
                    this.sensors.push(sensor);
                }
            }
        }
    }
    return Heater;
}());
exports.Heater = Heater;
//# sourceMappingURL=heater.js.map