import * as React from 'react';

import {InnerContainer} from "../common/InnerContainer";
import {Cancel, Heart, Home, IconoirProvider, Pin, PinAlt, Star} from "iconoir-react";
import {Color, ColorChangeHandler} from "react-color";
import {LabeledColorPicker} from "../common/LabeledColorPicker";

interface LocationPickerProps {
    setLocation: (icon: IconTypes) => void;
    setColor: ColorChangeHandler;
    locationColor: Color;
    clearLocation: () => void;
    className?: string;
}

export enum IconTypes {
    Heart,
    Home,
    Pin,
    Star
}

export function LocationPicker(props: LocationPickerProps) {

    const color_list = ['#FFFFFF', '#A0A0A0', '#FF6900', '#FCB900', '#7BDCB5', '#00D084',
    '#8ED1FC', '#0693E3', '#EB144C', '#F78DA7', '#9900EF', '#FF0000', '#00FF00', '#0000FF',
    '#FF00FF', '#FFFF00', '#00FFFF', '#FF4500']


    return (
        <IconoirProvider
            iconProps={{
                color: 'black',
                width: '24',
                height: '24'
            }}
        >
            <InnerContainer className={`flex flex-col space-y-2 items-center ${props.className}`}>
                <h3 className="text-white text-lg font-bold">Your Place</h3>
                <h4 className="text-white text-sm font-medium">(Click an icon to place it on the map.)</h4>
                <div className="flex flex-row flex-wrap space-x-6 justify-between items-center">
                    <div className="inline-flex rounded-md shadow-sm">
                        <button type="button"
                                onClick={props.clearLocation}
                                className="py-3 px-4 inline-flex justify-center items-center gap-2 -ml-px first:rounded-l-lg first:ml-0 last:rounded-r-lg border font-medium bg-white text-gray-700 align-middle hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all text-sm dark:bg-gray-800 dark:hover:bg-slate-800 dark:border-gray-700 dark:text-gray-400">
                            <Cancel color={"red"}/>
                        </button>
                        <button type="button"
                                onClick={() => props.setLocation(IconTypes.Heart)}
                                className="py-3 px-4 inline-flex justify-center items-center gap-2 -ml-px first:rounded-l-lg first:ml-0 last:rounded-r-lg border font-medium bg-white text-gray-700 align-middle hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all text-sm dark:bg-gray-800 dark:hover:bg-slate-800 dark:border-gray-700 dark:text-gray-400">
                            <Heart/>
                        </button>
                        <button type="button"
                                onClick={() => props.setLocation(IconTypes.Home)}
                                className="py-3 px-4 inline-flex justify-center items-center gap-2 -ml-px first:rounded-l-lg first:ml-0 last:rounded-r-lg border font-medium bg-white text-gray-700 align-middle hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all text-sm dark:bg-gray-800 dark:hover:bg-slate-800 dark:border-gray-700 dark:text-gray-400">
                            <Home/>
                        </button>
                        <button type="button"
                                onClick={() => props.setLocation(IconTypes.Pin)}
                                className="py-3 px-4 inline-flex justify-center items-center gap-2 -ml-px first:rounded-l-lg first:ml-0 last:rounded-r-lg border font-medium bg-white text-gray-700 align-middle hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all text-sm dark:bg-gray-800 dark:hover:bg-slate-800 dark:border-gray-700 dark:text-gray-400">
                            <PinAlt/>
                        </button>
                        <button type="button"
                                onClick={() => props.setLocation(IconTypes.Star)}
                                className="py-3 px-4 inline-flex justify-center items-center gap-2 -ml-px first:rounded-l-lg first:ml-0 last:rounded-r-lg border font-medium bg-white text-gray-700 align-middle hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all text-sm dark:bg-gray-800 dark:hover:bg-slate-800 dark:border-gray-700 dark:text-gray-400">
                            <Star/>
                        </button>
                    </div>
                </div>

                <LabeledColorPicker
                    label={"Icon Color"}
                    color={props.locationColor}
                    colors={color_list}
                    onChangeComplete={props.setColor}/>
            </InnerContainer>
        </IconoirProvider>
    );
}