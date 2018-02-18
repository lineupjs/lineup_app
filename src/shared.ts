import {IDataset} from './data';
import {LineUp} from 'lineupjs';


export const shared: {
  lineup: LineUp | null,
  dataset: IDataset | null
} = {lineup: null, dataset: null};

export default shared;
