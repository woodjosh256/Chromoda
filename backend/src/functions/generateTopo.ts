
// noinspection JSUnusedGlobalSymbols
import {requestTile, requestTileRegion, Tile} from "../lib/MapboxClient";
import {response200} from "../lib/responses";

export async function handler() {
    const tlTile: Tile = {
        x: 3826,
        y: 6127,
        zoom: 14
    };

    const brTile: Tile = {
        x: 3828,
        y: 6129,
        zoom: 14
    };

    const tile = await requestTileRegion(tlTile, brTile);

    let a = "asdf";
    // console.log(tile);

    return response200({
        tile: tile
    });

}