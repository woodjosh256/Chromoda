import React, {ChangeEvent, Dispatch, SetStateAction, useEffect, useState} from 'react';
import {BagDisplay} from "./BagDisplay";
import {ColorResult} from 'react-color';
import {MaterialContainer} from "../common/MaterialContainer";
import {SelectorButton} from "../common/SelectorButton";
import {LabeledColorPicker} from "../common/LabeledColorPicker";
import {InnerContainer} from "../common/InnerContainer";
import {ColorSelection} from "./ColorSection";
import {PrintGenerator, PrintOptions} from "../../utils/PrintGenerator";
import {LocationPicker} from "./LocationPicker";


interface PrintCustomizerProps {
    printGenerator: PrintGenerator;
    printOptions: PrintOptions;
    setPrintOptions: Dispatch<SetStateAction<PrintOptions |  null>>;
    exit: Dispatch<SetStateAction<boolean>>;
    className?: string;
}

export function PrintCustomizer(props: PrintCustomizerProps) {
    function done() {
        props.exit(false);
    }

    function updatePrintOptions(newOptions: Partial<PrintOptions>) {
        props.setPrintOptions(prevOptions => ( prevOptions ? { ...prevOptions, ...newOptions } : null));
    }

    function onColorAChange(color: ColorResult, event: React.ChangeEvent<HTMLInputElement>) {
        updatePrintOptions({ color_a: color.hex });
    }

    function onColorBChange(color: ColorResult, event: React.ChangeEvent<HTMLInputElement>) {
        updatePrintOptions({ color_b: color.hex });
    }

    function onSecondaryToggle(event: React.ChangeEvent<HTMLInputElement>) {
        updatePrintOptions({ secondary: event.target.checked });
    }

    function onGradientToggle(event: React.ChangeEvent<HTMLInputElement>) {
        updatePrintOptions({ gradient: event.target.checked });
    }

    const colors = ['#FFFFFF', '#A0A0A0', '#FF6900', '#FCB900', '#7BDCB5', '#00D084',
        '#8ED1FC', '#0693E3', '#EB144C', '#F78DA7', '#9900EF', '#FF0000', '#00FF00', '#0000FF',
        '#FF00FF', '#FFFF00', '#00FFFF', '#FF4500']

    return (
        <div className={`w-full h-full flex flex-col ${props.className}`}>
            <div className="flex-grow flex justify-center items-center">
                <BagDisplay printGenerator={props.printGenerator} printOptions={props.printOptions} className="max-h-96 max-w-96"/>
            </div>
            <MaterialContainer className="flex flex-col space-y-6 max-h-[65%]">

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
                    <LocationPicker className={"flex-grow"}/>

                </div>
                <div className="flex flex-row space-x-6 justify-between">
                    <SelectorButton className="flex-grow" handler={done}>BACK</SelectorButton>
                    <SelectorButton className="flex-grow" disabled={true} handler={() => {}}>Confirm</SelectorButton>
                </div>
            </MaterialContainer>
        </div>
    );
}