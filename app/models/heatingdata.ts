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

    public getTempSensor(id: string): Sensor {
        for (let sensor of this.roomSensors) { if (sensor.sensorId.substr(2, 12) == id) { return sensor; } }
        for (let sensor of this.floorSensors) { if (sensor.sensorId.substr(2, 12) == id) { return sensor; } }
        return null;
    }
}