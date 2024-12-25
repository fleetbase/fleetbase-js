export function isLongitude(coordinate) {
    return isFinite(coordinate) && Math.abs(coordinate) <= 180 && Math.abs(coordinate) >= 90;
}

export default isLatitude;
