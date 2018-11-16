import {IDataset} from './data';
import {LineUp, Taggle} from 'lineupjs';


export const shared: {
  lineup: LineUp | Taggle | null,
  dataset: IDataset | null,
  datasets: IDataset[]
} = {lineup: null, dataset: null, datasets: []};

export default shared;
