import { memo, useCallback, useEffect, useState } from 'react';
import type { ChangeEvent, FocusEvent, KeyboardEvent, MouseEvent } from 'react';
import ReqoreButton from '../Button';
import { IReqoreHeadingProps, ReqoreHeading } from '../Header';
import { IReqoreIconProps } from '../Icon';
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

    useEffect(() => {
      setName(label);
    }, [label]);

    const startEditing = useCallback(() => {
      setName(label);
      setIsEditing(true);
    }, [label]);

    const commit = useCallback(() => {
      setIsEditing(false);
      onSubmit?.(name);
    }, [name, onSubmit]);

    const cancel = useCallback(() => {
      setName(label);
      setIsEditing(false);
    }, [label]);

    const handleKeyDown = useCallback(
      (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          event.stopPropagation();
          cancel();
        } else if (event.key === 'Enter') {
          event.preventDefault();
          commit();
        }

        inputProps?.onKeyDown?.(event);
      },
      [cancel, commit, inputProps?.onKeyDown]
    );

    const handleClick = useCallback(
      (event: MouseEvent<HTMLInputElement>) => {
        event.stopPropagation();
        inputProps?.onClick?.(event);
      },
      [inputProps?.onClick]
    );

    const handleChange = useCallback(
      (event: ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value);
        inputProps?.onChange?.(event);
      },
      [inputProps?.onChange]
    );

    const handleBlur = useCallback(
      (event: FocusEvent<HTMLInputElement>) => {
        commit();
        inputProps?.onBlur?.(event);
      },
      [commit, inputProps?.onBlur]
    );

    const handleEditClick = useCallback(
      (event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        startEditing();
      },
      [startEditing]
    );

    if (isEditing) {
      return (
        <ReqoreInput
          {...inputProps}
          focusRules={inputProps?.focusRules ?? { type: 'auto' }}
          onClick={handleClick}
          value={name}
          minimal={inputProps?.minimal ?? true}
          fluid={inputProps?.fluid ?? true}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
        />
      );
    }

    return (
      <ReqoreHeading {...rest} className={`${rest.className || ''} reqore-label-editor`}>
        <ReqoreSpan effect={effect}>{name}</ReqoreSpan>
        {onSubmit ? (
          <ReqoreButton
            aria-label='Edit panel label'
            icon='EditLine'
            leftIconProps={iconProps}
            minimal
            size='tiny'
            tooltip='Edit panel label'
            onClick={handleEditClick}
          />
        ) : null}
      </ReqoreHeading>
    );
  }
);
