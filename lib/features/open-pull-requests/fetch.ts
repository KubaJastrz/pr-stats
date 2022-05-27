import { octokit } from '../../octokit';

const query = /* GraphQL */ `
  query GetPullRequestData(
    $owner: String!
    $name: String!
    $states: [PullRequestState!]
    $first: Int
    $after: String
  ) {
    repository(owner: $owner, name: $name) {
      pullRequests(states: $states, first: $first, after: $after) {
        nodes {
          author {
            login
          }
          createdAt
          updatedAt
          title
          number
          url
          isDraft
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
    rateLimit {
      cost
      limit
      remaining
      resetAt
    }
  }
`;

export type ResponseData = {
  repository: {
    pullRequests: {
      nodes:
        | {
            author: {
              login: string;
            } | null;
            createdAt: string;
            updatedAt: string;
            title: string;
            number: number;
            url: string;
            isDraft: boolean;
          }[]
        | null;
      pageInfo: {
        hasNextPage: boolean;
        endCursor: string | null;
      };
    };
  } | null;
  rateLimit: {
    cost: number;
    limit: number;
    remaining: number;
    resetAt: string;
  };
};

type FetchOptions = {
  size?: number;
  after?: string | null;
};

async function fetchData(
  responses: ResponseData[] = [],
  { size = 100, after }: FetchOptions = {},
): Promise<ResponseData[]> {
  const response = await octokit.graphql<ResponseData>(query, {
    owner: 'RampNetwork',
    name: 'ramp-instant',
    states: ['OPEN'],
    first: size,
    after,
  });
  responses.push(response);
  const hasNextPage = response.repository?.pullRequests.pageInfo.hasNextPage;
  if (hasNextPage) {
    return fetchData(responses.concat(response), {
      after: response.repository?.pullRequests.pageInfo.endCursor,
    });
  }
  return responses;
}

export async function fetch() {
  const responses = await fetchData();
  const final = responses[0];
  if (!final) return;

  responses.slice(1).forEach((response) => {
    final.repository?.pullRequests.nodes?.push(...(response.repository?.pullRequests.nodes ?? []));
    final.rateLimit = {
      ...response.rateLimit,
      cost: final.rateLimit.cost + response.rateLimit.cost,
    };
  });

  // @ts-expect-error
  final._meta = {
    savedAt: new Date().toISOString(),
  };

  return final;
}
