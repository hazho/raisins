import {
  getPath,
  htmlParser,
  htmlSerializer,
  htmlUtil,
  NodePath,
  NodeSelection,
  RaisinNode,
  RaisinNodeWithChildren,
} from '@raisins/core';
import { atom, Getter, PrimitiveAtom, SetStateAction } from 'jotai';
import { MutableRefObject } from 'react';
import { HTMLAtom } from './RaisinScope';
import { isFunction } from '../util/isFunction';
import { generateNextState } from './editting/EditAtoms';

export type InternalState = {
  current: RaisinNode;
  undoStack: RaisinNode[];
  redoStack: RaisinNode[];
  selected?: NodeSelection;
};

const { getParents, getAncestry: getAncestryUtil } = htmlUtil;

/*
    Scenario: Souls are presered when downstream HTML matches upstream HTML

        Given html has been loaded
        And a node is generated
        When a node is changed
        Then it's set upstream as serialized html
        When new serialized html is received downstream
        And the downstream html matches the upstream html
        Then a new node is not generated
        And a cached node is used
        And souls are preserved
*/
const NodeFromHtml = atom(
  (get) => {
    const ref = get(NodeWithHtmlRefAtom);
    const html = get(HTMLAtom);
    if (ref.current?.html === html) {
      return ref.current.node;
    }
    return htmlParser(html);
  },
  (get, set, current: RaisinNode) => {
    const cache = get(HtmlCacheAtom);
    let htmlString = cache.get(current);
    if (!htmlString) {
      htmlString = htmlSerializer(current);
      cache.set(current, htmlString);
    }
    const ref = get(NodeWithHtmlRefAtom);
    ref.current = { html: htmlString, node: current };
    set(HTMLAtom, htmlString);
  }
);
type NodeAndHTML = MutableRefObject<
  { html: string; node: RaisinNode } | undefined
>;
const NodeWithHtmlRefAtom = atom<NodeAndHTML>({ current: undefined });

const getDerivedInternal = (get: Getter) => {
  const current = get(NodeFromHtml);
  const historyState = get(HistoryAtom);
  return {
    current,
    ...historyState,
  };
};

const HtmlCacheAtom = atom(() => new WeakMap<RaisinNode, string>());

// Should be made private
export const InternalStateAtom: PrimitiveAtom<InternalState> = atom(
  getDerivedInternal,
  (get, set, next: SetStateAction<InternalState>) => {
    const iState = getDerivedInternal(get);
    const { current, ...rest } = isFunction(next) ? next(iState) : next;
    set(NodeFromHtml, current);
    set(HistoryAtom, rest);
  }
);
InternalStateAtom.debugLabel = 'InternalStateAtom';

export const HistoryAtom = atom<Omit<InternalState, 'current'>>({
  redoStack: [],
  undoStack: [],
  selected: undefined,
});
HistoryAtom.debugLabel = 'HistoryAtom';

export const RootNodeAtom = atom(
  (get) => get(InternalStateAtom).current,
  (_, set, next: SetStateAction<RaisinNode>) => {
    set(InternalStateAtom, (previous) => {
      const nextNode =
        typeof next === 'function' ? next(previous.current) : next;
      return generateNextState(previous, nextNode, false);
    });
  }
);
RootNodeAtom.debugLabel = 'RootNodeAtom';

export type IdentifierModel = {
  getAncestry(node: RaisinNode): RaisinNodeWithChildren[];
  getPath(node: RaisinNode): NodePath;
};
export const IdentifierModelAtom = atom<IdentifierModel>((get) => {
  const current = get(RootNodeAtom);
  const parents = get(ParentsAtom);

  function getPathInternal(node: RaisinNode): NodePath {
    return getPath(current, node)!;
  }
  function getAncestry(node: RaisinNode): RaisinNodeWithChildren[] {
    return getAncestryUtil(current, node, parents);
  }
  return {
    getAncestry,
    getPath: getPathInternal,
  };
});
IdentifierModelAtom.debugLabel = 'IdentifierModelAtom';

/**
 * RaisinNode --> RaisinNode (Parent)
 *
 * Map of children to their parents in the current document
 *
 */
export const ParentsAtom = atom((get) => {
  const doc = get(RootNodeAtom);
  return getParents(doc);
});
ParentsAtom.debugLabel = 'ParentsAtom';
