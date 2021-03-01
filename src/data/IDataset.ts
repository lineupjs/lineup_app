import { LineUp, Taggle } from 'lineupjs';

export const PRELOADED_TYPE = 'preloaded';

export interface IDatasetMeta {
  id: string;
  type: string;
  creationDate: Date;
  name: string;
  image?: string;
  link?: string;
  description: string;

  rawData: string;
}

export interface ISession {
  uid?: number; // auto increment;
  dataset: string; // <-> IDBDataset.id
  name: string;
  creationDate: Date;
  dump: any; // TOOD typing
}

export interface IDataset extends IDatasetMeta {
  buildScript(rawVariable: string, domVariable: string, dumpVariable: string): string;

  build(node: HTMLElement): Promise<LineUp | Taggle> | LineUp | Taggle;

  dump?: any; // TODO typing
  sessions?: ISession[];
}

export interface IDataLoader {
  type: string;
  supports(file: File): boolean;
  loadFile(file: File): Promise<IDataset | IDatasetMeta>;

  complete(db: IDatasetMeta): IDataset;
}
