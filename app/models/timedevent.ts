export class TimedEvent {
    public static eventType = {
        HEAT: 1,
        FALLBACK: 2,
        CONSTANT: 3,
        OFF: 4,
        HOLIDAY: 5
    }

    public description: string;
    public id: number;
    public isGroup: boolean;
    public subjectId: number;
    public timeEnd: Date;
    public timeEndStr: string;
    public timeStart: Date;
    public timeStartStr: string;
    public type: number;

    constructor(data) {
        if (data) {
            this.description = data.description;
            this.id = parseInt(data.id);
            this.isGroup = data.isGroup;
            this.subjectId = parseInt(data.subjectId);
            this.timeEnd = new Date(data.timeEnd);
            this.timeStart = new Date(data.timeStart);
            this.type = parseInt(data.type);
        }
    }

    private getSecondsOfDay(testDate: Date) {
        return testDate.getHours() * 3600 + testDate.getMinutes() * 60 + testDate.getSeconds();
    }

    public isActive(testTime: Date) {
        if (!testTime) { testTime = new Date(); }

        let testDay: number = testTime.getDay(); if (testDay == 0) { testDay = 7; }
        testDay--;  // Mon = 0, Sun = 6
        let testDayBin = Math.pow(2, testDay);

        if (this.timeStart.getFullYear() < 1000) {
            // repeating event
            let eventDays = this.timeStart.getFullYear();
            if ((testDayBin & eventDays) == 0) { return false; }

            // got this far - right day
            if (this.getSecondsOfDay(testTime) < this.getSecondsOfDay(this.timeStart) 
                || this.getSecondsOfDay(testTime) > this.getSecondsOfDay(this.timeEnd)) {
                return false;
            }
        } else {
            // fully spec'ed time
            if (testTime < this.timeStart || testTime > this.timeEnd) { return false; } 
        }

        return true;
    }

    public isExpired() {
        if (this.timeStart.getFullYear() > 1000 && this.timeEnd < new Date()) { return true; }
        return false;
    }

}