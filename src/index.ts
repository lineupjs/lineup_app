import 'file-loader?name=index.html!./index.html';
import './style.scss';
import 'jquery';
import 'imports-loader?jQuery=jquery!materialize-css';
import { parse, ParseResult } from 'papaparse';
import { builder } from 'lineupjs';
import 'lineupjs/build/LineUpJS.css';


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
  builder(result.data)
    .deriveColumns(...result.meta.fields)
    .deriveColors()
    .rowHeight(22, 2)
    .defaultRanking()
    .build(<HTMLElement>document.querySelector('div.lu'));
}
const uploader = <HTMLElement>document.querySelector('main');

function showFile(file: File) {
  uploader.dataset.state = 'uploading';
  uploadFile(file)
    .then(convertFile)
    .then(() => new Promise<any>((resolve) => setTimeout(resolve, 500)))
    .then(() => {
      uploader.dataset.state = 'ready';
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
