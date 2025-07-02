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
  content: string | React.ReactNode;
}

export interface IReqoreTierProps extends Omit<IReqorePanelProps, 'description'> {
  name: string;
  nameDetail?: string;
  price: string;
  currency: string;
  priceDetail?: string;
  description?: string | React.ReactNode;
  actionButtonProps?: IReqoreButtonProps;
  featureList?: IReqoreTierFeature[];
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
    ...rest
  }: IReqoreTierProps) => {
    const style = useMemo(() => {
      return {
        width: '300px',
      };
    }, []);

    return (
      <ReqorePanel style={style} {...rest}>
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
            <ReqoreH1 effect={{ weight: 'thick', textSize: '40px' }}>
              {currency}
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
              intent='success'
              labelEffect={{ uppercase: true, weight: 'thick', textSize: 'small' }}
              size='big'
              fluid
              pill
              label='Get Started'
              {...actionButtonProps}
            />
          </ReqoreControlGroup>
        </ReqoreControlGroup>
        <ReqoreVerticalSpacer height={10} />
        <ReqoreVerticalSpacer height={10} lineSize='tiny' intent='muted' />
        <ReqoreVerticalSpacer height={10} />
        <ReqoreControlGroup vertical>
          {featureList &&
            featureList.map(({ icon, content, iconProps, ...contentProps }, index) => (
              <ReqoreControlGroup key={index} spaceBetween fluid>
                <ReqoreIcon icon={icon || 'CheckLine'} intent='success' {...iconProps} />
                <ReqoreP {...contentProps}>{content}</ReqoreP>
              </ReqoreControlGroup>
            ))}
        </ReqoreControlGroup>
      </ReqorePanel>
    );
  }
);
