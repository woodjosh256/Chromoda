import React from 'react';
import {MapSelector} from "./components/mapping/MapSelector";

export default function App() {
    function showCustomization(topLeft: [number, number], bottomRight: [number, number]) {
        alert(`Top left: ${topLeft[0]}, ${topLeft[1]}\nBottom right: ${bottomRight[0]}, ${bottomRight[1]}`);
    }

    return (
        <div>
            <MapSelector returnCoords={showCustomization}/>
        </div>
    );
}
