import React from 'react';

interface InnerContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function InnerContainer(props: InnerContainerProps) {
  return (
      <div className={`bg-gray-800 rounded-2xl p-2 m-4 ${props.className}`}>
          {props.children}
      </div>
  );
};
