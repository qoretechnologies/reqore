import { StoryObj } from '@storybook/react';
import { useState } from 'react';
import { useMount } from 'react-use';
import { ReqorePagination } from '../../components/Paging';
import { ReqoreControlGroup, ReqoreTag, useReqorePaging } from '../../index';
import { TestTableItem, tableData } from '../../mock/tableData';
import { StoryMeta, StoryRenderer } from '../utils';

const meta = {
  title: 'Collections/Paging',
  component: ReqorePagination,
} as StoryMeta<typeof ReqorePagination<TestTableItem>>;

export default meta;
type Story = StoryObj<typeof meta>;
type StoryType = typeof ReqorePagination<TestTableItem> & any;

const Template: StoryRenderer<StoryType> = (args) => {
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
  parameters: {
    docs: {
      description: {
        story:
          'Renders Pagination in its default configuration.',
      },
    },
  },
  render: Template,
};

export const NoPageButtons: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Pagination without numbered page buttons.',
      },
    },
  },
  render: Template,

  args: {
    showPages: false,
  },
};

export const NoControlButtons: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Pagination without control buttons.',
      },
    },
  },
  render: Template,

  args: {
    showControls: false,
  },
};

export const ShowSomePages: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Pagination showing only a slice of the page buttons.',
      },
    },
  },
  render: Template,

  args: {
    pagingOptions: {
      pagesToShow: 4,
    },
  },
};

export const AsList: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Pagination in its list variant.',
      },
    },
  },
  render: Template,

  args: {
    showPagesAs: 'list',
    pagingOptions: {
      pagesToShow: 5,
    },
  },
};

export const WithStyling: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Pagination with additional inline styling.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          'Renders Pagination list with additional inline styling.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          'Renders Pagination with labels applied.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          'Renders Pagination and advances to the next page on vertical scroll.',
      },
    },
  },
  render: Template,

  args: {
    changePageOnScroll: 'vertical',
  },
};

export const NextPageOnHorizontalScroll: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Pagination and advances to the next page on horizontal scroll.',
      },
    },
  },
  render: Template,

  args: {
    changePageOnScroll: 'horizontal',
  },
};

export const ScrollToTop: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Pagination with a scroll-to-top control.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          'Renders Pagination with infinite scroll enabled.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          'Renders Pagination with infinite scroll and auto-scroll enabled.',
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story:
          'Renders Pagination with infinite scroll and auto-load enabled.',
      },
    },
  },
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
