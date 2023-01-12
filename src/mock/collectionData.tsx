import { noop } from 'lodash';
import { IReqoreCollectionItemProps } from '../components/Collection/item';
import { ReqoreH1 } from '../components/Header';
import ReqoreMessage from '../components/Message';
import { ReqoreP } from '../components/Paragraph';
import { ReqoreSpacer } from '../components/Spacer';
import ReqoreTag from '../components/Tag';

export default [
  {
    label: 'This item is not flat',
    tooltip: 'This is a test item',
    content:
      'Hello I am a test item content and I am very long so I will wrap to the next line and I will be very long',
    flat: false,
    tags: [
      {
        label: 23,
        asBadge: true,
      },
      {
        label: 2022,
        labelKey: 'Year',
        asBadge: true,
        onRemoveClick: noop,
      },
    ],
    expandable: true,
  },
  {
    label: 'Test with tooltip',
    tooltip: 'This is a test item',
    headerSize: 2,
    contentSize: 'huge',
    selected: true,
    icon: 'Hashtag',
    content:
      'Hello I am a test item content and I am very long so I will wrap to the next line and I will be very long',
    tags: [
      {
        label: 'local',
        labelKey: 'level',
        intent: 'info',
        icon: 'Hashtag',
      },
      {
        label: 'string',
        labelKey: 'type',
        intent: 'warning',
        icon: 'CodeLine',
      },
    ],
  },
  {
    icon: 'TextWrap',
    label: 'Item that is not minimal',
    tooltip: 'This is a test item',
    content:
      'Hello I am a test item content and I am very long so I will wrap to the next line and I will be very long',
    minimal: false,
    badge: 0,
  },
  {
    icon: 'ZcoolLine',
    label: 'Item without fade',
    content:
      'Hello I am a test item content and I am very long so I will wrap to the next line and I will be very long Hello I am a test item content and I am very long so will wrap to the next line and I will be very long. Hello I am a test item content and I am very long so I will wrap to the next line and I will be very long. Hello I am a test item content and I am very long so I will wrap to the next line and I will be very long. Hello I am a test item content and I am very long so I will wrap to the next line and I will be very long. Hello I am a test item content and I am very long so I will wrap to the next line and I will be very long. Hello I am a test item content and I am very long so I will wrap to the next line and I will be very long. Hello I am a test item content and I am very long so I will wrap to the next line and I will be very long Hello I am a test item content and I am very long so will wrap to the next line and I will be very long. Hello I am a test item content and I am very long so I will wrap to the next line and I will be very long. Hello I am a test item content and I am very long so I will wrap to the next line and I will be very long. Hello I am a test item content and I am very long so I will wrap to the next line and I will be very long. Hello I am a test item content and I am very long so I will wrap to the next line and I will be very long. Hello I am a test item content and I am very long so I will wrap to the next line and I will be very long',
    showContentFade: false,
  },
  {
    icon: 'FolderWarningFill',
    label: 'Expandable item',
    tooltip: 'This is a test item',
    content:
      'Hello I am a test item content and I am very long so I will wrap to the next line and I will be very long',
    expandable: true,
    badge: 10,
    tags: [
      {
        label: 23,
        asBadge: true,
      },
      {
        label: 2022,
        labelKey: 'Year',
        asBadge: true,
        onRemoveClick: noop(),
      },
    ],
  },
  {
    label: 'Item with custom content when expanded',
    tooltip: 'Expandable item with custom content',
    selected: true,
    content:
      'Hello I am a test item content and I am very long so I will wrap to the next line and I will be very long. Hello I am a test item content and I am very long so I will wrap to the next line and I will be very long. Hello I am a test item content and I am very long so I will wrap to the next line and I will be very long. Hello I am a test item content and I am very long so I will wrap to the next line and I will be very long. Hello I am a test item content and I am very long so I will wrap to the next line and I will be very long. Hello I am a test item content and I am very long so I will wrap to the next line and I will be very long',
    expandable: true,
    contentEffect: {
      gradient: {
        colors: { 0: '#3b065e', 100: '#00d3c8' },
        direction: 'to right bottom',
      },
      uppercase: true,
      weight: 'thin',
      spaced: 2,
    },
    expandedContent: (
      <>
        <ReqoreMessage intent='info'>Hello I am a custom content</ReqoreMessage>
        <ReqoreSpacer height={10} />
        <ReqoreH1>Well hello</ReqoreH1>
        <ReqoreP>
          Hello I am a test item content and I am very long so I will wrap to the next line and I
          will be very long. Hello I am a test item content and I am very long so I will wrap to the
          next line and I will be very long. Hello I am a test item content and I am very long so I
          will wrap to the next line and I will be very long. Hello I am a test item content and I
          am very long so I will wrap to the next line and I will be very long. Hello I am a test
          item content and I am very long so I will wrap to the next line and I will be very long.
        </ReqoreP>
        <ReqoreP>
          Hello I am a test item content and I am very long so I will wrap to the next line and I
          will be very long Hello I am a test item content and I am very long so I will wrap to the
          next line and I will be very long. Hello I am a test item content and I am very long so I
          will wrap to the next line and I will be very long. Hello I am a test item content and I
          am very long so I will wrap to the next line and I will be very long. Hello I am a test
          item content and I am very long so I will wrap to the next line and I will be very long.
          Hello I am a test item content and I am very long so I will wrap to the next line and I
          will be very long. Hello I am a test item content and I am very long so I will wrap to the
          next line and I will be very long
        </ReqoreP>
        <ReqoreP>
          Hello I am a test item content and I am very long so I will wrap to the next line and I
          will be very long Hello I am a test item content and I am very long so I will wrap to the
          next line and I will be very long. Hello I am a test item content and I am very long so I
          will wrap to the next line and I will be very long. Hello I am a test item content and I
          am very long so I will wrap to the next line and I will be very long. Hello I am a test
          item content and I am very long so I will wrap to the next line and I will be very long.
          Hello I am a test item content and I am very long so I will wrap to the next line and I
          will be very long. Hello I am a test item content and I am very long so I will wrap to the
          next line and I will be very long
        </ReqoreP>
        <ReqoreP>
          Hello I am a test item content and I am very long so I will wrap to the next line and I
          will be very long Hello I am a test item content and I am very long so I will wrap to the
          next line and I will be very long. Hello I am a test item content and I am very long so I
          will wrap to the next line and I will be very long. Hello I am a test item content and I
          am very long so I will wrap to the next line and I will be very long. Hello I am a test
          item content and I am very long so I will wrap to the next line and I will be very long.
          Hello I am a test item content and I am very long so I will wrap to the next line and I
          will be very long. Hello I am a test item content and I am very long so I will wrap to the
          next line and I will be very long
        </ReqoreP>
        <ReqoreP>
          Hello I am a test item content and I am very long so I will wrap to the next line and I
          will be very long Hello I am a test item content and I am very long so I will wrap to the
          next line and I will be very long. Hello I am a test item content and I am very long so I
          will wrap to the next line and I will be very long. Hello I am a test item content and I
          am very long so I will wrap to the next line and I will be very long. Hello I am a test
          item content and I am very long so I will wrap to the next line and I will be very long.
          Hello I am a test item content and I am very long so I will wrap to the next line and I
          will be very long. Hello I am a test item content and I am very long so I will wrap to the
          next line and I will be very long
        </ReqoreP>
        <ReqoreP>
          Hello I am a test item content and I am very long so I will wrap to the next line and I
          will be very long Hello I am a test item content and I am very long so I will wrap to the
          next line and I will be very long. Hello I am a test item content and I am very long so I
          will wrap to the next line and I will be very long. Hello I am a test item content and I
          am very long so I will wrap to the next line and I will be very long. Hello I am a test
          item content and I am very long so I will wrap to the next line and I will be very long.
          Hello I am a test item content and I am very long so I will wrap to the next line and I
          will be very long. Hello I am a test item content and I am very long so I will wrap to the
          next line and I will be very long
        </ReqoreP>
      </>
    ),
    tags: [
      {
        label: 'local',
        labelKey: 'level',
        intent: 'info',
        icon: 'Hashtag',
      },
      {
        label: 'string',
        labelKey: 'type',
        intent: 'warning',
        icon: 'CodeLine',
      },
    ],
  },
  {
    label: 'I have intent!',
    content: (
      <ReqoreP>
        'Well would you look at that. Lorem ipsum dolor{' '}
        <ReqoreTag label='dolor' icon='Briefcase3Line' /> <ReqoreTag label='sit amet' />,
        consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis
        natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis,
        ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec
        pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut,
        imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer
        tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus.
        Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante,
        dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius
        laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur
        ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget
        condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Nam
        quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante
        tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante. Etiam
        sit amet orci eget eros faucibus tincidunt. Duis leo. Sed fringilla mauris sit amet nibh.
        Donec sodales sagittis magna. Sed consequat, leo eget bibendum sodales, augue velit cursus
        nunc, quis gravida magna mi a libero. Fusce vulputate eleifend sapien. Vestibulum purus
        quam, scelerisque ut, mollis sed, nonummy id, metus. Nullam accumsan lorem in dui. Cras
        ultricies mi eu turpis hendrerit fringilla. Vestibulum ante ipsum primis in faucibus orci
        luctus et ultrices posuere cubilia Curae; In ac dui quis mi consectetuer lacinia. Nam
        pretium turpis et arcu. Duis arcu tortor, suscipit eget, imperdiet nec, imperdiet iaculis,
        ipsum. Sed aliquam ultrices mauris. Integer ante arcu, accumsan a, consectetuer eget,
        posuere ut, mauris. Praesent adipiscing. Phasellus ullamcorper ipsum rutrum nunc. Nunc
        nonummy metus. Vestibulum volutpat pretium libero. Cras id dui. Aenean ut eros et nisl
        sagittis vestibulum. Nullam nulla eros, ultricies sit amet, nonummy id, imperdiet feugiat,
        pede. Sed lectus. Donec mollis hendrerit risus. Phasellus nec sem in justo pellentesque
        facilisis. Etiam imperdiet imperdiet orci. Nunc nec neque. Phasellus leo dolor, tempus non,
        auctor et, hendrerit quis, nisi. Curabitur ligula sapien, tincidunt non, euismod vitae,
        posuere imperdiet, leo. Maecenas malesuada. Praesent congue erat at massa. Sed cursus turpis
        vitae tortor. Donec posuere vulputate arcu. Phasellus accumsan cursus velit. Vestibulum ante
        ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Sed aliquam, nisi
        quis porttitor congue, elit erat euismod orci, ac placerat dolor lectus quis orci. Phasellus
        consectetuer vestibulum elit. Aenean tellus metus, bibendum sed, posuere ac, mattis non,
        nunc. Vestibulum fringilla pede sit amet augue. In turpis. Pellentesque posuere. Praesent
        turpis. Aenean posuere, tortor sed cursus feugiat, nunc augue blandit nunc, eu sollicitudin
        urna dolor sagittis lacus. Donec elit libero, sodales nec, volutpat a, suscipit non, turpis.
        Nullam sagittis. Suspendisse pulvinar, augue ac venenatis condimentum, sem libero volutpat
        nibh, nec pellentesque velit pede quis nunc. Vestibulum ante ipsum primis in faucibus orci
        luctus et ultrices posuere cubilia Curae; Fusce id purus. Ut varius tincidunt libero.
        Phasellus dolor. Maecenas vestibulum mollis'
      </ReqoreP>
    ),
    expandable: true,
    intent: 'info',
  },
  {
    label: 'I have actions',
    content:
      'Hello I am a test item content and I am very long so I will wrap to the next line and I will be very long',
    actions: [
      {
        label: 'Action 1',
        id: 'action1',
        icon: 'CapsuleFill',
        onClick: () => alert('Action 1 clicked'),
      },
      {
        label: 'Action 2',
        id: 'action2',
        icon: 'CapsuleFill',
        onClick: () => alert('Action 2 clicked'),
      },
    ],
    intent: 'success',
    expandable: true,
  },
  {
    label: 'I have bottom actions',
    content:
      'Hello I am a test item content and I am very long so I will wrap to the next line and I will be very long',
    expandedActions: [
      {
        label: 'Action 1',
        id: 'action1',
        icon: 'CapsuleFill',
        onClick: () => alert('Action 1 clicked'),
        position: 'left',
      },
      {
        label: 'Action 2',
        id: 'action2',
        icon: 'CapsuleFill',
        onClick: () => alert('Action 2 clicked'),
        position: 'right',
      },
    ],
    tags: [
      {
        label: 23,
        asBadge: true,
      },
      {
        label: 2022,
        labelKey: 'Year',
        asBadge: true,
        onRemoveClick: noop,
      },
    ],
    expandable: true,
  },
] as IReqoreCollectionItemProps[];
