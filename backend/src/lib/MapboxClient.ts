import mapboxSdk from '@mapbox/mapbox-sdk/services/tilesets';
import * as dotenv from 'dotenv';
// @ts-ignore - Having this longer import fixes packaging errors. See: https://www.npmjs.com/package/@d4c/numjs
import nj from '@d4c/numjs/build/module/numjs.min.js';
import {TILE_SIZE} from "../constants";
import jimp from 'jimp';
const PNG = require('pngjs').PNG;

dotenv.config();

type BoundingBox = [[number, number], [number, number], [number, number], [number, number]]

export interface Tile {
    // x increases going east
    // y increases going south
    x: number;
    y: number;
    zoom: number;
}

function rgbToElevation(r: number, g: number, b: number) {
    return -10000 + ((r * 256 * 256 + g * 256 + b) * 0.1);
}

// returns tile in the form of a numjs array of elevation values
export async function requestTile(tile: Tile) : Promise<nj.NdArray> {
    console.log("requestTile begin")
    const url = `https://api.mapbox.com/v4/mapbox.terrain-rgb/${tile.zoom}/${tile.x}/${tile.y}@2x.pngraw?access_token=${process.env.MAPBOX_API_KEY}`;
    const response = await fetch(url);

    const data = await response.arrayBuffer();
    return new Promise((resolve, reject) => {
        // @ts-ignore
        new PNG().parse(data, (error, data) => {
            if (error) {
                // error - assume tile doesn't exist
                // make sea level tile
                resolve(nj.zeros([TILE_SIZE, TILE_SIZE], 'int16'))
            } else {
                console.log("start populating numj array")
                let array2d = nj.zeros([data.height, data.width])
                for (let y = 0; y < data.height; y ++) {
                    for (let x = 0; x < data.width; x++) {
                        let idx = (data.width * y + x) * 4
                        const elevation = rgbToElevation(data.data[idx], data.data[idx + 1], data.data[idx + 2])
                        array2d.set(y, x, elevation)
                    }
                }
                console.log("end populating numj array")
                resolve(array2d);
            }
        });
    });
}

// async function updateElevation(zoom: number, tile: Tile, regionArray: nj.NdArray, xPos: number, yPos: number) {
//     const elevation_array = await requestTile(zoom, tile);
//     regionArray.slice([yPos, yPos + TILE_SIZE], [xPos, xPos + TILE_SIZE]).assign(elevation_array, false)
// }

interface ElevationPromise {
    promise: Promise<nj.NdArray>,
    tile: Tile
}

// br_tile is inclusive
export async function requestTileRegion(tl_tile: Tile, br_tile: Tile): Promise<nj.NdArray> {
    if (tl_tile.zoom != br_tile.zoom) {
        throw Error("top left and bottom right tiles must have matching zoom.")
    }

    const zoom = tl_tile.zoom;
    const width = br_tile.x - tl_tile.x;
    const height = br_tile.y - tl_tile.y;

    const promises: ElevationPromise[] = []
    for (let tileX = tl_tile.x; tileX <= br_tile.x; tileX ++) {
        for (let tileY = tl_tile.y; tileY <= br_tile.y; tileY ++) {
            const tile: Tile = {
                x: tileX,
                y: tileY,
                zoom: zoom
            }
            const elevationPromise: ElevationPromise = {
                promise: requestTile(tile),
                tile: tile
            }
            console.log("Adding promise: ", elevationPromise)
            promises.push(elevationPromise);
        }
    }

    try {
        console.log("begin promise awaiting")
        const elevationMatrices = await Promise.all(promises.map(p => p.promise));
        console.log("end promise awaiting")

        let region = nj.zeros([TILE_SIZE * width, TILE_SIZE * height]);
        elevationMatrices.forEach((elevationMatrix, index) => {
            console.log("starting region")
            let { tile } = promises[index];
            region.slice([tile.y, tile.y + TILE_SIZE], [tile.x, tile.x + TILE_SIZE]).assign(elevationMatrix, false);
        })

        return mapToGrayscale(region);
    } catch (error) {
        console.error('Error while requesting tiles: ', error);
        throw error;
    }
}

function mapToGrayscale(array: nj.NdArray): nj.NdArray {
    const minValue = array.min();
    const maxValue = array.max();
    const WHITE_VALUE = 255;

    return array.subtract(minValue).divide(maxValue - minValue).multiply(WHITE_VALUE);
}

// todo change to coordinates
export function arrayToPng(array: nj.NdArray) {

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
