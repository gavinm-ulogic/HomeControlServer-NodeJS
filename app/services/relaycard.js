"use strict";
var SerialPort = require('serialport');
var RelayCardService = (function () {
    function RelayCardService() {
        this.doInitialise = true;
        this.onDataHandler = null;
        this.serialData = null;
        this.setupRelays = [0, 0, 0, 0]; // 1st vlaue not used
        this.liveRelays = [0, 0, 0, 0]; // 1st vlaue not used
        this.timeoutCheck = null;
        if (RelayCardService._instance) {
            throw new Error("Error: Instantiation failed. Singleton module! Use .getInstance() instead of new.");
        }
        RelayCardService._instance = this;
    }
    RelayCardService.getInstance = function () {
        if (RelayCardService._instance === null) {
            RelayCardService._instance = new RelayCardService();
        }
        return RelayCardService._instance;
    };
    RelayCardService.prototype.sendCommand = function (commandByte, addressByte, dataByte, callback) {
        var self = this;
        var waitTime = 100;
        if (!callback || self.doInitialise) {
            var yyy = 0;
        }
        if (self.doInitialise) {
            self.initialise();
            waitTime = 4000;
        }
        setTimeout(function () {
            var sendBuffer = new Buffer([commandByte, addressByte, dataByte, addressByte ^ commandByte ^ dataByte]);
            console.log("RelayCardService.sendCommand: command: " + sendBuffer[0] + ", card: " + sendBuffer[1] + ", data: " + sendBuffer[2] + ", xor: " + sendBuffer[3]);
            self.port.write(sendBuffer, function () {
                self.port.drain(function () {
                    setTimeout(function () {
                        if (callback) {
                            callback();
                        }
                    }, 500);
                });
            });
        }, waitTime);
    };
    RelayCardService.prototype.initialise = function () {
        console.log("RelayCardService.initialise");
        var self = this;
        self.doInitialise = false;
        if (self.port) {
            self.port.close();
        }
        self.port = new SerialPort('/dev/ttyUSB0', {
            baudRate: 19200,
            parity: 'none',
            dataBits: 8,
            stopBits: 1,
            parser: SerialPort.parsers.byteLength(4)
        });
        self.port.on('open', function () {
            console.log("RelayCardService.onOpen");
            var sendBuffer = new Buffer([0x1]);
            var doneFlag = false;
            // self.onDataHandler = function(data) {
            //     if (data.length > 3) { doneFlag = true; }
            // };
            for (var i = 0; i < 4; i++) {
                //if (doneFlag) { break; }
                self.port.write(sendBuffer);
            }
            //            setTimeout (function() {
            // // Get card count
            // self.onDataHandler = function(data: number[]) {
            //     if (data[0] === 1) 
            //     {
            //         let cardCount = data[1] - 1;
            //         console.log("Card count: " + cardCount); 
            //         self.onDataHandler = null;
            //     }
            // };
            // for (var i = 0; i < 4; i++) {
            //     self.port.write(sendBuffer);
            // }
            setTimeout(function () {
                self.setAllOff(function () {
                    self.testCards();
                });
            }, 2000);
        });
        self.port.on('error', function (err) {
            console.log("RelayCardService.onError");
            console.log('Error: ', err.message);
            self.doInitialise = true;
        });
        self.port.on('data', function (data) {
            console.log("RelayCardService.onData");
            console.log('Data: ' + data[0] + " " + data[1] + " " + data[2] + " " + data[3]);
            switch (data[0]) {
                case 1:
                    console.log("Card count: " + (data[1] - 1).toString());
                    break;
                case 252:
                    // Set card relay - report
                    self.liveRelays[data[2]] = data[3];
                    break;
            }
            if (self.onDataHandler) {
                self.onDataHandler(data);
            }
            if (self.timeoutCheck) {
                clearTimeout(self.timeoutCheck);
                self.timeoutCheck = null;
            }
        });
        self.port.on('close', function () {
            console.log("RelayCardService.onClose");
        });
        self.port.on('disconnect', function (err) {
            console.log("RelayCardService.onClose");
            console.log('Error: ', err.message);
        });
    };
    RelayCardService.prototype.isLive = function () {
        return !this.doInitialise;
    };
    RelayCardService.prototype.testSetOff = function () {
        var self = this;
        self.setOff(1, 7, function () {
            self.setOff(2, 7, function () {
                self.setOff(3, 7, function () {
                    ;
                });
            });
        });
    };
    RelayCardService.prototype.testSetOn = function () {
        var self = this;
        self.setOn(1, 7, function () {
            self.setOn(2, 7, function () {
                self.setOn(3, 7, function () {
                    ;
                    self.testSetOff();
                });
            });
        });
    };
    RelayCardService.prototype.testCards = function () {
        console.log("RelayCardService.testCards");
        this.testSetOn();
    };
    RelayCardService.prototype.setAllOff = function (callback) {
        console.log("RelayCardService.SetAllOff");
        this.sendCommand(3, 0, 0, callback);
    };
    RelayCardService.prototype.setOn = function (card, relay, callback) {
        console.log("RelayCardService.SetOn");
        return this.sendCommand(6, card, Math.pow(2, relay), callback);
    };
    RelayCardService.prototype.setOff = function (card, relay, callback) {
        console.log("RelayCardService.SetOff");
        return this.sendCommand(7, card, Math.pow(2, relay), callback);
    };
    RelayCardService.prototype.setCardRelays = function (card, value, callback) {
        console.log("RelayCardService.setCardRelays");
        this.sendCommand(3, card, value, callback);
    };
    RelayCardService.prototype.resetAllSetupRelays = function () {
        this.setupRelays = [0, 0, 0, 0];
    };
    RelayCardService.prototype.getRelayState = function (relayAddress) {
        return false; //?????????????????????????????????????????
    };
    RelayCardService.prototype.setupRelay = function (relayAddress, state) {
        var saAddress = relayAddress.split('-');
        var cardNum = Number(saAddress[0]);
        var relayNum = Number(saAddress[1]);
        var byteMask = 1 << relayNum;
        if (state) {
            this.setupRelays[cardNum] = this.setupRelays[cardNum] | byteMask;
        }
        else {
            this.setupRelays[cardNum] = this.setupRelays[cardNum] & (~byteMask);
        }
    };
    RelayCardService.prototype.updateRelays = function () {
        var self = this;
        self.timeoutCheck = setTimeout(function () {
            console.log("Relay card timeout detected");
            self.doInitialise = true;
        }, 10000);
        self.setCardRelays(1, self.setupRelays[1], function () {
            self.setCardRelays(2, self.setupRelays[2], function () {
                self.setCardRelays(3, self.setupRelays[3], function () {
                });
            });
        });
    };
    // Cards numbered from 1
    // Relays numbered from 0 to 7
    RelayCardService.BOARDCOUNT = 3;
    RelayCardService.RELAYCOUNT = 8;
    RelayCardService._instance = null;
    return RelayCardService;
}());
exports.RelayCardService = RelayCardService;
//# sourceMappingURL=relaycard.js.map