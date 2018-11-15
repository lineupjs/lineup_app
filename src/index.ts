import {Tooltip, Carousel, FloatingActionButton, toast} from 'materialize-css';
import 'file-loader?name=index.html!extract-loader!html-loader?interpolate!./index.html';
import './assets/favicon/favicon';
import './style.scss';
import 'typeface-roboto/index.css';
import initExport from './export';
import shared from './shared';
import {toCard, IDataset, fromFile, allDatasets} from './data';
import {version, buildId} from 'lineupjs';
import {storeDataset, deleteDataset} from './data/db';;

const uploader = <HTMLElement>document.querySelector('main');

function build(builder: Promise<IDataset>) {
  uploader.dataset.state = 'uploading';
  builder.then((d: IDataset) => {
    shared.dataset = d;
    return d.build(<HTMLElement>document.querySelector('div.lu-c'));
  }).then((l) => {
    shared.lineup = l;
    disableBubbling(<HTMLElement>document.querySelector('div.lu-c > main > main'), 'mousemove', 'mouseout', 'mouseover');
    return new Promise<any>((resolve) => setTimeout(resolve, 500));
  }).then(() => {
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
  }).catch((error) => {
    uploader.dataset.state = 'initial';
    toast({html: `<pre>${error}</pre>`, displayLength: 5000});
  });
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

function rebuildCarousel(data: IDataset[]) {
  const base = <HTMLElement>document.querySelector('.carousel');
  const instance = Carousel.getInstance(base);
  if (instance) {
    instance.destroy();
  }
  delete base.dataset.namespace;
  base.classList.remove('initialized');
  base.innerHTML = '';
  data.forEach((d) => base.insertAdjacentHTML('afterbegin', toCard(d))); // init carousel
  Carousel.init(base);

  // init buttons
  Array.from(base.querySelectorAll<HTMLElement>('[data-action=delete]')).forEach((elem: HTMLElement) => {
    elem.onclick = (evt) => {
      evt.preventDefault();
      evt.stopPropagation();
      const id = elem.dataset.id;
      const datasetIndex = data.findIndex((d) => d.id === id);
      deleteDataset(data[datasetIndex]).then(() => {
        const old = data.splice(datasetIndex, 1)[0]!;
        toast({html: `Dataset "${old.title}" deleted`, displayLength: 5000});
        rebuildCarousel(data);
      }).catch((error) => {
        toast({html: `Error while deleting dataset: <pre>${error}</pre>`, displayLength: 5000});
      });
    };
  });
}

function showFile(file: File, datasets: IDataset[]) {
  const f = fromFile(file).then((r) => {
    datasets.unshift(r);
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
  {
    const file = (<HTMLInputElement>document.querySelector('input[type=file]'));
    file.addEventListener('change', () => {
      showFile(file.files![0], data);
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
      showFile(evt.dataTransfer!.files[0], data);
      evt.preventDefault();
    }
    );
  }

  rebuildCarousel(data);


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
      rebuildCarousel(data);
      if (newDataset) {
        build(Promise.resolve(newDataset));
      }
    }
    );

    if (chosenDataset) {
      build(Promise.resolve(chosenDataset));
    }
  }
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
