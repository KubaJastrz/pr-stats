import { format } from 'prettier';
import * as fs from 'node:fs';

export async function formatJsonFile(uri: string) {
  const contents = await fs.promises.readFile(uri);
  const formatted = format(contents.toString(), {
    parser: 'json',
  });
  return fs.promises.writeFile(uri, formatted);
}
