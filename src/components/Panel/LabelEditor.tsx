import { memo, useEffect, useState } from 'react';
import { useUpdateEffect } from 'react-use';
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

/**
 * A panel's title, which its owner may let the reader rename (`onSubmit`).
 *
 * At rest it draws the `label` it is given, in the same render: the panel measures the title it
 * draws right after that render (how much room it has, which line its badges go to), and a title
 * copied into state by an effect showed the old words for that render. A drawer whose name
 * arrived with its data ("A/B test", then "Hero: Console input vs problem wizard" with "Running ·
 * phase 2") was measured as the short name beside its badge, and its long name was fitted to the
 * room left beside the badge, 137px, one line at 14px where two at 20px fitted the whole line
 * (an experiment drawer showing a removed version). `name` is only the draft while editing.
 */
export const LabelEditor = memo(
  ({ label, onSubmit, inputProps, iconProps, effect, ...rest }: IReqoreLabelEditorProps) => {
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
          fluid
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
                setName(label);
                setIsEditing(true);
              }
            : undefined
        }
      >
        <ReqoreSpan effect={effect}>{label}</ReqoreSpan>
        {onSubmit ? <ReqoreIcon icon='EditLine' size='small' margin='left' {...iconProps} /> : null}
      </ReqoreHeading>
    );
  }
);
