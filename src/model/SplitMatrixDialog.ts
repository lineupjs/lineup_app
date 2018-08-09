import {ADialog, IRankingHeaderContext, IDialogContext} from 'lineupjs';
import MatrixColumn from './MatrixColumn';


export default class SplitMatrixDialog extends ADialog {
  constructor(private readonly column: MatrixColumn, dialog: IDialogContext, private readonly ctx: IRankingHeaderContext) {
    super(dialog, {

    });
  }

  protected build(node: HTMLElement) {
    const categories = this.column.getStratifications();

    node.insertAdjacentHTML('beforeend', `<select class="browser-default">
      <option value="">Split matrix by...</option>
          ${categories.map((d) => `<option value="${d.name}">${d.name}</option>`).join('')}
      </select>`);

    const select = <HTMLSelectElement>node.querySelector('select')!;
    select.addEventListener('change', (evt) => {
      evt.preventDefault();
      evt.stopPropagation();

      const selected = categories[select.selectedIndex - 1]; // empty option
      if (!selected) {
        return;
      }
      this.column.splitBy(selected, this.ctx.provider);
      this.destroy();
    });
  }
}
