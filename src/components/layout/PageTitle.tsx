
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface PageTitleProps {
  title: string;
  subtitle?: string;
}

export const PageTitle: React.FC<PageTitleProps> = ({ title, subtitle }) => {
  const [pageTitleElement, setPageTitleElement] = useState<HTMLElement | null>(null);
  
  useEffect(() => {
    // Find the page title container
    const element = document.getElementById('page-title');
    if (!element) return;
    
    setPageTitleElement(element);
    
    // Clean up on unmount
    return () => {
      if (element && element.parentNode) {
        // Only clean up if the element still exists and has a parent
        while (element.firstChild) {
          element.removeChild(element.firstChild);
        }
      }
    };
  }, []);
  
  if (!pageTitleElement) return null;
  
  return createPortal(
    <div className="flex flex-col py-0 mb-0">
      <h1 className="text-lg font-bold tracking-tight">{title}</h1>
      {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
    </div>,
    pageTitleElement
  );
};
