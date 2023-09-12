import React from 'react';
import {MapSelector} from "./components/mapping/MapSelector";

export default function App() {

    function showCustomization(topLeft: [number, number], topRight: [number, number], bottomLeft: [number, number],  bottomRight: [number, number]) {
        alert(`Top Left: ${topLeft}\nTop Right: ${topRight}\nBottom Left: ${bottomLeft}\nBottom Right: ${bottomRight}`);
    }

    return (
        <div>
            <MapSelector returnCoords={showCustomization}/>
        </div>
    );
}
