import { readFileSync } from 'fs';
import { join } from 'path';

const yamlFilePath = join(__dirname, '../src/resources/application.yaml');

try {
  const yamlContent = readFileSync(yamlFilePath, 'utf8');
  const base64Content = Buffer.from(yamlContent, 'utf-8').toString('base64');

  console.log('✅ Base64 encoded application.yaml:');
  console.log(base64Content);
} catch (error) {
  console.error('Error reading application.yaml file:', error);
  process.exit(1);
}
