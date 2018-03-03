import {IDataset} from './data';
import {LineUp, Taggle} from 'lineupjs';


export const shared: {
  lineup: LineUp | Taggle | null,
  dataset: IDataset | null
} = {lineup: null, dataset: null};

export default shared;
