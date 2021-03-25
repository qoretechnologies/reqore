import { render } from '@testing-library/react';
import React from 'react';
import {
  ReqoreContent,
  ReqoreLayoutContent,
  ReqoreModal,
  ReqoreModalContent,
  ReqoreUIProvider,
} from '../src';

test('Renders basic <Modal /> properly', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreModal isOpen>
            <ReqoreModalContent>Basic modal</ReqoreModalContent>
          </ReqoreModal>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-modal').length).toBe(1);
  expect(document.querySelectorAll('.reqore-modal-content').length).toBe(1);
});

test('Does not renders <Modal /> if its not open', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreModal>
            <ReqoreModalContent>Basic modal</ReqoreModalContent>
          </ReqoreModal>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-modal').length).toBe(0);
  expect(document.querySelectorAll('.reqore-modal-content').length).toBe(0);
});

test('Renders <Modal /> with custom dimensions', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreModal width='700px' height='700px'>
            <ReqoreModalContent>Resized modal</ReqoreModalContent>
          </ReqoreModal>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-modal').length).toBe(0);
  expect(document.querySelectorAll('.reqore-modal-content').length).toBe(0);
});
