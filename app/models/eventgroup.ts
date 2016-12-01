export class EventGroup {
    id: number;
    name: string;

    constructor(data: any) {
        if (data) {
            this.id = parseInt(data.id);
            this.name = data.name;
        }
    }
}