import React from "react";

interface AttributionProps {
    className?: string;
}

export function Attribution (props: AttributionProps) {
    return (
        <div className={`space-x-2 text-white text-xs ${props.className}`}>
            <a href="https://acromoda.com" target="_blank" rel="noopener noreferrer">Acromoda</a>
            <a href="https://www.mapbox.com/about/maps/" target="_blank" rel="noopener noreferrer">© Mapbox</a>
            <a href="http://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">© OpenStreetMap</a>
            <a href="https://www.mapbox.com/map-feedback/" target="_blank" rel="noopener noreferrer">Improve this map</a>
        </div>
    );
}