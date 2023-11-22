import React, {useEffect, useState} from 'react';
import {MapSelector} from "./components/mapping/MapSelector";
import {CoordsBounds, PrintCustomizer} from "./components/printcustomizer/PrintCustomizer";
import {BAG_WIDTH} from "./constants";
import {PrintGenerator, PrintOptions} from "./utils/PrintGenerator";
import {IconTypes} from "./components/printcustomizer/LocationPicker";
import OrderDisplay from "./components/ordermanagment/OrderDisplay";
import {InternalOrderPrinter} from "./utils/InternalOrderPrinter";

export default function App() {
    return (
        <div className="h-screen w-screen flex flex-col relative">
            <InternalOrderPrinter/>
        </div>
    );
}