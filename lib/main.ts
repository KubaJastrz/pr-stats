import 'dotenv/config';
import minimist from 'minimist';
import prompts from 'prompts';
import { Feature } from './features';

type Argv = Partial<{
  reload: boolean;
  owner: string;
  repository: string;
  groupByLabels: string;
}>;

const argv = minimist<Argv>(process.argv.slice(2));

(async function run() {
  if (!argv.owner) {
    console.error('--owner is a required argument');
    return process.exit(1);
  }
  if (!argv.repository) {
    console.error('--repository is a required argument');
    return process.exit(1);
  }

  const { mode } = await prompts({
    type: 'select',
    name: 'mode',
    message: 'Which analytics to display?',
    choices: [
      {
        title: 'open pull requests',
        value: Feature.OpenPullRequests,
      },
      {
        title: '(wip) last week summary',
        value: Feature.LastWeek,
      },
    ],
  });

  switch (mode) {
    case Feature.OpenPullRequests: {
      (await import('./features/open-pull-requests')).initialize({
        reload: argv.reload ?? false,
        options: {
          owner: argv.owner,
          repository: argv.repository,
          groupByLabels: normalizeLabels(argv.groupByLabels),
        },
      });
      break;
    }

    case Feature.LastWeek: {
      console.log('wip');
      break;
    }
  }

  console.log();
})();

function normalizeLabels(labelString: string | undefined): string[] {
  return labelString?.split(',') ?? [];
}
