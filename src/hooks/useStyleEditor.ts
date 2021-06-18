import { useMemo, useState } from '@saasquatch/universal-hooks';
import * as css from 'css-tree';
import { RaisinDocumentNode, RaisinNode, RaisinNodeWithChildren, RaisinStyleNode } from '../core/html-dom/RaisinNode';
import { IdentityVisitor, replace, visit } from '../core/html-dom/util';
import { StateUpdater } from '../util/NewState';
import { ComponentModel } from './useComponentModel';

type Props = { node: RaisinNode; setNode: StateUpdater<RaisinNode>; parents: WeakMap<RaisinNode, RaisinNodeWithChildren>; componentModel: ComponentModel };

export function useStyleEditor(props: Props) {
  const sheets = useMemo(() => {
    // Finds all style nodes.
    const nodes: RaisinStyleNode[] = [];
    visit(props.node, {
      ...IdentityVisitor,
      onStyle: n => {
        nodes.push(n);
        return n;
      },
    });
    return nodes;
  }, [props.node]);

  // TOOD: This is volatile to Undo / Redo. It should reset based on Undo/Redo, but instead is cached
  const [selectedSheet, setSelectedsheet] = useState<RaisinStyleNode>(undefined);

  const updateSelectedSheet: StateUpdater<css.CssNodePlain> = next => {
    props.setNode((prev: RaisinDocumentNode) => {
      const nextVal = typeof next === 'function' ? next(selectedSheet.contents) : next;
      const newSheet: RaisinStyleNode = { ...selectedSheet, contents: nextVal };
      setSelectedsheet(newSheet);
      return replace(prev, selectedSheet, newSheet);
      // return prev;
    });
  };
  return {
    sheets,
    selectedSheet,
    setSelectedsheet,
    updateSelectedSheet,
    // styleString: csstree.generate(csstree.fromPlainObject(fakeCSS), {}),
  };
}
