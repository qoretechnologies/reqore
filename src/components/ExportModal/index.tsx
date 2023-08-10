import { useCallback, useMemo, useState } from 'react';
import { stringify } from 'yaml';
import { ReqoreTextarea, useReqoreProperty } from '../..';
import { convertToCSV } from '../../helpers/utils';
import { IReqoreModalProps, ReqoreModal } from '../Modal';
import ReqoreTabs, { IReqoreTabsProps } from '../Tabs';
import ReqoreTabsContent from '../Tabs/content';

export interface IReqoreExportModalProps extends IReqoreModalProps {
  data: { [key: string]: unknown } | unknown[];
  sendNotificationOnCopy?: boolean;
  tabsOptions?: Omit<IReqoreTabsProps, 'tabs'>;
}

export const ReqoreExportModal = ({
  data,
  sendNotificationOnCopy = true,
  tabsOptions = {},
  ...rest
}: IReqoreExportModalProps) => {
  const addNotification = useReqoreProperty('addNotification');
  const isArray = Array.isArray(data);
  const [tab, setTab] = useState<string>(isArray ? 'csv' : 'json');
  const tabs: IReqoreTabsProps['tabs'] = [
    { label: 'CSV', id: 'csv', disabled: !isArray },
    { label: 'JSON', id: 'json' },
    { label: 'YAML', id: 'yaml' },
  ];

  const dataToExport = useMemo(() => {
    switch (tab) {
      case 'csv':
        return convertToCSV(data as any[]);
      case 'json':
        return JSON.stringify(data, null, 2);
      case 'yaml':
        return stringify(data, null, 2);
      default:
        return '';
    }
  }, [data, tab, isArray]);

  const handleCopyClick = useCallback(() => {
    navigator.clipboard.writeText(dataToExport);

    if (sendNotificationOnCopy) {
      addNotification({
        content: 'Data copied to clipboard',
        intent: 'success',
        duration: 3000,
      });
    }
  }, [sendNotificationOnCopy, dataToExport]);

  return (
    <ReqoreModal
      label='Export data'
      icon='DownloadLine'
      {...rest}
      isOpen
      bottomActions={[
        {
          position: 'right',
          label: 'Copy',
          icon: 'ClipboardLine',
          onClick: () => {
            handleCopyClick();
          },
        },
        {
          position: 'right',
          label: 'Copy and close',
          icon: 'ClipboardFill',
          onClick: () => {
            handleCopyClick();
            rest.onClose?.();
          },
        },
      ]}
    >
      <ReqoreTabs
        fillParent
        activeTabIntent='info'
        activeTab={isArray ? 'csv' : 'json'}
        padded={false}
        {...tabsOptions}
        onTabChange={(tabId) => setTab(tabId.toString())}
        tabs={tabs}
      >
        {tabs.map((tab) => (
          <ReqoreTabsContent tabId={tab.id} key={tab.id} padded='none'>
            <ReqoreTextarea readOnly value={dataToExport} scaleWithContent minimal />
          </ReqoreTabsContent>
        ))}
      </ReqoreTabs>
    </ReqoreModal>
  );
};
