import {LineUp, Taggle} from 'lineupjs';

export interface IDataset {
  id: string;
  title: string;
  image?: string;
  link?: string;
  description: string;

  rawData: string;

  buildScript(rawVariable: string, domVariable: string): string;

  build(node: HTMLElement): Promise<LineUp | Taggle> | LineUp | Taggle;
}

export interface ILocalDataset extends IDataset {
  type: 'json' | 'csv';
}

export interface IDataLoader {
  type: string;
  supports(file: File): boolean;
  loadFile(file: File): Promise<ILocalDataset>;

  complete(db: Partial<ILocalDataset>): ILocalDataset;
}
