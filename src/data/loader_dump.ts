import {IDataset, IDatasetMeta} from './IDataset';
import {cleanName} from './ùtils';
import '!file-loader?name=schema.1.0.0.json!./schema.json';
import {LineUp, Taggle} from 'lineupjs';

const SCHEMA_REF = 'https://lineup.js.org/app_develop/schema.1.0.0.json';

export function isDumpFile(data: any) {
  return data && data.$schema === SCHEMA_REF;
}

export function fromDumpFile(parsed: any): IDatasetMeta {
  delete parsed.$schema;
  parsed.id = cleanName(parsed.name);
  return parsed;
}

export function exportDump(dataset: IDataset, lineup: LineUp|Taggle) {
  const dump = Object.assign({
    $schema: SCHEMA_REF,
    dump: lineup.dump()
  }, dataset);

  delete dump.build;
  delete dump.buildScript;
  delete dump.id;
  dump.sessions = !dump.sessions ? [] : dump.sessions.map((d) => {
    const r = Object.assign({}, d);
    delete r.uid;
    delete r.dataset;
    return r;
  });
  return dump;
}
