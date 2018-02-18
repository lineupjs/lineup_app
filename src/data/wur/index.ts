import {IDataset} from '../IDataset';
import {parse, ParseResult} from 'papaparse';
import {builder, buildRanking, buildStringColumn, buildNumberColumn} from 'lineupjs';

export const data: IDataset = {
  id: 'wur',
  title: 'Times Higher Education World University Ranking',
  image: '',
  link: 'https://www.kaggle.com/mylesoneill/world-university-rankings/version/3',
  description: `<p>
  Of all the universities in the world, which are the best?
</p>
<p>
  Ranking universities is a difficult, political, and controversial practice. There are hundreds of different national and
  international university ranking systems, many of which disagree with each other. This dataset contains
  three global university rankings from very different places.
</p>`,
  rawData: '',
  buildScript(_rawVariable: string, _domVariable: string) {
    return `//TODO`;
  },
  build(node: HTMLElement) {
    return System.import('raw-loader!./cwurData.csv').then((content: any) => {
      const csv: string = content.default ? content.default : content;
      this.rawData = csv;
      return parse(csv, {
        dynamicTyping: true,
        header: true,
        skipEmptyLines: true
      });
    }).then((parsed: ParseResult) => {
      const map = new Map<string, any>();
      const years = new Set<string>();
      parsed.data.forEach((d) => {
        const i = d.institution;
        if (!map.has(i)) {
          map.set(i, d);
        }
        const v = map.get(i);
        // year prefix stuff
        const year = d.year;
        years.add(year);
        Object.keys(d).forEach((k) => {
          const kk = `${year}_${k}`;
          v[kk] = d[k];
        });
      });
      const rows = Array.from(map.values());
      const yearArray = Array.from(years).sort();
      // world_rank,institution,country,national_rank,quality_of_education,alumni_employment,quality_of_faculty,publications,influence,citations,broad_impact,patents,year
      // multiple years
      // per year:
      const perYear = `score,national_rank,quality_of_education,alumni_employment,quality_of_faculty,publications,influence,citations,broad_impact,patents`.split(',');
      const b = builder(rows)
        .column(buildStringColumn('institution'))
        .column(buildStringColumn('country'));

      yearArray.forEach((year) => {
        const bb = buildRanking()
          .supportTypes()
          .column('institution')
          .column('country')
          .sortBy(`${year}_score`, 'desc');
        perYear.forEach((k) => {
          b.column(buildNumberColumn(`${year}_${k}`).label(`${k} (${year})`));
          bb.column(`${year}_${k}`);
        });
        b.ranking(bb);
      });

      return b.deriveColors().build(node);
    });
  }
};

export default data;
