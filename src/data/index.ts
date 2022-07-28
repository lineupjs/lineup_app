import { IDataset } from './IDataset';
import { wur, shanghai } from './wur';
import forbes from './forbes-top-2000-companies';
import happiness from './world-happiness-report';
import soccer from './soccer';
import { ieeeheat, ieeebars } from './ieee-programming';
import { simple, big } from './simple';
import { listDatasets, listSessions } from './db';
import JSON_LOADER from './loader_json';
import CSV_LOADER from './loader_csv';
import { IDatasetMeta, PRELOADED_TYPE } from './IDataset';

export * from './IDataset';
export * from './ui';

const preloaded: IDataset[] = [soccer, wur, shanghai, forbes, happiness, ieeebars, ieeeheat, simple, big];

const loaders = [JSON_LOADER, CSV_LOADER];

function complete(db: IDataset | IDatasetMeta) {
  if (typeof (db as IDataset).build === 'function') {
    return db as IDataset;
  }

  for (const loader of loaders) {
    if (db.type === loader.type) {
      return loader.complete(db);
    }
  }

  if (db.type.startsWith(PRELOADED_TYPE)) {
    const id = db.type.slice(PRELOADED_TYPE.length + 1); // for -
    const preloadedDataset = preloaded.find((d) => d.id === id);
    if (preloadedDataset) {
      return Object.assign(db, {
        buildScript: preloadedDataset.buildScript,
        build: preloadedDataset.build,
        rawData: preloadedDataset.rawData,
      });
    }
  }
  return db as IDataset;
}

export function fromFile(file: File): Promise<IDataset> {
  for (const loader of loaders) {
    if (loader.supports(file)) {
      return loader.loadFile(file).then(complete);
    }
  }
  return Promise.reject(`unknown file type: ${file.name}`);
}

export function allDatasets() {
  return Promise.all([listDatasets(), listSessions()]).then(([ds, sessions]) => {
    const full = ds.map(complete).filter((d) => d != null) as IDataset[];
    const data = preloaded.concat(full);

    // insert sessions
    for (const d of data) {
      d.sessions = sessions.filter((s) => s.dataset === d.id);
    }

    return data;
  });
}
