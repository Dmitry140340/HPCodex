"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateDistance = calculateDistance;
exports.geocodeAddress = geocodeAddress;
const axios_1 = __importDefault(require("axios"));
const YANDEX_API_KEY = process.env.REACT_APP_YANDEX_API_KEY || 'your-api-key';
const GEOCODE_URL = 'https://geocode-maps.yandex.ru/1.x';
const ROUTE_URL = 'https://api-maps.yandex.ru/services/route/2.0';
async function calculateDistance(fromAddress, toAddress) {
    try {
        const fromCoords = await geocodeAddress(fromAddress);
        const toCoords = await geocodeAddress(toAddress);
        const response = await axios_1.default.get(ROUTE_URL, {
            params: {
                apikey: YANDEX_API_KEY,
                waypoints: `${fromCoords.lat},${fromCoords.lng}|${toCoords.lat},${toCoords.lng}`,
                format: 'json',
            },
        });
        const distance = response.data?.routes?.[0]?.legs?.[0]?.distance?.value;
        if (typeof distance !== 'number') {
            throw new Error('Distance value is missing or invalid');
        }
        return distance / 1000; // Convert meters to kilometers
    }
    catch (error) {
        console.error('Error calculating distance:', error);
        throw new Error('Failed to calculate distance');
    }
}
async function geocodeAddress(address) {
    try {
        const response = await axios_1.default.get(GEOCODE_URL, {
            params: {
                apikey: YANDEX_API_KEY,
                geocode: address,
                format: 'json',
            },
        });
        const point = response.data?.response?.GeoObjectCollection?.featureMember?.[0]?.GeoObject?.Point?.pos;
        if (!point) {
            throw new Error('GeoObject or Point is missing in the response');
        }
        const [lng, lat] = point.split(' ').map(Number);
        return { lat, lng };
    }
    catch (error) {
        console.error('Error geocoding address:', error);
        throw new Error('Failed to geocode address');
    }
}
