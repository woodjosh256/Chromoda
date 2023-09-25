import React, {useState} from 'react';

interface ModalProps {
    className?: string;
    children?: React.ReactNode;
}

export function Modal(props: ModalProps) {
    return (
        <div className={'absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 z-40 flex justify-center items-center'}>
            <div className={`bg-white rounded-lg p-4 py-8 w-1/2 h-auto ${props.className}`}>
                {props.children}
            </div>
        </div>
    );
}