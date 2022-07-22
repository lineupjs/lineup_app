import shared from './shared';

import CODEPEN_CSS from 'raw-loader!../templates/style.tcss';
import { exportJSON } from './data/loader_json';
import { exportCSV } from './data/loader_csv';
import { exportDump } from './data/loader_dump';
import LZString from 'lz-string';

declare const LineUpJS: { version: string };

export default function initExport() {
  const downloadHelper = document.querySelector<HTMLAnchorElement>('#downloadHelper');

  const downloadImpl = (data: string, name: string, mimetype: string) => {
    // download link
    const b = new Blob([data], { type: mimetype });
    downloadHelper.href = URL.createObjectURL(b);
    downloadHelper.download = name;
    downloadHelper.click();
  };

  document.querySelector('#downloadCSV')!.addEventListener('click', (evt) => {
    evt.preventDefault();
    evt.stopPropagation();
    Promise.resolve(exportCSV(shared.lineup!)).then((csv) => {
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

  const createCodePen = document.querySelector<HTMLLinkElement>('#createCodePen');
  const createCodePenHelper = document.querySelector<HTMLFormElement>('#createCodePenHelper');
  createCodePen.addEventListener('click', (evt) => {
    evt.preventDefault();
    evt.stopPropagation();

    const data = {
      title: document.title,
      description: shared.dataset!.description,
      html: `<script id="data" type="text/csv">${
        shared.dataset!.rawData
      }</script>\n\n<script id="dump" type="application/json">${JSON.stringify(
        shared.lineup!.dump(),
        null,
        ' '
      )}</script>`,
      css: CODEPEN_CSS,
      css_pre_processor: 'scss',
      css_starter: 'normalize',
      js: shared.dataset!.buildScript(
        `document.querySelector('#data').textContent`,
        'document.body',
        `JSON.parse(document.querySelector('#dump').textContent)`
      ),
      js_pre_processor: 'babel',
      js_modernizr: false,
      css_external: `https://unpkg.com/lineupjs@${LineUpJS.version}/build/LineUpJS.css`,
      js_external: `https://unpkg.com/lineupjs@${LineUpJS.version}/build/LineUpJS.js;https://unpkg.com/papaparse`,
    };

    const json = JSON.stringify(data)
      // Quotes will screw up the JSON
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

    createCodePenHelper.querySelector('input')!.value = json;
    createCodePenHelper.submit();
  });

  const createJSFiddle = document.querySelector<HTMLLinkElement>('#createJSFiddle');
  const createJSFiddleHelper = document.querySelector<HTMLFormElement>('#createJSFiddleHelper');
  createJSFiddle.addEventListener('click', (evt) => {
    evt.preventDefault();
    evt.stopPropagation();

    const setInput = (name: string, value: any) => {
      const input = createJSFiddleHelper.querySelector<HTMLInputElement>(`[name="${name}"]`)!;
      input.value = value.toString();
    };

    setInput('title', document.title);
    setInput('description', shared.dataset!.description);
    setInput(
      'html',
      `<script id="data" type="text/csv">${
        shared.dataset!.rawData
      }</script>\n\n<script id="dump" type="application/json">${JSON.stringify(
        shared.lineup!.dump(),
        null,
        ' '
      )}</script>`
    );
    setInput('css', CODEPEN_CSS);
    setInput(
      'js',
      shared.dataset!.buildScript(
        `document.querySelector('#data').textContent`,
        'document.body',
        `JSON.parse(document.querySelector('#dump').textContent)`
      )
    );
    setInput(
      'resources',
      `https://unpkg.com/lineupjs@${LineUpJS.version}/build/LineUpJS.css,https://unpkg.com/lineupjs@${LineUpJS.version}/build/LineUpJS.js,https://unpkg.com/papaparse`
    );

    createJSFiddleHelper.submit();
  });

  const createCodeSandbox = document.querySelector<HTMLLinkElement>('#createCodeSandbox');
  const createCodeSandboxHelper = document.querySelector<HTMLFormElement>('#createCodeSandboxHelper');
  createCodeSandbox.addEventListener('click', (evt) => {
    evt.preventDefault();
    evt.stopPropagation();

    const parameters = {
      files: {
        'index.html': {
          content: `<!DOCTYPE html>
<html lang="en">
<head>
  <title>${document.title}</title>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
</head>
<body>
</body>
</html>`,
        },
        'data/raw_data.txt': {
          content: shared.dataset!.rawData,
        },
        'data/dump.json': {
          content: JSON.stringify(shared.lineup!.dump(), null, ' '),
        },
        'main.css': {
          content: CODEPEN_CSS,
        },
        'index.js': {
          content: `
import * as LineUpJS from "lineupjs";
import "lineupjs/build/LineUpJS.css";
import * as Papa from "papaparse";

import "./main.css";
import * as exportDump from "./data/dump.json";
import * as exportData from "./data/raw_data.txt";

${shared.dataset!.buildScript(`exportData.default`, 'document.body', `exportDump`)}`,
        },
        'package.json': {
          content: {
            name: document.title,
            description: shared.dataset!.description,
            dependencies: {
              lineupjs: LineUpJS.version,
              papaparse: '^4.6.2',
            },
          },
        },
      },
    };

    // based on codesandbox-import-utils
    const json = LZString.compressToBase64(JSON.stringify(parameters))
      .replace(/\+/g, '-') // Convert '+' to '-'
      .replace(/\//g, '_') // Convert '/' to '_'
      .replace(/=+$/, ''); // Remove ending '='

    createCodeSandboxHelper.querySelector('input')!.value = json;
    createCodeSandboxHelper.submit();
  });
}
