---
sidebar_position: 1
---

# Getting started

Install the package and wrap your app with the provider.

```bash
npm install @qoretechnologies/reqore
# or
yarn add @qoretechnologies/reqore
```

```tsx
import React from 'react';
import { ReqoreUIProvider, ReqoreButton } from '@qoretechnologies/reqore';

export const App = () => (
  <ReqoreUIProvider>
    <ReqoreButton intent="success">Hello Reqore</ReqoreButton>
  </ReqoreUIProvider>
);
```

Next, visit the [API reference](/api) for the full exported surface.
