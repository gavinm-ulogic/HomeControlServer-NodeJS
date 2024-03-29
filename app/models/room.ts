import { Sensor } from "../models/sensor";
import { Heater } from "../models/heater";

export class Room {
    groupId: number;
    heaters: Heater[];
    id: number;
    name: string;
    sensors: Sensor[];
    tempTarget: number;
    tempMin: number;
    tempMax: number;

    constructor(data: any, floorheaters?: Heater[], towelrads?: Heater[], sensors?: Sensor[]) {
        if (data) {
            this.groupId = parseInt(data.groupId);
            this.id = parseInt(data.id);
            this.name = data.name;
            this.tempTarget = parseInt(data.tempTarget);
            this.tempMin = parseInt(data.tempMin);
            this.tempMax = parseInt(data.tempMax);
        }

        this.heaters = [];
        if (floorheaters) {
            for (let heater of floorheaters) {
                if (heater.roomId == this.id) { this.heaters.push(heater); }
            }
        }

        if (towelrads) {
            for (let heater of towelrads) {
                if (heater.roomId == this.id) { this.heaters.push(heater); }
            }
        }

        this.sensors = [];
        if (sensors) {
            for (let sensor of sensors) {
                if (sensor.roomId == this.id) { this.sensors.push(sensor); }
            }
        }
    }    

    public update(data: Room): Room {
        this.groupId = data.groupId;
        this.name = data.name;
        this.tempTarget = data.tempTarget;
        this.tempMin = data.tempMin;
        this.tempMax = data.tempMax;
        return this;
    }

}