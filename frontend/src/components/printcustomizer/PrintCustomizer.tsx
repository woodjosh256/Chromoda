import React, {ChangeEvent, Dispatch, SetStateAction, useEffect, useState} from 'react';
import {BagDisplay} from "./BagDisplay";
import {Color, ColorResult} from 'react-color';
import {MaterialContainer} from "../common/MaterialContainer";
import {SelectorButton} from "../common/SelectorButton";
import {LabeledColorPicker} from "../common/LabeledColorPicker";
import {InnerContainer} from "../common/InnerContainer";
import {ColorSelection} from "./ColorSection";
import {PrintGenerator, PrintOptions} from "../../utils/PrintGenerator";
import {IconTypes, LocationPicker} from "./LocationPicker";
import {Modal} from "../common/Modal";
import {ConfirmLocation} from "./ConfirmLocation";
import {getPrintId} from "../ordermanagment/OrderDisplay";
import {Toggle} from "../common/Toggle";

export interface CoordsBounds {
    tl_lat: number;
    tl_lon: number;
    tr_lat: number;
    tr_lon: number;
    bl_lat: number;
    bl_lon: number;
    br_lat: number;
    br_lon: number;
}

interface PrintCustomizerProps {
    printGenerator: PrintGenerator;
    printOptions: PrintOptions;
    setPrintOptions: Dispatch<SetStateAction<PrintOptions | null>>;
    exit: Dispatch<SetStateAction<boolean>>;
    coordsbounds: CoordsBounds;
    className?: string;
}

async function confirmLocation(props: PrintCustomizerProps): Promise<boolean> {
    let orderID = getPrintId();
    if (orderID === "") {
        return false;
    }

    let params = {
        "print_id": orderID,
        "order_id": "n/a",
        "tl_lon": props.coordsbounds.tl_lon,
        "tl_lat": props.coordsbounds.tl_lat,
        "tr_lon": props.coordsbounds.tr_lon,
        "tr_lat": props.coordsbounds.tr_lat,
        "bl_lon": props.coordsbounds.bl_lon,
        "bl_lat": props.coordsbounds.bl_lat,
        "br_lon": props.coordsbounds.br_lon,
        "br_lat": props.coordsbounds.br_lat,
        "color_a": props.printOptions.color_a,
        "color_b": props.printOptions.color_b,
        "gradient": props.printOptions.gradient,
        "secondary": props.printOptions.secondary,
        "text": props.printOptions.text,
        "coordinates": props.printOptions.coordinates
    }

    let query: string = Object.keys(params).map((key) => {
        return encodeURIComponent(key) + '=' + encodeURIComponent(String((params as any)[key]))
    }).join('&');

    let url = "https://8sbys0hxkb.execute-api.us-east-1.amazonaws.com/dev/saveOrder" + "?" + query;

    let response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })

    if (response.status === 200) {
        return true;
    }

    return false;
}

export function PrintCustomizer(props: PrintCustomizerProps) {
    const [locationPickerMode, setLocationPickerMode] = useState<boolean>(false);
    const [donePickingLocation, setDonePickingLocation] = useState<boolean>(false);
    let firstClick = false;

    function done() {
        props.exit(false);
    }

    function updateCenter() {
        const center: [number, number] = [(props.coordsbounds.tl_lon + props.coordsbounds.tr_lon + props.coordsbounds.bl_lon + props.coordsbounds.br_lon) / 4,
            (props.coordsbounds.tl_lat + props.coordsbounds.tr_lat + props.coordsbounds.bl_lat + props.coordsbounds.br_lat) / 4]
        updatePrintOptions({center: center})
    }

    function updatePrintOptions(newOptions: Partial<PrintOptions>) {
        props.setPrintOptions(prevOptions => (prevOptions ? {...prevOptions, ...newOptions} : null));
    }

    function onColorAChange(color: ColorResult, event: React.ChangeEvent<HTMLInputElement>) {
        updatePrintOptions({color_a: color.hex});
    }

    function onColorBChange(color: ColorResult, event: React.ChangeEvent<HTMLInputElement>) {
        updatePrintOptions({color_b: color.hex});
    }

    function onSecondaryToggle(event: React.ChangeEvent<HTMLInputElement>) {
        updatePrintOptions({secondary: event.target.checked});
    }

    function onGradientToggle(event: React.ChangeEvent<HTMLInputElement>) {
        updatePrintOptions({gradient: event.target.checked});
    }


    const colors = ['#FFFFFF', '#A0A0A0', '#FF6900', '#FCB900', '#7BDCB5', '#00D084',
        '#8ED1FC', '#0693E3', '#EB144C', '#F78DA7', '#9900EF', '#FF0000', '#00FF00', '#0000FF',
        '#FF00FF', '#FFFF00', '#00FFFF', '#FF4500']

    let printId = getPrintId();

    useEffect(() => {
        updateCenter();
    }, [props.coordsbounds]);

    return (
        <div className={`w-full h-full flex flex-col ${props.className}`}>
            {donePickingLocation ?
                <ConfirmLocation locationConfirmed={() => {
                    return confirmLocation(props)
                }} cancel={() => {
                    setDonePickingLocation(false)
                }}/>
                : null}
            <div className="flex-grow flex justify-center items-center">
                <BagDisplay
                    printGenerator={props.printGenerator}
                    printOptions={props.printOptions}
                    className="max-h-96 max-w-96"/>
            </div>
            <MaterialContainer className={`max-h-[65%] relative`}>
                <div className={`flex flex-col space-y-6 justify-around`}>
                    <div className={'flex flex-col bg-gray-800 rounded-2xl space-y-6 p-6'}>
                        <div className="flex flex-row w-full justify-around items-center flex-wrap">
                            {/*<ColorSelection*/}
                            {/*    className={`flex-grow`}*/}
                            {/*    colorA={props.printOptions.color_a}*/}
                            {/*    colorB={props.printOptions.color_b}*/}
                            {/*    secondary={props.printOptions.secondary}*/}
                            {/*    gradient={props.printOptions.gradient}*/}
                            {/*    colors={colors}*/}
                            {/*    onColorAChange={onColorAChange}*/}
                            {/*    onColorBChange={onColorBChange}*/}
                            {/*    onSecondaryToggle={onSecondaryToggle}*/}
                            {/*    onGradientToggle={onGradientToggle}*/}
                            {/*/>*/}
                            <LabeledColorPicker label={"Primary"} color={props.printOptions.color_a} colors={colors}
                                                onChangeComplete={onColorAChange}/>
                            <LabeledColorPicker label={"Secondary"} color={props.printOptions.color_b} colors={colors}
                                                onChangeComplete={onColorBChange}/>
                            <Toggle label={"Gradient"} checked={props.printOptions.gradient}
                                    onChange={onGradientToggle}/>
                        </div>

                        <div className={'flex flex-row w-full justify-around items-center'}>
                            <p className={'text-white mr-2'}>Label (optional):</p>
                            <input type={"text"}
                                   value={props.printOptions.text ? props.printOptions.text : ""}
                                   placeholder={"Mount Washington"}
                                   onChange={(event: ChangeEvent<HTMLInputElement>) => updatePrintOptions({text: event.target.value})}
                                   maxLength={18}
                                   className={"bg-gray-700 rounded-md p-2 text-white flex-grow focus:outline-none focus:border-pink-600 focus:ring-1 focus:ring-pink-600"}
                            />
                        </div>
                        <div className={'flex flex-row w-full justify-around items-center'}>
                            <Toggle label={"Show Coordinates"}
                                    checked={props.printOptions.coordinates}
                                    onChange={(event: ChangeEvent<HTMLInputElement>) => {
                                        updatePrintOptions({coordinates: event.target.checked})
                                        updateCenter();
                                    }}
                            />
                        </div>


                    </div>

                    <div className="flex flex-row space-x-6 justify-between">
                        <SelectorButton className="flex-grow" handler={done}>BACK</SelectorButton>
                        <SelectorButton className="flex-grow" disabled={printId === ""} handler={() => {
                            setDonePickingLocation(true);
                        }}>Confirm</SelectorButton>
                    </div>
                </div>
            </MaterialContainer>
        </div>
    );
}