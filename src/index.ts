import {Tooltip, Carousel, FloatingActionButton, toast} from 'materialize-css';
import 'file-loader?name=index.html!extract-loader!html-loader?interpolate!./index.html';
import './assets/favicon/favicon';
import './style.scss';
import 'typeface-roboto/index.css';
import initExport from './export';
import shared from './shared';
import {IDataset, fromFile, allDatasets} from './data';
import {version, buildId} from 'lineupjs';
import {storeDataset} from './data/db';
import {createCard} from './data/ui';
import {ISession} from './data/IDataset';

const uploader = <HTMLElement>document.querySelector('main');

function build(builder: Promise<IDataset>, session?: ISession | null) {
  uploader.dataset.state = 'uploading';
  return builder.then((d: IDataset) => {
    shared.dataset = d;
    return d.build(<HTMLElement>document.querySelector('div.lu-c'));
  }).then((l) => {
    shared.lineup = l;
    disableBubbling(<HTMLElement>document.querySelector('div.lu-c > main > main'), 'mousemove', 'mouseout', 'mouseover');
    return new Promise<any>((resolve) => setTimeout(resolve, 500));
  }).then(() => {
    // patch switch button
    const side = <HTMLElement>document.querySelector('.lu-rule-button-chooser');
    if (side) {
      side.classList.add('switch');
      const input = (<HTMLElement>side.querySelector('input'));
      input.insertAdjacentHTML('afterend', `<span class="lever"></span>`);
      input.insertAdjacentHTML('beforebegin', `<span>Item</span>`);
    } //
    (<HTMLElement>document.querySelector('.brand-logo')).textContent = document.title = `LineUp ${shared.dataset!.title}`;
    Array.from(document.querySelectorAll('.nav-wrapper a.disabled')).forEach((d: Element) => {
      (<HTMLElement>d).classList.remove('disabled');
    }
    );
  }).then(() => {
    let next: string;
    if (session) {
      shared.session = session;
      next = `#${shared.dataset!.id}@${session.uid}`;
      shared.lineup!.data.restore(session.dump);
    } else {
      shared.session = null;
      next = `#${shared.dataset!.id}`;
    }
    if (location.hash !== next) {
      location.assign(next);
    }
    uploader.dataset.state = 'ready';
  }).catch((error) => {
    uploader.dataset.state = 'initial';
    toast({html: `<pre>${error}</pre>`, displayLength: 5000});
  });
}

function loadSession(session?: ISession) {
  if (!session || !shared.lineup) {
    shared.session = null;
    return;
  }
  shared.session = session;
  shared.lineup.data.restore(session.dump);
}

function disableBubbling(node: HTMLElement, ...events: string[]) {
  for (const event of events) {
    node.addEventListener(event, (evt) => evt.stopPropagation());
  }
}

function reset() {
  if (shared.lineup) {
    shared.lineup.destroy();
    shared.lineup = null;
  }
  shared.dataset = null;
  (<HTMLElement>document.querySelector('.brand-logo')).textContent = document.title = `LineUp`;
  Array.from(document.querySelectorAll('.nav-wrapper > a')).forEach((d: Element) => {
    (<HTMLElement>d).classList.add('disabled');
  }
  );
  uploader.dataset.state = 'initial';
}

function refreshCarousel() {
  const base = <HTMLElement>document.querySelector('.carousel');
  const instance = Carousel.getInstance(base);
  if (instance) {
    instance.destroy();
  }
  delete base.dataset.namespace;
  base.classList.remove('initialized');
  Carousel.init(base);
}

function addToCarousel(d: IDataset) {
  const base = <HTMLElement>document.querySelector('.carousel');
  const node = createCard(d, () => {
    node.remove();
    refreshCarousel();
  });
  base.appendChild(node);
}

function showFile(file: File) {
  const f = fromFile(file).then((r) => {
    shared.datasets.unshift(r);
    addToCarousel(r);
    refreshCarousel();
    return storeDataset(r).then(() => r);
  });
  build(f);
}

window.addEventListener('resize', () => {
  setTimeout(() => {
    if (shared.lineup) {
      shared.lineup.update();
    }
  }, 100);
}, {
  passive: false
});

initExport();


FloatingActionButton.init(document.querySelectorAll('.fixed-action-btn'), {
  direction: 'left'
});
Tooltip.init(document.querySelectorAll('.tooltipped'));

{
  // update version info
  document.querySelector<HTMLElement>('.version-info')!.innerHTML = `LineUp.js v${version} (${buildId})`;
}

allDatasets().then((data) => {
  shared.datasets = data;
  {
    const file = (<HTMLInputElement>document.querySelector('input[type=file]'));
    file.addEventListener('change', () => {
      showFile(file.files![0]);
    }
    );
    (<HTMLElement>document.querySelector('#dropper a.btn')).addEventListener('click', (evt) => {
      evt.preventDefault();
      evt.stopPropagation();
      file.click();
    }
    );
    uploader.addEventListener('dragover', (evt) => {
      evt.preventDefault();
      evt.stopPropagation();
    }
    );
    uploader.addEventListener('drop', (evt) => {
      if (evt.dataTransfer!.files.length !== 1) {
        return;
      }
      showFile(evt.dataTransfer!.files[0]);
      evt.preventDefault();
    }
    );
  }

  for (const d of data) {
    addToCarousel(d);
  }
  refreshCarousel();

  const findSession = (dataset?: IDataset, sessionUID?: string) => {
    const uid = sessionUID ? parseInt(sessionUID, 10) : NaN;
    if (!sessionUID || isNaN(uid) || !dataset || !dataset.sessions || dataset.sessions.length === 0) {
      return null;
    }
    return dataset.sessions.find((d) => d.uid === uid);
  };

  // handle hash changes
  const findAndLoadViaHash = (doReset: boolean = true) => {
    const h = location.hash.slice(1).split('@');
    const newDataset = data.find((d) => d.id === h[0]);
    const session = findSession(newDataset, h[1]);
    if (newDataset === shared.dataset) {
      if (session && session !== shared.session) {
        loadSession(session);
      }
      return;
    }
    if (doReset) {
      reset();
    }
    if (!newDataset) {
      return;
    }
    build(Promise.resolve(newDataset), session);
  };
  window.addEventListener('hashchange', () => findAndLoadViaHash(true));
  findAndLoadViaHash(false);
});

declare const __DEBUG__: boolean;

// register service worker
if (!__DEBUG__ && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').then((registration) => {
    console.log('SW registered: ', registration);
  }).catch((registrationError) => {
    console.warn('SW registration failed: ', registrationError);
    });
  });
}
