import { useState } from 'react';
import { IReqoreTreeProps } from '.';
import { ReqoreTextarea } from '../..';
import ReqoreButton from '../Button';
import ReqoreControlGroup from '../ControlGroup';
import ReqoreInput from '../Input';
import { IReqoreModalProps, ReqoreModal } from '../Modal';
import ReqoreTag from '../Tag';

export interface IReqoreTreeManagementDialog
  extends IReqoreModalProps,
    Pick<IReqoreTreeProps, 'KeyRenderer' | 'ValueRenderer'> {
  open?: boolean;
  path?: string;
  parentPath?: string;
  type?: 'object' | 'array';
  parentType?: 'object' | 'array';
  data?: { key: string; value: any };
  onSave?: (data: {
    key: string;
    value: any;
    originalData?: { key?: string; value?: any };
  }) => void;
  /** Label used when the dialog is opened for adding a new item. Defaults to `'Adding new item'`. */
  addItemDialogLabel?: string;
  /** Label builder used when the dialog is opened for editing an existing item at `path`. */
  updateItemDialogLabel?: (path: string) => string;
  /** Save-button label. Defaults to `'Save'`. */
  saveLabel?: string;
  /** "Key" field label. Defaults to `'Key'`. */
  keyLabel?: string;
  /** "Value" field label. Defaults to `'Value'`. */
  valueLabel?: string;
  /** Placeholder for the key input. Defaults to `'Key'`. */
  keyPlaceholder?: string;
  /** Placeholder for the value input. Defaults to `'Value'`. */
  valuePlaceholder?: string;
}

export const ReqoreTreeManagementDialog = ({
  path,
  parentType,
  type,
  data,
  onClose,
  onSave,
  KeyRenderer,
  ValueRenderer,
  addItemDialogLabel = 'Adding new item',
  updateItemDialogLabel = (p: string) => `Updating "${p}"`,
  saveLabel = 'Save',
  keyLabel = 'Key',
  valueLabel = 'Value',
  keyPlaceholder = 'Key',
  valuePlaceholder = 'Value',
}: IReqoreTreeManagementDialog) => {
  const [key, setKey] = useState(data?.key);
  const [value, setValue] = useState<any>(data?.value);

  return (
    <ReqoreModal
      isOpen
      label={path ? updateItemDialogLabel(path) : addItemDialogLabel}
      onClose={onClose}
      minimal
      panelSize='small'
      actions={[
        {
          intent: 'success',
          className: 'reqore-tree-save',
          disabled: type === 'object' ? !key || !value : !value,
          label: saveLabel,
          icon: 'CheckLine',
          onClick: () => {
            onSave({
              key,
              value,
              originalData: data,
            });
            onClose();
          },
        },
      ]}
    >
      <ReqoreControlGroup vertical>
        {type === 'object' || (data?.key && parentType !== 'array') ? (
          <ReqoreControlGroup fluid vertical>
            <ReqoreTag fixed width='100px' label={keyLabel} />
            {KeyRenderer ? (
              <KeyRenderer value={key} isEditing onChange={(newKey) => setKey(newKey)} />
            ) : (
              <ReqoreInput
                disabled={data && parentType === 'array'}
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder={keyPlaceholder}
                fluid
              />
            )}
          </ReqoreControlGroup>
        ) : null}
        {typeof data?.value !== 'object' && (
          <ReqoreControlGroup fluid verticalAlign='flex-start' vertical>
            <ReqoreTag fixed width='100px' label={valueLabel} />
            <ReqoreControlGroup stack fluid>
              {ValueRenderer ? (
                <ValueRenderer
                  value={value}
                  isEditing
                  onChange={(newValue) => setValue(newValue)}
                />
              ) : (
                <ReqoreTextarea
                  value={value}
                  scaleWithContent
                  onChange={(e: any) => setValue(e.target.value)}
                  placeholder={valuePlaceholder}
                  fluid
                  disabled={value === '[]' || value === '{}'}
                />
              )}
              <ReqoreButton
                fixed
                className='reqore-tree-modal-list'
                onClick={() => (value === '[]' ? setValue('') : setValue('[]'))}
                intent={value === '[]' ? 'info' : undefined}
                compact
                textAlign='center'
              >
                [...]
              </ReqoreButton>
              <ReqoreButton
                fixed
                className='reqore-tree-modal-object'
                onClick={() => (value === '{}' ? setValue('') : setValue('{}'))}
                intent={value === '{}' ? 'info' : undefined}
                compact
                textAlign='center'
                label='{...}'
              />
            </ReqoreControlGroup>
          </ReqoreControlGroup>
        )}
      </ReqoreControlGroup>
    </ReqoreModal>
  );
};
