import { TSizes } from '../../constants/sizes';
import { DEFAULT_INTENTS } from '../../constants/theme';
import Icons from '../../icons.json';
import { IReqoreIconName } from '../../types/icons';

export interface IArgData {
  description?: string;
  name?: string;
  control?: any;
  options?: string[];
  type?: string;
  table?: any;
}

export type TArg<T> = { [key: string]: (IArgData & { defaultValue?: T }) | undefined };
export type TDisabledArg = { [key: string]: { table: { disable: boolean } } };

export const argManager = <Target>() => {
  return {
    createArg<K extends keyof Target>(
      name: K,
      data: IArgData & { defaultValue?: Target[K] }
    ): TArg<Target[K]> {
      return {
        [name as string]: data,
      };
    },
    disableArg<K extends keyof Target>(name: K): TDisabledArg {
      return {
        [name]: {
          table: {
            disable: true,
          },
        },
      };
    },
    disableArgs<K extends keyof Target>(names: K[]): TDisabledArg {
      return names.reduce((newArgs: TDisabledArg, name) => {
        return {
          ...newArgs,
          ...{
            [name]: {
              table: {
                disable: true,
              },
            },
          },
        };
      }, {});
    },
  };
};

export const IconArg = (
  iconKeyName: string = 'icon',
  name?: string,
  defaultValue?: IReqoreIconName
) =>
  argManager<any>().createArg(iconKeyName, {
    defaultValue: defaultValue || (defaultValue === null ? null : '24HoursFill'),
    name: name || 'Icon',
    description: 'The icon name used',
    control: {
      type: 'select',
    },
    options: Icons,
  });

export const MinimalArg = (): TArg<any> => {
  return argManager<any>().createArg('minimal', {
    description: 'Whether the component should be minimal',
    name: 'Minimal',
    defaultValue: false,
    control: {
      type: 'boolean',
    },
  });
};

export const FlatArg = {
  ...argManager<any>().createArg('flat', {
    description: 'Whether the component should be flat',
    name: 'Flat',
    defaultValue: false,
    control: {
      type: 'boolean',
    },
  }),
};

export const NoContentArg = {
  ...argManager<any>().createArg('withoutContent', {
    defaultValue: true,
    table: {
      disable: true,
    },
  }),
};

export const SizeArg = {
  ...argManager<any>().createArg('size', {
    control: 'select',
    description: 'The size of the element',
    options: ['tiny', 'small', 'normal', 'big', 'huge'] as TSizes[],
    name: 'Size',
    defaultValue: 'normal' as TSizes,
    table: {
      defaultValue: { summary: 'normal' },
    },
  }),
};

export const GapSizeArg = {
  ...argManager<any>().createArg('gapSize', {
    control: 'select',
    description: 'The gap size of the elements',
    options: ['tiny', 'small', 'normal', 'big', 'huge'] as TSizes[],
    name: 'Gap Size',
    defaultValue: 'normal' as TSizes,
    table: {
      defaultValue: { summary: 'normal' },
    },
  }),
};

export const IntentArg = {
  ...argManager<any>().createArg('intent', {
    control: 'select',
    description: 'The intent of the element',
    options: Object.keys(DEFAULT_INTENTS),
    name: 'Intent',
  }),
};

export const CustomIntentArg = (key: string) => ({
  ...argManager<any>().createArg(key, {
    control: 'select',
    description: 'The custom intent',
    options: Object.keys(DEFAULT_INTENTS),
    name: 'Custom Intent',
  }),
});

export const DisabledArg = {
  ...argManager<any>().createArg('disabled', {
    control: 'boolean',
    description: 'Whether the element should be disabled',
    name: 'Disabled',
    defaultValue: false,
  }),
};
