import {parse, ParseResult} from 'papaparse';
import {IDataLoader, IDatasetMeta, IDataset} from './IDataset';
import {builder, Taggle, LineUp} from 'lineupjs';
import {cleanName, fixHeaders} from './utils';
import {niceDate} from '../ui';

function buildScript(rawVariable: string, domVariable: string, dumpVariable: string) {
  return `
const parsed = Papa.parse(${rawVariable}, {
  dynamicTyping: true,
  header: true,
  skipEmptyLines: true
});
const dump = ${dumpVariable};

const lineup = LineUpJS
  .builder(parsed.data)
  .deriveColumns(...parsed.meta.fields)
  .deriveColors()
  .restore(dump)
  .build(${domVariable});
`;
}


export function exportCSV(lineup: LineUp | Taggle) {
  return lineup!.data.exportTable(lineup!.data.getRankings()[0], {});
}

export const CSV_LOADER: IDataLoader = {
  type: 'csv',
  supports: (file: File) => file.name.endsWith('.csv') || file.name.endsWith('.tsv') || file.name.endsWith('.txt') || file.type === 'text/csv',
  loadFile: (file: File) => {
    return new Promise<{raw: string, parsed: ParseResult}>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const raw = fixHeaders(String(reader.result));
        const parsed = parse(raw, {
          dynamicTyping: true,
          header: true,
          skipEmptyLines: true
        });
        resolve({raw, parsed});
      };
      reader.readAsText(file);
    }).then(({raw, parsed}) => {
      const name = file.name.split('.').slice(0, -1).join('.');
      return {
        id: cleanName(name),
        type: <'csv'>'csv',
        name,
        creationDate: new Date(),
        description: `Imported from "${file.name}" on ${niceDate(new Date())}`,
        rawData: raw,
        buildScript,
        build: (node: HTMLElement) => {
          return builder(parsed.data)
            .deriveColumns(...parsed.meta.fields)
            .deriveColors()
            .defaultRanking()
            .buildTaggle(node);
        }
      };
    });
  },

  complete: (db: IDatasetMeta): IDataset => {
    return <IDataset>Object.assign(db, {
      type: 'csv',
      buildScript,
      build: (node: HTMLElement) => {
        const parsed = parse(db.rawData!, {
          dynamicTyping: true,
          header: true,
          skipEmptyLines: true
        });
        return builder(parsed.data)
            .deriveColumns(...parsed.meta.fields)
            .deriveColors()
            .defaultRanking()
            .buildTaggle(node);
      }
    });
  }
};

export default CSV_LOADER;
