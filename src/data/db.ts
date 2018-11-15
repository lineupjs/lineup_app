import Dexie from 'dexie';
import {ILocalDataset} from './IDataset';

const SCHEMA_VERSION = 1;

interface IDBDataset {
  uid?: number;
  id: string;
  creationDate: Date;
  title: string;
  description: string;
  rawData: string;
  type: string;
}

interface IDBSession {
  uid?: number; // auto increment;
  dataset: number; // <-> IDBDataset.id
  date: Date;
  dump: any;
}

//
// Declare Database
//
class LineUpDB extends Dexie {
  datasets: Dexie.Table<IDBDataset, string>;
  sessions: Dexie.Table<IDBSession, number>;

  constructor() {
    super('LineUp App DB');
    this.version(SCHEMA_VERSION).stores({
      datasets: '++uid,id,title',
      sessions: '++uid,dataset,date'
    });
    // hack for linting
    this.datasets = (<any>this).datasets || <any>undefined;
    this.sessions = (<any>this).sessions || <any>undefined;
  }
}

const db = new LineUpDB();

export function storeDataset(dataset: ILocalDataset): Promise<IDBDataset> {
  const row: IDBDataset = {
    id: dataset.id,
    creationDate: new Date(),
    title: dataset.title,
    description: dataset.description,
    rawData: dataset.rawData,
    type: dataset.type
  };
  return db.datasets!.add(row).then(() => row);
}

export function listDatasets(): Promise<IDBDataset[]> {
  function parse(d: IDBDataset) {
    d.creationDate = new Date(d.creationDate);
    return d;
  }
  return db.datasets!.orderBy('creationDate').toArray((r) => r.map(parse));
}
