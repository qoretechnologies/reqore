import { isNumber } from 'lodash';
import { memo, useMemo } from 'react';
import { IReqoreIconName } from '../../types/icons';
import ReqoreButton, { ButtonBadge, IReqoreButtonProps } from '../Button';
import ReqoreControlGroup from '../ControlGroup';
import { ReqoreH1 } from '../Header';
import ReqoreIcon, { IReqoreIconProps } from '../Icon';
import { IReqorePanelProps, ReqorePanel } from '../Panel';
import { IReqoreParagraphProps, ReqoreP } from '../Paragraph';
import { ReqoreVerticalSpacer } from '../Spacer';

export interface IReqoreTierFeature extends Omit<IReqoreParagraphProps, 'content'> {
  icon?: IReqoreIconName;
  iconProps?: IReqoreIconProps;
  rightIcon?: IReqoreIconName;
  rightIconProps?: IReqoreIconProps;
  content: string | React.ReactNode;
}

export interface IReqoreTierProps extends Omit<IReqorePanelProps, 'description'> {
  name: string;
  nameDetail?: string;
  price: string | number;
  currency: string;
  priceDetail?: string;
  salePrice?: string | number;
  description?: string | React.ReactNode;
  actionButtonProps?: IReqoreButtonProps;
  featureList?: IReqoreTierFeature[];
  highlight?: boolean;
  active?: boolean;
}

export const ReqoreTier = memo(
  ({
    currency,
    priceDetail,
    description,
    price,
    actionButtonProps,
    name,
    nameDetail,
    badge,
    featureList,
    highlight,
    salePrice,
    active,
    ...rest
  }: IReqoreTierProps) => {
    const style = useMemo(() => {
      return {
        transform: `scale(${highlight ? 1.05 : 1})`,
        ...rest.style,
      };
    }, [rest.style]);

    const contentEffect = useMemo(
      (): IReqorePanelProps['contentEffect'] => ({
        gradient: {
          type: 'linear',
          direction: 'to right bottom',
          animate: highlight ? 'always' : 'never',
          animationSpeed: 5,
          colors: {
            0: highlight ? 'main:darken:3' : 'transparent',
            150: highlight ? 'info:darken:7:0.8' : 'main:darken:5',
          },
        },
        ...rest.contentEffect,
      }),
      [highlight, rest.contentEffect]
    );

    return (
      <ReqorePanel
        intent={highlight ? 'info' : undefined}
        {...rest}
        style={style}
        contentEffect={contentEffect}
      >
        <ReqoreVerticalSpacer height={20} />
        {badge && (
          <>
            <ButtonBadge content={badge} />
            <ReqoreVerticalSpacer height={10} />
          </>
        )}

        <ReqoreControlGroup horizontalAlign='center' vertical gapSize='big'>
          <ReqoreControlGroup horizontalAlign='center' vertical gapSize='tiny'>
            <ReqoreP effect={{ uppercase: true, weight: 'bold' }} size='big'>
              {name}
            </ReqoreP>
            {nameDetail && (
              <ReqoreP intent='muted' effect={{ uppercase: true }} size='small'>
                {nameDetail}
              </ReqoreP>
            )}
          </ReqoreControlGroup>
          <ReqoreControlGroup vertical horizontalAlign='center' gapSize='tiny'>
            {salePrice && (
              <ReqoreP
                effect={{
                  uppercase: true,
                  weight: 'thick',
                  textSize: '40px',
                  color: 'success:lighten:15:1',
                }}
              >
                {currency && isNumber(salePrice) ? currency : undefined}
                {salePrice}
              </ReqoreP>
            )}
            <ReqoreH1
              effect={{
                weight: 'thick',
                textSize: salePrice ? '20px' : '40px',
                lineThrough: salePrice ? '1px solid line-through red' : undefined,
                opacity: salePrice ? 0.5 : 1,
              }}
            >
              {currency && isNumber(price) ? currency : undefined}
              {price}
            </ReqoreH1>
            {priceDetail && (
              <ReqoreP intent='muted' size='small' effect={{ uppercase: true }}>
                {priceDetail}
              </ReqoreP>
            )}
          </ReqoreControlGroup>
          {description && (
            <ReqoreP style={{ textAlign: 'center', padding: '0 20px' }}>{description}</ReqoreP>
          )}
          <ReqoreControlGroup fluid>
            <ReqoreButton
              minimal
              textAlign='center'
              iconsAlign='center'
              intent={active ? 'success' : 'info'}
              labelEffect={{ uppercase: true, weight: 'thick', textSize: 'small' }}
              size='big'
              fluid
              pill
              label={active ? 'Active' : 'Get Started'}
              icon={active ? 'CheckLine' : undefined}
              {...actionButtonProps}
              readOnly={active}
            />
          </ReqoreControlGroup>
        </ReqoreControlGroup>
        <ReqoreVerticalSpacer height={20} />
        <ReqoreControlGroup vertical>
          {featureList &&
            featureList.map(
              ({ icon, content, iconProps, rightIcon, rightIconProps, ...contentProps }, index) => (
                <ReqoreControlGroup key={index} spaceBetween fluid>
                  <ReqoreIcon icon={icon || 'CheckLine'} intent='success' {...iconProps} />
                  <ReqoreP {...contentProps}>{content}</ReqoreP>
                  <ReqoreIcon icon={rightIcon} {...rightIconProps} />
                </ReqoreControlGroup>
              )
            )}
        </ReqoreControlGroup>
      </ReqorePanel>
    );
  }
);
