import React, {useRef, useEffect, useState} from 'react';
import logo from './logo.svg';

import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

// @ts-ignore
import * as mapboxgl from '!mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import {MaterialContainer} from "./components/common/MaterialContainer";
import {SelectorButton} from "./components/common/SelectorButton";


mapboxgl.accessToken = 'pk.eyJ1Ijoid29vZGpvc2gyNTYiLCJhIjoiY2w1enZ3enZ0MWRzbDNlcnQ2aHczbnpoeSJ9.ktUPmFvHckp8iworeuOvOA';

export default function App() {
    const mapContainer = useRef(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const [lng, setLng] = useState(-70.9);
    const [lat, setLat] = useState(42.35);
    const [zoom, setZoom] = useState(9);



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
            projection: 'mercator',
            maxPitch: 0,
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


        map.current.on('move', () => {
            setLng(map.current.getCenter().lng.toFixed(4));
            setLat(map.current.getCenter().lat.toFixed(4));
            setZoom(map.current.getZoom().toFixed(2));
        });
    });

    return (
        <div>
            <div ref={mapContainer} className="w-screen h-screen"/>
            <MaterialContainer className={"absolute inset-x-0 bottom-0 flex flex-col space-y-4"}>
                <p className="text-white text-center">Move map to select region.</p>
                <SelectorButton handler={() => null}>SELECT</SelectorButton>
            </MaterialContainer>
        </div>
    );
}
