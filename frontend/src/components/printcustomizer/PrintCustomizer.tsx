import React, {useEffect, useState} from 'react';
import {BagDisplay} from "./BagDisplay";
import {BAG_HEIGHT, BAG_WIDTH} from "../../constants";
import { TwitterPicker } from 'react-color';

interface PrintCustomizerProps {
    svg: string;
}

interface PrintOptions {
    color_a: string;
    color_b: string;
}

export function PrintCustomizer(props: PrintCustomizerProps) {

    const [printOptions, setPrintOptions] = useState<PrintOptions>({
        color_a: "#ffffff",
        color_b: "#0000ff"
    });

    return (
        <div className="relative h-screen w-screen ">
            <h1>Print Customizer</h1>
            {/*<YourComponent svg={props.svg} />*/}
            <BagDisplay svg={props.svg} printOptions={printOptions} className="flex-grow"/>
            <TwitterPicker color={printOptions.color_a} onChangeComplete={(color) =>
                setPrintOptions({
                    color_a: color.hex,
                    color_b: printOptions.color_b
                })}></TwitterPicker>
            <TwitterPicker color={printOptions.color_b} onChangeComplete={(color) => {
                setPrintOptions({
                    color_a: printOptions.color_a,
                    color_b: color.hex
                })
            }}></TwitterPicker>
        </div>
    );
}