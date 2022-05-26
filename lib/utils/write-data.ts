import * as path from 'node:path';
import * as fs from 'node:fs';
import { formatJsonFile } from './format-json';

const basePath = path.join(__dirname, '../../data');

export async function writeDataToFile(name: string, data: unknown) {
  const filePath = path.join(basePath, `${name}.json`);
  await fs.promises.writeFile(filePath, JSON.stringify(data));
  await formatJsonFile(filePath);
}
