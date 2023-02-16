import { Story, StoryObj } from '@storybook/react/types-6-0';
import { IReqorePaginationProps, ReqorePagination } from '../../components/Paging';
import { IReqorePagingOptions } from '../../hooks/usePaging';
import { ReqoreControlGroup, ReqoreTag, useReqorePaging } from '../../index';
import { tableData } from '../../mock/tableData';

export default {
  title: 'Components/Paging',
} as StoryObj<typeof ReqorePagination>;

const Template: Story<IReqorePaginationProps<any> & { pagingOptions?: IReqorePagingOptions<any> }> =
  (args) => {
    const paging = useReqorePaging<any>({ items: tableData, ...args.pagingOptions });

    return (
      <ReqoreControlGroup vertical fluid>
        {paging.items.map((item) => (
          <ReqoreTag fixed='key' labelKey={item.id} label={`${item.firstName} ${item.lastName}`} />
        ))}
        <ReqorePagination<any> {...paging} {...args} />
      </ReqoreControlGroup>
    );
  };

export const Basic = Template.bind({});
export const NoPageButtons = Template.bind({});
NoPageButtons.args = {
  showPages: false,
};

export const NoControlButtons = Template.bind({});
NoControlButtons.args = {
  showControls: false,
};

export const ShowSomePages = Template.bind({});
ShowSomePages.args = {
  pagingOptions: {
    pagesToShow: 4,
  } as IReqorePagingOptions<any>,
};
export const AsList = Template.bind({});
AsList.args = {
  showPagesAs: 'list',
  pagingOptions: {
    pagesToShow: 5,
  } as IReqorePagingOptions<any>,
};

export const ShowAllPages = Template.bind({});
ShowAllPages.args = {
  showPagesAs: 'list',
};

export const WithStyling: Story<
  IReqorePaginationProps<any> & { pagingOptions?: IReqorePagingOptions<any> }
> = Template.bind({});
WithStyling.args = {
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
  } as IReqorePagingOptions<any>,
};

export const ListWithStyling: Story<
  IReqorePaginationProps<any> & { pagingOptions?: IReqorePagingOptions<any> }
> = Template.bind({});
ListWithStyling.args = {
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
  } as IReqorePagingOptions<any>,
};

export const WithLabels: Story<
  IReqorePaginationProps<any> & { pagingOptions?: IReqorePagingOptions<any> }
> = Template.bind({});
WithLabels.args = {
  showPagesAs: 'list',
  showLabels: true,
  listPageButtonProps: {
    isDefaultOpen: true,
  },
  pagingOptions: {
    pagesToShow: 15,
  } as IReqorePagingOptions<any>,
};
