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
  /**
   * Label for the CSV format tab. Defaults to English `'CSV'` — override for
   * locales that transliterate format acronyms.
   */
  csvTabLabel?: string;
  /**
   * Label for the JSON format tab. Defaults to English `'JSON'` — override for
   * locales that transliterate format acronyms.
   */
  jsonTabLabel?: string;
  /**
   * Label for the YAML format tab. Defaults to English `'YAML'` — override for
   * locales that transliterate format acronyms.
   */
  yamlTabLabel?: string;
  /**
   * Label for the "Copy" bottom action button. Defaults to English `'Copy'` —
   * override to translate the button copy.
   */
  copyLabel?: string;
  /**
   * Label for the "Copy and close" bottom action button. Defaults to English
   * `'Copy and close'` — override to translate the button copy.
   */
  copyAndCloseLabel?: string;
  /**
   * Content shown in the notification fired when data is copied to the clipboard.
   * Defaults to English `'Data copied to clipboard'` — override to translate.
   */
  copyNotificationContent?: string;
}

export const ReqoreExportModal = ({
  data,
  sendNotificationOnCopy = true,
  tabsOptions = {},
  csvTabLabel = 'CSV',
  jsonTabLabel = 'JSON',
  yamlTabLabel = 'YAML',
  copyLabel = 'Copy',
  copyAndCloseLabel = 'Copy and close',
  copyNotificationContent = 'Data copied to clipboard',
  ...rest
}: IReqoreExportModalProps) => {
  const addNotification = useReqoreProperty('addNotification');
  const isArray = Array.isArray(data);
  const [tab, setTab] = useState<string>(isArray ? 'csv' : 'json');
  const tabs: IReqoreTabsProps['tabs'] = [
    { label: csvTabLabel, id: 'csv', disabled: !isArray },
    { label: jsonTabLabel, id: 'json' },
    { label: yamlTabLabel, id: 'yaml' },
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
        content: copyNotificationContent,
        intent: 'success',
        duration: 3000,
      });
    }
  }, [sendNotificationOnCopy, dataToExport, copyNotificationContent]);

  return (
    <ReqoreModal
      label='Export data'
      icon='DownloadLine'
      {...rest}
      isOpen
      bottomActions={[
        {
          position: 'right',
          label: copyLabel,
          icon: 'ClipboardLine',
          onClick: () => {
            handleCopyClick();
          },
        },
        {
          position: 'right',
          label: copyAndCloseLabel,
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
        flat={false}
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
