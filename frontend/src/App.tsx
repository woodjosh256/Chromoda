import React, {useEffect, useState} from 'react';
import {MapSelector} from "./components/mapping/MapSelector";
import {CoordsBounds, PrintCustomizer} from "./components/printcustomizer/PrintCustomizer";
import {BAG_WIDTH} from "./constants";
import {PrintGenerator, PrintOptions} from "./utils/PrintGenerator";
import {IconTypes} from "./components/printcustomizer/LocationPicker";
import OrderDisplay from "./components/ordermanagment/OrderDisplay";
import {LoadingCircle} from "./components/common/LoadingCircle";
import {Modal} from "./components/common/Modal";

export default function App() {
    const [svgData, setSvgData] = useState<string | null>(null);
    const [boundingCoords, setBoundingCoords] = useState<CoordsBounds | null>(null);
    const [showMap, setShowMap] = useState<boolean>(true);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [printOptions, setPrintOptions] = useState<PrintOptions | null>(null);

    const [beginCustomization, setBeginCustomization] = useState<boolean>(false);

    function queryMapAPI(topLeft: [number, number], topRight: [number, number], bottomLeft: [number, number], bottomRight: [number, number]): Promise<Response> {
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

        let url = "https://8sbys0hxkb.execute-api.us-east-1.amazonaws.com/dev/generateTopo" + "?" + query;

        return fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
    }

    function warmupLambda() {
        queryMapAPI(
            [-97.60781350198876, 46.1554748320809],
            [-80.01837084094592, 54.21503671402186],
            [-89.17330990661537, 37.415187460042574],
            [-71.58341534687632, 46.75842653536185])
            .then(response => response.json())
            .then(data => {
                // console.log(data)
            });
    }

    function finishOrderDisplay() {
        setBeginCustomization(true);
    }

    async function showCustomization(topLeft: [number, number], topRight: [number, number], bottomLeft: [number, number], bottomRight: [number, number]) {
        setIsLoading(true);
        queryMapAPI(topLeft, topRight, bottomLeft, bottomRight)
            .then(response => response.json())
            .then(data => {
                setBoundingCoords({
                    tl_lat: topLeft[1],
                    tl_lon: topLeft[0],
                    tr_lat: topRight[1],
                    tr_lon: topRight[0],
                    bl_lat: bottomLeft[1],
                    bl_lon: bottomLeft[0],
                    br_lat: bottomRight[1],
                    br_lon: bottomRight[0],
                })
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
            secondary: true,
            text: null,
            coordinates: false
        })
    }, []);

    return (
        <div className="h-screen w-screen flex flex-col relative">
            <OrderDisplay className={`z-40 ${beginCustomization ? "hidden" : ""}`} done={finishOrderDisplay}/>
            {isLoading ?
                <Modal>
                    <LoadingCircle/>
                </Modal>
                : null}
            <div className={`flex-grow`}>
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
                                     coordsbounds={boundingCoords!}
                                     className={(showMap ? "hidden" : "block") + ""}/>
                    : null
                }
            </div>
        </div>
    );
}
