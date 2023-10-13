import { memo, useEffect, useState } from 'react';
import { useUpdateEffect } from 'react-use';
import { IReqoreHeadingProps, ReqoreHeading } from '../Header';
import ReqoreIcon, { IReqoreIconProps } from '../Icon';
import ReqoreInput, { IReqoreInputProps } from '../Input';

export interface IReqoreLabelEditorProps extends Omit<IReqoreHeadingProps, 'onSubmit'> {
  label: string | number;
  onSubmit?: (label: string | number) => void;
  iconProps?: IReqoreIconProps;
  inputProps?: IReqoreInputProps;
}

export const LabelEditor = memo(
  ({ label, onSubmit, inputProps, iconProps, ...rest }: IReqoreLabelEditorProps) => {
    const [name, setName] = useState<string | number>(label);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
      setName(label);
    }, [label]);

    useUpdateEffect(() => {
      if (!isEditing) {
        onSubmit?.(name);
      }
    }, [isEditing]);

    if (isEditing) {
      return (
        <ReqoreInput
          focusRules={{ type: 'auto' }}
          onClick={(e) => e.stopPropagation()}
          value={name}
          minimal
          onChange={(e: any) => setName(e.target.value)}
          onKeyUp={(e) => {
            if (e.key === 'Enter') {
              setIsEditing(false);
            }
          }}
          onBlur={() => setIsEditing(false)}
          {...inputProps}
        />
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
        {name}
        {onSubmit ? <ReqoreIcon icon='EditLine' size='small' margin='left' {...iconProps} /> : null}
      </ReqoreHeading>
    );
  }
);
