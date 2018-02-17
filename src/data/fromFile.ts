
import {parse, ParseResult} from 'papaparse';
import {IDataset} from './IDataset';
import {builder} from 'lineupjs';

export default function fromFile(file: File): Promise<IDataset> {
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
      title,
      description: `Imported from "${file.name}" on ${new Date()}`,
      rawData: raw,
      buildScript: (rawVariable: string, domVariable: string) => {
        return `
        const parsed = Papa.parse(${rawVariable}, {
          dynamicTyping: true,
          header: true,
          skipEmptyLines: true
        });

        const lineup = LineUpJS.asLineUp(${domVariable}, parsed.data, ...parsed.meta.fields);
        `;
      },
      build: (node: HTMLElement) => {
        return builder(parsed.data)
          .deriveColumns(...parsed.meta.fields)
          .deriveColors()
          .rowHeight(22, 2)
          .defaultRanking()
          .build(node);
      }
    };
  });
}
