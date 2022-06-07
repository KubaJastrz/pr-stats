import { readDataFromFile, writeDataToFile } from '../utils/data';
import { Feature } from './types';

type Options<TOptions = {}> = {
  reload: boolean;
  options: TOptions;
};

export function initializeFactory<TData = unknown, TOptions = {}>(
  feature: Feature,
  {
    fetch,
    analyze,
  }: {
    fetch: (options: TOptions) => Promise<TData | undefined>;
    analyze: (data: TData, options: TOptions) => void;
  },
) {
  return async function initialize({ reload, options }: Options<TOptions>) {
    let data = (await readDataFromFile(feature)) as unknown;

    if (reload || !data) {
      data = await fetchToFile(() => fetch(options));
    }

    if (!data) {
      console.error(`Missing data for ${feature}`);
      return process.exit(1);
    }

    analyze(data as TData, options);

    console.log();
  };
}

async function fetchToFile<T>(fetch: () => Promise<T>) {
  const freshData = await fetch();
  if (freshData) {
    await writeDataToFile(Feature.OpenPullRequests, freshData);
  }
  return freshData;
}
