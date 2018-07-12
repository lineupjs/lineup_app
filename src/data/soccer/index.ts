import { IDataset } from '../IDataset';
import { parse, ParseResult } from 'papaparse';
import { builder, buildRanking, buildStringColumn, buildCategoricalColumn, buildNumberColumn } from 'lineupjs';
import '!file-loader?name=preview.png!./soccer.png';
import { splitMatrix, MatrixColumn, IStratification } from '../../model';


function stratifications(): IStratification[] {
  const descs = [
    {
      name: 'season',
      value: {
        categories: [
          '12/13',
          '13/14',
          '14/15',
          '15/16',
          '16/17',
          '17/18',
        ]
      }
    }
  ];

  return descs.map((d) => {
    return {
      name: d.name,
      categories: d.value.categories,
      data: d.value.categories
    };
  });
}

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
    .column(buildStringColumn('player').width(150))
    .column(buildNumberColumn('age', [0, NaN]))
    .column(buildStringColumn('current_club').width(150).label('Current Club'))
    .column(buildCategoricalColumn('current_league').label('Current League'))
    .column(buildCategoricalColumn('foot'))
    .column(buildNumberColumn('height', [0, NaN]))
    .column(buildStringColumn('nationality'))
    .column(buildCategoricalColumn('position'))
    .column(buildNumberColumn('games', [0, NaN]).asArray(6).width(300))
    .column(buildNumberColumn('goals', [0, NaN]).asArray(6).width(300))
    .column(buildNumberColumn('minutes', [0, NaN]).asArray(6).width(300)))
    .column(buildNumberColumn('assists', [0, NaN]).asArray(6).width(300))
    .deriveColors()
    .ranking(buildRanking()
      .aggregate()
      .group()
      .rank()
      .selection()
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
        .registerColumnType('matrix', MatrixColumn)
        .registerToolbarAction('splitMatrix', splitMatrix)
        .column(buildStringColumn('player').width(150))
        .column(buildNumberColumn('age', [0, NaN]))
        .column(buildStringColumn('current_club').width(150).label('Current Club'))
        .column(buildCategoricalColumn('current_league').label('Current League'))
        .column(buildCategoricalColumn('foot'))
        .column(buildNumberColumn('height', [0, NaN]))
        .column(buildStringColumn('nationality'))
        .column(buildCategoricalColumn('position'))
        .column(buildNumberColumn('games', [0, NaN]).asArray(6).width(300).custom('type', 'matrix').custom('stratificatins', stratifications))
        .column(buildNumberColumn('goals', [0, NaN]).asArray(6).width(300).custom('type', 'matrix').custom('stratificatins', stratifications))
        .column(buildNumberColumn('minutes', [0, NaN]).asArray(6).width(300).custom('type', 'matrix').custom('stratificatins', stratifications))
        .column(buildNumberColumn('assists', [0, NaN]).asArray(6).width(300).custom('type', 'matrix').custom('stratificatins', stratifications))
        .deriveColors()
        .ranking(buildRanking()
          .aggregate()
          .group()
          .rank()
          .selection()
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
        .buildTaggle(node);
    });
  }
};

export default data;
