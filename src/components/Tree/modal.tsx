import { useState } from 'react';
import { ReqoreTextarea } from '../..';
import ReqoreButton from '../Button';
import ReqoreControlGroup from '../ControlGroup';
import ReqoreInput from '../Input';
import { IReqoreModalProps, ReqoreModal } from '../Modal';
import ReqoreTag from '../Tag';

export interface IReqoreTreeManagementDialog extends IReqoreModalProps {
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
}

export const ReqoreTreeManagementDialog = ({
  path,
  parentType,
  type,
  data,
  onClose,
  onSave,
}: IReqoreTreeManagementDialog) => {
  const [key, setKey] = useState(data?.key);
  const [value, setValue] = useState<any>(data?.value);

  return (
    <ReqoreModal
      isOpen
      label={path ? `Updating "${path}"` : 'Adding new item'}
      onClose={onClose}
      minimal
      panelSize='small'
      actions={[
        {
          intent: 'success',
          className: 'reqore-tree-save',
          disabled: type === 'object' ? !key || !value : !value,
          label: 'Save',
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
          <ReqoreControlGroup fluid stack>
            <ReqoreTag fixed width='100px' label='Key' />
            <ReqoreInput
              disabled={data && parentType === 'array'}
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder='Key'
              fluid
            />
          </ReqoreControlGroup>
        ) : null}
        {typeof data?.value !== 'object' && (
          <ReqoreControlGroup fluid stack verticalAlign='flex-start'>
            <ReqoreTag fixed width='100px' label='Value' />

            <ReqoreTextarea
              value={value}
              scaleWithContent
              onChange={(e: any) => setValue(e.target.value)}
              placeholder='Value'
              fluid
              disabled={value === '[]' || value === '{}'}
            />
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
        )}
      </ReqoreControlGroup>
    </ReqoreModal>
  );
};
