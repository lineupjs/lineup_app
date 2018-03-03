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
