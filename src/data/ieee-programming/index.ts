import {IDataset, PRELOADED_TYPE} from '../IDataset';
import {parse, ParseResult} from 'papaparse';
import {builder, buildRanking, buildStringColumn, buildCategoricalColumn, buildNumberColumn} from 'lineupjs';

import imageBars from './ieee_bars.png';
import imageHeat from './ieee_heat.png';

export const ieeebars: IDataset = {
  id: 'ieee_bars',
  type: PRELOADED_TYPE,
  creationDate: new Date(),
  name: 'IEEE Programming Languages Bars',
  image: imageBars,
  description: `<p>
  55 programming languages are compared by 11 metrics from 2014 to 2018.
  For each year, the languages are ranked with stacked bars by their total popularity accross all metrics.
</p>
  <p>Source: <a href="https://spectrum.ieee.org/static/ieee-top-programming-languages-2018-methods">IEEE Spectrum</a></p>`,
  rawData: '',
  buildScript(rawVariable: string, domVariable: string, dumpVariable: string) {
    return `
  const parsed = Papa.parse(${rawVariable}, {
    dynamicTyping: true,
    header: true,
    skipEmptyLines: true
  });
  const dump = ${dumpVariable};

  const years = [2014, 2015, 2016, 2017, 2018]; // 5 years
  const sources = ['Career Builder', 'Dice', 'Github (active)', 'Github (created)', 'Google Search', 'Google Trends', 'Hacker News', 'IEEE Xplore', 'Reddit (posts)', 'Stack Overflow (?s)', 'Stack Overflow (views)', 'Twitter']; // 12 sources
  const spectrumWeights = [5, 5, 50, 30, 50, 50, 20, 100, 20, 30, 30, 20];
  // //Merge data of multiple years for each source
  parsed.data.forEach((row) => {
    sources.forEach((source) => {
      row[source] = years.map((y) => !row[source + ' ' + y] && row[source + ' ' + y] !== 0 ? null : row[source + ' ' + y]);
    });
  });

  // basic data
  let dataBuilder = LineUpJS.builder(parsed.data)
    .column(LineUpJS.buildStringColumn('name'))
    .column(LineUpJS.buildCategoricalColumn('web'))
    .column(LineUpJS.buildCategoricalColumn('mobile'))
    .column(LineUpJS.buildCategoricalColumn('enterprise'))
    .column(LineUpJS.buildCategoricalColumn('embedded'))
    .column(LineUpJS.buildNumberColumn('NA 2018')); // NA column of 2018

  // source matrices
  sources.forEach((source) => {
    dataBuilder = dataBuilder.column(LineUpJS.buildNumberColumn(source).asArray(years.map(String)));
  });

  // rankings per year, begin with 2018
  years.reverse().forEach((year) => {
    const columnNames: string[] = [];
    const colSpectrumWeights = spectrumWeights.slice(); //duplicate array

    sources.forEach((source, i) => {
      const colName = source + ' ' + year;
      if(colName === 'Google Trends 2018') {
        // not available in dataset
        colSpectrumWeights.splice(i, 1); //remove weight
      } else {
        dataBuilder = dataBuilder.column(LineUpJS.buildNumberColumn(colName)); //Create a column to use it for the ranking
        columnNames.push(colName);
      }
    });
  });

  const lineup = dataBuilder.deriveColors().restore(dump).buildTaggle(${domVariable});
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
      const spectrumWeights = [5, 5, 50, 30, 50, 50, 20, 100, 20, 30, 30, 20];
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
        dataBuilder = dataBuilder.column(buildNumberColumn(source).asArray(years.map(String)));
      });

      // rankings per year, begin with 2018
      years.reverse().forEach((year) => {
        const columnNames: string[] = [];
        const colSpectrumWeights = spectrumWeights.slice(); //duplicate array

        sources.forEach((source, i) => {
          const colName = `${source} ${year}`;
          if(colName === 'Google Trends 2018') {
            // not available in dataset
            colSpectrumWeights.splice(i, 1); //remove weight
          } else {
            dataBuilder = dataBuilder.column(buildNumberColumn(colName)); //Create a column to use it for the ranking
            columnNames.push(colName);
          }
        });

        dataBuilder = dataBuilder.ranking(
          buildRanking()
            .column({ type: 'weightedSum', columns: columnNames, weights: colSpectrumWeights, label: year.toString()})
            .supportTypes()
            .column('name')
            .sortBy(year.toString(), 'desc')
        );
      });

      return dataBuilder.deriveColors().buildTaggle(node);
    });
  }
};

export const ieeeheat: IDataset = {
  id: 'ieee-heatmap',
  type: PRELOADED_TYPE,
  creationDate: new Date(),
  name: 'IEEE Programming Languages Heatmap',
  image: imageHeat,
  description: `<p>
  55 programming languages are compared by 11 metrics from 2014 to 2018.
  For each year, the languages are ranked by their total popularity accross all metrics, collected in a heatmap.
</p>
  <p>Source: <a href="https://spectrum.ieee.org/static/ieee-top-programming-languages-2018-methods">IEEE Spectrum</a></p>`,
  rawData: '',
  buildScript(rawVariable: string, domVariable: string, dumpVariable: string) {
    return `
  const parsed = Papa.parse(${rawVariable}, {
    dynamicTyping: true,
    header: true,
    skipEmptyLines: true
  });
  const dump = ${dumpVariable};

  const years = [2014, 2015, 2016, 2017, 2018]; // 5 years
  const sources = ['Career Builder', 'Dice', 'Github (active)', 'Github (created)', 'Google Search', 'Google Trends', 'Hacker News', 'IEEE Xplore', 'Reddit (posts)', 'Stack Overflow (?s)', 'Stack Overflow (views)', 'Twitter']; // 12 sources

  parsed.data.forEach((row) => {
    // //Merge data of multiple years for each source
    sources.forEach((source) => {
      row[source] = years.map((y) => row[source + ' ' + y]);
    });

    // Merge data of multiple sources for each year
    years.forEach((y) => {
      row[y] = sources.map((source) => row[source + ' ' + y]);
    });
  });


  // basic data
  let dataBuilder = LineUpJS.builder(parsed.data)
    .column(LineUpJS.buildStringColumn('name'))
    .column(LineUpJS.buildCategoricalColumn('web'))
    .column(LineUpJS.buildCategoricalColumn('mobile'))
    .column(LineUpJS.buildCategoricalColumn('enterprise'))
    .column(LineUpJS.buildCategoricalColumn('embedded'))
    .column(LineUpJS.buildNumberColumn('NA 2018')); // NA column of 2018

  // source matrices
  sources.forEach((source) => {
    dataBuilder = dataBuilder.column(LineUpJS.buildNumberColumn(source, [0, NaN]).asArray(years.map(String)));
  });

  // year matrices
  years.forEach((year) => {
    dataBuilder = dataBuilder.column(LineUpJS.buildNumberColumn(year.toString(), [0, NaN]).asArray(sources));
  });

  const lineup = dataBuilder.deriveColors().restore(dump).buildTaggle(${domVariable});
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
        dataBuilder = dataBuilder.column(buildNumberColumn(source, [0, NaN]).asArray(years.map(String)));
      });

      // year matrices
      years.forEach((year) => {
        dataBuilder = dataBuilder.column(buildNumberColumn(year.toString(), [0, NaN]).asArray(sources));
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
