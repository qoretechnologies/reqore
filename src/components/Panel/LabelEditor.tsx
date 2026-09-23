import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useUpdateEffect } from 'react-use';
import { useReqoreProperty } from '../../hooks/useReqoreContext';
import ReqoreButton from '../Button';
import ReqoreControlGroup from '../ControlGroup';
import { IReqoreHeadingProps, ReqoreHeading } from '../Header';
import ReqoreIcon, { IReqoreIconProps } from '../Icon';
import ReqoreInput, { IReqoreInputProps } from '../Input';
import { ReqoreSpan } from '../Span';

export interface IReqoreLabelEditorProps extends Omit<IReqoreHeadingProps, 'onSubmit'> {
  label: string | number;
  onSubmit?: (label: string | number) => void;
  iconProps?: IReqoreIconProps;
  inputProps?: IReqoreInputProps;
}

export const LabelEditor = memo(
  ({ label, onSubmit, inputProps, iconProps, effect, ...rest }: IReqoreLabelEditorProps) => {
    const [name, setName] = useState<string | number>(label);
    const [isEditing, setIsEditing] = useState(false);
    const isMobile = useReqoreProperty('isMobile');

    /* Leaving the editor SUBMITS — by Enter, by blur, by anything. That is the
       rule this component has always had, and cancelling is the one exception
       to it. A ref rather than state because nothing renders from it: it only
       has to survive from the moment the cancel is asked for until the effect
       below reads it, which is the same commit. */
    const submitOnExit = useRef(true);

    useEffect(() => {
      setName(label);
    }, [label]);

    useUpdateEffect(() => {
      if (!isEditing) {
        if (submitOnExit.current) {
          onSubmit?.(name);
        }

        submitOnExit.current = true;
      }
    }, [isEditing]);

    /** Put the label back as it was and leave the editor without submitting. */
    const cancel = useCallback(() => {
      submitOnExit.current = false;
      setName(label);
      setIsEditing(false);
    }, [label]);

    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key !== 'Escape') {
          return;
        }

        /* The press stops here. A panel is often inside a modal, and reqore
           closes a modal on Escape from a `keydown` listener on `document` —
           so without this, one press would both abandon the edit and shut the
           dialog around it. React binds below `document`, so stopping the
           synthetic event stops the native one before it gets there. */
        event.preventDefault();
        event.stopPropagation();
        cancel();
      },
      [cancel]
    );

    /* Cancelling by POINTER has to outrun the blur the pointer itself causes:
       pressing the button moves focus off the input, `onBlur` submits, and the
       click that would have cancelled arrives too late to matter. So the
       decision is taken on mousedown — before focus moves — and the default is
       prevented so focus never leaves at all. `onClick` still runs for the
       keyboard, where no blur happens and mousedown never fires. */
    const handleCancelMouseDown = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        cancel();
      },
      [cancel]
    );

    if (isEditing) {
      const input = (
        <ReqoreInput
          focusRules={{ type: 'auto' }}
          onClick={(e) => e.stopPropagation()}
          value={name}
          minimal
          fluid
          onChange={(e: any) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          onKeyUp={(e) => {
            if (e.key === 'Enter') {
              setIsEditing(false);
            }
          }}
          onBlur={() => setIsEditing(false)}
          {...inputProps}
        />
      );

      /* Escape is the way out on a keyboard, and a phone has no Escape. Without
         a control there, the only exits are Enter and tapping elsewhere, and
         both of those SUBMIT — so an edit begun by accident could not be
         abandoned. The button is the same affordance the key is, for the one
         place the key does not exist. */
      if (!isMobile) {
        return input;
      }

      return (
        <ReqoreControlGroup stack fluid className='reqore-label-editor-group'>
          {input}
          <ReqoreButton
            className='reqore-label-editor-cancel'
            aria-label='Cancel editing'
            tooltip='Cancel editing'
            icon='CloseLine'
            minimal
            onMouseDown={handleCancelMouseDown}
            onClick={cancel}
          />
        </ReqoreControlGroup>
      );
    }

    return (
      <ReqoreHeading
        {...rest}
        className={`${rest.className || ''} reqore-label-editor`}
        onClick={
          onSubmit
            ? (e) => {
                e.stopPropagation();
                setIsEditing(true);
              }
            : undefined
        }
      >
        <ReqoreSpan effect={effect}>{name}</ReqoreSpan>
        {onSubmit ? <ReqoreIcon icon='EditLine' size='small' margin='left' {...iconProps} /> : null}
      </ReqoreHeading>
    );
  }
);
