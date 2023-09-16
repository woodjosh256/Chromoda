import React, {useState} from 'react';
import {MapSelector} from "./components/mapping/MapSelector";
import {PrintCustomizer} from "./components/printcustomizer/PrintCustomizer";
import {BAG_WIDTH} from "./constants";

export default function App() {
    const [showPrintCustomizer, setShowPrintCustomizer] = useState(false);  // Step 1
    const [svgData, setSvgData] = useState<string | null>(null);  // To store SVG data

    function queryAPI(topLeft: [number, number], topRight: [number, number], bottomLeft: [number, number],  bottomRight: [number, number]): Promise<Response> {
        let params = {
            "tl_lon": topLeft[0],
            "tl_lat": topLeft[1],
            "tr_lon": topRight[0],
            "tr_lat": topRight[1],
            "bl_lon": bottomLeft[0],
            "bl_lat": bottomLeft[1],
            "br_lon": bottomRight[0],
            "br_lat": bottomRight[1],
            "width": BAG_WIDTH,
            "lines": 25,
        }

        let query: string = Object.keys(params).map((key) => {
            return encodeURIComponent(key) + '=' + encodeURIComponent(String((params as any)[key]))
        }).join('&');

        let url = "https://v9d5jpgnsf.execute-api.us-east-1.amazonaws.com/dev/generateTopo" + "?" + query;

        return fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
    }

    function warmupLambda() {
        queryAPI(
            [-97.60781350198876,46.1554748320809],
            [-80.01837084094592,54.21503671402186],
            [-89.17330990661537,37.415187460042574],
            [-71.58341534687632,46.75842653536185])
            .then(response => response.json())
            .then(data => {
                // console.log(data)
            });
    }

    function showCustomization(topLeft: [number, number], topRight: [number, number], bottomLeft: [number, number],  bottomRight: [number, number]) {
        queryAPI(topLeft, topRight, bottomLeft, bottomRight)
            .then(response => response.json())
            .then(data => {
                setSvgData(data["svg"])
                setShowPrintCustomizer(true)
            });
    }

    return (
        <div className="h-screen w-screen flex flex-col">
            <div className="flex-grow">
                {showPrintCustomizer && svgData ? <PrintCustomizer svg={svgData} /> : <MapSelector returnCoords={showCustomization} onload={warmupLambda}/>}
            </div>
        </div>
    );
}
