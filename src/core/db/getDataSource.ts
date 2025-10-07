import dataSource from './config';
import type { DataSource } from 'typeorm';

export async function getDataSource(): Promise<DataSource> {
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }

  return dataSource;
}
