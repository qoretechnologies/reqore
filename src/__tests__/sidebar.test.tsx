import { render } from '@testing-library/react';
import React from 'react';
import QorusSidebar from '../components/Sidebar';
import { qorusSidebarItems } from '../mock/menu';

test('Renders sidebar', () => {
  render(<QorusSidebar items={qorusSidebarItems} path='/' />);

  expect(document.querySelectorAll('.sidebarItem')).toHaveLength(7);
  expect(document.querySelectorAll('.sidebarSection').length).toBe(2);
});
