import JSON_LOADER from './loader_json';
import CSV_LOADER from './loader_csv';
import {ILocalDataset} from './IDataset';

export const loaders = [JSON_LOADER, CSV_LOADER];


export function fromFile(file: File): Promise<ILocalDataset> {
  for (const loader of loaders) {
    if (loader.supports(file)) {
      return loader.loadFile(file);
    }
  }
  return Promise.reject(`unknown file type: ${file.name}`);
}

export function complete(db: Partial<ILocalDataset>) {
  for (const loader of loaders) {
    if (db.type === loader.type) {
      return loader.complete(db);
    }
  }
  throw new Error('unknown loaded dataset no handler for');
}
