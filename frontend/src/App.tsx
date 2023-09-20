import React, {useEffect, useRef, useState} from 'react';
import {MapSelector} from "./components/mapping/MapSelector";
import {PrintCustomizer} from "./components/printcustomizer/PrintCustomizer";
import {BAG_WIDTH} from "./constants";
import mapboxgl from "mapbox-gl";
import {Console} from "inspector";
import {PrintGenerator, PrintOptions} from "./utils/PrintGenerator";

export default function App() {
    const [svgData, setSvgData] = useState<string | null>(null);
    const [showMap, setShowMap] = useState<boolean>(true);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [printOptions, setPrintOptions] = useState<PrintOptions | null>(null);

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
            "width": Math.floor(BAG_WIDTH / 2),
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

    async function showCustomization(topLeft: [number, number], topRight: [number, number], bottomLeft: [number, number],  bottomRight: [number, number]) {
        setIsLoading(true);
        queryAPI(topLeft, topRight, bottomLeft, bottomRight)
            .then(response => response.json())
            .then(data => {
                setSvgData(data["svg"]);
                setIsLoading(false);
                setShowMap(false);
            });
    }

    function showMapSelector() {
        setShowMap(true);
    }

    useEffect(() => {
        setPrintOptions({
            color_a: "#FFFFFF",
            color_b: "#0000FF",
            gradient: false,
            secondary: true
        })
    }, []);

    return (
        <div className="h-screen w-screen flex flex-col">
            <div className="flex-grow">
                <MapSelector returnCoords={showCustomization}
                             onload={warmupLambda}
                             className={(showMap ? "block" : "hidden") + ""}
                             isLoading={isLoading}
                />
                {!showMap && svgData && printOptions ?
                    <PrintCustomizer printGenerator={new PrintGenerator(svgData)}
                                     printOptions={printOptions}
                                     setPrintOptions={setPrintOptions}
                                     exit={showMapSelector}
                                     className={(showMap ? "hidden" : "block") + ""}/>
                    : null
                }
            </div>
        </div>
    );
}
