import {IDataset} from './IDataset';
import {toast} from 'materialize-css';
import {deleteDataset} from './db';

function editAble(d: IDataset, card: HTMLElement, onDelete: ()=>void) {
  if (d.type === 'preloaded') {
    return; // no options for preloaded
  }
  card.insertAdjacentHTML('beforeend', `<p>
    <a class="waves-effect waves-light btn" data-id="${d.id}" data-action="delete">Delete</a>
  </p>`);

  const deleteButton = card.querySelector<HTMLElement>('[data-action=delete]')!;
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
}

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
  </div>`;

  editAble(d, card, onDelete);
  if (d.link) {
    card.insertAdjacentHTML('beforeend', `<p>
      <a href="${d.link}" target="_blank" rel="noopener">Kaggle Link</a>
    </p>`);
  }
  sessions(d, card);
  return card;
}
