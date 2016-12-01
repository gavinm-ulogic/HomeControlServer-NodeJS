import { Sensor } from "../models/sensor";

export class Heater {
    groupId: number;
    id: number;
    name: string;
    relayAddress: string;
    roomId: number;
    sensors: Sensor[];
    state: number;
    tempMax: number;
    type: number;

    constructor(data: any, sensors?: Sensor[]) {
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
            for (let sensor of sensors) {
                if (sensor.roomId == this.roomId) { this.sensors.push(sensor); }
            }
        }
    }     
}