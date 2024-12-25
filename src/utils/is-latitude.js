export function isLatitude(coordinate) {
    return isFinite(coordinate) && Math.abs(coordinate) <= 90;
}

export default isLatitude;
