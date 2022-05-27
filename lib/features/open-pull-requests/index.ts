import { Feature } from '../types';
import { analyze } from './analyze';
import { fetch, ResponseData } from './fetch';
import { initializeFactory } from '../initialize';

export const initialize = initializeFactory<ResponseData>(Feature.OpenPullRequests, {
  analyze,
  fetch,
});
