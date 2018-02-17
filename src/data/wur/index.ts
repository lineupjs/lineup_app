import {IDataset} from '../IDataset';
import {builder} from 'lineupjs';

export const data: IDataset = {
  id: 'wur',
  title: 'World University Ranking',
  image: '',
  link: 'https://www.kaggle.com/mylesoneill/world-university-rankings/version/3',
  description: `<p>
  Of all the universities in the world, which are the best?
</p>
<p>
  Ranking universities is a difficult, political, and controversial practice. There are hundreds of different national and
  international university ranking systems, many of which disagree with each other. This dataset contains
  three global university rankings from very different places.
</p>`,
  rawData: '',
  buildScript: (rawVariable: string, domVariable: string) => {
    return `
  const parsed = Papa.parse(${rawVariable}, {
    dynamicTyping: true,
    header: true,
    skipEmptyLines: true
  });

  const lineup = LineUpJS.asLineUp(${domVariable}, parsed.data, ...parsed.meta.fields);
  `;
  },
  build: (node: HTMLElement) => {
    return builder([]).build(node);
  }
};

export default data;
