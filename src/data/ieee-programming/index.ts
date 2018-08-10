import {IDataset} from '../IDataset';
import {parse, ParseResult} from 'papaparse';
import {builder, buildRanking, buildStringColumn, buildCategoricalColumn, buildNumberColumn} from 'lineupjs';

import imageBars from './ieee_bars.png';
import imageHeat from './ieee_heat.png';

export const ieeebars: IDataset = {
  id: 'ieee_bars',
  title: 'IEEE Programming Languages Bars',
  image: imageBars,
  description: `<p>
  55 programming languages are compared by 11 metrics from 2014 to 2018.
  For each year, the languages are ranked with stacked bars by their total popularity accross all metrics.
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
  const spectrumWeights: { [s: string]: number; }  = {'Career Builder': 5, 'Dice': 5, 'Github (active)': 50, 'Github (created)': 30, 'Google Search': 50, 'Google Trends': 50, 'Hacker News': 20, 'IEEE Xplore': 100, 'Reddit (posts)': 20, 'Stack Overflow (?s)': 30, 'Stack Overflow (views)': 30, 'Twitter': 20};

  // //Merge data of multiple years for each source
  parsed.data.forEach((row) => {
    sources.forEach((source) => {
      row[source] = years.map((y) => !row[source + ' ' + year] && row[source + ' ' + year] !== 0 ? null : row[source + ' ' + year]);
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
    dataBuilder = dataBuilder.column(buildNumberColumn(source).asArray(years.map((y) => ''+y));
  });

  // rankings per year, begin with 2018
  years.reverse().forEach((year) => {
    const columnNamesAndWeights: (string | number)[] = [];

    sources.forEach((source) => {
      const colName = source + ' ' + year;
      dataBuilder = dataBuilder.column(buildNumberColumn(colName)); //Create a column to use it for the ranking
      if (parsed.data[0] && parsed.data[0][colName]) { // avoid NaN columns (e.g. Google Trends 2018)
        columnNamesAndWeights.push(...[colName, spectrumWeights[source]]); // all columns have weight 1
      }
    });

    dataBuilder = dataBuilder.ranking(
      buildRanking()
        .weightedSum(''+year, <string>columnNamesAndWeights[0], <number>columnNamesAndWeights[1], <string>columnNamesAndWeights[2], <number>columnNamesAndWeights[3], ...columnNamesAndWeights.slice(4))
        .supportTypes()
        .column('name')
        .sortBy(''+year, 'desc')
    );
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
      const spectrumWeights: { [s: string]: number; }  = {'Career Builder': 5, 'Dice': 5, 'Github (active)': 50, 'Github (created)': 30, 'Google Search': 50, 'Google Trends': 50, 'Hacker News': 20, 'IEEE Xplore': 100, 'Reddit (posts)': 20, 'Stack Overflow (?s)': 30, 'Stack Overflow (views)': 30, 'Twitter': 20};

      // //Merge data of multiple years for each source
      parsed.data.forEach((row) => {
        sources.forEach((source) => {
          row[source] = years.map((y) => !row[`${source} ${y}`] && row[`${source} ${y}`] !== 0 ? null : row[`${source} ${y}`]);
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
        dataBuilder = dataBuilder.column(buildNumberColumn(source).asArray(years.map((y) => `${y}`)));
      });

      // rankings per year, begin with 2018
      years.reverse().forEach((year) => {
        const columnNamesAndWeights: (string | number)[] = [];

        sources.forEach((source) => {
          const colName = `${source} ${year}`;
          dataBuilder = dataBuilder.column(buildNumberColumn(colName)); //Create a column to use it for the ranking
          if (parsed.data[0] && parsed.data[0][colName]) { // avoid NaN columns (e.g. Google Trends 2018)
            columnNamesAndWeights.push(...[colName, spectrumWeights[source]]);
          }
        });

        dataBuilder = dataBuilder.ranking(
          buildRanking()
            .weightedSum(`${year}`, <string>columnNamesAndWeights[0], <number>columnNamesAndWeights[1], <string>columnNamesAndWeights[2], <number>columnNamesAndWeights[3], ...columnNamesAndWeights.slice(4))
            .supportTypes()
            .column('name')
            .sortBy(`${year}`, 'desc')
        );
      });

      return dataBuilder.deriveColors().buildTaggle(node);
    });
  }
};

export const ieeeheat: IDataset = {
  id: 'ieee-heatmap',
  title: 'IEEE Programming Languages Heatmap',
  image: imageHeat,
  description: `<p>
  55 programming languages are compared by 11 metrics from 2014 to 2018.
  For each year, the languages are ranked by their total popularity accross all metrics, collected in a heatmap.
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

  parsed.data.forEach((row) => {
    // //Merge data of multiple years for each source
    sources.forEach((source) => {
      row[source] = years.map((y) => row[source + ' ' + year]);
    });

    // Merge data of multiple sources for each year
    years.forEach((y) => {
      row[y] = sources.map((source) => row[source + ' ' + year]);
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
    dataBuilder = dataBuilder.column(buildNumberColumn(source, [0, NaN]).asArray(years.map((y) => ''+y)));
  });

  // year matrices
  years.forEach((year) => {
    dataBuilder = dataBuilder.column(buildNumberColumn('' + year, [0, NaN]).asArray(sources));
  });

  dataBuilder = dataBuilder.ranking(
  buildRanking()
      .supportTypes()
      .column('name')
      .column('2018')
      .sortBy('2018', 'desc')
    );

  dataBuilder = dataBuilder.ranking(
    buildRanking()
        .supportTypes()
        .column('name')
        .column('2017').column('2016').column('2015').column('2014')
        .sortBy('2017', 'desc')
      );

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

      parsed.data.forEach((row) => {
        // //Merge data of multiple years for each source
        sources.forEach((source) => {
          row[source] = years.map((y) => row[`${source} ${y}`]);
        });

        // Merge data of multiple sources for each year
        years.forEach((y) => {
          row[y] = sources.map((source) => row[`${source} ${y}`]);
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
        dataBuilder = dataBuilder.column(buildNumberColumn(source, [0, NaN]).asArray(years.map((y) => `${y}`)));
      });

      // year matrices
      years.forEach((year) => {
        dataBuilder = dataBuilder.column(buildNumberColumn(`${year}`, [0, NaN]).asArray(sources));
      });

      dataBuilder = dataBuilder.ranking(
      buildRanking()
          .supportTypes()
          .column('name')
          .column('2018')
          .sortBy('2018', 'desc')
        );

      dataBuilder = dataBuilder.ranking(
        buildRanking()
            .supportTypes()
            .column('name')
            .column('2017').column('2016').column('2015').column('2014')
            .sortBy('2017', 'desc')
          );

      return dataBuilder.deriveColors().buildTaggle(node);
    });
  }
};
