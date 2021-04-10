import { Model, NodeWithSlots } from '../../model/EditorModel';
import { useMemo, useState } from '@saasquatch/universal-hooks';
import { useDND } from './useDragState';
import { useComponentModel } from './useComponentModel';
import { RaisinNode } from '../../model/RaisinNode';
import { parse } from '../../model/parser';
import useCanvas from './useCanvas';
import { useCore } from './useCore';
import { useStyleEditor } from './useStyleEditor';

export type Mode = 'preview' | 'edit';

export type InternalState = {
  current: RaisinNode;
  slots: NodeWithSlots;
  undoStack: RaisinNode[];
  redoStack: RaisinNode[];
  selected?: RaisinNode;
};

export type DraggableState = Map<
  RaisinNode,
  {
    element?: HTMLElement;
    handle?: HTMLElement;
  }
>;

const nodeToId = new WeakMap<RaisinNode, string>();

export function getId(node: RaisinNode): string {
  const existing = nodeToId.get(node);
  if (existing) {
    return existing;
  }
  const id = 'node-' + Math.round(Math.random() * 10000);
  nodeToId.set(node, id);
  return id;
}

export function useEditor(host: HTMLElement): Model {
  const metamodel = useComponentModel();
  const initial = useMemo(() => {
    const html = host.querySelectorAll('template')[0].innerHTML;
    const raisinNode = parse(html);
    return raisinNode;
  }, []);

  const core = useCore(metamodel, initial);
  const [mode, setMode] = useState<Mode>('edit');

  return {
    ...core,
    getId,
    mode,
    setMode,
    ...useStyleEditor({ node: core.node, setNode: core.setNode, parents: core.parents, componentModel: metamodel }),
    ...metamodel,
    ...useCanvas({ selected: core.selected, setNodeInternal: core.setNodeInternal }),
    ...useDND({ node: core.node, setNode: core.setNode, parents: core.parents, componentModel: metamodel }),
  };
}
