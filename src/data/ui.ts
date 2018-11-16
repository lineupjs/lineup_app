import {IDataset, PRELOADED_TYPE} from './IDataset';
import {toast} from 'materialize-css';
import {deleteDataset} from './db';

function sessions(d: IDataset, card: HTMLElement) {
  if (!d.sessions) {
    return;
  }
  // TODO
}

export function createCard(d: IDataset, onDelete: () => void) {
  const card = document.createElement('div');

  card.classList.add('carousel-item', 'card', 'sticky-action');
  card.innerHTML = `<div class="card-image waves-effect waves-block waves-light sticky-action">
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
    ${d.link ? `<p>
    <a href="${d.link}" target="_blank" rel="noopener">Kaggle Link</a>
  </p>` : ''}
  </div>`;
  sessions(d, <HTMLElement>card.firstElementChild!);

  if (d.type === PRELOADED_TYPE) {
    // no further actions
    return card;
  }

  const deleteButton = document.createElement('a');
  deleteButton.href = '#';
  deleteButton.innerHTML = `Delete`;
  card.querySelector<HTMLElement>('.card-action')!.appendChild(deleteButton);
  deleteButton.onclick = (evt) => {
    evt.preventDefault();
    evt.stopPropagation();
    deleteDataset(d).then(() => {
      toast({html: `Dataset "${d.title}" deleted`, displayLength: 5000});
      onDelete();
    }).catch((error) => {
      toast({html: `Error while deleting dataset: <pre>${error}</pre>`, displayLength: 5000});
    });
  };

  return card;
}
