import 'materialize-css';
import 'file-loader?name=index.html!extract-loader!html-loader?interpolate!./index.html';
import './assets/favicon/favicon';
import './style.scss';
import 'font-awesome/css/font-awesome.css';
import * as $ from 'jquery';
import 'lineupjs/build/LineUpJS.css';
import initExport from './export';
import shared from './shared';

import data,
{
  toCard,
  IDataset,
  fromFile
}

  from './data';

const uploader = <HTMLElement>document.querySelector('main');

function build(builder: Promise<IDataset>) {
  uploader.dataset.state = 'uploading';
  builder.then((d: IDataset) => {
    shared.dataset = d;
    return d.build(<HTMLElement>document.querySelector('div.lu-c'));
  }
  ).then((l) => {
    shared.lineup = l;
    return new Promise<any>((resolve) => setTimeout(resolve, 500));
  }
  ).then(() => {
    const next = `#${shared.dataset!.id}`;
    if (location.hash !== 'next') {
      location.assign(next);
    } // patch switch button
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
    uploader.dataset.state = 'ready';
  }
  );
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

function rebuildCarousel() {
  const base = <HTMLElement>document.querySelector('.carousel');
  (<any>$)('.carousel').carousel('destroy');
  delete base.dataset.namespace;
  base.classList.remove('initialized');
  base.innerHTML = '';
  data.forEach((d) => base.insertAdjacentHTML('afterbegin', toCard(d))); // init carousel
  (<any>$)('.carousel').carousel();
}

function showFile(file: File) {
  build(fromFile(file).then((r) => {
    data.unshift(r);
    return r;
  }
  ));
}

window.addEventListener('resize', () => {
  if (shared.lineup) {
    shared.lineup.update();
  }
});

initExport();

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
    if (evt.dataTransfer.files.length !== 1) {
      return;
    }
    showFile(evt.dataTransfer.files[0]);
    evt.preventDefault();
  }
  );
}

rebuildCarousel();

{
  const h = location.hash.slice(1);
  const chosenDataset = data.find((d) => d.id === h);

  window.addEventListener('hashchange', () => {
    const h = location.hash.slice(1);
    const newDataset = data.find((d) => d.id === h);
    if (newDataset === shared.dataset) {
      return;
    }
    reset();
    rebuildCarousel();
    if (newDataset) {
      build(Promise.resolve(newDataset));
    }
  }
  );

  if (chosenDataset) {
    build(Promise.resolve(chosenDataset));
  }
}


declare const __DEBUG__: boolean;

// register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').then((registration) => {
    console.log('SW registered: ', registration);
  }).catch((registrationError) => {
    console.warn('SW registration failed: ', registrationError);
    });
  });
}
