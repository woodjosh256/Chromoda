import React, {ChangeEvent, useState} from 'react';
import {Color, ColorChangeHandler, ColorResult, GithubPicker, RGBColor, SketchPicker, TwitterPicker} from 'react-color';

interface CustomColorPickerProps {
    color: Color;
    onChangeComplete: ColorChangeHandler;
    colors: string[];
}

export const CustomColorPicker = (props: CustomColorPickerProps) => {
  const [displayColorPicker, setDisplayColorPicker] = useState(false);
  const [color, setColor] = useState<Color>(props.color);

  const handleClick = () => {
    setDisplayColorPicker(!displayColorPicker);
  };

  const handleClose = () => {
    setDisplayColorPicker(false);
  };

  const onChangeComplete = (color: ColorResult, event: ChangeEvent<HTMLInputElement>) => {
    setColor(color.hex);
    props.onChangeComplete(color, event);
  }

  return (
    <div>
      <div className="p-1 bg-gray-400 rounded-full shadow cursor-pointer" onClick={handleClick}>
        <div className="w-8 h-8 rounded-full"
          style={{
            background: `${color}`,
          }}
        />
      </div>
      {displayColorPicker ? (
        <div className="absolute z-10">
          <div className="fixed inset-0" onClick={handleClose}></div>
          <TwitterPicker color={color} colors={props.colors} onChangeComplete={onChangeComplete}  />
        </div>
      ) : null}
    </div>
  );
};