require('dotenv').config();

import { fetchOpenPullRequests } from './features/open-pull-requests';
import { writeDataToFile } from './utils/write-data';

const argv = process.argv.slice(2);

if (argv.includes('--fetch')) {
  fetchOpenPullRequests().then((data) => {
    if (data) {
      return writeDataToFile('open-pull-requests', data);
    }
  });
}
