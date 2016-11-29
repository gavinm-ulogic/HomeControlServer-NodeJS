import * as SerialPort from 'serialport';

export class RelayCardService {

    // Cards numbered from 1
    // Relays numbered from 0 to 7

    private static BOARDCOUNT = 3;
    private static RELAYCOUNT = 8;

    private port: SerialPort;
    private doInitialise: boolean = true;
    private onDataHandler = null;
    private serialData = null;

    private static _instance: RelayCardService = null;

    private setupRelays: number[] = [0, 0, 0, 0];   // 1st vlaue not used
    private liveRelays: number[] = [0, 0, 0, 0];    // 1st vlaue not used

    private timeoutCheck: any = null;

    constructor() {
        if(RelayCardService._instance){
        throw new Error("Error: Instantiation failed. Singleton module! Use .getInstance() instead of new.");
        }
        RelayCardService._instance = this;        
    }

    public static getInstance() {
        if(RelayCardService._instance === null) {
            RelayCardService._instance = new RelayCardService();
        }
        return RelayCardService._instance;
    }
    
    private sendCommand(commandByte: number, addressByte: number, dataByte: number, callback: any) {
        let self = this;
        let waitTime = 100;
        if (self.doInitialise) { self.initialise(); waitTime = 4000; }

        setTimeout(function() {
            let sendBuffer = new Buffer([commandByte, addressByte, dataByte, addressByte ^ commandByte ^ dataByte]);
            console.log("RelayCardService.sendCommand: command: " + sendBuffer[0] + ", card: " + sendBuffer[1] + ", data: " + sendBuffer[2] + ", xor: " + sendBuffer[3]);        
            self.port.write(sendBuffer, function() {
                self.port.drain(function() {
                    setTimeout(function() {
                        if (callback) { callback(); }
                    }, 500);
                });
            });
        }, waitTime);
    }

    public initialise() {
        console.log("RelayCardService.initialise");
        let self = this; 
        self.doInitialise = false;
        
        if (self.port) {
            self.port.close();
        }

        self.port = new SerialPort('/dev/ttyUSB0', {
            baudRate: 19200,
            parity: 'none',
            dataBits: 8,
            stopBits: 1,
            parser: SerialPort.parsers.byteLength(4)
        });

        self.port.on('open', function() {
            console.log("RelayCardService.onOpen");
            let sendBuffer = new Buffer([0x1]);
            let doneFlag = false;

            // self.onDataHandler = function(data) {
            //     if (data.length > 3) { doneFlag = true; }
            // };

            for (var i = 0; i < 4; i++) {
                //if (doneFlag) { break; }
                self.port.write(sendBuffer);
            }

//            setTimeout (function() {
                // // Get card count
                // self.onDataHandler = function(data: number[]) {
                //     if (data[0] === 1) 
                //     {
                //         let cardCount = data[1] - 1;
                //         console.log("Card count: " + cardCount); 
                //         self.onDataHandler = null;
                //     }
                // };

                // for (var i = 0; i < 4; i++) {
                //     self.port.write(sendBuffer);
                // }

            setTimeout (function() {
                self.setAllOff(function() {
                    self.testCards();
                });
            }, 2000);


        });

        self.port.on('error', function(err) {
            console.log("RelayCardService.onError");
            console.log('Error: ', err.message);
            self.doInitialise = true;
        })

        self.port.on('data', function (data) {
            console.log("RelayCardService.onData");
            console.log('Data: ' + data[0] + " " + data[1] + " " + data[2] + " " + data[3]);
            switch (data[0]) {
                case 1:
                    console.log("Card count: " +  (data[1] - 1).toString()); 
                    break;

                case 252:
                    // Set card relay - report
                    self.liveRelays[data[2]] = data[3];
                    break;
            }
            if (self.onDataHandler) {
                self.onDataHandler(data);
            }
            if (self.timeoutCheck) { 
                clearTimeout(self.timeoutCheck); 
                self.timeoutCheck = null;
            }
        });

        self.port.on('close', function() {
            console.log("RelayCardService.onClose");
        })

        self.port.on('disconnect', function(err) {
            console.log("RelayCardService.onClose");
            console.log('Error: ', err.message);
        })

                
    } 
    

    public isLive() {
        return !this.doInitialise;
    }

    private testSetOff() {
        let self = this;
        self.setOff(1, 7, function() {
            self.setOff(2, 7, function(){
                self.setOff(3, 7, function(){;
                });
            });
        });
    }

    private testSetOn() {
        let self = this;
        self.setOn(1, 7, function() {
            self.setOn(2, 7, function(){
                self.setOn(3, 7, function(){;
                    self.testSetOff();
                });
            });
        });
    }

    public testCards() {
        console.log("RelayCardService.testCards");
        this.testSetOn();
    }

    public setAllOff(callback: any) {
        console.log("RelayCardService.SetAllOff");
        this.sendCommand(3, 0, 0, callback);    
    }

    public setOn(card: number, relay: number, callback: any) {
        console.log("RelayCardService.SetOn");
        return this.sendCommand(6, card, Math.pow(2, relay), callback);
    }

    public setOff(card: number, relay: number, callback: any) {
        console.log("RelayCardService.SetOff");
        return this.sendCommand(7, card, Math.pow(2, relay), callback);
    }

    public setCardRelays(card: number, value: number, callback: any) {
        console.log("RelayCardService.setCardRelays");
        this.sendCommand(3, card, value, callback);
    }
    
    public resetAllSetupRelays() {
        this.setupRelays = [0, 0, 0, 0];
    }

    public getRelayState(relayAddress: string) {
        return false;           //?????????????????????????????????????????
    }

    public setupRelay(relayAddress: string, state: boolean)
    {
        let saAddress = relayAddress.split('-');
        let cardNum = Number(saAddress[0]);
        let relayNum = Number(saAddress[1]);
        let byteMask = 1 << relayNum;

        if (state)
        {
            this.setupRelays[cardNum] = this.setupRelays[cardNum] | byteMask;
        }
        else
        {
            this.setupRelays[cardNum] = this.setupRelays[cardNum] & (~byteMask);
        }
    }

    public updateRelays()
    {
        let self = this;
        self.timeoutCheck = setTimeout(function(){
            console.log("Relay card timeout detected");
            self.doInitialise = true;
        }, 10000);
        self.setCardRelays(1, self.setupRelays[1], function() {
            self.setCardRelays(2, self.setupRelays[2], function() {
                self.setCardRelays(3, self.setupRelays[3], null);            
            });
        });
    }
    
}
