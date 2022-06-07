import { Feature } from '../types';
import { analyze, AnalyzeOptions } from './analyze';
import { fetch, ResponseData } from './fetch';
import { initializeFactory } from '../initialize';

type Options = AnalyzeOptions;

export const initialize = initializeFactory<ResponseData, Options>(Feature.OpenPullRequests, {
  analyze,
  fetch,
});
