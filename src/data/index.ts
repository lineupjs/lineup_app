import {IDataset} from './IDataset';
import {wur, shanghai} from './wur';
import forbes from './forbes-top-2000-companies';
import happiness from './world-happiness-report';
import soccer from './soccer';
import {ieeeheat, ieeebars} from './ieee-programming';
import {listDatasets, listSessions} from './db';
import {complete} from './loaders';
export {IDataset} from './IDataset';
export {fromFile} from './loaders';
export * from './ui';

const preloaded: IDataset[] = [
  wur,
  shanghai,
  forbes,
  happiness,
  ieeebars,
  ieeeheat,
  soccer
];


export function allDatasets() {
  return Promise.all([listDatasets(), listSessions()]).then(([ds, sessions]) => {
    const full = <IDataset[]>ds.map(complete).filter((d) => d != null);
    const data = preloaded.concat(full);

    // insert sessions
    for (const d of data) {
      d.sessions = sessions.filter((s) => s.dataset === d.id);
    }

    return data;
  });
}
