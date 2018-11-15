import {IDataLoader, ILocalDataset} from './IDataset';
import {builder} from 'lineupjs';

function buildScript(rawVariable: string, domVariable: string) {
  return `
  const parsed = JSON.parse(${rawVariable});

  const lineup = LineUpJS.asLineUp(${domVariable}, parsed);
  `;
}

export const JSON_LOADER: IDataLoader = {
  type: 'json',
  supports: (file: File) => file.name.endsWith('.json') || file.type === 'application/json',
  loadFile: (file: File) => {
    return new Promise<{raw: string, parsed: object[]}>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const raw = String(reader.result);
        const parsed = JSON.parse(raw);
        resolve({raw, parsed});
      };
      reader.readAsText(file);
    }).then(({raw, parsed}) => {
      const title = file.name.split('.').slice(0, -1).join('.');
      return {
        id: title.toLowerCase().replace(/\s+/g, '-'),
        type: <'json'>'json',
        title,
        description: `Imported from "${file.name}" on ${new Date()}`,
        rawData: raw,
        buildScript,
        build: (node: HTMLElement) => {
          return builder(parsed)
            .deriveColumns()
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
        const parsed = JSON.parse(db.rawData!);
        return builder(parsed)
            .deriveColumns()
            .deriveColors()
            .defaultRanking()
            .buildTaggle(node);
      }
    });
  }
};

export default JSON_LOADER;
