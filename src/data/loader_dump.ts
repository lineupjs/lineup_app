import {IDataset, IDatasetMeta, PRELOADED_TYPE} from './IDataset';
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
  parsed.creationDate = new Date(parsed.creationDate);
  if (parsed.sessions) {
    parsed.sessions.forEach((d: any) => d.creationDate = new Date(d.creationDate));
  }
  return parsed;
}

export function exportDump(dataset: IDataset, lineup: LineUp|Taggle) {
  const dump = Object.assign({
    $schema: SCHEMA_REF
  }, dataset);

  if (dataset.type === PRELOADED_TYPE) {
    dump.type = `${PRELOADED_TYPE}-${dataset.id}`;
    delete dump.rawData; // since part of the preloaded state anyhow
  }

  delete dump.build;
  delete dump.buildScript;
  delete dump.id;
  dump.sessions = !dump.sessions ? [] : dump.sessions.map((d) => {
    const r = Object.assign({}, d);
    delete r.uid;
    delete r.dataset;
    return r;
  });
  dump.dump = lineup.dump();
  return dump;
}
