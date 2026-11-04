// Copyright 2026 Qore Technologies, s.r.o.

export interface IStoryClipboard {
  /**
   * The Clipboard API: `refuses` (no permission, the page not focused) or `absent` (a page served
   * over plain http, not a secure context).
   */
  api: 'refuses' | 'absent';
  /** Whether the document's copy command copies. */
  copyCommand: boolean;
}

/**
 * Stand in for a browser whose clipboard is not the one a secure context offers, for a story's
 * `beforeEach`. Returns the cleanup that puts the real Clipboard API and copy command back, so
 * later stories copy as the browser does.
 *
 * Stories run on localhost, a secure context, so the browser running them always offers the
 * Clipboard API; this is how a story shows what reqore does where it does not, or where nothing
 * can copy at all.
 */
export const withStoryClipboard = ({ api, copyCommand }: IStoryClipboard) => {
  Object.defineProperty(navigator, 'clipboard', {
    value:
      api === 'refuses'
        ? { writeText: () => Promise.reject(new DOMException('Not allowed', 'NotAllowedError')) }
        : undefined,
    configurable: true,
  });
  Object.defineProperty(document, 'execCommand', {
    value: (command: string) => copyCommand && command === 'copy',
    configurable: true,
  });
  return () => {
    // own properties over the prototypes' getters: deleting them uncovers the real ones
    Reflect.deleteProperty(navigator, 'clipboard');
    Reflect.deleteProperty(document, 'execCommand');
  };
};

/** A browser that allows no copy: the Clipboard API refuses and the copy command copies nothing. */
export const withBrowserThatCannotCopy = () =>
  withStoryClipboard({ api: 'refuses', copyCommand: false });
