import {version} from 'lineupjs';
import shared from './shared';

import CODEPEN_CSS from 'raw-loader!../templates/style.tcss';
import {exportJSON} from './data/loader_json';
import {exportCSV} from './data/loader_csv';
import {exportDump} from './data/loader_dump';


export default function initExport() {
  const downloadHelper = <HTMLLinkElement>document.querySelector('#downloadHelper');

  const downloadImpl = (data: string, name: string, mimetype: string) => {
    // download link
    const b = new Blob([data], {type: mimetype});
    downloadHelper.href = URL.createObjectURL(b);
    (<any>downloadHelper).download = name;
    downloadHelper.click();
  };

  document.querySelector('#downloadCSV')!.addEventListener('click', (evt) => {
    evt.preventDefault();
    evt.stopPropagation();
    exportCSV(shared.lineup!).then((csv) => {
      downloadImpl(csv, `${shared.dataset!.name}.csv`, 'text/csv');
    });
  });
  document.querySelector('#downloadJSON')!.addEventListener('click', (evt) => {
    evt.preventDefault();
    evt.stopPropagation();
    exportJSON(shared.lineup!).then((json) => {
      downloadImpl(JSON.stringify(json, null, ' '), `${shared.dataset!.name}.json`, 'application/json');
    });
  });
  document.querySelector('#downloadDump')!.addEventListener('click', (evt) => {
    evt.preventDefault();
    evt.stopPropagation();
    Promise.resolve(exportDump(shared.dataset!, shared.lineup!)).then((json) => {
      downloadImpl(JSON.stringify(json, null, ' '), `${shared.dataset!.name}.json`, 'application/json');
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
      html: `<script id="data" type="text/csv">${shared.dataset!.rawData}</script>\n\n<script id="dump" type="application/json">${JSON.stringify(shared.lineup!.dump(), null, ' ')}</script>`,
      css: CODEPEN_CSS,
      css_pre_processor: 'scss',
      css_starter: 'normalize',
      js: shared.dataset!.buildScript(`document.querySelector('#data').textContent`, 'document.body', `JSON.parse(document.querySelector('#dump').textContent)`),
      js_pre_processor: 'babel',
      js_modernizr: false,
      css_external: `https://unpkg.com/lineupjs@${version}/build/LineUpJS.css`,
      js_external: `https://unpkg.com/lineupjs@${version}/build/LineUpJS.js;https://unpkg.com/papaparse`
    };

    const json = JSON.stringify(data)
      // Quotes will screw up the JSON
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

    createCodepenHelper.querySelector('input')!.value = json;
    createCodepenHelper.submit();
  });
}
