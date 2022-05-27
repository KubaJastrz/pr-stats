import { readDataFromFile, writeDataToFile } from '../utils/data';
import { Feature } from './types';

type Options = {
  reload: boolean;
};

export function initializeFactory<TData = unknown, TOptions = {}>(
  feature: Feature,
  {
    fetch,
    analyze,
  }: {
    fetch: () => Promise<TData | undefined>;
    analyze: (data: TData) => void;
  },
) {
  return async function initialize({ reload }: TOptions & Options) {
    let data = (await readDataFromFile(feature)) as unknown;

    if (reload || !data) {
      data = await fetchToFile(fetch);
    }

    if (!data) {
      console.error(`Missing data for ${feature}`);
      return process.exit(1);
    }

    analyze(data as TData);
  };
}

async function fetchToFile<T>(fetch: () => Promise<T>) {
  const freshData = await fetch();
  if (freshData) {
    await writeDataToFile(Feature.OpenPullRequests, freshData);
  }
  return freshData;
}
