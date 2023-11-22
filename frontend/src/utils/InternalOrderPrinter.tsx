import React, {useRef} from "react";
import {BAG_HEIGHT, BAG_WIDTH} from "../constants";
import {PrintGenerator, PrintOptions} from "./PrintGenerator";
import {CoordsBounds} from "../components/printcustomizer/PrintCustomizer";

export const InternalOrderPrinter = () => {
    let print_input = useRef<HTMLInputElement | null>(null);
    let myImg = useRef<HTMLImageElement | null>(null);
    let backImg = useRef<HTMLImageElement | null>(null);

    async function queryMapAPI(topLeft: [number, number], topRight: [number, number], bottomLeft: [number, number], bottomRight: [number, number]): Promise<Response> {
        let params = {
            "tl_lon": topLeft[0],
            "tl_lat": topLeft[1],
            "tr_lon": topRight[0],
            "tr_lat": topRight[1],
            "bl_lon": bottomLeft[0],
            "bl_lat": bottomLeft[1],
            "br_lon": bottomRight[0],
            "br_lat": bottomRight[1],
            "width": BAG_WIDTH / 2,
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

    function getCenter(coordsBounds: CoordsBounds): [number, number] {
        return [(coordsBounds.tl_lon + coordsBounds.tr_lon + coordsBounds.bl_lon + coordsBounds.br_lon) / 4,
            (coordsBounds.tl_lat + coordsBounds.tr_lat + coordsBounds.bl_lat + coordsBounds.br_lat) / 4]
    }

    function submitPrint() {
        if (print_input.current && print_input.current.value !== '') {
            console.log("Requesting print " + print_input.current.value + "...");
            let print_id = print_input.current.value;
            fetch("https://8sbys0hxkb.execute-api.us-east-1.amazonaws.com/dev/getOrder?print_id=" + print_id)
                .then(response => response.json())
                .then(data => {
                    console.log(data);
                    queryMapAPI([Number(data.tl_lon), Number(data.tl_lat)],
                        [Number(data.tr_lon), Number(data.tr_lat)],
                        [Number(data.bl_lon), Number(data.bl_lat)],
                        [Number(data.br_lon), Number(data.br_lat)])
                        .then(query_response => query_response.json())
                        .then(query_data => {
                            console.log(query_data)
                            let svg = query_data["svg"];

                            const coordsBounds: CoordsBounds = {
                                tl_lon: Number(data.tl_lon),
                                tl_lat: Number(data.tl_lat),
                                tr_lon: Number(data.tr_lon),
                                tr_lat: Number(data.tr_lat),
                                bl_lon: Number(data.bl_lon),
                                bl_lat: Number(data.bl_lat),
                                br_lon: Number(data.br_lon),
                                br_lat: Number(data.br_lat)
                            }

                            let printOptions: PrintOptions = {
                                color_a: data.color_a,
                                color_b: data.color_b,
                                secondary: data.secondary,
                                gradient: data.gradient,
                                text: data.text,
                                coordinates: data.coordinates,
                                center: getCenter(coordsBounds)
                            }

                            let printGenerator = new PrintGenerator(svg);
                            printGenerator.generatePrint(printOptions, true).then(print => {
                                if (myImg.current) {
                                    myImg.current.src = print;
                                }
                            })

                            printGenerator.generatePrint(printOptions, false).then(print => {
                                if (backImg.current) {
                                    backImg.current.src = print;
                                }
                            })

                        })
                })
                .catch(error => {
                    console.log(error);
                });
        } else {
            alert("No order ID entered.")
        }
    }

    return (
        <div>
            <h1>Internal Print Printer</h1>
            <label className={''}>Print ID</label>
            <input className='border-solid border-2 border-black mx-2' type="text" ref={print_input}/>
            <button className='border-solid border-2 border-black px-2' type="submit" onClick={submitPrint}>Submit
            </button>
            <img ref={myImg} className={"cursor-pointer"}/>
            <img ref={backImg} className={"cursor-pointer"}/>
        </div>
    );
}