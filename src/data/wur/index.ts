import {IDataset} from '../IDataset';
import {parse, ParseResult} from 'papaparse';
import {builder, buildRanking, buildStringColumn, buildNumberColumn} from 'lineupjs';

export const wur: IDataset = {
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
</p><p>
The <a href="https://www.timeshighereducation.com/world-university-rankings" target="_blank">Times Higher
Education World University Ranking</a> is widely regarded as one of the most influential and widely observed
university measures. Founded in the United Kingdom in 2010, it has been criticized for its commercialization
and for undermining non-English-instructing institutions.
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
      const {rows, yearArray} = reGroup(parsed.data, 'institution');
      // world_rank,institution,country,national_rank,quality_of_education,alumni_employment,quality_of_faculty,publications,influence,citations,broad_impact,patents,year
      // multiple years
      // per year:
      const perYear = `score,national_rank,quality_of_education,alumni_employment,quality_of_faculty,publications,influence,citations,broad_impact,patents`.split(',');
      const b = builder(rows)
        .rowHeight(22, 2)
        .column(buildStringColumn('institution'))
        .column(buildStringColumn('country'));

      yearArray.slice(0, 2).forEach((year) => {
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

      yearArray.slice(2).forEach((year) => {
        b.column(buildNumberColumn(`${year}_score`).label(`score (${year})`));
      });

      return b.deriveColors().build(node);
    });
  }
};

export const shanghai: IDataset = {
  id: 'shanghai',
  title: 'Academic Ranking of World Universities',
  image: '',
  link: 'https://www.kaggle.com/mylesoneill/world-university-rankings/version/3',
  description: `<p>
  Of all the universities in the world, which are the best?
</p>
<p>
  Ranking universities is a difficult, political, and controversial practice. There are hundreds of different national and
  international university ranking systems, many of which disagree with each other. This dataset contains
  three global university rankings from very different places.
</p><p>
The <a href="http://www.shanghairanking.com/" target="_blank">Academic Ranking of World Universities</a>, also known as the Shanghai Ranking,
is an equally influential ranking. It was founded in China in 2003 and has been criticized for focusing on raw research power
and for undermining humanities and quality of instruction.
</p>`,
  rawData: '',
  buildScript(_rawVariable: string, _domVariable: string) {
    return `//TODO`;
  },
  build(node: HTMLElement) {
    return System.import('raw-loader!./shanghaiData.csv').then((content: any) => {
      const csv: string = content.default ? content.default : content;
      this.rawData = csv;
      return parse(csv, {
        dynamicTyping: true,
        header: true,
        skipEmptyLines: true
      });
    }).then((parsed: ParseResult) => {
      const {rows, yearArray} = reGroup(parsed.data, 'university_name');
      // world_rank,university_name,national_rank,total_score,alumni,award,hici,ns,pub,pcp,year
      // multiple years
      // per year:
      const perYear = `total_score,alumni,award,hici,ns,pub,pcp`.split(',');
      const b = builder(rows)
        .rowHeight(22, 2)
        .column(buildStringColumn('university_name'));

      yearArray.slice(0, 2).forEach((year) => {
        const bb = buildRanking()
          .supportTypes()
          .column('university_name')
          .column(`${year}_national_rank`)
          .sortBy(`${year}_total_score`, 'desc');

        b.column(buildNumberColumn(`${year}_national_rank`).label(`national_rank`));
        perYear.forEach((k) => {
          b.column(buildNumberColumn(`${year}_${k}`, [0, 100]).label(`${k} (${year})`));
          bb.column(`${year}_${k}`);
        });
        b.ranking(bb);
      });

      yearArray.slice(2).forEach((year) => {
        b.column(buildNumberColumn(`${year}_total_score`, [0, 100]).label(`total_score (${year})`));
      });

      return b.deriveColors().build(node);
    });
  }
};


function reGroup(data: any[], primary: string) {
  const map = new Map<string, any>();
  const years = new Set<string>();
  data.forEach((d) => {
    const i = d[primary];
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
  return {rows, yearArray};
}

