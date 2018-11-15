import Dexie from 'dexie';
import {IDatasetMeta, IDataset} from './IDataset';

const SCHEMA_VERSION = 1;

interface IDBSession {
  uid?: number; // auto increment;
  dataset: string; // <-> IDBDataset.id
  creationDate: Date;
  dump: any;
}

//
// Declare Database
//
class LineUpDB extends Dexie {
  datasets: Dexie.Table<IDatasetMeta, number>;
  sessions: Dexie.Table<IDBSession, number>;

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

export function storeDataset(dataset: IDataset): Promise<any> {
  const copy = Object.assign({}, dataset);
  delete copy.build;
  delete copy.buildScript;
  return db.datasets.add(copy);
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

export function storeSession(dataset: IDatasetMeta, dump: any) {
  const row: IDBSession = {
    dataset: dataset.id,
    creationDate: new Date(),
    dump
  };
  return db.sessions.add(row).then(() => row);
}

export function listSessions(dataset: IDatasetMeta): Promise<IDBSession[]> {
  function parse(d: IDBSession) {
    d.creationDate = new Date(d.creationDate);
    return d;
  }
  return db.sessions.where('dataset').equals(dataset.id).toArray((r) => r.map(parse));
}

export function deleteSession(session: IDBSession): Promise<any> {
  return db.sessions.delete(session.uid!);
}
