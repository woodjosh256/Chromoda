import * as React from 'react';

import {InnerContainer} from "../common/InnerContainer";
import {Cancel, Heart, Home, IconoirProvider, Pin, PinAlt, Star} from "iconoir-react";

interface LocationPickerProps {
    className?: string;
}

export function LocationPicker(props: LocationPickerProps) {


    return (
        <IconoirProvider
            iconProps={{
                color: 'black',
                width: '36',
                height: '36'
            }}
        >
            <InnerContainer className={`flex flex-col space-y-2 items-center ${props.className}`}>
                <h3 className="text-white text-lg font-bold">Your Place</h3>

                <div className="flex flex-row flex-wrap space-x-6 justify-between items-center">
                    <div className="inline-flex rounded-md shadow-sm">
                        <button type="button"
                                className="py-3 px-4 inline-flex justify-center items-center gap-2 -ml-px first:rounded-l-lg first:ml-0 last:rounded-r-lg border font-medium bg-white text-gray-700 align-middle hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all text-sm dark:bg-gray-800 dark:hover:bg-slate-800 dark:border-gray-700 dark:text-gray-400">
                            <Cancel color={"gray"}/>
                        </button>
                        <button type="button"
                                className="py-3 px-4 inline-flex justify-center items-center gap-2 -ml-px first:rounded-l-lg first:ml-0 last:rounded-r-lg border font-medium bg-white text-gray-700 align-middle hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all text-sm dark:bg-gray-800 dark:hover:bg-slate-800 dark:border-gray-700 dark:text-gray-400">
                            <Heart/>
                        </button>
                        <button type="button"
                                className="py-3 px-4 inline-flex justify-center items-center gap-2 -ml-px first:rounded-l-lg first:ml-0 last:rounded-r-lg border font-medium bg-white text-gray-700 align-middle hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all text-sm dark:bg-gray-800 dark:hover:bg-slate-800 dark:border-gray-700 dark:text-gray-400">
                            <Home/>
                        </button>
                        <button type="button"
                                className="py-3 px-4 inline-flex justify-center items-center gap-2 -ml-px first:rounded-l-lg first:ml-0 last:rounded-r-lg border font-medium bg-white text-gray-700 align-middle hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all text-sm dark:bg-gray-800 dark:hover:bg-slate-800 dark:border-gray-700 dark:text-gray-400">
                            <PinAlt/>
                        </button>
                        <button type="button"
                                className="py-3 px-4 inline-flex justify-center items-center gap-2 -ml-px first:rounded-l-lg first:ml-0 last:rounded-r-lg border font-medium bg-white text-gray-700 align-middle hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all text-sm dark:bg-gray-800 dark:hover:bg-slate-800 dark:border-gray-700 dark:text-gray-400">
                            <Star/>
                        </button>
                    </div>
                </div>
            </InnerContainer>
        </IconoirProvider>
    );
}