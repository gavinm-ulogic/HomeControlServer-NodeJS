import * as FS from 'fs';
import { HeatingData } from '../models/heatingdata';
// import { EventGroup } from '../models/eventgroup';
import { Room } from '../models/room';
// import { Heater } from '../models/heater';
// import { Sensor } from '../models/sensor';
import { TimedEvent } from '../models/timedevent';
// import { Relay } from '../models/relay';

export class HeatingService {

    public static HOLIDAYDELTA = -5;
    private OLDFILE = "./appdata.json";
    private DATAFILE = "./heatingdata.json";

    public heatingData = new HeatingData();
    public holidayMode = false;
    public floorHeatActive = true;
    public towelRadsActive = true;

    public nextGroupId = 1;
    public nextEventId = 1;

    private static _instance: HeatingService = null;

    constructor() {
        if(HeatingService._instance){
        throw new Error("Error: Instantiation failed. Singleton module! Use .getInstance() instead of new.");
        }
        HeatingService._instance = this;        
        this.loadFromFile();
    }

    public static getInstance() {
        if(HeatingService._instance === null) {
            HeatingService._instance = new HeatingService();
        }
        return HeatingService._instance;
    }

    public loadFromFile() {
        let self = this;
        FS.readFile(this.DATAFILE, "", function(err, data) {
            if (err) {
                console.log("HeatingService.loadFromFile: " + err.message);
            } else {
                self.heatingData.loadData(data);

                for(let eventGroup of self.heatingData.groups) {
                    if (eventGroup.id >= self.nextGroupId) { self.nextGroupId = eventGroup.id + 1; }
                } 
                for(let timedEvent of self.heatingData.events) {
                    if (timedEvent.id >= self.nextEventId) { self.nextEventId = timedEvent.id + 1; }
                } 
            }
        });
    }

    public saveToFile() {
        let self = this;

        let jsonFilter = function(key,value) {
            if (key=="heaters") return undefined;
            else if (key=="sensors") return undefined;
            else return value;
        };

        FS.writeFile(self.DATAFILE, JSON.stringify(self.heatingData, jsonFilter));        
    }

    public getAllRooms() {
        return this.heatingData.rooms;
    }

    public getRoomById(roomId: number) {
        for (let room of this.heatingData.rooms) {
            if (room.id == roomId) { return room; }
        }
        return null;
    }

    public updateRoom(room: Room): Room {
        let theRoom = this.getRoomById(room.id);
        if (!theRoom) { return null; };
        return theRoom.update(room); 
    }

    public getAllGroups() {
        return this.heatingData.groups;
    }

    public getGroupById(groupId: number) {
        for (let group of this.heatingData.groups) {
            if (group.id == groupId) { return group; }
        }
        return null;
    }

    public createEvent(timedEvent: TimedEvent): TimedEvent {
        timedEvent.id = this.nextEventId;
        this.nextEventId++;
        this.heatingData.events.push(timedEvent);
        return timedEvent;
    }

    public getAllEvents(): TimedEvent[] {
        return this.heatingData.events;
    }

    public getEventById(eventId: number): TimedEvent {
        for (let event of this.heatingData.events) {
            if (event.id == eventId) { return event; }
        }
        return null;
    }

    public updateEvent(timedEvent: TimedEvent): TimedEvent {
        let updateEvent = this.getEventById(timedEvent.id);
        if (!updateEvent) { return null; };
        return updateEvent.update(timedEvent); 
    }

    public deleteEvent(timedEvent: TimedEvent) {
        for (let i in this.heatingData.events) {
            if (this.heatingData.events[i].id == timedEvent.id) { this.heatingData.events.splice(parseInt(i), 1); }
        }
    }

    public getAllSensors() {
        return this.heatingData.roomSensors;
    }

    public getSensorById(sensorId: number) {
        for (let sensor of this.heatingData.roomSensors) {
            if (sensor.id == sensorId) { return sensor; }
        }
        return null;
    }

    public updateTempSensors(sensors) {
        for (let sensor of sensors) {
            let foundSensor = this.heatingData.getSensorBySensorId(sensor.name);
            if (foundSensor) {
                let currentTime = new Date();
                let roundTemp = Math.round(sensor.value);
                foundSensor.lastRead = currentTime; 
                if (roundTemp != foundSensor.reading) { foundSensor.lastChange = currentTime; } 
                foundSensor.reading = roundTemp;
            }
        }
    }

}
