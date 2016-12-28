import { HeatingService } from '../services/heatingservice';
let oneWire = require('ds1820-temp');
// var usb = require('usb')

export class OneWireService {

    private static POLLPERIOD = 30000;
    private static _instance: OneWireService = null;
    
    private heatingService = HeatingService.getInstance();

    constructor() {
        if(OneWireService._instance){
        throw new Error("Error: Instantiation failed. Singleton module! Use .getInstance() instead of new.");
        }
        OneWireService._instance = this;
    }

    public static getInstance() {
        if(OneWireService._instance === null) {
            OneWireService._instance = new OneWireService();
        }
        return OneWireService._instance;
    }

    public readAll() {
        let self = this;

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
            } else {
                console.log('OneWire.readAll no devices found');
            } 
        }, function (err) {
            console.log('OneWire.readAll error: ', err);
        });
    }

    public run() {
        let self = this;
        setInterval( function() {
            self.readAll();
        }, OneWireService.POLLPERIOD);
    }
}
