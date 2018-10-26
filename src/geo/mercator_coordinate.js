// @flow

import LngLat from '../geo/lng_lat';
import type {LngLatLike} from '../geo/lng_lat';

/*
 * The circumference of the world in meters at the given latitude.
 */
function circumferenceAtLatitude(latitude: number) {
    const circumference = 2 * Math.PI * 6378137;
    return circumference * Math.cos(latitude * Math.PI / 180);
}

/**
 * A `MercatorCoordinate` object represents a projected three dimensional position.
 *
 * `MercatorCoordinate` uses the web mercator projection ([EPSG:3857](https://epsg.io/3857)) with slightly different units:
 * - the size of 1 unit is the width of the projected world instead of the "mercator meter"
 * - the origin of the coordinate space is at the north-west corner instead of the middle
 *
 * For example, `MercatorCoordinate(0, 0, 0)` is the north-west corner of the mercator world and
 * `MercatorCoordinate(1, 1, 0)` is the south-east corner. If you are familiar with
 * [vector tiles](https://github.com/mapbox/vector-tile-spec) it may be helpful to think
 * of the coordinate space as the `0/0/0` tile with an extent of `1`.
 *
 * The `z` dimension of `MercatorCoordinate` is conformal. A cube in the mercator coordinate space would be rendered as a cube.
 *
 * @param {number} x The x component of the position.
 * @param {number} y The y component of the position.
 * @param {number} z The z component of the position.
 * @example
 * var nullIsland = new mapboxgl.MercatorCoordinate(0.5, 0.5, 0);
 *
 * @see [Add a custom style layer](https://www.mapbox.com/mapbox-gl-js/example/custom-style-layer/)
 */
class MercatorCoordinate {
    x: number;
    y: number;
    z: number;

    constructor(x: number, y: number, z: number = 0) {
        this.x = +x;
        this.y = +y;
        this.z = +z;
    }

    /**
     * Project a `LngLat` to a `MercatorCoordinate`.
     *
     * @param {LngLatLike} lngLatLike The location to project.
     * @param {number} altitude The altitude in meters of the position.
     * @returns {MercatorCoordinate} The projected mercator coordinate.
     * @example
     * var coord = mapboxgl.MercatorCoordinate.fromLngLat({ lng: 0, lat: 0}, 0);
     * coord; // MercatorCoordinate(0.5, 0.5, 0)
     */
    static fromLngLat(lngLatLike: LngLatLike, altitude: number = 0) {
        const lngLat = LngLat.convert(lngLatLike);

        const x = (180 + lngLat.lng) / 360;
        const y = (180 - (180 / Math.PI * Math.log(Math.tan(Math.PI / 4 + lngLat.lat * Math.PI / 360)))) / 360;
        const z = altitude / circumferenceAtLatitude(lngLat.lat);
        return new MercatorCoordinate(x, y, z);
    }

    /**
     * Returns the `LatLng` for the coordinate.
     *
     * @returns {LngLat} The `LngLat` object.
     * @example
     * var coord = new mapboxglMercatorCoordinate(0.5, 0.5, 0);
     * var latLng = coord.toLatLng(); // LngLat(0, 0)
     */
    toLngLat() {
        const lng = this.x * 360 - 180;
        const y2 = 180 - this.y * 360;
        const lat = 360 / Math.PI * Math.atan(Math.exp(y2 * Math.PI / 180)) - 90;
        return new LngLat(lng, lat);
    }

    /**
     * Returns the altitude in meters of the coordinate.
     *
     * @returns {number} The altitude in meters.
     * @example
     * var coord = new mapboxgl.MercatorCoordinate(0, 0, 0.02);
     * coord.toAltitude(); // 6914.281956295339
     */
    toAltitude() {
        const lat = this.toLngLat().lat;
        return this.z * circumferenceAtLatitude(lat);
    }
}

export default MercatorCoordinate;
