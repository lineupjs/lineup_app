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
      datasets: '++uid,id,name,creationDate',
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
  const sessions = copy.sessions;
  delete copy.sessions;
  const add = db.datasets.add(copy).then((uid) => Object.assign(dataset, {uid}));

  if (!sessions || sessions.length === 0) {
    return add;
  }
  const s = sessions.map((s) => {
    const row: ISession = {
      dataset: dataset.id,
      creationDate: s.creationDate || new Date(),
      name: s.name,
      dump: s.dump
    };
    return db.sessions.add(row).then((uid) => Object.assign(row, {uid}));
  });
  return Promise.all<(IDataset | ISession)[]>([<any>add].concat(s)).then((r: any[]) => {
    const ds = <IDataset>r[0];
    ds.sessions = r.slice(1);
    return ds;
  });
}

export function editDataset(dataset: IDataset): Promise<IDataset> {
  return db.datasets.update((<any>dataset).uid, {
    name: dataset.name,
    description: dataset.description
  }).then(() => dataset);
}

function byCreationDate<T extends {creationDate: Date}>(arr: T[]) {
  for (const entry of arr) {
    entry.creationDate = entry.creationDate instanceof Date ? entry.creationDate : new Date(entry.creationDate);
  }
  return arr.sort((a, b) => b.creationDate.getTime() - a.creationDate.getTime());
}

export function listDatasets(): Promise<IDatasetMeta[]> {
  return db.datasets.toArray().then(byCreationDate);
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
    return db.sessions.toArray().then(byCreationDate);
  }
  return db.sessions.where('dataset').equals(dataset.id).toArray().then(byCreationDate);
}

export function deleteSession(session: ISession): Promise<any> {
  return db.sessions.delete(session.uid!);
}
