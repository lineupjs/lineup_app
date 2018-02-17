import {IDataset} from '../IDataset';
import {builder} from 'lineupjs';

export const data: IDataset = {
  id: 'happiness',
  title: 'World Happiness Report',
  image: '',
  link: 'https://www.kaggle.com/unsdsn/world-happiness',
  description: `<p>The World Happiness Report is a landmark survey of the state of global happiness. The first report was published in 2012,
  the second in 2013, the third in 2015, and the fourth in the 2016 Update. The World Happiness 2017, which
  ranks 155 countries by their happiness levels, was released at the United Nations at an event celebrating
  International Day of Happiness on March 20th.</p>`,
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
