import { ReactNode } from 'react';

export const Summary = ({ children }: { children: ReactNode }) => {
  return (
    <div className="my-phi-xl mb-phi-2xl text-base text-justify text-body cursor-default summary-text">
      {children}
    </div>
  );
};
