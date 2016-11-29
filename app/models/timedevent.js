"use strict";
var TimedEvent = (function () {
    function TimedEvent(data) {
        if (data) {
            this.description = data.description;
            this.id = parseInt(data.id);
            this.isGroup = data.isGroup;
            this.subjectId = parseInt(data.subjectId);
            this.timeEnd = new Date(data.timeEnd);
            this.timeStart = new Date(data.timeStart);
            this.type = parseInt(data.type);
        }
    }
    TimedEvent.prototype.getSecondsOfDay = function (testDate) {
        return testDate.getHours() * 3600 + testDate.getMinutes() * 60 + testDate.getSeconds();
    };
    TimedEvent.prototype.isActive = function (testTime) {
        if (!testTime) {
            testTime = new Date();
        }
        var testDay = testTime.getDay();
        if (testDay == 0) {
            testDay = 7;
        }
        testDay--; // Mon = 0, Sun = 6
        var testDayBin = Math.pow(2, testDay);
        if (this.timeStart.getFullYear() < 1000) {
            // repeating event
            var eventDays = this.timeStart.getFullYear();
            if ((testDayBin & eventDays) == 0) {
                return false;
            }
            // got this far - right day
            if (this.getSecondsOfDay(testTime) < this.getSecondsOfDay(this.timeStart)
                || this.getSecondsOfDay(testTime) > this.getSecondsOfDay(this.timeEnd)) {
                return false;
            }
        }
        else {
            // fully spec'ed time
            if (testTime < this.timeStart || testTime > this.timeEnd) {
                return false;
            }
        }
        return true;
    };
    TimedEvent.prototype.isExpired = function () {
        if (this.timeStart.getFullYear() > 1000 && this.timeEnd < new Date()) {
            return true;
        }
        return false;
    };
    TimedEvent.eventType = {
        HEAT: 1,
        FALLBACK: 2,
        CONSTANT: 3,
        OFF: 4,
        HOLIDAY: 5
    };
    return TimedEvent;
}());
exports.TimedEvent = TimedEvent;
//# sourceMappingURL=timedevent.js.map