import {IDataset, PRELOADED_TYPE} from '../IDataset';
import {parse, ParseResult} from 'papaparse';
import {builder, buildRanking, buildStringColumn, buildCategoricalColumn, buildNumberColumn} from 'lineupjs';
import '!file-loader?name=preview.png!./soccer.png';

export const data: IDataset = {
  id: 'soccer',
  type: PRELOADED_TYPE,
  creationDate: new Date(),
  name: 'Soccer Stats',
  image: './preview.png',
  link: 'https://www.kaggle.com/gimunu/football-striker-performance',
  description: `<p>
  The aim of this dataset is to offer in a relatively small number of columns (~30) data to compare the performance of some football players, or to compare the efficiency of strikers in-between different European leagues.
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

parsed.data.forEach((row) => {
  const suffix = [12, 13, 14, 15, 16, 17];
  const cols = ['games', 'goals', 'minutes', 'assists'];
  cols.forEach((col) => {
    row[col] = suffix.map((d) => !row[col + d] && row[col + d] !== 0 ? null : row[col + d]);
  });
});

const lineup = LineUpJS.builder(parsed.data)
  .column(LineUpJS.buildStringColumn('player'))
  .column(LineUpJS.buildNumberColumn('age', [0, NaN]))
  .column(LineUpJS.buildStringColumn('current_club'))
  .column(LineUpJS.buildCategoricalColumn('current_league'))
  .column(LineUpJS.buildCategoricalColumn('foot'))
  .column(LineUpJS.buildNumberColumn('height', [160, NaN]))
  .column(LineUpJS.buildStringColumn('nationality'))
  .column(LineUpJS.buildCategoricalColumn('position'))
  .column(LineUpJS.buildNumberColumn('games', [0, NaN]).asArray(4))
  .column(LineUpJS.buildNumberColumn('goals', [0, NaN]).asArray(4))
  .column(LineUpJS.buildNumberColumn('minutes', [0, NaN]).asArray(4))
  .column(LineUpJS.buildNumberColumn('assists', [0, NaN]).asArray(4))
  .deriveColors()
  .restore(dump)
  .buildTaggle(${domVariable});
`;
  },
  build(node: HTMLElement) {
    return import('raw-loader!./soccer.csv').then((content: any) => {
      const csv: string = content.default ? content.default : content;
      this.rawData = csv;
      return parse(csv, {
        dynamicTyping: true,
        header: true,
        skipEmptyLines: true
      });
    }).then((parsed: ParseResult) => {
      const suffix = [12, 13, 14, 15, 16, 17];
      const cols = ['games', 'goals', 'minutes', 'assists'];
      const labels = suffix.map((d) => `20${d}`);
      parsed.data.forEach((row) => {
        cols.forEach((col) => {
          row[col] = suffix.map((d) => !row[`${col}${d}`] && row[`${col}${d}`] !== 0 ? null : row[`${col}${d}`]);
        });
      });
      return builder(parsed.data)
        .column(buildStringColumn('player').width(150))
        .column(buildNumberColumn('age', [0, NaN]))
        .column(buildStringColumn('current_club').width(100))
        .column(buildCategoricalColumn('current_league'))
        .column(buildCategoricalColumn('foot'))
        .column(buildNumberColumn('height', [160, 210]))
        .column(buildStringColumn('nationality'))
        .column(buildCategoricalColumn('position'))
        .column(buildNumberColumn('games', [0, NaN]).asArray(labels).width(300))
        .column(buildNumberColumn('goals', [0, NaN]).asArray(labels).width(300))
        .column(buildNumberColumn('minutes', [0, NaN]).asArray(labels))
        .column(buildNumberColumn('assists', [0, NaN]).asArray(labels))
        .deriveColors()
        .ranking(buildRanking()
          .supportTypes()
          .column('player')
          .column('current_league')
          .column('current_club')
          .column('position')
          .column('foot')
          .column('age')
          .column('height')
          .column('goals')
          .column('games')
          //.allColumns()
        )
        .aggregationStrategy('group+top+item')
        .buildTaggle(node);
    });
  }
};

export default data;
