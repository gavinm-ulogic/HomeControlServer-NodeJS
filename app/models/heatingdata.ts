import { EventGroup } from '../models/eventgroup';
import { Room } from '../models/room';
import { Heater } from '../models/heater';
import { Sensor } from '../models/sensor';
import { TimedEvent } from '../models/timedevent';
import { Relay } from '../models/relay';

export class HeatingData {

    public groups: EventGroup[] = [];
    public rooms: Room[] = [];
    public floorHeats: Heater[] = [];
    public towelRads: Heater[] = [];
    public roomSensors: Sensor[] = [];
    public floorSensors: Sensor[] = [];
    public events: TimedEvent[] = [];
    public relays: Relay[] = [];

    public loadData(data: any) {
        let loadedData: any = JSON.parse(data);
        
        this.groups = []
        for (let objData of loadedData.groups) {
            this.groups.push(new EventGroup(objData));
        }

        this.roomSensors = []
        for (let objData of loadedData.roomSensors) {
            this.roomSensors.push(new Sensor(objData));
        }

        this.floorSensors = []
        for (let objData of loadedData.floorSensors) {
            this.floorSensors.push(new Sensor(objData));
        }

        this.floorHeats = []
        for (let objData of loadedData.floorHeats) {
            this.floorHeats.push(new Heater(objData, this.roomSensors));
        }

        this.towelRads = []
        for (let objData of loadedData.towelRads) {
            this.towelRads.push(new Heater(objData, this.roomSensors));
        }

        this.rooms = []
        for (let objData of loadedData.rooms) {
            this.rooms.push(new Room(objData, this.floorHeats, this.towelRads, this.roomSensors));
        }

        this.events = []
        for (let objData of loadedData.events) {
            let newEvent = new TimedEvent(objData);
            if (!newEvent.isExpired()) { this.events.push(newEvent); }
        }

        console.log("HeatingData.loadData done");
    }

    public getSensorBySensorId(sensorId: string): Sensor {
        let testStart = (sensorId.length == 12) ? 2 : 0;
        let testLen = (sensorId.length == 12) ? 12 : undefined;
        for (let sensor of this.roomSensors) { 
            if (sensor.sensorId.substr(testStart, testLen).toUpperCase() == sensorId.toUpperCase()) { return sensor; } 
        }
        for (let sensor of this.floorSensors) { 
            if (sensor.sensorId.substr(testStart, testLen).toUpperCase() == sensorId.toUpperCase()) { return sensor; } 
        }
        return null;
    }
}