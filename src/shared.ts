import type { ISession, IDataset } from './data';
import type { LineUp, Taggle } from 'lineupjs';

export const shared: {
  lineup: LineUp | Taggle | null;
  dataset: IDataset | null;
  session: ISession | null;
  datasets: IDataset[];
} = { lineup: null, dataset: null, datasets: [], session: null };

export default shared;
