import {parse, ParseResult} from 'papaparse';
import {IDataLoader, ILocalDataset} from './IDataset';
import {builder} from 'lineupjs';

function buildScript(rawVariable: string, domVariable: string) {
  return `
  const parsed = Papa.parse(${rawVariable}, {
    dynamicTyping: true,
    header: true,
    skipEmptyLines: true
  });

  const lineup = LineUpJS.asLineUp(${domVariable}, parsed.data, ...parsed.meta.fields);
  `;
}

export const CSV_LOADER: IDataLoader = {
  type: 'csv',
  supports: (file: File) => file.name.endsWith('.csv') || file.name.endsWith('.tsv') || file.name.endsWith('.txt') || file.type === 'text/csv',
  loadFile: (file: File) => {
    return new Promise<{raw: string, parsed: ParseResult}>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const raw = String(reader.result);
        const parsed = parse(raw, {
          dynamicTyping: true,
          header: true,
          skipEmptyLines: true
        });
        resolve({raw, parsed});
      };
      reader.readAsText(file);
    }).then(({raw, parsed}) => {
      const title = file.name.split('.').slice(0, -1).join('.');
      return {
        id: title.toLowerCase().replace(/\s+/g, '-'),
        type: <'csv'>'csv',
        title,
        description: `Imported from "${file.name}" on ${new Date()}`,
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

  complete: (db: Partial<ILocalDataset>): ILocalDataset => {
    return <ILocalDataset>Object.assign(db, {
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
