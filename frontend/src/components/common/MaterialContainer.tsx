import React from 'react';

interface MaterialContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function MaterialContainer(props: MaterialContainerProps) {
  return (
      <div className={`bg-gray-700 rounded-2xl shadow-lg p-6 m-4 w-11/12 md:mx-auto md:w-3/4 lg:w-2/3 xl:w-1/2 ${props.className}`}>
          {props.children}
      </div>
  );
};
