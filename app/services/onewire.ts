import { HeatingService } from '../services/heatingservice';
let oneWire = require('ds1820-temp');

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
        // promise based
        return oneWire.readDevices().then(function (devices) {
            //console.log('Read all devices', devices);
            self.heatingService.updateTempSensors(devices);
        }, function (err) {
            console.log('An error occurred', err);
        });
    }

    public run() {
        let self = this;
        setInterval( function() {
            self.readAll();
        }, OneWireService.POLLPERIOD);
    }
}
