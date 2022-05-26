import { ResponseData } from './fetch';

export function analyzeOpenPullRequests(data: ResponseData) {
  console.log(data.repository?.pullRequests.nodes?.length ?? 0);
}
