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
        "locationIcon": props.printOptions.locationIcon,
        "locationColor": props.printOptions.locationColor,
        "location_x": props.printOptions.location ? props.printOptions.location[0] : null,
        "location_y": props.printOptions.location ? props.printOptions.location[1] : null,
    }

    let query: string = Object.keys(params).map((key) => {
        return encodeURIComponent(key) + '=' + encodeURIComponent(String((params as any)[key]))
    }).join('&');

    let url = "https://vj00e2kyw2.execute-api.us-east-1.amazonaws.com/dev/saveOrder" + "?" + query;

    let response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })

    if (response.status === 200) {
        return true;
    }
    console.log(response);
    return false;
}

export function PrintCustomizer(props: PrintCustomizerProps) {
    const [locationPickerMode, setLocationPickerMode] = useState<boolean>(false);
    const [donePickingLocation, setDonePickingLocation] = useState<boolean>(false);
    let firstClick = false;

    function done() {
        props.exit(false);
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

    function onLocationColorChange(color: ColorResult, event: React.ChangeEvent<HTMLInputElement>) {
        updatePrintOptions({locationColor: color.hex});
    }

    function enterLocationPickerMode(icon: IconTypes) {
        setLocationPickerMode(true);
        updatePrintOptions({location: undefined})
        updatePrintOptions({locationIcon: icon})
        firstClick = true;
    }

    function imageClicked(x: number, y: number) {
        if (locationPickerMode) {
            updatePrintOptions({location: [x, y]});
            setLocationPickerMode(false);
        }
    }


    const colors = ['#FFFFFF', '#A0A0A0', '#FF6900', '#FCB900', '#7BDCB5', '#00D084',
        '#8ED1FC', '#0693E3', '#EB144C', '#F78DA7', '#9900EF', '#FF0000', '#00FF00', '#0000FF',
        '#FF00FF', '#FFFF00', '#00FFFF', '#FF4500']

    let disabledClassName = locationPickerMode ? "opacity-10 pointer-events auto [&>*]:pointer-events-none" : "";

    let orderId = getPrintId();

    return (
        <div className={`w-full h-full flex flex-col ${props.className}`}>
            {donePickingLocation ?
                <ConfirmLocation locationConfirmed={() => {return confirmLocation(props)}} cancel={() => {
                    setDonePickingLocation(false)
                }}/>
                : null}
            <div className="flex-grow flex justify-center items-center">
                <BagDisplay
                    onClick={imageClicked}
                    printGenerator={props.printGenerator}
                    printOptions={props.printOptions}
                    className="max-h-96 max-w-96"/>
            </div>
            <MaterialContainer
                className={`max-h-[65%] relative`}
                onClick={() => {
                    firstClick ? firstClick = false : setLocationPickerMode(false)
                }}>
                {locationPickerMode ? <div
                    className="absolute inset-0 flex items-center justify-center text-white text-lg font-bold z-20">Click
                    anywhere on map to mark location</div> : null}
                <div className={`flex flex-col space-y-6  ${disabledClassName}`}>
                    <div className="flex flex-row overflow-scroll w-full">
                        <ColorSelection
                            className={`flex-grow`}
                            colorA={props.printOptions.color_a}
                            colorB={props.printOptions.color_b}
                            secondary={props.printOptions.secondary}
                            gradient={props.printOptions.gradient}
                            colors={colors}
                            onColorAChange={onColorAChange}
                            onColorBChange={onColorBChange}
                            onSecondaryToggle={onSecondaryToggle}
                            onGradientToggle={onGradientToggle}
                        />
                        <LocationPicker
                            className={"flex-grow"}
                            setLocation={enterLocationPickerMode}
                            setColor={onLocationColorChange}
                            locationColor={props.printOptions.locationColor}
                            clearLocation={() => {
                                updatePrintOptions({location: undefined})
                            }}
                        />

                    </div>
                    <div className="flex flex-row space-x-6 justify-between">
                        <SelectorButton className="flex-grow" handler={done}>BACK</SelectorButton>
                        <SelectorButton className="flex-grow" disabled={orderId === ""} handler={() => {
                            setDonePickingLocation(true);
                        }}>Confirm</SelectorButton>
                    </div>
                </div>
            </MaterialContainer>
        </div>
    );
}