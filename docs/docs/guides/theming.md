---
sidebar_position: 2
---

# Theming

Reqore components can be themed via the UI provider. You can start from the default theme and override specific values.

```tsx
import React from 'react';
import { ReqoreUIProvider, ReqoreButton } from '@qoretechnologies/reqore';

const theme = {
  main: '#2f80ed',
  intent: {
    success: '#27ae60',
  },
};

export const ThemedExample = () => (
  <ReqoreUIProvider theme={theme}>
    <ReqoreButton intent="success">Themed Button</ReqoreButton>
  </ReqoreUIProvider>
);
```

For deeper customization, check the API reference for `IReqoreTheme`.
