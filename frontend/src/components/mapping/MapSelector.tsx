import React, {useRef, useEffect} from 'react';

import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

// @ts-ignore
import * as mapboxgl from '!mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import {MaterialContainer} from "../common/MaterialContainer";
import {SelectorButton} from "../common/SelectorButton";
import {Attribution} from "./Attribution";
import {BAG_WIDTH, BAG_HEIGHT} from "../../constants";

mapboxgl.accessToken = 'pk.eyJ1Ijoid29vZGpvc2gyNTYiLCJhIjoiY2w1enZ3enZ0MWRzbDNlcnQ2aHczbnpoeSJ9.ktUPmFvHckp8iworeuOvOA';

interface MapSelectorProps {
    returnCoords: (top_left: [number, number], bottom_right: [number, number]) => void; // long, lat order
}

export function MapSelector(props: MapSelectorProps) {
    const mapContainer = useRef<HTMLDivElement | null>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const box = useRef<HTMLDivElement | null>(null);

    const starting_zoom: number = 2.5;
    const starting_lat: number = 39.78;
    const starting_lng: number = -98.55;

    useEffect(() => {
        if (map.current) return; // initialize map only once
        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/outdoors-v12',
            center: [starting_lng, starting_lat],
            zoom: starting_zoom,
            maxPitch: 0,
            projection: 'mercator',
            attributionControl: false
        });

        map.current.addControl(
            new MapboxGeocoder({
                accessToken: mapboxgl.accessToken,
                mapboxgl: mapboxgl,
                marker: false,
            })
        );
        map.current.addControl(new mapboxgl.NavigationControl({showCompass: true}));

        // this enables 3d terrain
        map.current.on('style.load', () => {
            map.current.addSource('mapbox-dem', {
                'type': 'raster-dem',
                'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
                'tileSize': 512,
                'maxzoom': 14
            });
            // add the DEM source as a terrain layer with exaggerated height
            map.current.setTerrain({'source': 'mapbox-dem', 'exaggeration': 1.3});
        });
    });

    function returnCoords() {
        if (!map.current || !box.current) return;
        let topLeft = map.current.unproject([box.current.offsetLeft,
            box.current.offsetTop]);
        let bottomRight = map.current.unproject([box.current.offsetLeft + box.current.offsetWidth,
            box.current.offsetTop + box.current.offsetHeight]);

        props.returnCoords([topLeft.lng, topLeft.lat], [bottomRight.lng, bottomRight.lat]);
    }

    return (
        <div className="relative h-screen w-screen">
            <div ref={mapContainer} className="z-0 absolute top-0 left-0 w-full h-full"/>
            <Attribution className="absolute bottom-0 right-0 px-2 backdrop-blur backdrop-brightness-75"/>
            <div className="z-1 absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center pointer-events-none">

                <div className="flex-grow flex w-9/12 md:w-1/3 items-center justify-center pointer-events-none">
                    <div ref={box} className={`w-full aspect-bag_ratio border-4 rounded-[3rem] shadow-gray-800 shadow-mega border-pink-600`}/>
                </div>

                <MaterialContainer className={"h-auto flex flex-col space-y-4 pointer-events-auto"}>
                    <p className="text-white text-center">Move map to select region to be printed on your fanny pack.</p>
                    <SelectorButton handler={returnCoords}>SELECT REGION</SelectorButton>
                </MaterialContainer>
            </div>
        </div>

    );
}
