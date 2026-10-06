import { useLayoutEffect, useRef, useState } from 'react';
import { ReqoreMessage, ReqoreVerticalSpacer } from '../../index';

/**
 * A plain HTML `<form>` for the form-control stories, with what it would post written under it:
 * "Posts" is the form's data right now, "Submitted" what the last submit sent (including the
 * name and value of the submit button that was pressed). Nothing leaves the page.
 */

type TEntries = [string, string][];

const readEntries = (form: HTMLFormElement, submitter?: HTMLElement): TEntries =>
  Array.from(new FormData(form, submitter).entries()).map(([key, value]) => [key, String(value)]);

const formatEntries = (entries: TEntries) =>
  entries.length ? entries.map(([key, value]) => `${key}=${value}`).join(' · ') : 'nothing';

export const StoryForm = ({
  children,
  id,
}: {
  children: React.ReactNode;
  id?: string;
}) => {
  const formRef = useRef<HTMLFormElement>(null);
  const [current, setCurrent] = useState<string>('');
  const [submitted, setSubmitted] = useState<string>();

  // Controlled children change without the form hearing it, so read it after every render.
  useLayoutEffect(() => {
    if (!formRef.current) {
      return;
    }

    const next = formatEntries(readEntries(formRef.current));

    if (next !== current) {
      setCurrent(next);
    }
  });

  return (
    <form
      id={id}
      ref={formRef}
      className='story-form'
      noValidate
      // Read once the event is over: React reports a checkbox's change during its click,
      // before a cancelled click (a read-only checkbox) has been undone.
      onChange={() =>
        setTimeout(() => formRef.current && setCurrent(formatEntries(readEntries(formRef.current))))
      }
      onSubmit={(event) => {
        event.preventDefault();
        const submitter = (event.nativeEvent as SubmitEvent).submitter ?? undefined;

        setSubmitted(formatEntries(readEntries(formRef.current, submitter)));
      }}
    >
      {children}
      <ReqoreVerticalSpacer height={15} />
      <ReqoreMessage size='small' flat className='story-form-posts' title='Posts'>
        <span className='story-form-value'>{current}</span>
      </ReqoreMessage>
      {submitted !== undefined ? (
        <>
          <ReqoreVerticalSpacer height={10} />
          <ReqoreMessage
            size='small'
            flat
            intent='success'
            className='story-form-submitted'
            title='Submitted'
          >
            <span className='story-form-value'>{submitted}</span>
          </ReqoreMessage>
        </>
      ) : null}
    </form>
  );
};

/** The text of the "Posts" or "Submitted" line of the story form. */
export const storyFormText = (which: 'posts' | 'submitted') =>
  document.querySelector(`.story-form-${which} .story-form-value`)?.textContent;
