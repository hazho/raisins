import { RaisinNode } from '@raisins/core';
import { PrimitiveAtom, useAtom } from 'jotai';
import { SetAtom } from 'jotai/core/atom';
import { useAtomValue, useUpdateAtom } from 'jotai/utils';
import React, { useContext } from 'react';
import { RaisinScope } from '../core/RaisinScope';
import { createMemoizeAtom } from '../util/weakCache';
import { RootNodeAtom } from '../core/CoreAtoms';
import { nodeAtomWithSoulSaved } from './nodeAtomWithSoulSaved';
import {
  ScopedAtomCreator,
  WriteableScopedAtomCreator,
} from './ScopedAtomCreator';

// TODO: allow this to be swapped out? There are likely more history listeners.
const CONTEXT = React.createContext<PrimitiveAtom<RaisinNode>>(RootNodeAtom);
CONTEXT.displayName = 'RaisinNodeAtomContext';

/**
 * Uses atom for the "current node"
 *
 * Since this returns an atom, it should be performant and not cause the context re-rendering side
 * effects of just including `[state,setState]` in the context.
 *
 * @returns
 */
export const useNodeAtom = () => useContext(CONTEXT);

/**
 * Provides the "current node" context.
 */
export const NodeAtomProvider = ({
  nodeAtom,
  children,
}: {
  nodeAtom: PrimitiveAtom<RaisinNode>;
  children: React.ReactNode;
}) => {
  // Provides an important step -- saves souls to prevent spurious rerenders
  const value = nodeAtomWithSoulSaved(nodeAtom);
  const Pro = CONTEXT.Provider;
  return <Pro value={value}>{children}</Pro>;
};

/**
 * For writeable atoms
 */
export function atomForNode<R, W>(
  scopeFn: WriteableScopedAtomCreator<R, W, PrimitiveAtom<RaisinNode>>,
  debugLabel?: string
): {
  useValue: () => R;
  useUpdate: () => SetAtom<W, void>;
  useAtom: () => [R, SetAtom<W, void>];
};
/**
 * For read-only atoms
 */
export function atomForNode<R>(
  scopeFn: ScopedAtomCreator<R, PrimitiveAtom<RaisinNode>>,
  debugLabel?: string
): {
  useValue: () => R;
  useUpdate: () => never;
  useAtom: () => [R, never];
};

export function atomForNode<R, W>(
  scopeFn:
    | WriteableScopedAtomCreator<R, W, PrimitiveAtom<RaisinNode>>
    | ScopedAtomCreator<R, PrimitiveAtom<RaisinNode>>,
  debugLabel?: string
) {
  const memoized = createMemoizeAtom();
  const getAtom = (base: PrimitiveAtom<RaisinNode>) =>
    memoized(() => {
      const scopedAtom = scopeFn(base);
      const baseDebugLabel = base.debugLabel ?? `${base}`;
      scopedAtom.debugLabel = `${baseDebugLabel}/${debugLabel}`;
      return scopedAtom;
    }, [scopeFn, base]);

  return {
    useValue: () => useAtomValue(getAtom(useNodeAtom()), RaisinScope),
    useUpdate: () => useUpdateAtom(getAtom(useNodeAtom()) as any, RaisinScope),
    useAtom: () => useAtom(getAtom(useNodeAtom()), RaisinScope),
  };
}
