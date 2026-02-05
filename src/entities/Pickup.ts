import { Entity } from './Entity';

export class Pickup extends Entity {
    public value: number;

    constructor(x: number, y: number, value: number) {
        super(x, y, 6, '#FFD700'); // Gold circle
        this.value = value;
    }
}
