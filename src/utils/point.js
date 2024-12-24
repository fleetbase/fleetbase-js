export default class Point {
    constructor(latitude = 0, longitude = 0) {
        this.type = 'Point';
        this.coordinates = [longitude, latitude];
    }

    get latitude() {
        return this.coordinates[1];
    }

    get longitude() {
        return this.coordinates[0];
    }

    lat() {
        return this.latitude;
    }

    lng() {
        return this.longitude;
    }

    static fromGeoJson(json) {
        const [longitude, latitude] = json.coordinates;

        return new Point(latitude, longitude);
    }

    serialize() {
        return {
            type: 'Point',
            coorindates: [this.lat(), this.lng()],
        };
    }

    toJson() {
        return this.serialize();
    }

    toString() {
        return `(${this.latitude}, ${this.longitude})`;
    }
}
