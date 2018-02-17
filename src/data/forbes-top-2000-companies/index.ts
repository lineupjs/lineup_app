import {IDataset} from '../IDataset';
import {builder} from 'lineupjs';

export const data: IDataset = {
  id: 'forbes',
  title: 'Forbes Top 2000',
  image: '',
  link: 'https://www.kaggle.com/ash316/forbes-top-2000-companies',
  description: `<p>
  Every Year Forbes.com releases a list of Top 2000 companies worldwide. These companies are ranked by various metrics like
  the company size, its market value, sales, profit,etc.
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
