export default class Point {
    static fromGeoJson(json: any): Point;
    constructor(latitude?: number, longitude?: number);
    type: string;
    coordinates: number[];
    get latitude(): number;
    get longitude(): number;
    lat(): number;
    lng(): number;
    serialize(): {
        type: string;
        coorindates: number[];
    };
    toJson(): {
        type: string;
        coorindates: number[];
    };
    toString(): string;
}
