import Dexie from 'dexie';
import {IDatasetMeta, IDataset, ISession} from './IDataset';

const SCHEMA_VERSION = 1;

//
// Declare Database
//
class LineUpDB extends Dexie {
  datasets: Dexie.Table<IDatasetMeta, number>;
  sessions: Dexie.Table<ISession, number>;

  constructor() {
    super('LineUp App DB');
    this.version(SCHEMA_VERSION).stores({
      datasets: '++uid,id,title,creationDate',
      sessions: '++uid,dataset,creationDate'
    });
    // hack for linting
    this.datasets = (<any>this).datasets || <any>undefined;
    this.sessions = (<any>this).sessions || <any>undefined;
  }
}

const db = new LineUpDB();

export function storeDataset(dataset: IDataset): Promise<IDataset> {
  const copy = Object.assign({}, dataset);
  delete copy.build;
  delete copy.buildScript;
  delete copy.sessions;
  return db.datasets.add(copy).then((uid) => Object.assign(copy, {uid}));
}

export function listDatasets(): Promise<IDatasetMeta[]> {
  return db.datasets.orderBy('creationDate').toArray();
}

export function deleteDataset(dataset: IDatasetMeta): Promise<any> {
  return db.transaction('rw', db.datasets, db.sessions, () => Promise.all([
    db.sessions.where('dataset').equals(dataset.id).delete(),
    db.datasets.where('id').equals(dataset.id).delete()
  ]));
}

export function storeSession(dataset: IDatasetMeta, name: string, dump: any) {
  const row: ISession = {
    dataset: dataset.id,
    creationDate: new Date(),
    name,
    dump
  };
  return db.sessions.add(row).then((uid) => Object.assign(row, {uid}));
}

export function listSessions(dataset?: IDatasetMeta): Promise<ISession[]> {
  if (!dataset) {
    return db.sessions.toArray();
  }
  return db.sessions.where('dataset').equals(dataset.id).toArray();
}

export function deleteSession(session: ISession): Promise<any> {
  return db.sessions.delete(session.uid!);
}
