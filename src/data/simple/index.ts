import {builder} from 'lineupjs';
import {IDataset, PRELOADED_TYPE} from '../IDataset';
import image from './simple.png';


export const simple: IDataset = {
  id: 'simple',
  type: PRELOADED_TYPE,
  creationDate: new Date(),
  name: 'Simple Random Dataset',
  image,
  description: `A random dataset to illustrate LineUp features`,
  rawData: '',
  buildScript(_rawVariable: string, domVariable: string, dumpVariable: string) {
    return `
// generate some data
const arr = [];
const cats = ['c1', 'c2', 'c3'];
for (let i = 0; i < 100; ++i) {
  arr.push({
    d: 'Row ' + i,
    a: Math.random() * 10,
    cat: cats[Math.floor(Math.random() * 3)],
    cat2: cats[Math.floor(Math.random() * 3)]
  });
}

const lineup = LineUpJS.builder(arr)
  .deriveColumns()
  .deriveColors()
  .restore(${dumpVariable})
  .build(${domVariable});
  `;
  },
  build(node: HTMLElement) {
    // generate some data
    const arr = [];
    const cats = ['c1', 'c2', 'c3'];
    for (let i = 0; i < 100; ++i) {
      arr.push({
        d: `Row ${i}`,
        a: Math.random() * 10,
        cat: cats[Math.floor(Math.random() * 3)],
        cat2: cats[Math.floor(Math.random() * 3)]
      });
    }

    return builder(arr)
    .deriveColumns()
    .deriveColors()
    .build(node);
  }
};
