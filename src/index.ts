import 'file-loader?name=index.html!./index.html';
import './style.scss';
import 'jquery';
import 'imports-loader?jQuery=jquery!materialize-css';
import {parse, ParseResult} from 'papaparse';
import {builder, LineUp} from 'lineupjs';
import 'lineupjs/build/LineUpJS.css';


let lineup: LineUp;
let uploadedFile: File;
const uploader = <HTMLElement>document.querySelector('main');

const downloadCSV = <HTMLLinkElement>document.querySelector('#downloadCSV');
const downloadCSVHelper = <HTMLLinkElement>document.querySelector('#downloadCSVHelper');
const createCodepen = <HTMLLinkElement>document.querySelector('#createCodePen');
const createCodepenHelper = <HTMLFormElement>document.querySelector('#createCodePenHelper');

const CODEPEN_CSS = `.lu {
  clear: both;
  position: absolute;
  top: 1px;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0;
}`;

const CODEPEN_JS = `const arr = [];
const cats = ['c1', 'c2', 'c3'];
for (let i = 0; i < 100; ++i) {
  arr.push({
    a: Math.random() * 10,
    d: 'Row ' + i,
    cat: cats[Math.floor(Math.random() * 3)],
    cat2: cats[Math.floor(Math.random() * 3)]
  })
}
const lineup = LineUpJS.asLineUp(document.body, arr);`;

function uploadFile(file: File) {
  return new Promise<ParseResult>((resolve) => {
    parse(file, {
      dynamicTyping: true,
      header: true,
      complete: resolve,
      skipEmptyLines: true
    });
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
  uploadedFile = file;
  uploader.dataset.state = 'uploading';
  uploadFile(file)
    .then(convertFile)
    .then(() => new Promise<any>((resolve) => setTimeout(resolve, 500)))
    .then(() => {
      downloadCSV.classList.remove('disabled');
      createCodepen.classList.remove('disabled');
      uploader.dataset.state = 'ready';
    });
}

downloadCSV.addEventListener('click', (evt) => {
  evt.preventDefault();
  evt.stopPropagation();
  lineup.data.exportTable(lineup.data.getRankings()[0], {}).then((csv) => {
    // download link
    downloadCSVHelper.href = `data:text/csv;charset=utf-8,${csv}`;
    (<any>downloadCSVHelper).download = `${uploadedFile.name}.csv`;
    downloadCSVHelper.click();
  });
});

createCodepen.addEventListener('click', (evt) => {
  evt.preventDefault();
  evt.stopPropagation();

  const data = {
    title: `LineUp ${uploadedFile.name}`,
    description: 'this is an auto exported from the LineUp demo app',
    html: ``,
    css: CODEPEN_CSS,
    css_pre_processor: 'scss',
    css_starter: 'normalize',
    js: CODEPEN_JS,
    js_pre_processor: 'babel',
    js_modernizr: false,
    css_external: 'https://sgratzl.github.io/lineupjs_docs/master/LineUpJS.min.css',
    js_external: 'https://sgratzl.github.io/lineupjs_docs/master/LineUpJS.min.js'
  };

  const json = JSON.stringify(data)
    // Quotes will screw up the JSON
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

  createCodepenHelper.querySelector('input')!.value = json;
  createCodepenHelper.submit();
});

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
