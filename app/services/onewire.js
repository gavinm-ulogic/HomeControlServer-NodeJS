"use strict";
var heatingservice_1 = require('../services/heatingservice');
var oneWire = require('ds1820-temp');
var usb = require('usb');
var OneWireService = (function () {
    function OneWireService() {
        this.heatingService = heatingservice_1.HeatingService.getInstance();
        if (OneWireService._instance) {
            throw new Error("Error: Instantiation failed. Singleton module! Use .getInstance() instead of new.");
        }
        OneWireService._instance = this;
    }
    OneWireService.getInstance = function () {
        if (OneWireService._instance === null) {
            OneWireService._instance = new OneWireService();
        }
        return OneWireService._instance;
    };
    OneWireService.prototype.readAll = function () {
        var self = this;
        // // idVendor: 1274, idProduct: 9360
        // var testUsb = usb.getDeviceList();
        // for (let device of testUsb) {
        //     console.log("USB device: busNumber: " + device.busNumber 
        //     + ", deviceAddress: " + device.deviceAddress 
        //     + ", idVendor: " + device.deviceDescriptor.idVendor + ", idProduct: " + device.deviceDescriptor.idProduct);
        // }
        // promise based
        return oneWire.readDevices().then(function (devices) {
            //console.log('Read all devices', devices);
            if (devices) {
                console.log('OneWire.readAll device count: ' + devices.length);
                self.heatingService.updateTempSensors(devices);
            }
            else {
                console.log('OneWire.readAll no devices found');
            }
        }, function (err) {
            console.log('OneWire.readAll error: ', err);
        });
    };
    OneWireService.prototype.run = function () {
        var self = this;
        setInterval(function () {
            self.readAll();
        }, OneWireService.POLLPERIOD);
    };
    OneWireService.POLLPERIOD = 30000;
    OneWireService._instance = null;
    return OneWireService;
}());
exports.OneWireService = OneWireService;
//# sourceMappingURL=onewire.js.map