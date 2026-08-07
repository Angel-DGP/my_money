import React, { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';

/**
 * PageContainerFooterPortalContext
 *
 * Provides a stable DOM node where PageContainerFooter can render itself
 * via a React portal. This decouples the footer from any scroll container
 * it might be nested inside (e.g. FormLayout > PageContainer.Body).
 *
 * Usage:
 *   - PageContainer sets the portal target via PageContainerFooterPortal.Slot
 *   - PageContainerFooter renders itself into that slot automatically
 */

interface FooterPortalContextValue {
  portalNode: HTMLDivElement | null;
  setPortalNode: (node: HTMLDivElement | null) => void;
}

const FooterPortalContext = createContext<FooterPortalContextValue>({
  portalNode: null,
  setPortalNode: () => undefined,
});

export function FooterPortalProvider({ children }: { children: React.ReactNode }) {
  const [portalNode, setPortalNode] = useState<HTMLDivElement | null>(null);

  const handleRef = useCallback((node: HTMLDivElement | null) => {
    setPortalNode(node);
  }, []);

  return (
    <FooterPortalContext.Provider value={{ portalNode, setPortalNode: handleRef }}>
      {children}
    </FooterPortalContext.Provider>
  );
}

/** Place this component where you want the footer to appear (end of PageContainer) */
export function FooterPortalSlot() {
  const { setPortalNode } = useContext(FooterPortalContext);
  return <div ref={setPortalNode} />;
}

/** Use this hook inside PageContainerFooter to get the portal target */
export function useFooterPortal() {
  return useContext(FooterPortalContext).portalNode;
}

/** Portal wrapper: renders children into the FooterPortalSlot if available */
export function FooterPortal({ children }: { children: React.ReactNode }) {
  const portalNode = useFooterPortal();
  if (!portalNode) return <>{children}</>;
  return createPortal(children, portalNode);
}
