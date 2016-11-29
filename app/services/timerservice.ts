import { EventGroup } from '../models/eventgroup';
import { Room } from '../models/room';
import { Heater } from '../models/heater';
import { Sensor } from '../models/sensor';
import { TimedEvent } from '../models/timedevent';
import { Relay } from '../models/relay';

import { OneWireService } from '../services/onewire';
import { RelayCardService } from '../services/relaycard';
import { HeatingService } from '../services/heatingservice';

export class TimerService {
 
    private static STARTDELAY = 20000;
    private static LOOPDELAY = 40000;

    private static _instance: TimerService = null;

    private processedRelays: any[] = [];

    private runFlag =  false;

    private tempDelta = 0;

    private heatingService = HeatingService.getInstance();
    private relayCardService = RelayCardService.getInstance();

    constructor() {
        if(TimerService._instance){
        throw new Error("Error: Instantiation failed. Singleton module! Use .getInstance() instead of new.");
        }
        TimerService._instance = this;        
    }

    public static getInstance() {
        if(TimerService._instance === null) {
            TimerService._instance = new TimerService();
        }
        return TimerService._instance;
    }

    public run() {
        let self = this;
        self.runFlag = true;
        setTimeout(function() {
            self.runLoop();
        }, TimerService.STARTDELAY)
    }

    private runLoop() {
        let self = this;
        if (self.runFlag) {
            console.log("TimerService.runLoop");
            setTimeout(function() {
                self.runLoop();
            }, TimerService.LOOPDELAY);
            self.doHeating();
            //this.heatingService.saveToFile();
        }
    }

    public kill()
    {
        this.runFlag = false;
    }

    public doHeating()
    {
        console.log("TimerService.doHeating");
        let self = this;

        // Should first check state of relays (in case of power cut)
//        if (!self.relayCardService.isLive() && !self.relayCardService.initialise()) return;
        //////////////////////////////////////////////////////////////////////////////////////////if (!self.relayCardService.isLive()) return;

        let currentTime = new Date();
        let timedEvents: TimedEvent[] = [];
        let timedEvent: TimedEvent = null;
        let room: Room = null;
        let towelRad: Heater = null;
        let floorHeat: Heater = null;
        let tooHot = false;
        let staySame = false;

        if (self.heatingService.holidayMode) { self.tempDelta = HeatingService.HOLIDAYDELTA; } else { self.tempDelta = 0; }

        // All relays to switch off unless set to on
        self.relayCardService.resetAllSetupRelays();
        self.processedRelays = [];
        
        // Iterate rooms
        if (self.heatingService.floorHeatActive) {
            for (let aRoom of self.heatingService.heatingData.rooms) {
                tooHot = false;
                staySame = false;

                for (let aSensor of aRoom.sensors) {
                    if (aSensor.reading > aRoom.tempTarget + self.tempDelta) {
                        tooHot = true;
                        break;
                    } else if (aSensor.reading === aRoom.tempTarget + self.tempDelta) {
                        staySame = true;
                    }
                }           

                if (!tooHot) {
                    for (let i = self.heatingService.heatingData.events.length - 1; i >= 0; i--) {
                        if ((self.heatingService.heatingData.events[i].subjectId == aRoom.id) 
                            || (self.heatingService.heatingData.events[i].subjectId == aRoom.groupId)) {
                            let anEvent = self.heatingService.heatingData.events[i];
                            if (anEvent.isExpired()) {
                                this.heatingService.deleteEvent(anEvent); return false;
                            } else if (anEvent.isActive(null)) {
                                for (let aHeater of aRoom.heaters) {
                                    if (aHeater.relayAddress) {
                                        self.processRelay(aHeater, anEvent, staySame);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }        
        
        // Iterate towel rads
        if (self.heatingService.towelRadsActive) {
            for (let aRad of self.heatingService.heatingData.towelRads) {
                // find all events for this towel rad - priority is last is highest
                for (let i = self.heatingService.heatingData.events.length - 1; i >= 0; i--) {
                    if ((self.heatingService.heatingData.events[i].subjectId == aRad.id) 
                        || (self.heatingService.heatingData.events[i].subjectId == aRad.groupId)) {
                        let anEvent = self.heatingService.heatingData.events[i];
                        if (anEvent.isExpired()) {
                            this.heatingService.deleteEvent(anEvent); return false;
                        } else if (anEvent.isActive(null)) {
                            if (aRad.relayAddress) {
                                self.processRelay(aRad, anEvent, staySame);
                            }
                        }
                    }
                }
            }
        }

        self.relayCardService.updateRelays();
    }


    private processRelay(heater: Heater, timedEvent: TimedEvent, staySame: boolean)
    {// if staySame the relay should stay off if already off or on if already on
        let self = this;
        let tooHot = false;

        for (let aSensor of heater.sensors) {
            if (aSensor.reading >= heater.tempMax)
            {
                tooHot = true;
                break;
            }
        }

        if (!tooHot)
        {
            let foundRelay = false;
            let state = (timedEvent.type == TimedEvent.eventType.HEAT);

            for (let processedRelay of self.processedRelays)
            {
                if (processedRelay.relayAddress == heater.relayAddress)
                {
                    if (processedRelay.eventId < timedEvent.id)
                    {// highest event id has priority
                        self.relayCardService.setupRelay(heater.relayAddress, (staySame) ? self.relayCardService.getRelayState(heater.relayAddress) : state);
                        processedRelay.eventId = timedEvent.id;
                    }
                    foundRelay = true;
                    break;
                }
            }

            if (!foundRelay)
            {
                self.relayCardService.setupRelay(heater.relayAddress, (staySame) ? self.relayCardService.getRelayState(heater.relayAddress) : state);
                self.processedRelays.push({ relayAddress: heater.relayAddress, eventId: timedEvent.id });
            }
        }
    }
}
