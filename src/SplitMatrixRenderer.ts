import { ICellRendererFactory, NumbersColumn, Column, IStatistics, ICategoricalStatistics, ICategory, IRenderContext, renderers, NestedColumn, createNestedDesc, IGroupCellRenderer, ICellRenderer } from 'lineupjs';


/**
 * special summary to split a matrix by a categorical attribute
 * @param {IStratification[]} categories
 * @return {ISummaryFunction}
 */
export interface IStratification {
  name: string;
  categories: (ICategory | string)[];
  data: string[];
}

/**
 * Extends the histogram renderer by adding a select field to the summary renderer.
 * The renderer needs a list of stratifications in the constructor
 */
export class SplitMatrixRenderer implements ICellRendererFactory {
  readonly title = 'Histogram + Matrix Splitter';
  private readonly histogramRenderer = renderers.histogram;

  constructor(private categories: IStratification[]) {
    //
  }

  canRender(col: Column, mode: any /*ERenderMode*/): boolean {
    return this.histogramRenderer.canRender(col, mode);
  }

  create(col: Column, context: IRenderContext, hist: IStatistics | ICategoricalStatistics | null, imposer?: any/*IImposer*/): ICellRenderer {
    return this.histogramRenderer.create(col, context, hist, imposer);
  }

  createGroup(col: Column, context: IRenderContext, hist: IStatistics | ICategoricalStatistics | null, imposer?: any/*IImposer*/): IGroupCellRenderer {
    return this.histogramRenderer.createGroup(col, context, hist, imposer);
  }

  createSummary(col: NumbersColumn, context: IRenderContext, interactive: boolean, imposer?: any/*IImposer*/) {
    const histogramRenderer = this.histogramRenderer.createSummary(col, context, interactive, imposer);
    if (!interactive) {
      return {
        template: histogramRenderer.template,
        update: (node: HTMLElement, hist: IStatistics | ICategoricalStatistics | null): void => {
          // use original histogram summary and add the select field
          histogramRenderer.update(node, hist);
          node.dataset.renderer = 'histogram';
        }
      };
    }

    const allLabels = (<any>col.desc).labels || [];

    return {
      template: histogramRenderer.template,
      update: (node: HTMLElement, hist: IStatistics | ICategoricalStatistics | null): void => {
        // use original histogram summary and add the select field
        histogramRenderer.update(node, hist);
        node.dataset.renderer = 'histogram';

        if (node.querySelector('select') || this.categories.length === 0) {
          return; // prevent adding two select fields
        }

        node.dataset.summary = 'stratify';

        node.innerHTML += `<select>
            <option value="">Split matrix by...</option>
            ${this.categories.map((d) => `<option value="${d.name}">${d.name}</option>`).join('')}
        </select>`;

        const select = <HTMLSelectElement>node.querySelector('select')!;
        select.addEventListener('change', (evt) => {
          evt.preventDefault();
          evt.stopPropagation();

          const selected = this.categories[select.selectedIndex - 1]; // empty option
          if (!selected) {
            return;
          }
          const base = <NestedColumn>context.provider.create(createNestedDesc(`${col.getMetaData().label} by ${selected.name}`));
          const w = col.getWidth();
          selected.categories.forEach((group) => {
            const g = typeof group === 'string' ? { name: group, label: group, color: undefined } : group;
            const gcol = <NumbersColumn>context.provider.clone(col);
            // set group name
            gcol.setMetaData({ label: g.label || g.name, color: g.color || Column.DEFAULT_COLOR, description: '' });

            const length = selected.data.reduce((a, s) => a + (s === g.name ? 1 : 0), 0);
            gcol.setSplicer(<any>{
              length,
              splice: (vs: any[]) => vs.filter((_v: any, i: number) => selected.data[i] === g.name),
              labels: allLabels.filter((_v: any, i: number) => selected.data[i] === g.name)
            });
            gcol.setWidth(w * length / selected.data.length);

            base.push(gcol);
          });

          // replace with splitted value
          col.insertAfterMe(base);
          col.removeMe();
        });
      }
    };
  }
}
