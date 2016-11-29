export class Sensor {
    id: number;
    lastChange: Date;
    lastChangeStr: string;
    lastRead: Date;
    lastReadStr: string;
    name: string;
    reading: number;
    roomId: number;
    sensorId: string;
    type: number;

    constructor(data) {
        if (data) {
            this.id = parseInt(data.id);
            this.lastChange = new Date(data.lastChange);
            this.lastRead = new Date(data.lastRead);
            this.name = data.name;
            this.reading = parseInt(data.reading);
            this.roomId = parseInt(data.roomId);
            this.sensorId = data.sensorId;
            this.type = parseInt(data.type);
        }
    }    
}