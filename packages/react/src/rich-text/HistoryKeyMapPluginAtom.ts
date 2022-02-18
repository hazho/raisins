import { keymap } from 'prosemirror-keymap';
import connectedAtom from '../util/atoms/connectedAtom';
import { RedoAtom, UndoAtom } from '../core/editting/HistoryAtoms';
import { SelectedAtom } from '../core/selection/SelectedNode';

export const HistoryKeyMapPluginAtom = connectedAtom((_, set) => {
  // FIXME: on undo/redo, we also need to update the selection to move the cursor

  const plugin = keymap({
    //  Uppercase Z implies "Shift" is used
    'Mod-Z': () => {
      set(RedoAtom);
      return true;
    },
    'Mod-z': () => {
      set(UndoAtom);
      return true;
    },
    'Mod-y': () => {
      set(RedoAtom);
      return true;
    },
    "Escape": () => {
      set(SelectedAtom, undefined);
      return true;
    },
  });
  return plugin;
});
