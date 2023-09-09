import React from 'react';

interface SelectorButtonProps {
  handler: () => void;
  children: string;
  className?: string;
}

export function SelectorButton(props: SelectorButtonProps) {
  return (
      <button
          onClick={props.handler}
          className={`border-2 border-pink-600 rounded-lg px-3 py-2 text-pink-400 cursor-pointer hover:bg-pink-600 hover:text-pink-200 ${props.className}`}>
        {props.children}
      </button>
  );
}