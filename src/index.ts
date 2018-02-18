import 'file-loader?name=index.html!./index.html';
import './style.scss';
import * as Materialize from 'materialize-css';
import * as $ from 'jquery';
import {LineUp, isSupportType, LocalDataProvider} from 'lineupjs';
import 'lineupjs/build/LineUpJS.css';

import CODEPEN_CSS from 'raw-loader!../templates/style.tcss';
import GIST_HTML from 'raw-loader!../templates/index.html';

import data, {toCard, IDataset, fromFile} from './data';

let lineup: LineUp | null;
let dataset: IDataset | null;
const uploader = <HTMLElement>document.querySelector('main');

function build(builder: Promise<IDataset>) {
  uploader.dataset.state = 'uploading';
  builder.then((d: IDataset) => {
    dataset = d;
    return d.build(<HTMLElement>document.querySelector('div.lu-c'));
  }).then((l) => {
    lineup = l;
    return new Promise<any>((resolve) => setTimeout(resolve, 500));
  }).then(() => {
    const next = `#${dataset!.id}`;
    if (location.hash !== 'next') {
      location.assign(next);
    }
    (<HTMLElement>document.querySelector('.brand-logo')).textContent = document.title = `LineUp ${dataset!.title}`;
    Array.from(document.querySelectorAll('.nav-wrapper a.disabled')).forEach((d: HTMLElement) => {
      d.classList.remove('disabled');
    });
    uploader.dataset.state = 'ready';
  });
}

function reset() {
  if (lineup) {
    lineup.destroy();
    lineup = null;
  }
  dataset = null;
  (<HTMLElement>document.querySelector('.brand-logo')).textContent = document.title = `LineUp`;
  Array.from(document.querySelectorAll('.nav-wrapper > a')).forEach((d: HTMLElement) => {
    d.classList.add('disabled');
  });
  uploader.dataset.state = 'initial';
}

function rebuildCarousel() {
  const base = <HTMLElement>document.querySelector('.carousel');
  $('.carousel').carousel('destroy');
  delete base.dataset.namespace;
  base.classList.remove('initialized');
  base.innerHTML = '';
  data.forEach((d) => base.insertAdjacentHTML('afterbegin', toCard(d)));

  // init carousel
  $('.carousel').carousel();
}

function showFile(file: File) {
  build(fromFile(file).then((r) => {
    data.unshift(r);
    return r;
  }));
}

{
  const downloadHelper = <HTMLLinkElement>document.querySelector('#downloadHelper');
  document.querySelector('#downloadCSV')!.addEventListener('click', (evt) => {
    evt.preventDefault();
    evt.stopPropagation();
    lineup!.data.exportTable(lineup!.data.getRankings()[0], {}).then((csv) => {
      // download link
      downloadHelper.href = `data:text/csv;charset=utf-8,${csv}`;
      (<any>downloadHelper).download = `${dataset!.title}.csv`;
      downloadHelper.click();
    });
  });
  document.querySelector('#downloadJSON')!.addEventListener('click', (evt) => {
    evt.preventDefault();
    evt.stopPropagation();
    const ranking = lineup!.data.getRankings()[0];
    const cols = ranking.flatColumns.filter((d) => !isSupportType(d));
    const data = <LocalDataProvider>lineup!.data;
    const ordered = data.viewRawRows(ranking.getOrder());
    const json = ordered.map((row) => {
      const r: any = {};
      cols.forEach((col) => {
        r[col.label] = col.getValue(row);
      });
      return r;
    });
    // download link
    downloadHelper.href = `data:application/json;charset=utf-8,${JSON.stringify(json)}`;
    (<any>downloadHelper).download = `${dataset!.title}.json`;
    downloadHelper.click();
  });
}
{
  const createCodepen = <HTMLLinkElement>document.querySelector('#createCodePen');
  const createCodepenHelper = <HTMLFormElement>document.querySelector('#createCodePenHelper');
  createCodepen.addEventListener('click', (evt) => {
    evt.preventDefault();
    evt.stopPropagation();

    const data = {
      title: document.title,
      description: dataset!.description,
      html: `<script id="data" type="text/csv">${dataset!.rawData}</script>`,
      css: CODEPEN_CSS,
      css_pre_processor: 'scss',
      css_starter: 'normalize',
      js: dataset!.buildScript(`document.querySelector('#data').textContent`, 'document.body'),
      js_pre_processor: 'babel',
      js_modernizr: false,
      css_external: 'https://sgratzl.github.io/lineupjs_docs/master/LineUpJS.min.css',
      js_external: 'https://sgratzl.github.io/lineupjs_docs/master/LineUpJS.min.js;https://cdn.rawgit.com/mholt/PapaParse/master/papaparse.min.js'
    };

    const json = JSON.stringify(data)
      // Quotes will screw up the JSON
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

    createCodepenHelper.querySelector('input')!.value = json;
    createCodepenHelper.submit();
  });
}
{
  const createGist = <HTMLLinkElement>document.querySelector('#createGist');
  createGist.addEventListener('click', (evt) => {
    evt.preventDefault();
    evt.stopPropagation();

    const data = {
      description: document.title,
      public: false,
      files: {
        'index.html': {
          content: GIST_HTML.replace('DATADATA', dataset!.rawData)
        },
        'index.js': {
          content: dataset!.buildScript(`document.querySelector('#data').textContent`, 'document.body'),
        },
        'style.css': {
          content: CODEPEN_CSS
        }
      }
    };

    const loading = Materialize.toast((<HTMLElement>document.querySelector('#export-helper')).innerHTML, 100000);

    fetch('https://api.github.com/gists', {
      body: JSON.stringify(data),
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', // include, *omit
      headers: {
        'content-type': 'application/json'
      },
      method: 'POST',
      mode: 'cors',
      redirect: 'follow',
      referrer: 'no-referrer'
    }).then((r) => r.json())
      .then((r: any) => {
        loading.remove();
        Materialize.toast(`
          <span>Successfully exported</span>
          <a class="btn-flat toast-action" href="${r.html_url}" target="_blank">Open Gist</button>
          <a class="btn-flat toast-action" href="https://bl.ocks.org/${r.id}" target="_blank">Open Bl.ocks</button>
        `, 10000);
      })
      .catch((error) => {
        loading.remove();
        Materialize.toast(`
          <span>Error during export</span>
          <span>${error}</span>
        `, 10000, 'red darken-1');
      });
  });
}

{
  const file = (<HTMLInputElement>document.querySelector('input[type=file]'));
  file.addEventListener('change', () => {
    showFile(file.files![0]);
  });
  (<HTMLElement>document.querySelector('#dropper a.btn')).addEventListener('click', (evt) => {
    evt.preventDefault();
    evt.stopPropagation();
    file.click();
  });
  uploader.addEventListener('dragover', (evt) => {
    evt.preventDefault();
    evt.stopPropagation();
  });
  uploader.addEventListener('drop', (evt) => {
    if (evt.dataTransfer.files.length !== 1) {
      return;
    }
    showFile(evt.dataTransfer.files[0]);
    evt.preventDefault();
  });
}

rebuildCarousel();

{
  const h = location.hash.slice(1);
  const chosenDataset = data.find((d) => d.id === h);

  window.addEventListener('hashchange', () => {
    const h = location.hash.slice(1);
    const newDataset = data.find((d) => d.id === h);
    if (newDataset === dataset) {
      return;
    }
    reset();
    rebuildCarousel();
    if (newDataset) {
      build(Promise.resolve(newDataset));
    }
  });

  if (chosenDataset) {
    build(Promise.resolve(chosenDataset));
  }
}
