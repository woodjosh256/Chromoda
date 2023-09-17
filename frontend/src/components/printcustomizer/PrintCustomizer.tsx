import React, {ChangeEvent, Dispatch, SetStateAction, useEffect, useState} from 'react';
import {BagDisplay, PrintOptions} from "./BagDisplay";
import {ColorResult} from 'react-color';
import {MaterialContainer} from "../common/MaterialContainer";
import {SelectorButton} from "../common/SelectorButton";
import {LabeledColorPicker} from "../common/LabeledColorPicker";
import {InnerContainer} from "../common/InnerContainer";
import {ColorSelection} from "./ColorSection";


interface PrintCustomizerProps {
    svg: string | null;
    exit: Dispatch<SetStateAction<boolean>>;
    className?: string;
}

export function PrintCustomizer(props: PrintCustomizerProps) {

    const [printOptions, setPrintOptions] = useState<PrintOptions | null>(null);

    useEffect(() => {
        setPrintOptions({
            color_a: "#FFFFFF",
            color_b: "#0000FF",
            gradient: false,
            secondary: true
        })
    }, []);

    if (!printOptions?.color_a && !printOptions) return (<div></div>)

    function done() {
        props.exit(false);
    }

    function onColorAChange(color: ColorResult, event: ChangeEvent<HTMLInputElement>) {
        setPrintOptions({
            color_a: color.hex,
            color_b: printOptions ? printOptions.color_b : "#000000", // should never be null,
            gradient: printOptions ? printOptions.gradient : false,
            secondary: printOptions ? printOptions.secondary : false
        })
    }

    function onSecondaryToggle(event: React.ChangeEvent<HTMLInputElement>) {
        setPrintOptions({
            color_a: printOptions ? printOptions.color_a : "#000000",
            color_b: printOptions ? printOptions.color_b : "#000000",
            gradient: printOptions ? printOptions.gradient : false,
            secondary: event.target.checked
        })
    }

    function onGradientToggle(event: React.ChangeEvent<HTMLInputElement>) {
        setPrintOptions({
            color_a: printOptions ? printOptions.color_a : "#000000",
            color_b: printOptions ? printOptions.color_b : "#000000",
            gradient: event.target.checked,
            secondary: printOptions ? printOptions.secondary : false
        })
    }

    const colors = ['#FFFFFF', '#A0A0A0', '#FF6900', '#FCB900', '#7BDCB5', '#00D084',
        '#8ED1FC', '#0693E3', '#EB144C', '#F78DA7', '#9900EF', '#FF0000', '#00FF00', '#0000FF',
        '#FF00FF', '#FFFF00', '#00FFFF', '#FF4500']

    function onColorBChange(color: ColorResult, event: ChangeEvent<HTMLInputElement>) {
        setPrintOptions({
            color_a: printOptions ? printOptions.color_a : "#000000", // should never be null
            color_b: color.hex,
            gradient: printOptions ? printOptions.gradient : false,
            secondary: printOptions ? printOptions.secondary : false
        })
    }

    return (
        <div className={`w-full h-full flex flex-col ${props.className}`}>
            <div className="flex-grow flex justify-center items-center">
                <BagDisplay svg={props.svg} printOptions={printOptions} className="max-h-96 max-w-96"/>
            </div>
            <MaterialContainer className="flex flex-col space-y-6 max-h-[65%]">


                <ColorSelection
                    colorA={printOptions.color_a}
                    colorB={printOptions.color_b}
                    secondary={printOptions.secondary}
                    gradient={printOptions.gradient}
                    colors={colors}
                    onColorAChange={onColorAChange}
                    onColorBChange={onColorBChange}
                    onSecondaryToggle={onSecondaryToggle}
                    onGradientToggle={onGradientToggle}
                />
                <div className="flex flex-row space-x-6 justify-between">
                    <SelectorButton className="flex-grow" handler={done}>BACK</SelectorButton>
                    <SelectorButton className="flex-grow" disabled={true} handler={() => {}}>Confirm</SelectorButton>
                </div>
            </MaterialContainer>
        </div>
    );
}