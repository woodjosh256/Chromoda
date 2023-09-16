import React, {useEffect, useState} from 'react';
import {BagDisplay} from "./BagDisplay";
import {BAG_HEIGHT, BAG_WIDTH} from "../../constants";

interface PrintCustomizerProps {
    svg: string;
}

interface PrintOptions {
    color_a: string;
    color_b: string;
}

export function PrintCustomizer(props: PrintCustomizerProps) {

    let printOptions: PrintOptions = {
        color_a: "#ffffff",
        color_b: "#0000ff"
    }

    return (
        <div className="relative h-screen w-screen ">
            <h1>Print Customizer</h1>
            {/*<YourComponent svg={props.svg} />*/}
            <BagDisplay svg={props.svg} printOptions={printOptions} className="flex-grow"/>
        </div>
    );
}