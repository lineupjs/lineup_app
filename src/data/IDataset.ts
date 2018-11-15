import {LineUp, Taggle} from 'lineupjs';

export interface IDatasetMeta {
  id: string;
  type: string;
  creationDate: Date;
  title: string;
  image?: string;
  link?: string;
  description: string;

  rawData: string;
}

export interface IDataset extends IDatasetMeta {
  buildScript(rawVariable: string, domVariable: string): string;

  build(node: HTMLElement): Promise<LineUp | Taggle> | LineUp | Taggle;
}

export interface IDataLoader {
  type: string;
  supports(file: File): boolean;
  loadFile(file: File): Promise<IDataset>;

  complete(db: IDatasetMeta): IDataset;
}
