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
          labels(first: 100) {
            nodes {
              id
              name
              color
            }
          }
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

export type PullRequest = {
  author: {
    login: string;
  } | null;
  createdAt: string;
  updatedAt: string;
  title: string;
  number: number;
  url: string;
  isDraft: boolean;
  labels: {
    nodes:
      | {
          id: string;
          name: string;
          color: string;
        }[]
      | null;
  } | null;
};

export type ResponseData = {
  repository: {
    pullRequests: {
      nodes: PullRequest[] | null;
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

type FetchDataOptions = {
  size?: number;
  after?: string | null;
};

async function fetchData(
  owner: string,
  repository: string,
  responses: ResponseData[] = [],
  { size = 100, after }: FetchDataOptions = {},
): Promise<ResponseData[]> {
  const response = await octokit.graphql<ResponseData>(query, {
    owner,
    name: repository,
    states: ['OPEN'],
    first: size,
    after,
  });
  const hasNextPage = response.repository?.pullRequests.pageInfo.hasNextPage;
  if (hasNextPage) {
    return fetchData(owner, repository, responses.concat(response), {
      after: response.repository?.pullRequests.pageInfo.endCursor,
    });
  }
  return responses.concat(response);
}

export type FetchOptions = {
  owner: string;
  repository: string;
};

export async function fetch({ owner, repository }: FetchOptions) {
  const responses = await fetchData(owner, repository);
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
