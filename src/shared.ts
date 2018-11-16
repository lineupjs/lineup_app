import {IDataset} from './data';
import {LineUp, Taggle} from 'lineupjs';
import {ISession} from './data/IDataset';

export const shared: {
  lineup: LineUp | Taggle | null,
  dataset: IDataset | null,
  session: ISession | null,
  datasets: IDataset[]
} = {lineup: null, dataset: null, datasets: [], session: null};

export default shared;
