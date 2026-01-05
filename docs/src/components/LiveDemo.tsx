import React from 'react';
import { ReqoreLayoutContent, ReqoreUIProvider } from '../../../src';

// Strip Markdown's auto-generated <p> wrappers from MDX children so button labels stay text-only.
// In MDX v2, paragraphs come through as elements whose type has mdxType === 'p'.
const unwrapParagraphs = (node: React.ReactNode): React.ReactNode => {
  if (!node) return node;

  if (Array.isArray(node)) {
    return node.map(unwrapParagraphs);
  }

  if (React.isValidElement(node)) {
    const isParagraph = node.type === 'p' || node.props?.mdxType === 'p';

    if (isParagraph) {
      return unwrapParagraphs(node.props.children);
    }

    return React.cloneElement(node, node.props, unwrapParagraphs(node.props.children));
  }

  return node;
};

interface LiveDemoProps {
  children?: React.ReactNode;
  vertical?: boolean;
}

export default function LiveDemo({ children, vertical }: LiveDemoProps) {
  return (
    <ReqoreUIProvider options={{ animations: { buttons: false } }}>
      <ReqoreLayoutContent
        style={{ padding: 10, display: 'flex', flexDirection: vertical ? 'column' : 'row' }}
      >
        {unwrapParagraphs(children)}
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );
}
