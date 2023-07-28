import { StoryObj } from '@storybook/react';
import { useState } from 'react';
import { useMount } from 'react-use';
import { ReqorePagination } from '../../components/Paging';
import { ReqoreControlGroup, ReqoreTag, useReqorePaging } from '../../index';
import { TestTableItem, tableData } from '../../mock/tableData';
import { StoryMeta, StoryRenderer } from '../utils';

const meta = {
  title: 'Collections/Paging/Stories',
  component: ReqorePagination,
} as StoryMeta<typeof ReqorePagination<TestTableItem>>;

export default meta;
type Story = StoryObj<typeof meta>;

const Template: StoryRenderer<typeof ReqorePagination<TestTableItem> & any> = (args) => {
  const [scrollContainer, setScrollContainer] = useState<any>(undefined);
  const paging = useReqorePaging<any>({ items: tableData, ...args.pagingOptions });

  useMount(() => {
    setScrollContainer(document.querySelector('.reqore-content')!);
  });

  return (
    <ReqoreControlGroup vertical fluid key='paging-wrapper'>
      {paging.items.map((item) => (
        <ReqoreTag fixed='key' labelKey={item.id} label={`${item.firstName} ${item.lastName}`} />
      ))}
      <ReqorePagination<any>
        {...paging}
        {...args}
        scrollContainer={
          args.scrollToTopOnPageChange || !!args.changePageOnScroll ? scrollContainer : undefined
        }
      />
    </ReqoreControlGroup>
  );
};

export const Basic: Story = {
  render: Template,
};

export const NoPageButtons: Story = {
  render: Template,

  args: {
    showPages: false,
  },
};

export const NoControlButtons: Story = {
  render: Template,

  args: {
    showControls: false,
  },
};

export const ShowSomePages: Story = {
  render: Template,

  args: {
    pagingOptions: {
      pagesToShow: 4,
    },
  },
};

export const AsList: Story = {
  render: Template,

  args: {
    showPagesAs: 'list',
    pagingOptions: {
      pagesToShow: 5,
    },
  },
};

export const WithStyling: Story = {
  render: Template,

  args: {
    showPagesAs: 'buttons',
    activePageButtonProps: {
      effect: {
        gradient: {
          colors: 'info',
        },
      },
    },
    pageButtonProps: {
      effect: {
        gradient: {
          colors: 'warning',
        },
      },
    },
    controlPageButtonProps: {
      effect: {
        gradient: {
          colors: 'success',
        },
      },
    },
    pagingOptions: {
      pagesToShow: 15,
    },
  },
};

export const ListWithStyling: Story = {
  render: Template,

  args: {
    showPagesAs: 'list',
    activePageButtonProps: {
      effect: {
        gradient: {
          colors: 'info',
        },
      },
    },
    pageButtonProps: {
      effect: {
        gradient: {
          colors: 'warning',
        },
      },
    },
    listPageButtonProps: {
      isDefaultOpen: true,
      effect: {
        gradient: {
          colors: 'info',
        },
      },
    },
    controlPageButtonProps: {
      effect: {
        gradient: {
          colors: 'success',
        },
      },
    },
    pagingOptions: {
      pagesToShow: 15,
    },
  },
};

export const WithLabels: Story = {
  render: Template,

  args: {
    showPagesAs: 'list',
    showLabels: true,
    listPageButtonProps: {
      isDefaultOpen: true,
    },
    pagingOptions: {
      pagesToShow: 15,
    },
  },
};

export const NextPageOnVerticalScroll: Story = {
  render: Template,

  args: {
    changePageOnScroll: 'vertical',
  },
};

export const NextPageOnHorizontalScroll: Story = {
  render: Template,

  args: {
    changePageOnScroll: 'horizontal',
  },
};

export const ScrollToTop: Story = {
  render: Template,

  args: {
    scrollToTopOnPageChange: true,
    pagingOptions: {
      pagesToShow: 5,
      itemsPerPage: 100,
    },
  },
};

export const Infinite: Story = {
  render: Template,

  args: {
    showLabels: true,
    fluid: false,
    loadMoreButtonProps: {
      textAlign: 'center',
    },
    loadMoreLabel: 'Load 10 more',
    pagingOptions: {
      infinite: true,
    },
  },
};

export const InfiniteWithAutoScroll: Story = {
  render: Template,

  args: {
    showLabels: true,
    fluid: true,
    scrollOnLoadMore: true,
    loadMoreButtonProps: {
      textAlign: 'center',
      size: 'big',
    },
    loadAllButtonProps: {
      textAlign: 'center',
      size: 'big',
    },
    loadMoreLabel: 'Load 100 more',
    pagingOptions: {
      infinite: true,
      itemsPerPage: 100,
    },
  },
};

export const InfiniteWithAutoLoad: Story = {
  render: Template,

  args: {
    showLabels: true,
    fluid: true,
    autoLoadMore: true,
    scrollOnLoadMore: true,
    loadMoreButtonProps: {
      textAlign: 'center',
      icon: 'Loader5Line',
    },
    loadMoreLabel: 'Scroll to load 20 more',
    pagingOptions: {
      infinite: true,
      itemsPerPage: 20,
    },
  },
};
