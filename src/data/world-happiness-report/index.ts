import {IDataset, PRELOADED_TYPE} from '../IDataset';
import {parse, ParseResult} from 'papaparse';
import {builder, buildRanking, buildStringColumn, buildNumberColumn} from 'lineupjs';
import image from './happiness.png';
import {fixHeaders} from '../ùtils';

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
  buildScript(rawVariable: string, domVariable: string, dumpVariable: string) {
    return `
const parsed = Papa.parse(${rawVariable}, {
  dynamicTyping: true,
  header: true,
  skipEmptyLines: true
});
const dump = ${dumpVariable};

const lineup = LineUpJS.builder(parsed.data)
  .column(LineUpJS.buildStringColumn('Country'))
  .column(LineUpJS.buildNumberColumn('Happiness_Score', [0, 10]))
  .column(LineUpJS.buildNumberColumn('Economy_GDP_per_Capita_', [0, 10]))
  .column(LineUpJS.buildNumberColumn('Family', [0, 10]))
  .column(LineUpJS.buildNumberColumn('Health_Life_Expectancy_', [0, 10]))
  .column(LineUpJS.buildNumberColumn('Freedom', [0, 10]))
  .column(LineUpJS.buildNumberColumn('Generosity', [0, 10]))
  .column(LineUpJS.buildNumberColumn('Trust_Government_Corruption_', [0, 10]))
  .column(LineUpJS.buildNumberColumn('Dystopia_Residual', [0, 10]))
  .deriveColors()
  .restore(dump)
  .buildTaggle(${domVariable});
`;
  },
  build(node: HTMLElement) {
    return import('raw-loader!./2017.csv').then((content: any) => {
      const csv: string = content.default ? content.default : content;
      this.rawData = fixHeaders(csv);
      return parse(this.rawData, {
        dynamicTyping: true,
        header: true,
        skipEmptyLines: true
      });
    }).then((parsed: ParseResult) => {
      // "Country","Happiness.Rank","Happiness.Score","Whisker.high","Whisker.low","Economy..GDP.per.Capita.","Family","Health..Life.Expectancy.","Freedom","Generosity","Trust..Government.Corruption.","Dystopia.Residual"
      return builder(parsed.data)
        .column(buildStringColumn('Country'))
        .column(buildNumberColumn('Happiness_Score', [0, 10]))
        .column(buildNumberColumn('Economy_GDP_per_Capita_', [0, 10]))
        .column(buildNumberColumn('Family', [0, 10]))
        .column(buildNumberColumn('Health_Life_Expectancy_', [0, 10]))
        .column(buildNumberColumn('Freedom', [0, 10]))
        .column(buildNumberColumn('Generosity', [0, 10]))
        .column(buildNumberColumn('Trust_Government_Corruption_', [0, 10]))
        .column(buildNumberColumn('Dystopia_Residual', [0, 10]))
        .deriveColors()
        .ranking(buildRanking()
          .supportTypes()
          .allColumns()
          .sortBy('Happiness_Score', 'desc')
        )
        .buildTaggle(node);
    });
  }
};

export default data;
