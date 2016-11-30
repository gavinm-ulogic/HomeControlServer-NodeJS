"use strict";
var timedevent_1 = require('../models/timedevent');
var relaycard_1 = require('../services/relaycard');
var heatingservice_1 = require('../services/heatingservice');
var TimerService = (function () {
    function TimerService() {
        this.processedRelays = [];
        this.runFlag = false;
        this.tempDelta = 0;
        this.heatingService = heatingservice_1.HeatingService.getInstance();
        this.relayCardService = relaycard_1.RelayCardService.getInstance();
        if (TimerService._instance) {
            throw new Error("Error: Instantiation failed. Singleton module! Use .getInstance() instead of new.");
        }
        TimerService._instance = this;
    }
    TimerService.getInstance = function () {
        if (TimerService._instance === null) {
            TimerService._instance = new TimerService();
        }
        return TimerService._instance;
    };
    TimerService.prototype.run = function () {
        var self = this;
        self.runFlag = true;
        setTimeout(function () {
            self.runLoop();
        }, TimerService.STARTDELAY);
    };
    TimerService.prototype.runLoop = function () {
        var self = this;
        if (self.runFlag) {
            console.log("TimerService.runLoop");
            setTimeout(function () {
                self.runLoop();
            }, TimerService.LOOPDELAY);
            self.doHeating();
            this.heatingService.saveToFile();
        }
    };
    TimerService.prototype.kill = function () {
        this.runFlag = false;
    };
    TimerService.prototype.doHeating = function () {
        console.log("TimerService.doHeating");
        var self = this;
        // Should first check state of relays (in case of power cut)
        //        if (!self.relayCardService.isLive() && !self.relayCardService.initialise()) return;
        //////////////////////////////////////////////////////////////////////////////////////////if (!self.relayCardService.isLive()) return;
        var currentTime = new Date();
        var timedEvents = [];
        var timedEvent = null;
        var room = null;
        var towelRad = null;
        var floorHeat = null;
        var tooHot = false;
        var staySame = false;
        if (self.heatingService.holidayMode) {
            self.tempDelta = heatingservice_1.HeatingService.HOLIDAYDELTA;
        }
        else {
            self.tempDelta = 0;
        }
        // All relays to switch off unless set to on
        self.relayCardService.resetAllSetupRelays();
        self.processedRelays = [];
        // Iterate rooms
        if (self.heatingService.floorHeatActive) {
            for (var _i = 0, _a = self.heatingService.heatingData.rooms; _i < _a.length; _i++) {
                var aRoom = _a[_i];
                tooHot = false;
                staySame = false;
                for (var _b = 0, _c = aRoom.sensors; _b < _c.length; _b++) {
                    var aSensor = _c[_b];
                    if (aSensor.reading > aRoom.tempTarget + self.tempDelta) {
                        tooHot = true;
                        break;
                    }
                    else if (aSensor.reading === aRoom.tempTarget + self.tempDelta) {
                        staySame = true;
                    }
                }
                if (!tooHot) {
                    for (var i = self.heatingService.heatingData.events.length - 1; i >= 0; i--) {
                        if ((self.heatingService.heatingData.events[i].subjectId == aRoom.id)
                            || (self.heatingService.heatingData.events[i].subjectId == aRoom.groupId)) {
                            var anEvent = self.heatingService.heatingData.events[i];
                            if (anEvent.isExpired()) {
                                this.heatingService.deleteEvent(anEvent);
                                return false;
                            }
                            else if (anEvent.isActive(null)) {
                                for (var _d = 0, _e = aRoom.heaters; _d < _e.length; _d++) {
                                    var aHeater = _e[_d];
                                    if (aHeater.relayAddress) {
                                        self.processRelay(aHeater, anEvent, staySame);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        // Iterate towel rads
        if (self.heatingService.towelRadsActive) {
            for (var _f = 0, _g = self.heatingService.heatingData.towelRads; _f < _g.length; _f++) {
                var aRad = _g[_f];
                // find all events for this towel rad - priority is last is highest
                for (var i = self.heatingService.heatingData.events.length - 1; i >= 0; i--) {
                    if ((self.heatingService.heatingData.events[i].subjectId == aRad.id)
                        || (self.heatingService.heatingData.events[i].subjectId == aRad.groupId)) {
                        var anEvent = self.heatingService.heatingData.events[i];
                        if (anEvent.isExpired()) {
                            this.heatingService.deleteEvent(anEvent);
                            return false;
                        }
                        else if (anEvent.isActive(null)) {
                            if (aRad.relayAddress) {
                                self.processRelay(aRad, anEvent, staySame);
                            }
                        }
                    }
                }
            }
        }
        self.relayCardService.updateRelays();
    };
    TimerService.prototype.processRelay = function (heater, timedEvent, staySame) {
        var self = this;
        var tooHot = false;
        for (var _i = 0, _a = heater.sensors; _i < _a.length; _i++) {
            var aSensor = _a[_i];
            if (aSensor.reading >= heater.tempMax) {
                tooHot = true;
                break;
            }
        }
        if (!tooHot) {
            var foundRelay = false;
            var state = (timedEvent.type == timedevent_1.TimedEvent.eventType.HEAT);
            for (var _b = 0, _c = self.processedRelays; _b < _c.length; _b++) {
                var processedRelay = _c[_b];
                if (processedRelay.relayAddress == heater.relayAddress) {
                    if (processedRelay.eventId < timedEvent.id) {
                        self.relayCardService.setupRelay(heater.relayAddress, (staySame) ? self.relayCardService.getRelayState(heater.relayAddress) : state);
                        processedRelay.eventId = timedEvent.id;
                    }
                    foundRelay = true;
                    break;
                }
            }
            if (!foundRelay) {
                self.relayCardService.setupRelay(heater.relayAddress, (staySame) ? self.relayCardService.getRelayState(heater.relayAddress) : state);
                self.processedRelays.push({ relayAddress: heater.relayAddress, eventId: timedEvent.id });
            }
        }
    };
    TimerService.STARTDELAY = 20000;
    TimerService.LOOPDELAY = 40000;
    TimerService._instance = null;
    return TimerService;
}());
exports.TimerService = TimerService;
//# sourceMappingURL=timerservice.js.map