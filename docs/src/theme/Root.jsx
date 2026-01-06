import OriginalRoot from '@theme-original/Root';
import React from 'react';

export default function Root(props) {
  React.useEffect(() => {
    // Create portal element for Reqore modals and popovers
    if (!document.getElementById('reqore-portal')) {
      const portal = document.createElement('div');
      portal.id = 'reqore-portal';
      document.body.appendChild(portal);
    }
  }, []);

  return <OriginalRoot {...props} />;
}
