import 'dotenv/config';
import minimist from 'minimist';
import prompts from 'prompts';
import { Feature } from './features';

type Argv = {
  reload: boolean;
};

const argv = minimist<Argv>(process.argv.slice(2));

(async function run() {
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
        title: 'last week summary',
        value: Feature.LastWeek,
      },
    ],
  });

  switch (mode) {
    case Feature.OpenPullRequests: {
      (await import('./features/open-pull-requests')).initialize({
        reload: argv.reload,
      });
    }

    case Feature.LastWeek: {
    }
  }
})();
