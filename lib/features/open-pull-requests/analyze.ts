import { yellow, bold, gray, white } from 'kleur';
import { formatDateString, formatDateTimeString } from '../../utils/format-date';
import { PullRequest, ResponseData } from './fetch';

export type AnalyzeOptions = {
  groupByLabels: string[];
};

export function analyze(data: ResponseData, { groupByLabels }: AnalyzeOptions) {
  const pullRequests = data.repository?.pullRequests.nodes || [];
  if (pullRequests.length === 0) {
    console.log('No open pull requests found');
    return process.exit();
  }

  const oldest = pullRequests.filter(byNoDrafts).sort(byOldest).slice(0, 5);

  printStatistics(pullRequests, bold().green('Statistics'));
  if (groupByLabels.length) {
    printLabels(pullRequests, groupByLabels);
  }
  printPullRequestList(oldest, 'Oldest pull requests');
}

type Contributor = {
  login: string;
  pullRequests: PullRequest[];
};

function printStatistics(pullRequests: PullRequest[], title: string) {
  const total = pullRequests;
  const drafts = pullRequests.filter(byDrafts);
  const contributors = pullRequests.reduce<Contributor[]>((all, pr) => {
    const existing = all.find((a) => a.login === pr.author?.login);
    if (existing) {
      return all.map((a) => {
        if (a.login === pr.author?.login) {
          return { ...a, pullRequests: a.pullRequests.concat(pr) };
        }
        return a;
      });
    }
    return all.concat({
      login: pr.author!.login,
      pullRequests: [pr],
    });
  }, []);
  const mostByContributor = contributors.slice().sort(byContributions).at(0);
  const totalByContributor = contributors.reduce(
    (all, contributor) => {
      return {
        total: all.total + contributor.pullRequests.length,
        drafts: all.drafts + contributor.pullRequests.filter(byDrafts).length,
      };
    },
    { total: 0, drafts: 0 },
  );
  const averageByContributor = {
    total: +(totalByContributor.total / contributors.length).toFixed(2),
    drafts: +(totalByContributor.drafts / contributors.length).toFixed(2),
  };

  console.log(title);
  console.log(`Open PRs - ${total.length} (${drafts.length} drafts)`);
  console.log(`Contributors - ${contributors.length}`);
  if (mostByContributor) {
    const total = mostByContributor.pullRequests;
    const drafts = mostByContributor.pullRequests.filter(byDrafts);
    console.log(
      `Most contributions - ${mostByContributor.login} (${total.length} PRs, ${drafts.length} drafts)`,
    );
  }
  console.log(
    `Average per contributor - ${averageByContributor.total} PRs (${averageByContributor.drafts} drafts)`,
  );
  console.log();
}

function printLabels(pullRequests: PullRequest[], targetLabels: string[]) {
  const groupedByLabels = pullRequests.reduce<Record<string, PullRequest[]>>((all, pr) => {
    const labels = pr.labels?.nodes ?? [];
    labels.forEach(({ id, name }) => {
      if (!(targetLabels.includes(name) || targetLabels.includes(id))) return;
      if (!all[name]) {
        all[name] = [];
      }
      all[name]!.push(pr);
    });
    return all;
  }, {});
  const sortedByPullRequests = Object.entries(groupedByLabels).sort((a, b) => {
    return b[1].length - a[1].length;
  });

  for (const [label, pullRequests] of sortedByPullRequests) {
    printStatistics(pullRequests, bold().yellow(label));
  }
}

function printPullRequestList(pullRequests: PullRequest[], title: string) {
  console.log(bold().green(title));
  pullRequests.forEach((pr) => {
    console.log('-'.repeat(65));
    console.log(bold(`${yellow(`#${pr.number}`)} - ${pr.title}`));
    console.log(
      indent(
        pr,
        gray(`Opened by ${white(pr.author!.login)} on ${white(formatDateString(pr.createdAt))}`),
      ),
    );
    console.log(indent(pr, gray(`Last updated at ${white(formatDateTimeString(pr.updatedAt))}`)));
    console.log(indent(pr, gray(pr.url)));
  });
  console.log('-'.repeat(65));
}

function indent(pr: PullRequest, message: string) {
  const length = pr.number.toString().length + 4;
  return ' '.repeat(length) + message;
}

function byDrafts(pr: PullRequest) {
  return pr.isDraft;
}

function byNoDrafts(pr: PullRequest) {
  return !pr.isDraft;
}

function byOldest(a: PullRequest, b: PullRequest) {
  return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
}

function byContributions(a: Contributor, b: Contributor) {
  return b.pullRequests.length - a.pullRequests.length;
}
