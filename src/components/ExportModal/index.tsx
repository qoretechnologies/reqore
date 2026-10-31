import { useCallback, useMemo, useState } from 'react';
import { stringify } from 'yaml';
import { ReqoreTextarea, useReqoreProperty } from '../..';
import { copyText } from '../../helpers/secureContextApis';
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
  /**
   * Title of the notification shown when the data could not be copied (the browser allowed
   * neither the Clipboard API nor its copy command, as on a page served over plain http).
   * Shown whatever `sendNotificationOnCopy` says: a copy that did not happen is never silent.
   * Defaults to English `'Could not copy'` — override to translate.
   */
  copyFailedNotificationTitle?: string;
  /**
   * Content of the notification shown when the data could not be copied. "Copy and close"
   * leaves the modal open then, so the text can be selected. Defaults to English
   * `'The browser did not allow copying to the clipboard. Select the text and copy it
   * yourself.'` — override to translate.
   */
  copyFailedNotificationContent?: string;
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
  copyFailedNotificationTitle = 'Could not copy',
  copyFailedNotificationContent = 'The browser did not allow copying to the clipboard. Select the text and copy it yourself.',
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

  /** Copies the shown data, says how it went, and resolves to whether it was copied. */
  const handleCopyClick = useCallback(async (): Promise<boolean> => {
    try {
      await copyText(dataToExport);
    } catch {
      addNotification({
        title: copyFailedNotificationTitle,
        content: copyFailedNotificationContent,
        intent: 'danger',
        duration: 10000,
      });
      return false;
    }

    if (sendNotificationOnCopy) {
      addNotification({
        content: copyNotificationContent,
        intent: 'success',
        duration: 3000,
      });
    }
    return true;
  }, [
    addNotification,
    sendNotificationOnCopy,
    dataToExport,
    copyNotificationContent,
    copyFailedNotificationTitle,
    copyFailedNotificationContent,
  ]);

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
            void handleCopyClick();
          },
        },
        {
          position: 'right',
          label: copyAndCloseLabel,
          icon: 'ClipboardFill',
          // Closes only once the data was copied: when it was not, the text stays on screen to
          // be selected and copied by hand.
          onClick: async () => {
            if (await handleCopyClick()) {
              rest.onClose?.();
            }
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
