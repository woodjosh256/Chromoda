
// noinspection JSUnusedGlobalSymbols
import {requestTile, Tile} from "../lib/MapboxClient";
import {response200} from "../lib/responses";

export async function handler() {
    const myTile: Tile = {
        x: 3826,
        y: 6127
    };
    const zoomLevel = 14;
    const tile = await requestTile(zoomLevel, myTile);

    // const tile = "asdf";
    console.log(tile);

    return response200({
        tile: tile
    });

}