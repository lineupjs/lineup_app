import MatrixColumn from './MatrixColumn';
import {IToolbarAction} from 'lineupjs';
import SplitMatrixDialog from './SplitMatrixDialog';

export {default as MatrixColumn, IStratification} from './MatrixColumn';

export const splitMatrix: IToolbarAction = {
  title: 'Split By &hellip;',
  onClick: (col, evt, ctx, level) => {
    const dialog = new SplitMatrixDialog(<MatrixColumn>col, {
      attachment: <HTMLElement>evt.currentTarget,
      level,
      manager: ctx.dialogManager,
      idPrefix: ctx.idPrefix
    }, ctx);
    dialog.open();
  },
  options: {
    shortcut: true,
    order: 50
  }
};
