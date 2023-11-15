import mapboxSdk from '@mapbox/mapbox-sdk/services/tilesets';
import * as dotenv from 'dotenv';
// @ts-ignore - Having this longer import fixes packaging errors. See: https://www.npmjs.com/package/@d4c/numjs
import nj from '@d4c/numjs/build/module/numjs.min.js';
import {TILE_SIZE} from "../constants";
const PNG = require('pngjs').PNG;

dotenv.config();

type BoundingBox = [[number, number], [number, number], [number, number], [number, number]]

export interface Tile {
    x: number;
    y: number;
}

function rgbToElevation(r: number, g: number, b: number) {
    return -10000 + ((r * 256 * 256 + g * 256 + b) * 0.1);
}

// returns tile in the form of a numjs array of elevation values
export async function requestTile(zoomLevel: number, tile: Tile) : Promise<nj.NdArray> {
    const url = `https://api.mapbox.com/v4/mapbox.terrain-rgb/${zoomLevel}/${tile.x}/${tile.y}@2x.pngraw?access_token=${process.env.MAPBOX_API_KEY}`;
    const response = await fetch(url);

    const data = await response.arrayBuffer();
    return new Promise((resolve, reject) => {
        // @ts-ignore
        new PNG().parse(data, (error, data) => {
            if (error) {
                // error - assume tile doesn't exist
                // make sea level tile
                resolve(nj.zeros(TILE_SIZE))
            } else {
                let array2d = nj.zeros([data.height, data.width])
                for (let y = 0; y < data.height; y ++) {
                    for (let x = 0; x < data.width; x++) {
                        let idx = (data.width * y + x) * 4
                        const elevation = rgbToElevation(data.data[idx], data.data[idx + 1], data.data[idx + 2])
                        array2d.set(y, x, elevation)
                    }
                }
                resolve(array2d);
            }
        });
    });

    // todo add error handling for if there isn't a tile
}
//
// async function getRgbHeightmap(box: BoundingBox, minWidth: number) {
// }
//
// export async function getHeightmap(box: BoundingBox, minWidth: number) {
//     const baseClient = mapboxSdk({ accessToken: process.env.MAPBOX_API_KEY })
//
//     console.log(process.env.MAPBOX_API_KEY)
// }
//
