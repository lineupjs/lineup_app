import { IDataset, PRELOADED_TYPE } from './IDataset';
import { toast } from 'materialize-css';
import { deleteSession } from './db';
import { areyousure, fromNow } from '../ui';

function sessions(dataset: IDataset, card: HTMLElement) {
  if (!dataset.sessions || dataset.sessions.length === 0) {
    return;
  }

  const content = card.querySelector<HTMLElement>('.card-reveal')!;
  content.insertAdjacentHTML(
    'beforeend',
    `
  <div class="card-sessions">
    <span class="card-title grey-text text-darken-4">Saved Sessions
      <i class="material-icons right">close</i>
    </span>
    <ul class="collection">
      ${dataset.sessions
        .map(
          (s) => `<li class="collection-item">
        <div>
          ${s.name} <span class="grey-text lighten-2">(${fromNow(s.creationDate)})</span>
          <a href="#${dataset.id}@${
            s.uid
          }" class="secondary-content" title="Open session"><i class="material-icons grey-text waves-effect waves-light">play_arrow</i></a>
          <a href="#" class="secondary-content delete-session" data-uid="${
            s.uid
          }" title="Delete session"><i class="material-icons grey-text waves-effect waves-light">delete</i></a>
        </div>
      </li>`
        )
        .join('')}
    </ul>
  </div>`
  );
  content.querySelector<HTMLElement>('.card-sessions .card-title')!.onclick = () => {
    content.classList.remove('sessions');
  };
  Array.from(content.querySelectorAll<HTMLElement>('.delete-session')).forEach((d: HTMLElement) => {
    d.onclick = async (evt) => {
      evt.preventDefault();
      evt.stopPropagation();
      const sessionId = parseInt(d.dataset.uid!, 10);
      const session = dataset.sessions!.find((d) => d.uid === sessionId);
      if (!session) {
        return;
      }
      try {
        await areyousure(`to delete session "${session.name}" of dataset "${dataset.name}"`);
        await deleteSession(session);
        toast({ html: `Session "${session.name}" of dataset "${dataset.name}" deleted`, displayLength: 5000 });
        d.closest('li')!.remove();
        dataset.sessions!.splice(dataset.sessions!.indexOf(session), 1);
      } catch (error) {
        toast({ html: `Error while deleting session: <pre>${error}</pre>`, displayLength: 5000 });
      }
    };
  });

  const sessions = document.createElement('a');
  sessions.href = '#';
  sessions.classList.add('activator');
  sessions.innerHTML = `Sessions`;
  card.querySelector<HTMLElement>('.card-action')!.appendChild(sessions);
  sessions.onclick = async (evt) => {
    evt.preventDefault();
    content.classList.add('sessions'); // show sessions part
  };
}

export function createCard(
  dataset: IDataset,
  onDelete: (dataset: IDataset) => void,
  onEdit: (dataset: IDataset) => void
) {
  const card = document.createElement('div');

  card.classList.add('carousel-item', 'card', 'sticky-action');
  card.innerHTML = `<div class="card-image waves-effect waves-block waves-light sticky-action">
    ${
      dataset.image
        ? `<img class="activator" src="${dataset.image}" alt="No Preview Available">`
        : `<span class="material-icons grey-text local-image activator">photo</span>`
    }
  </div>
  <div class="card-content">
    <span class="card-title activator grey-text text-darken-4"><span class="dd-title">${dataset.name}</span>
      <i class="material-icons right">more_vert</i>
    </span>
  </div>
  <div class="card-action">
    <a href="#${dataset.id}">Select</a>
  </div>
  <div class="card-reveal">
    <div class="card-desc">
      <span class="card-title grey-text text-darken-4"><span class="dd-title">${dataset.name}</span>
        <i class="material-icons right">close</i>
      </span>
      <div class="dd-desc">
        ${dataset.description}
      </div>
      ${dataset.link ? `<p><a href="${dataset.link}" target="_blank" rel="noopener">Kaggle Link</a></p>` : ''}
    </div>
  </div>`;
  sessions(dataset, <HTMLElement>card);

  if (dataset.type === PRELOADED_TYPE) {
    // no further actions
    return card;
  }

  card.querySelector<HTMLElement>(
    '.card-image'
  )!.innerHTML = `<span class="material-icons grey-text local-image activator">computer</span>`;

  const editButton = document.createElement('a');
  editButton.href = '#';
  editButton.innerHTML = `Edit`;
  card.querySelector<HTMLElement>('.card-action')!.appendChild(editButton);
  editButton.onclick = (evt) => {
    evt.preventDefault();
    evt.stopPropagation();
    onEdit(dataset);
  };

  const deleteButton = document.createElement('a');
  deleteButton.href = '#';
  deleteButton.innerHTML = `Delete`;
  card.querySelector<HTMLElement>('.card-action')!.appendChild(deleteButton);
  deleteButton.onclick = (evt) => {
    evt.preventDefault();
    evt.stopPropagation();
    onDelete(dataset);
  };

  return card;
}
