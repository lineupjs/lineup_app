import { ICellRendererFactory, NumbersColumn, Column, isNumbersColumn, IStatistics, ICategoricalStatistics, ICategory, IRenderContext, renderers } from 'lineupjs';


/** @internal */
export function noop() {
  // no op
}

/** @internal */
export const noRenderer = {
  template: `<div></div>`,
  update: noop,
  render: noop
};

export interface IStratification {
  name: string;
  categories: (ICategory | string)[];
  data: string[];
}

export class SplitMatrixRenderer implements ICellRendererFactory {
  readonly title = 'SplitMatrix';

  constructor(private categories: IStratification[]) {
    console.log(categories);

  }

  canRender(col: Column) {
    return isNumbersColumn(col);
  }

  create(col: NumbersColumn) {
    return noRenderer;
  }

  createGroup() {
    return noRenderer;
  }

  createSummary(col: NumbersColumn, context: IRenderContext, interactive: boolean, imposer?: any) {
    if (!interactive) {
      return renderers.histogram.createSummary(col, context, interactive, imposer);
    }

    return {
      template: `<div></div>`,
      update: (node: HTMLElement, hist: IStatistics | ICategoricalStatistics | null): void => {
        node.dataset.summary = 'stratify';
        node.innerHTML = `<select>
            <option value="">Stratify by...</option>
            ${this.categories.map((d) => `<option value="${d.name}">${d.name}</option>`).join('')}
        </select>`;
        const select = <HTMLSelectElement>node.firstElementChild!;
      }
    };
  }
}

/**
 * special summary to split a matrix by a categorical attribute
 * @param {IStratification[]} categories
 * @return {ISummaryFunction}
 */
/*
export function matrixSplicer(categories: IStratification[]) {
  return (col: NumbersColumn, node: HTMLElement, interactive: boolean, ctx) => {
    node.dataset.summary = 'stratify';
    const allLabels = (<any>col.desc).labels || [];
    if (!interactive) {
      // our custom splice also provides labels
      const labels = (<any>col.getSplicer()).labels || allLabels;
      if (!labels) {
        node.innerHTML = '';
      }
      node.innerHTML = `<span>${labels[0]}</span><span>${labels[labels.length - 1]}</span>`;
      return;
    }
    node.innerHTML = `<select>
        <option value="">Stratify by...</option>
        ${categories.map((d) => `<option value="${d.name}">${d.name}</option>`).join('')}
    </select>`;
    const select = <HTMLSelectElement>node.firstElementChild!;
    select.addEventListener('change', (evt) => {
      evt.preventDefault();
      evt.stopPropagation();

      const selected = categories[select.selectedIndex - 1]; // empty option
      if (!selected) {
        return;
      }
      const base = <NestedColumn>ctx.provider.create(createNestedDesc(`${col.getMetaData().label} by ${selected.name}`));
      const w = col.getWidth();
      selected.categories.forEach((group) => {
        const g = typeof group === 'string' ? {name: group, label: group} : group;
        const gcol = <NumbersColumn>ctx.provider.clone(col);
        // set group name
        gcol.setMetaData({label: g.label || g.name, color: g.color || Column.DEFAULT_COLOR, description: ''});

        const length = selected.data.reduce((a, s) => a + (s === g.name ? 1 : 0), 0);
        gcol.setSplicer(<any>{
          length,
          splice: (vs) => vs.filter((_v, i) => selected.data[i] === g.name),
          labels: allLabels.filter((_v, i) => selected.data[i] === g.name)
        });
        gcol.setWidth(w * length / selected.data.length);

        base.push(gcol);
      });

      // replace with splitted value
      col.insertAfterMe(base);
      col.removeMe();
    });
  };
}
*/
