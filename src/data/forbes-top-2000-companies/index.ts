import {IDataset, PRELOADED_TYPE} from '../IDataset';
import {parse, ParseResult} from 'papaparse';
import {builder, buildRanking, buildStringColumn, buildCategoricalColumn, buildNumberColumn} from 'lineupjs';
import image from './forbes.png';

export const data: IDataset = {
  id: 'forbes',
  type: PRELOADED_TYPE,
  creationDate: new Date(),
  name: 'Forbes Top 2000',
  image,
  link: 'https://www.kaggle.com/ash316/forbes-top-2000-companies',
  description: `<p>
  Every Year Forbes.com releases a list of Top 2000 companies worldwide. These companies are ranked by various metrics like
  the company size, its market value, sales, profit,etc.
</p>`,
  rawData: '',
  buildScript(rawVariable: string, domVariable: string, dumpVariable: string) {
    return `
const parsed = Papa.parse(${rawVariable}, {
  dynamicTyping: true,
  header: true,
  skipEmptyLines: true
});
const dump = ${dumpVariable};

const lineup = LineUpJS.builder(parsed.data)
  .column(LineUpJS.buildStringColumn('Company'))
  .column(LineUpJS.buildStringColumn('Country'))
  .column(LineUpJS.buildNumberColumn('Rank'))
  .column(LineUpJS.buildNumberColumn('Sales'))
  .column(LineUpJS.buildNumberColumn('Market Value'))
  .column(LineUpJS.buildNumberColumn('Profits'))
  .column(LineUpJS.buildNumberColumn('Assets'))
  .column(LineUpJS.buildCategoricalColumn('Sector'))
  .column(LineUpJS.buildStringColumn('Industry'))
  .deriveColors()
  .restore(dump)
  .buildTaggle(${domVariable});
  `;
  },
  build(node: HTMLElement) {
    return import('raw-loader!./Forbes Top2000 2017.csv').then((content: any) => {
      const csv: string = content.default ? content.default : content;
      this.rawData = csv;
      return parse(csv, {
        dynamicTyping: true,
        header: true,
        skipEmptyLines: true
      });
    }).then((parsed: ParseResult) => {
      return builder(parsed.data)
        .column(buildStringColumn('Company'))
        .column(buildStringColumn('Country'))
        .column(buildNumberColumn('Rank').label('Forbes Rank'))
        .column(buildNumberColumn('Sales'))
        .column(buildNumberColumn('Market Value'))
        .column(buildNumberColumn('Profits'))
        .column(buildNumberColumn('Assets'))
        .column(buildCategoricalColumn('Sector'))
        .column(buildStringColumn('Industry'))
        .deriveColors()
        .ranking(buildRanking()
          .supportTypes()
          .allColumns()
          .sortBy('Forbes Rank', 'asc')
        )
        .buildTaggle(node);
    });
  }
};

export default data;
