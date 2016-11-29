export class EventGroup {
    id: number;
    name: string;

    constructor(data) {
        if (data) {
            this.id = parseInt(data.id);
            this.name = data.name;
        }
    }
}