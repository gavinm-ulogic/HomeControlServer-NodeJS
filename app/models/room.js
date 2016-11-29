"use strict";
var Room = (function () {
    function Room(data, floorheaters, towelrads, sensors) {
        if (data) {
            this.groupId = parseInt(data.groupId);
            this.id = parseInt(data.id);
            this.name = data.name;
            this.tempCurrent = parseInt(data.tempCurrent);
            this.tempTarget = parseInt(data.tempTarget);
            this.tempMin = parseInt(data.tempMin);
            this.tempMax = parseInt(data.tempMax);
        }
        this.heaters = [];
        if (floorheaters) {
            for (var _i = 0, floorheaters_1 = floorheaters; _i < floorheaters_1.length; _i++) {
                var heater = floorheaters_1[_i];
                if (heater.roomId == this.id) {
                    this.heaters.push(heater);
                }
            }
        }
        if (towelrads) {
            for (var _a = 0, towelrads_1 = towelrads; _a < towelrads_1.length; _a++) {
                var heater = towelrads_1[_a];
                if (heater.roomId == this.id) {
                    this.heaters.push(heater);
                }
            }
        }
        this.sensors = [];
        if (sensors) {
            for (var _b = 0, sensors_1 = sensors; _b < sensors_1.length; _b++) {
                var sensor = sensors_1[_b];
                if (sensor.roomId == this.id) {
                    this.sensors.push(sensor);
                }
            }
        }
    }
    return Room;
}());
exports.Room = Room;
//# sourceMappingURL=room.js.map