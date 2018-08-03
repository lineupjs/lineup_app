import {IDataset} from '../IDataset';
import {parse, ParseResult} from 'papaparse';
import {builder, buildRanking, buildStringColumn, buildCategoricalColumn, buildNumberColumn} from 'lineupjs';

import imageYears from './ieee_years.png';

export const ieeeyears: IDataset = {
  id: 'ieee_years',
  title: 'IEEE Programming Languages',
  image: imageYears,
  description: `<p>
  55 programming languages are compared by 11 metrics from 2014 to 2018.
  For each year, the languages are ranked by their total popularity accross all metrics.
</p>
  <p>Source: <a href="https://spectrum.ieee.org/static/ieee-top-programming-languages-2018-methods">IEEE Spectrum</a></p>`,
  rawData: '',
  buildScript(rawVariable: string, domVariable: string) {
    return `
  const parsed = Papa.parse(${rawVariable}, {
    dynamicTyping: true,
    header: true,
    skipEmptyLines: true
  });

  const years = [2014, 2015, 2016, 2017, 2018]; // 5 years
      const sources = ['Career Builder', 'Dice', 'Github (active)', 'Github (created)', 'Google Search', 'Google Trends', 'Hacker News', 'IEEE Xplore', 'Reddit (posts)', 'Stack Overflow (?s)', 'Stack Overflow (views)', 'Twitter']; // 12 sources

      // //Merge data of multiple years for each source
      parsed.data.forEach((row) => {
        sources.forEach((source) => {
          row[source] = years.map((y) => !row[source + ' ' + y] && row[source + ' ' + y] !== 0 ? null : row[source + ' ' + y]);
        });
      });

      // basic data
      let dataBuilder = builder(parsed.data)
        .column(buildStringColumn('name'))
        .column(buildCategoricalColumn('web'))
        .column(buildCategoricalColumn('mobile'))
        .column(buildCategoricalColumn('enterprise'))
        .column(buildCategoricalColumn('embedded'))
        .column(buildNumberColumn('NA 2018')); // NA column of 2018

      // source matrices
      sources.forEach((source) => {
        dataBuilder = dataBuilder.column(buildNumberColumn(source).asArray(years.length))
      });

      // rankings per year, begin with 2018
      years.reverse().forEach((year) => {
        let columnNamesAndWeights: (string | number)[] = [];

        sources.forEach((source) => {
          const colName = source + ' ' + year;
          dataBuilder = dataBuilder.column(buildNumberColumn(colName)) //Create a column to use it for the ranking
          if (parsed.data[0] && parsed.data[0][colName]) // avoid NaN columns (e.g. Google Trends 2018)
            columnNamesAndWeights.push(...[colName, 1]); // all columns have weight 1
        });

        dataBuilder = dataBuilder.ranking(
          buildRanking()
            .weightedSum('' + year, <string>columnNamesAndWeights[0], <number>columnNamesAndWeights[1], <string>columnNamesAndWeights[2], <number>columnNamesAndWeights[3], ...columnNamesAndWeights.slice(4))
            .supportTypes()
            .column('name')
            .sortBy('' + year, 'desc')
        )
      });

      const lineup= dataBuilder.deriveColors().buildTaggle(${domVariable});
  `;
  },
  build(node: HTMLElement) {
    return import('raw-loader!./ieee_language_rankings.csv').then((content: any) => {
      const csv: string = content.default ? content.default : content;
      this.rawData = csv;
      return parse(csv, {
        dynamicTyping: true,
        header: true,
        skipEmptyLines: true
      });
    }).then((parsed: ParseResult) => {
      const years = [2014, 2015, 2016, 2017, 2018]; // 5 years
      const sources = ['Career Builder', 'Dice', 'Github (active)', 'Github (created)', 'Google Search', 'Google Trends', 'Hacker News', 'IEEE Xplore', 'Reddit (posts)', 'Stack Overflow (?s)', 'Stack Overflow (views)', 'Twitter']; // 12 sources

      // //Merge data of multiple years for each source
      parsed.data.forEach((row) => {
        sources.forEach((source) => {
          row[source] = years.map((y) => !row[source + ' ' + y] && row[source + ' ' + y] !== 0 ? null : row[source + ' ' + y]);
        });
      });

      // basic data
      let dataBuilder = builder(parsed.data)
        .column(buildStringColumn('name'))
        .column(buildCategoricalColumn('web'))
        .column(buildCategoricalColumn('mobile'))
        .column(buildCategoricalColumn('enterprise'))
        .column(buildCategoricalColumn('embedded'))
        .column(buildNumberColumn('NA 2018')); // NA column of 2018

      // source matrices
      sources.forEach((source) => {
        dataBuilder = dataBuilder.column(buildNumberColumn(source).asArray(years.length));
      });

      // rankings per year, begin with 2018
      years.reverse().forEach((year) => {
        const columnNamesAndWeights: (string | number)[] = [];

        sources.forEach((source) => {
          const colName = source + ' ' + year;
          dataBuilder = dataBuilder.column(buildNumberColumn(colName)); //Create a column to use it for the ranking
          if (parsed.data[0] && parsed.data[0][colName]) { // avoid NaN columns (e.g. Google Trends 2018)
            columnNamesAndWeights.push(...[colName, 1]); // all columns have weight 1
          }
        });

        dataBuilder = dataBuilder.ranking(
          buildRanking()
            .weightedSum('' + year, <string>columnNamesAndWeights[0], <number>columnNamesAndWeights[1], <string>columnNamesAndWeights[2], <number>columnNamesAndWeights[3], ...columnNamesAndWeights.slice(4))
            .supportTypes()
            .column('name')
            .sortBy('' + year, 'desc')
        );
      });

      return dataBuilder.deriveColors().buildTaggle(node);
    });
  }
};
