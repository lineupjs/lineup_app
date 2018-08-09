import {NumbersColumn, INumbersColumnDesc, ICategory, createNestedDesc, IDataProvider, NestedColumn, Column, toolbar} from 'lineupjs';

export interface IStratification {
  name: string;
  categories: (ICategory | string)[];
  data: string[];
}

export interface IMatrixColumnDesc extends INumbersColumnDesc {
  stratifications: IStratification[];
}

@toolbar('splitMatrix')
export default class MatrixColumn extends NumbersColumn {
  constructor(id: string, desc: Readonly<IMatrixColumnDesc>)  {
    super(id, desc);
  }

  getStratifications() {
    return (<IMatrixColumnDesc>this.desc).stratifications;
  }

  splitBy(stratification: IStratification, provider: IDataProvider) {
    const base = <NestedColumn>provider.create(createNestedDesc(`${this.label} by ${stratification.name}`));
    const w = this.getWidth();
    stratification.categories.forEach((group) => {
      const g = typeof group === 'string' ? { name: group, label: group, color: undefined } : group;
      const gcol = <MatrixColumn>provider.clone(this);
      // set group name
      gcol.setMetaData({ label: g.label || g.name, color: g.color || Column.DEFAULT_COLOR, description: '' });

      const length = stratification.data.reduce((a, s) => a + (s === g.name ? 1 : 0), 0);
      gcol.setSplicer({
        length,
        splice: (vs: any[]) => vs.filter((_v: any, i: number) => stratification.data[i] === g.name)
      });
      gcol.setWidth(w * length / stratification.data.length);

      base.push(gcol);
    });

    // replace with splitted value
    this.insertAfterMe(base);
    this.removeMe();
  }
}
