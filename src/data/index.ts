import {IDataset} from './IDataset';
import {wur, shanghai} from './wur';
import forbes from './forbes-top-2000-companies';
import happiness from './world-happiness-report';
import soccer from './soccer';
import {ieeeheat, ieeebars} from './ieee-programming';
import {listDatasets} from './db';
import {complete} from './loaders';
export {IDataset} from './IDataset';
export {fromFile} from './loaders';

export const data: IDataset[] = [
  wur,
  shanghai,
  forbes,
  happiness,
  ieeebars,
  ieeeheat,
  soccer
];

export default data;


export function toCard(d: IDataset) {
  return `<!--card item-->
    <div class="carousel-item card sticky-action">
      <div class="card-image waves-effect waves-block waves-light sticky-action">
        <img class="activator" src="${d.image || ''}" alt="No Preview Available">
      </div>
      <div class="card-content">
        <span class="card-title activator grey-text text-darken-4">${d.title}
          <i class="material-icons right">more_vert</i>
        </span>
      </div>
      <div class="card-action">
        <a href="#${d.id}">Select</a>
      </div>
      <div class="card-reveal">
        <span class="card-title grey-text text-darken-4">${d.title}
          <i class="material-icons right">close</i>
        </span>
        ${d.description}
        ${d.type !== 'preloaded' ? `<p><a class="waves-effect waves-light btn" data-id="${d.id}" data-action="delete">Delete</a></p>` : ''}
        ${d.link ? `<p>
          <a href="${d.link}" target="_blank" rel="noopener">Kaggle Link</a>
        </p>` : ''}
      </div>
    </div>`;
}


export function allDatasets() {
  return listDatasets().then((ds) => {
    const full = <IDataset[]>ds.map(complete).filter((d) => d != null);
    data.push(...full);
    return data;
  });
}
