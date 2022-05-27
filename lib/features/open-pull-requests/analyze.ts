import { ResponseData } from './fetch';

export function analyze(data: ResponseData) {
  console.log(data.repository?.pullRequests.nodes?.length ?? 0);
}
