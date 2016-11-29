import * as FS from 'fs';
import { HeatingData } from '../models/heatingdata';
// import { EventGroup } from '../models/eventgroup';
// import { Room } from '../models/room';
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

    private processSubData() {
        // Add heaters to rooms
        for (let i = 0; i < this.heatingData.floorHeats.length; i++)
        {
            for (let j = 0; j < this.heatingData.rooms.length; j++)
            {
                if (this.heatingData.rooms[j].id == this.heatingData.floorHeats[i].roomId)
                {
                    if (!this.heatingData.rooms[j].heaters) { this.heatingData.rooms[j].heaters = []; }
                    this.heatingData.rooms[j].heaters.push(this.heatingData.floorHeats[i]);
                    break;
                }
            }
        }
        for (let i = 0; i < this.heatingData.towelRads.length; i++)
        {
            for (let j = 0; j < this.heatingData.rooms.length; j++)
            {
                if (this.heatingData.rooms[j].id == this.heatingData.towelRads[i].roomId)
                {
                    if (!this.heatingData.rooms[j].heaters) { this.heatingData.rooms[j].heaters = []; }
                    this.heatingData.rooms[j].heaters.push(this.heatingData.towelRads[i]);
                    break;
                }
            }
        }

        // Add sensors to rooms and heaters
        for (let i = 0; i < this.heatingData.roomSensors.length; i++)
        {
            for (let j = 0; j < this.heatingData.rooms.length; j++)
            {
                if (this.heatingData.rooms[j].id == this.heatingData.roomSensors[i].roomId)
                {
                    if (!this.heatingData.rooms[j].sensors) { this.heatingData.rooms[j].sensors = []; }
                    this.heatingData.rooms[j].sensors.push(this.heatingData.roomSensors[i]);
                    if (this.heatingData.rooms[j].heaters) {
                        for (let k = 0; k < this.heatingData.rooms[j].heaters.length; k++)
                        {
                            if (!this.heatingData.rooms[j].heaters[k].sensors) { this.heatingData.rooms[j].heaters[k].sensors = []; }
                            this.heatingData.rooms[j].heaters[k].sensors.push(this.heatingData.roomSensors[i]);
                        }
                    }
                    break;
                }
            }
        }
        for (let i = 0; i < this.heatingData.floorSensors.length; i++)
        {
            for (let j = 0; j < this.heatingData.rooms.length; j++)
            {
                if (this.heatingData.rooms[j].id == this.heatingData.floorSensors[i].roomId)
                {
                    if (!this.heatingData.rooms[j].sensors) { this.heatingData.rooms[j].sensors = []; }
                    this.heatingData.rooms[j].sensors.push(this.heatingData.floorSensors[i]);
                    if (this.heatingData.rooms[j].heaters) {
                        for (let k = 0; k < this.heatingData.rooms[j].heaters.length; k++)
                        {
                            if (!this.heatingData.rooms[j].heaters[k].sensors) { this.heatingData.rooms[j].heaters[k].sensors = []; }
                            this.heatingData.rooms[j].heaters[k].sensors.push(this.heatingData.floorSensors[i]);
                        }
                    }
                    break;
                }
            }
        }

            // // Clear and then populate relay set
            // Relay oRelay;
            // theData.theRelays.Clear();
            // for (int i = 0; i < this.heatingData.floorHeats.length; i++)
            // {
            //     oRelay = new Relay(this.heatingData.floorHeats[i].Name, this.heatingData.floorHeats[i].RelayAddress);
            //     theData.theRelays.Add(oRelay);
            // }
            // for (int i = 0; i < this.heatingData.towelRads.length; i++)
            // {
            //     oRelay = new Relay(this.heatingData.towelRads[i].Name, this.heatingData.towelRads[i].RelayAddress);
            //     theData.theRelays.Add(oRelay);
            // }
            // theData.theRelays.Sort();

    };

    public loadFromFile() {
        let self = this;
        FS.readFile(this.DATAFILE, "", function(err, data) {
            if (err) {
                console.log("HeatingService.loadFromFile: " + err.message);
            } else {
                self.heatingData.loadData(data);
                // console.log("HeatingService.loadFromFile: " + data);
                // let loadedData: any = JSON.parse(data);
                // self.heatingData.groups = loadedData.groups;
                // self.heatingData.rooms = loadedData.rooms;
                // self.heatingData.floorHeats = loadedData.floorHeats;
                // self.heatingData.towelRads = loadedData.towelRads;
                // self.heatingData.roomSensors = loadedData.roomSensors;
                // self.heatingData.floorSensors = loadedData.floorSensors;
                // self.heatingData.events = loadedData.events;
                // self.heatingData.relays = loadedData.relays;

                // self.heatingData.groups = loadedData.HeatingData.theGroups.EventGroup;
                // self.heatingData.rooms = loadedData.HeatingData.theRooms.Room;
                // self.heatingData.floorHeats = loadedData.HeatingData.theFloorHeats.Heater;
                // self.heatingData.towelRads = loadedData.HeatingData.theTowelRads.Heater;
                // self.heatingData.roomSensors = loadedData.HeatingData.theRoomSensors.Sensor;
                // self.heatingData.floorSensors = loadedData.HeatingData.theFloorSensors.Sensor;
                // self.heatingData.events = loadedData.HeatingData.theEvents.TimedEvent;
                // self.heatingData.relays = loadedData.HeatingData.theRelays.Relay;
                //self.saveToFile();

                //self.processSubData();      // Heaters & Sensors sub-objects not saved to the data file
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

    public getRoomById = function(roomId: string) {
        for (let room of this.heatingData.rooms) {
            if (room.id == roomId) { return room; }
        }
        return null;
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

    public getAllEvents() {
        return this.heatingData.events;
    }

    public getEventById(eventId: number) {
        for (let event of this.heatingData.events) {
            if (event.id == eventId) { return event; }
        }
        return null;
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

    public deleteEvent(timedEvent: TimedEvent) {
        for (let i in this.heatingData.events) {
            if (this.heatingData.events[i].id == timedEvent.id) { this.heatingData.events.splice(parseInt(i), 1); }
        }
    }

    public updateTempSensors(sensors) {
        for (let sensor of sensors) {
            let foundSensor = this.heatingData.getTempSensor(sensor.name);
            if (foundSensor) { foundSensor.reading = sensor.value; }
        }
    }

}
