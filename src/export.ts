import * as Materialize from 'materialize-css';
import {isSupportType, LocalDataProvider} from 'lineupjs';
import shared from './shared';

import CODEPEN_CSS from 'raw-loader!../templates/style.tcss';
import GIST_HTML from 'raw-loader!../templates/index.html';


export default function initExport() {
  const downloadHelper = <HTMLLinkElement>document.querySelector('#downloadHelper');
  document.querySelector('#downloadCSV')!.addEventListener('click', (evt) => {
    evt.preventDefault();
    evt.stopPropagation();
    shared.lineup!.data.exportTable(shared.lineup!.data.getRankings()[0], {}).then((csv) => {
      // download link
      downloadHelper.href = `data:text/csv;charset=utf-8,${csv}`;
      (<any>downloadHelper).download = `${shared.dataset!.title}.csv`;
      downloadHelper.click();
    });
  });
  document.querySelector('#downloadJSON')!.addEventListener('click', (evt) => {
    evt.preventDefault();
    evt.stopPropagation();
    const ranking = shared.lineup!.data.getRankings()[0];
    const cols = ranking.flatColumns.filter((d) => !isSupportType(d));
    const data = <LocalDataProvider>shared.lineup!.data;
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
    (<any>downloadHelper).download = `${shared.dataset!.title}.json`;
    downloadHelper.click();
  });


  const createCodepen = <HTMLLinkElement>document.querySelector('#createCodePen');
  const createCodepenHelper = <HTMLFormElement>document.querySelector('#createCodePenHelper');
  createCodepen.addEventListener('click', (evt) => {
    evt.preventDefault();
    evt.stopPropagation();

    const data = {
      title: document.title,
      description: shared.dataset!.description,
      html: `<script id="data" type="text/csv">${shared.dataset!.rawData}</script>`,
      css: CODEPEN_CSS,
      css_pre_processor: 'scss',
      css_starter: 'normalize',
      js: shared.dataset!.buildScript(`document.querySelector('#data').textContent`, 'document.body'),
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


  const createGist = <HTMLLinkElement>document.querySelector('#createGist');
  createGist.addEventListener('click', (evt) => {
    evt.preventDefault();
    evt.stopPropagation();

    const data = {
      description: document.title,
      public: false,
      files: {
        'index.html': {
          content: GIST_HTML.replace('DATADATA', shared.dataset!.rawData)
        },
        'index.js': {
          content: shared.dataset!.buildScript(`document.querySelector('#data').textContent`, 'document.body'),
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
