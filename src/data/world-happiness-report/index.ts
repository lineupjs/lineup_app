import {IDataset, PRELOADED_TYPE} from '../IDataset';
import {parse, ParseResult} from 'papaparse';
import {builder, buildRanking, buildStringColumn, buildNumberColumn} from 'lineupjs';
import image from './happiness.png';
import {normalize} from '../ùtils';

export const data: IDataset = {
  id: 'happiness',
  type: PRELOADED_TYPE,
  creationDate: new Date(),
  name: 'World Happiness Report',
  image,
  link: 'https://www.kaggle.com/unsdsn/world-happiness',
  description: `<p>The World Happiness Report is a landmark survey of the state of global happiness. The first report was published in 2012,
  the second in 2013, the third in 2015, and the fourth in the 2016 Update. The World Happiness 2017, which
  ranks 155 countries by their happiness levels, was released at the United Nations at an event celebrating
  International Day of Happiness on March 20th.</p>`,
  rawData: '',
  buildScript(rawVariable: string, domVariable: string) {
    return `
    const parsed = Papa.parse(${rawVariable}, {
      dynamicTyping: true,
      header: true,
      skipEmptyLines: true
    });

    const lineup = LineUpJS.builder(parsed.data)
      .column(LineUpJS.buildStringColumn('Country'))
      .column(LineUpJS.buildNumberColumn('Happiness.Score', [0, 10]))
      .column(LineUpJS.buildNumberColumn('Economy..GDP.per.Capita.', [0, 10]))
      .column(LineUpJS.buildNumberColumn('Family', [0, 10]))
      .column(LineUpJS.buildNumberColumn('Health..Life.Expectancy.', [0, 10]))
      .column(LineUpJS.buildNumberColumn('Freedom', [0, 10]))
      .column(LineUpJS.buildNumberColumn('Generosity', [0, 10]))
      .column(LineUpJS.buildNumberColumn('Trust..Government.Corruption.', [0, 10]))
      .column(LineUpJS.buildNumberColumn('Dystopia.Residual', [0, 10]))
      .deriveColors()
      .ranking(LineUpJS.buildRanking()
        .supportTypes()
        .allColumns()
        .sortBy('Happiness.Score', 'desc')
      )
      .buildTaggle(${domVariable});
    `;
  },
  build(node: HTMLElement) {
    return import('raw-loader!./2017.csv').then((content: any) => {
      const csv: string = content.default ? content.default : content;
      this.rawData = csv;
      return parse(csv, <any>{
        dynamicTyping: true,
        header: true,
        skipEmptyLines: true,
        transformHeader: normalize
      });
    }).then((parsed: ParseResult) => {
      // "Country","Happiness.Rank","Happiness.Score","Whisker.high","Whisker.low","Economy..GDP.per.Capita.","Family","Health..Life.Expectancy.","Freedom","Generosity","Trust..Government.Corruption.","Dystopia.Residual"
      return builder(parsed.data)
        .column(buildStringColumn('country'))
        .column(buildNumberColumn('happiness_score', [0, 10]))
        .column(buildNumberColumn('economy_gdp_per_capita.', [0, 10]))
        .column(buildNumberColumn('family', [0, 10]))
        .column(buildNumberColumn('health_life_expectancy', [0, 10]))
        .column(buildNumberColumn('freedom', [0, 10]))
        .column(buildNumberColumn('generosity', [0, 10]))
        .column(buildNumberColumn('trust_government_corruption', [0, 10]))
        .column(buildNumberColumn('dystopia_residual', [0, 10]))
        .deriveColors()
        .ranking(buildRanking()
          .supportTypes()
          .allColumns()
          .sortBy('happiness_score', 'desc')
        )
        .buildTaggle(node);
    });
  }
};

export default data;
