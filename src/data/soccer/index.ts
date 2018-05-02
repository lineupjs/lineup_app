import {IDataset} from '../IDataset';
import {parse, ParseResult} from 'papaparse';
import {builder, buildRanking, buildStringColumn, buildCategoricalColumn, buildNumberColumn} from 'lineupjs';
import '!file-loader?name=preview.png!./soccer.png';

export const data: IDataset = {
  id: 'soccer',
  title: 'Soccer Stats',
  image: './preview.png',
  link: 'https://www.kaggle.com/gimunu/football-striker-performance',
  description: `<p>
  The aim of this dataset is to offer in a relatively small number of columns (~30) data to compare the performance of some football players, or to compare the efficiency of strikers in-between different European leagues.
</p>`,
  rawData: '',
  buildScript(rawVariable: string, domVariable: string) {
    return `
  const parsed = Papa.parse(${rawVariable}, {
    dynamicTyping: true,
    header: true,
    skipEmptyLines: true
  });

  parsed.data.forEach((row) => {
    const suffix = [12, 13, 14, 15, 16, 17];
    const cols = ['games', 'goals', 'minutes', 'assists'];
    cols.forEach((col) => {
      row[col] = suffix.map((d) => !row[col + d] && row[col + d] !== 0 ? null : row[col + d]);
    });
  });

  const lineup = LineUpJS.builder(parsed.data)
    .column(buildStringColumn('player'))
    .column(buildNumberColumn('age', [0, NaN]))
    .column(buildStringColumn('current_club'))
    .column(buildCategoricalColumn('current_league'))
    .column(buildCategoricalColumn('foot'))
    .column(buildNumberColumn('height', [0, NaN]))
    .column(buildStringColumn('nationality'))
    .column(buildCategoricalColumn('position'))
    .column(buildNumberColumn('games', [0, NaN]).asArray(4))
    .column(buildNumberColumn('goals', [0, NaN]).asArray(4))
    .column(buildNumberColumn('minutes', [0, NaN]).asArray(4))
    .column(buildNumberColumn('assists', [0, NaN]).asArray(4))
    .deriveColors()
    .ranking(buildRanking()
      .supportTypes()
      .allColumns()
    )
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
      parsed.data.forEach((row) => {
        const suffix = [12, 13, 14, 15, 16, 17];
        const cols = ['games', 'goals', 'minutes', 'assists'];
        cols.forEach((col) => {
          row[col] = suffix.map((d) => !row[`${col}${d}`] && row[`${col}${d}`] !== 0 ? null : row[`${col}${d}`]);
        });
      });
      return builder(parsed.data)
        .column(buildStringColumn('player'))
        .column(buildNumberColumn('age', [0, NaN]))
        .column(buildStringColumn('current_club'))
        .column(buildCategoricalColumn('current_league'))
        .column(buildCategoricalColumn('foot'))
        .column(buildNumberColumn('height', [0, NaN]))
        .column(buildStringColumn('nationality'))
        .column(buildCategoricalColumn('position'))
        .column(buildNumberColumn('games', [0, NaN]).asArray(4))
        .column(buildNumberColumn('goals', [0, NaN]).asArray(4))
        .column(buildNumberColumn('minutes', [0, NaN]).asArray(4))
        .column(buildNumberColumn('assists', [0, NaN]).asArray(4))
        .deriveColors()
        .ranking(buildRanking()
          .supportTypes()
          .allColumns()
        )
        .buildTaggle(node);
    });
  }
};

export default data;
