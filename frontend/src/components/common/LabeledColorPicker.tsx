import {Color, ColorChangeHandler} from "react-color";
import {CustomColorPicker} from "./CustomColorPicker";

interface LabeledColorPickerProps {
    label: string;
    color: Color;
    colors: string[];
    onChangeComplete: ColorChangeHandler;
    className?: string;
}

export const LabeledColorPicker = (props: LabeledColorPickerProps) => {
    return (
        <div className={`flex flex-row space-x-2 justify-center items-center ${props.className}`}>
            <CustomColorPicker color={props.color}
                               colors={props.colors}
                               onChangeComplete={props.onChangeComplete}/>
            <p className="text-white">{props.label}</p>
        </div>
    )
}