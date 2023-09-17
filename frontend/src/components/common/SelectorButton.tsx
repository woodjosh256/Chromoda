import React from 'react';

interface SelectorButtonProps {
  handler: () => void;
  children: string;
  className?: string;
  disabled?: boolean;
}

export function SelectorButton(props: SelectorButtonProps) {
  return (
      <button
          disabled={props.disabled}
          onClick={props.handler}
          className={`border-2 border-pink-600 rounded-lg px-3 py-2 text-pink-400 cursor-pointer
          enabled:hover:bg-pink-600 enabled:hover:text-pink-200 disabled:opacity-30 disabled:cursor-default  ${props.className}`}>
        {props.children}
      </button>
  );
}