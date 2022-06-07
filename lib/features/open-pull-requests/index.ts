import { Feature } from '../types';
import { analyze, AnalyzeOptions } from './analyze';
import { fetch, FetchOptions, ResponseData } from './fetch';
import { initializeFactory } from '../initialize';

type Options = AnalyzeOptions & FetchOptions;

export const initialize = initializeFactory<ResponseData, Options>(Feature.OpenPullRequests, {
  analyze,
  fetch,
});
