import { useEffect } from 'react';
import DemoBar from './DemoBar';
import DemoDisclaimer from './DemoDisclaimer';
import { Toaster } from './toast';

// Wraps every demo route: scoped theme, the Concept Demo bar, the disclaimer footer and toasts.
export default function DemoShell({ theme, projectRef, name, title, onReset, children }) {
  useEffect(() => {
    document.title = `${title ?? name} | Concept demo by Dhruv Kaith`;
  }, [title, name]);

  return (
    <div className={`surface-root t-${theme} flex flex-col`}>
      <DemoBar projectRef={projectRef} />
      <div className="flex-1">{children}</div>
      <DemoDisclaimer name={name} onReset={onReset} />
      <Toaster />
    </div>
  );
}
