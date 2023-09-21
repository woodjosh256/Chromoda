import React from 'react';
import {LabeledColorPicker} from "../common/LabeledColorPicker";
import {InnerContainer} from "../common/InnerContainer";
import {Color, ColorChangeHandler} from "react-color";
import {Toggle} from "../common/Toggle";

interface ColorSelectionProps {
    colorA: Color;
    colorB: Color;
    secondary: boolean;
    colors: string[];
    onColorAChange: ColorChangeHandler;
    onColorBChange: ColorChangeHandler;
    onSecondaryToggle: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onGradientToggle: (event: React.ChangeEvent<HTMLInputElement>) => void;
    className?: string;
    gradient: boolean;
}

export function ColorSelection(props: ColorSelectionProps) {

    return (
        <InnerContainer className={`flex flex-col space-y-2 items-center ${props.className}`}>
            <h3 className="text-white text-lg font-bold">Colors</h3>

            <div className="flex flex-col space-y-2 items-center">
                <div className="flex flex-row flex-wrap space-x-6 justify-between items-center">
                    <LabeledColorPicker
                        color={props.colorA}
                        colors={props.colors}
                        onChangeComplete={props.onColorAChange}
                        label="Primary"
                        className="mx-6 my-2"
                    />
                    {props.secondary ?
                        <LabeledColorPicker
                            color={props.colorB}
                            colors={props.colors}
                            onChangeComplete={props.onColorBChange}
                            label="Secondary"
                            className="mx-6 my-2"/>
                        : null
                    }
                </div>
                <div className="flex flex-row flex-wrap space-x-6 justify-between items-center">
                    <Toggle label="Secondary"
                            checked={props.secondary}
                            onChange={props.onSecondaryToggle}
                            className="mx-6 my-2"
                    />
                    {props.secondary ?
                        <Toggle label="Gradient"
                            checked={props.gradient && props.secondary}
                            disabled={!props.secondary}
                            onChange={props.onGradientToggle}
                            className="mx-6 my-2"
                    /> : null}


                </div>
            </div>


        </InnerContainer>
    );
};
