import path from 'node:path';
import fs from 'node:fs';
import { formatJsonFile } from './format-json';

const basePath = path.join(process.cwd(), 'data');

export async function writeDataToFile(name: string, data: unknown): Promise<void> {
  const filePath = path.join(basePath, `${name}.json`);
  await fs.promises.writeFile(filePath, JSON.stringify(data));
  await formatJsonFile(filePath);
}

export async function readDataFromFile(name: string): Promise<unknown> {
  const filePath = path.join(basePath, `${name}.json`);
  try {
    const contents = await fs.promises.readFile(filePath);
    return JSON.parse(contents.toString());
  } catch {
    return undefined;
  }
}
