import { IDataLoader, IDataset, IDatasetMeta } from './IDataset';
import { builder, Taggle, isSupportType, LocalDataProvider, LineUp } from 'lineupjs';
import { cleanName } from './utils';
import { niceDate } from '../ui';
import { isDumpFile, fromDumpFile } from './loader_dump';

function buildScript(rawVariable: string, domVariable: string, dumpVariable: string) {
  return `
const parsed = JSON.parse(${rawVariable});
const dump = ${dumpVariable};

const lineup = LineUpJS
  .builder(parsed)
  .deriveColumns()
  .deriveColors()
  .restore(dump)
  .build(${domVariable});
`;
}

export function exportJSON(lineup: LineUp | Taggle) {
  const data = lineup!.data as LocalDataProvider;
  const ranking = data.getRankings()[0];
  const cols = ranking.flatColumns.filter((d) => !isSupportType(d));
  const ordered = data.viewRawRows(ranking.getOrder());
  return Promise.resolve(
    ordered.map((row) => {
      const r: any = {};
      cols.forEach((col) => {
        r[col.label] = col.getExportValue(row, 'json');
      });
      return r;
    })
  );
}

export const JSON_LOADER: IDataLoader = {
  type: 'json',
  supports: (file: File) => file.name.endsWith('.json') || file.type === 'application/json',
  loadFile: (file: File) => {
    return new Promise<{ raw: string; parsed: unknown[] }>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const raw = String(reader.result);
        const parsed = JSON.parse(raw);
        resolve({ raw, parsed });
      };
      reader.readAsText(file);
    }).then(({ raw, parsed }) => {
      if (isDumpFile(parsed)) {
        return Promise.resolve(fromDumpFile(parsed));
      }
      if (!Array.isArray(parsed) || parsed.length === 0 || typeof parsed[0] !== 'object') {
        return Promise.reject<IDataset>('not an array of objects');
      }
      const name = file.name.split('.').slice(0, -1).join('.');
      return {
        id: cleanName(name),
        type: <const>'json',
        name,
        creationDate: new Date(),
        description: `Imported from "${file.name}" on ${niceDate(new Date())}`,
        rawData: raw,
        buildScript,
        build: (node: HTMLElement) => {
          return builder(parsed).deriveColumns().deriveColors().defaultRanking().buildTaggle(node);
        },
      };
    });
  },

  complete: (db: IDatasetMeta): IDataset => {
    return Object.assign(db, {
      type: 'json',
      buildScript,
      build: (node: HTMLElement) => {
        const parsed = JSON.parse(db.rawData!);
        return builder(parsed).deriveColumns().deriveColors().defaultRanking().buildTaggle(node);
      },
    });
  },
};

export default JSON_LOADER;
