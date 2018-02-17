import 'file-loader?name=index.html!./index.html';
import './style.scss';
import * as Materialize from 'materialize-css';
import {parse, ParseResult} from 'papaparse';
import {builder, LineUp, isSupportType, LocalDataProvider} from 'lineupjs';
import 'lineupjs/build/LineUpJS.css';

import CODEPEN_CSS from 'raw-loader!../templates/style.tcss';
import CODEPEN_JS from 'raw-loader!../templates/index.js';
import GIST_HTML from 'raw-loader!../templates/index.html';


let lineup: LineUp;
let uploadedName: string;
let uploadedFileContent: string;
const uploader = <HTMLElement>document.querySelector('main');

function uploadFile(file: File) {
  uploadedName = file.name.split('.').slice(0, -1).join('.');
  return new Promise<ParseResult>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      uploadedFileContent = String(reader.result);
      const parsed = parse(uploadedFileContent, {
        dynamicTyping: true,
        header: true,
        skipEmptyLines: true
      });
      resolve(parsed);
    };
    reader.readAsText(file);
  });
}
function convertFile(result: ParseResult) {
  lineup = builder(result.data)
    .deriveColumns(...result.meta.fields)
    .deriveColors()
    .rowHeight(22, 2)
    .defaultRanking()
    .build(<HTMLElement>document.querySelector('div.lu'));
}

function showFile(file: File) {
  uploader.dataset.state = 'uploading';
  uploadFile(file)
    .then(convertFile)
    .then(() => new Promise<any>((resolve) => setTimeout(resolve, 500)))
    .then(() => {
      (<HTMLElement>document.querySelector('.brand-logo')).textContent = document.title = `LineUp ${uploadedName}`;
      Array.from(document.querySelectorAll('.nav-wrapper a.disabled')).forEach((d: HTMLElement) => {
        d.classList.remove('disabled');
      });
      uploader.dataset.state = 'ready';
    });
}

{
  const downloadHelper = <HTMLLinkElement>document.querySelector('#downloadHelper');
  document.querySelector('#downloadCSV')!.addEventListener('click', (evt) => {
    evt.preventDefault();
    evt.stopPropagation();
    lineup.data.exportTable(lineup.data.getRankings()[0], {}).then((csv) => {
      // download link
      downloadHelper.href = `data:text/csv;charset=utf-8,${csv}`;
      (<any>downloadHelper).download = `${uploadedName}.csv`;
      downloadHelper.click();
    });
  });
  document.querySelector('#downloadJSON')!.addEventListener('click', (evt) => {
    evt.preventDefault();
    evt.stopPropagation();
    const ranking = lineup.data.getRankings()[0];
    const cols = ranking.flatColumns.filter((d) => !isSupportType(d));
    const data = <LocalDataProvider>lineup.data;
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
    (<any>downloadHelper).download = `${uploadedName}.json`;
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
      description: 'this is an auto exported from the LineUp demo app',
      html: `<script id="data" type="text/csv">${uploadedFileContent}</script>`,
      css: CODEPEN_CSS,
      css_pre_processor: 'scss',
      css_starter: 'normalize',
      js: CODEPEN_JS,
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
          content: GIST_HTML.replace('DATADATA', uploadedFileContent)
        },
        'index.js': {
          content: CODEPEN_JS
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
  (<HTMLElement>document.querySelector('#dropper a')).addEventListener('click', (evt) => {
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
