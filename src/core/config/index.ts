import { readFileSync } from 'fs';
import { join } from 'path';
import 'reflect-metadata';

import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import * as yaml from 'js-yaml';

import { Config } from './Config';

const configFilePath = '../../resources/application.yaml';

const applicationYamlBase64 = process.env.APPLICATION_YAML;
const applicationYamlContent = applicationYamlBase64
  ? Buffer.from(applicationYamlBase64, 'base64').toString('utf-8')
  : readFileSync(join(__dirname, configFilePath), 'utf8');

export const config: Config = plainToInstance(
  Config,
  yaml.load(applicationYamlContent),
);

// eslint-disable-next-line @typescript-eslint/no-floating-promises
validate(config).then((errors) => {
  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
});
