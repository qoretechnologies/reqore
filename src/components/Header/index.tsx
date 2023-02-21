import { memo, useMemo, useState } from 'react';
import styled from 'styled-components';
import { HEADER_SIZE_TO_NUMBER, TSizes } from '../../constants/sizes';
import { IReqoreTheme, TReqoreIntent } from '../../constants/theme';
import { isStringSize } from '../../helpers/utils';
import { useReqoreTheme } from '../../hooks/useTheme';
import { useTooltip } from '../../hooks/useTooltip';
import { IWithReqoreEffect, IWithReqoreTooltip } from '../../types/global';
import { StyledTextEffect } from '../Effect';

export interface IReqoreHeadingProps
  extends IWithReqoreEffect,
    IWithReqoreTooltip,
    React.HTMLAttributes<HTMLHeadingElement> {
  intent?: TReqoreIntent;
  size?: 1 | 2 | 3 | 4 | 5 | 6 | TSizes;
  customTheme?: Partial<IReqoreTheme>;
}

export interface IReqoreHeadingStyle extends IReqoreHeadingProps {
  theme: IReqoreTheme;
}

export const StyledHeader = styled(StyledTextEffect)`
  margin: 0;
  padding: 0;
  color: ${({ theme, intent }) => (intent ? theme.intents[intent] : 'inherit')};

  font-size: ${({ _size }) => {
    switch (_size) {
      case 1:
        return '30px';
      case 2:
        return '24px';
      case 3:
        return '19px';
      case 4:
        return '14px';
      case 5:
        return '11px';
      case 6:
        return '8px';
      default:
        return 'inherit';
    }
  }};
`;

export const ReqoreHeading = memo(
  ({ size, children, customTheme, intent, className, tooltip, ...rest }: IReqoreHeadingProps) => {
    const [ref, setRef] = useState<HTMLHeadingElement>(undefined);
    const theme = useReqoreTheme('main', customTheme, intent);
    const _size: number = isStringSize(size) ? HEADER_SIZE_TO_NUMBER[size] : size;
    const HTMLheaderElement = useMemo(() => {
      return `h${_size}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    }, [_size]);

    useTooltip(ref, tooltip);

    return (
      <StyledHeader
        as={HTMLheaderElement}
        theme={theme}
        intent={intent}
        ref={setRef}
        {...rest}
        _size={_size}
        className={`${className || ''} reqore-heading`}
      >
        {children}
      </StyledHeader>
    );
  }
);

export const ReqoreH1 = (props: IReqoreHeadingProps) => <ReqoreHeading size={1} {...props} />;
export const ReqoreH2 = (props: IReqoreHeadingProps) => <ReqoreHeading size={2} {...props} />;
export const ReqoreH3 = (props: IReqoreHeadingProps) => <ReqoreHeading size={3} {...props} />;
export const ReqoreH4 = (props: IReqoreHeadingProps) => <ReqoreHeading size={4} {...props} />;
export const ReqoreH5 = (props: IReqoreHeadingProps) => <ReqoreHeading size={5} {...props} />;
export const ReqoreH6 = (props: IReqoreHeadingProps) => <ReqoreHeading size={6} {...props} />;
