import {version} from 'lineupjs';
import shared from './shared';

import CODEPEN_CSS from 'raw-loader!../templates/style.tcss';
import {exportJSON} from './data/loader_json';
import {exportCSV} from './data/loader_csv';
import {exportDump} from './data/loader_dump';


export default function initExport() {
  const downloadHelper = <HTMLLinkElement>document.querySelector('#downloadHelper');
  document.querySelector('#downloadCSV')!.addEventListener('click', (evt) => {
    evt.preventDefault();
    evt.stopPropagation();
    exportCSV(shared.lineup!).then((csv) => {
      // download link
      downloadHelper.href = `data:text/csv;charset=utf-8;base64,${btoa(unescape(encodeURIComponent(csv)))}`;
      (<any>downloadHelper).download = `${shared.dataset!.name}.csv`;
      downloadHelper.click();
    });
  });
  document.querySelector('#downloadJSON')!.addEventListener('click', (evt) => {
    evt.preventDefault();
    evt.stopPropagation();
    exportJSON(shared.lineup!).then((json) => {
      // download link
      downloadHelper.href = `data:application/json;charset=utf-8;base64,${btoa(unescape(encodeURIComponent(JSON.stringify(json))))}`;
      (<any>downloadHelper).download = `${shared.dataset!.name}.json`;
      downloadHelper.click();
    });
  });
  document.querySelector('#downloadDump')!.addEventListener('click', (evt) => {
    evt.preventDefault();
    evt.stopPropagation();
    Promise.resolve(exportDump(shared.dataset!, shared.lineup!)).then((json) => {
      // download link
      downloadHelper.href = `data:application/json;charset=utf-8;base64,${btoa(unescape(encodeURIComponent(JSON.stringify(json))))}`;
      (<any>downloadHelper).download = `${shared.dataset!.name}.json`;
      downloadHelper.click();
    });
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
      css_external: `https://unpkg.com/lineupjs@${version}/build/LineUpJS.min.css`,
      js_external: `https://unpkg.com/lineupjs@${version}/build/LineUpJS.min.js;https://cdn.rawgit.com/mholt/PapaParse/master/papaparse.min.js`
    };

    const json = JSON.stringify(data)
      // Quotes will screw up the JSON
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

    createCodepenHelper.querySelector('input')!.value = json;
    createCodepenHelper.submit();
  });
}
