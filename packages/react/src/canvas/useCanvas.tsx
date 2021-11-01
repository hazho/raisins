import { RaisinDocumentNode } from '@raisins/core';
import { atom } from 'jotai';
import { useAtomValue, useUpdateAtom } from 'jotai/utils';
import { useCallback } from 'react';
import { h, VNodeStyle } from 'snabbdom';
import { RaisinScope } from '../atoms/RaisinScope';
import {
  LocalURLAtom,
  ModuleDetailsAtom,
} from '../component-metamodel/ComponentModel';
import { moduleDetailsToScriptSrc } from '../component-metamodel/convert/moduleDetailsToScriptSrc';
import { getId, RootNodeAtom } from '../hooks/CoreAtoms';
import { SelectedNodeAtom, SetSelectedIdAtom } from '../selection/SelectedAtom';
import { NPMRegistryAtom } from '../util/NPMRegistry';
import { raisintoSnabdom, SnabdomRenderer } from './raisinToSnabdom';
import { useSnabbdomSandboxedIframe } from './useSnabbdomSandboxedIframe';

export type Size = {
  name: string;
  width: string;
  height: number;
};

export type Mode = 'preview' | 'edit' | 'html';

export const sizes: Size[] = [
  { name: 'Auto', width: 'auto', height: 1080 },
  { name: 'Large', width: '992px', height: 1080 },
  { name: 'Medium', width: '768px', height: 1080 },
  { name: 'Small', width: '576px', height: 1080 },
  { name: 'X-Small', width: '400px', height: 1080 },
];

function useIframeWithScriptsAndSelection() {
  const setSelectedId = useUpdateAtom(SetSelectedIdAtom, RaisinScope);
  const onClick = useCallback((id: string) => setSelectedId(id), [setSelectedId]);
  const canvasScripts = useAtomValue(CanvasScriptsAtom, RaisinScope);
  const registry = useAtomValue(NPMRegistryAtom, RaisinScope);
  const props = useSnabbdomSandboxedIframe({
    initialComponent: h('div', {}),
    onClick,
    head: canvasScripts,
    registry,
  });

  return {
    renderInIframe: props.renderInIframe,
    containerRef: props.container,
  };
}

const CanvasScriptsAtom = atom((get) => {
  const localUrl = get(LocalURLAtom);
  const moduleDetails = get(ModuleDetailsAtom);
  const registry = get(NPMRegistryAtom);
  return moduleDetailsToScriptSrc(moduleDetails, localUrl, registry);
});


export const OutlineAtom = atom(true);
export const ModeAtom = atom<Mode>('edit');
export const SizeAtom = atom<Size>(sizes[0]);

const VnodeAtom = atom((get) => {
  const mode = get(ModeAtom);
  const selected = get(SelectedNodeAtom);
  const outlined = get(OutlineAtom);
  const node = get(RootNodeAtom);

  const renderer: SnabdomRenderer = (d, n) => {
    if (mode === 'preview') {
      return d;
    }
    const { delayed, remove, ...rest } = d.style || {};
    const style: VNodeStyle = {
      ...rest,
      cursor: 'pointer',
      outline:
        n === selected
          ? '2px dashed rgba(255,0,0,0.5)'
          : outlined
          ? '1px dashed rgba(0,0,0,0.2)'
          : '',
      outlineOffset: n === selected ? '-2px' : '',
    };
    let propsToRender: Record<string, any> = {};

    return {
      ...d,
      attrs: {
        ...d.attrs,
        'raisins-id': getId(n),
        'raisins-thing': 'yes',
      },
      style,
      props: propsToRender,
    };
  };
  const vnode = raisintoSnabdom(node as RaisinDocumentNode, renderer);

  return vnode;
});

export default function useCanvas() {
  const frameProps = useIframeWithScriptsAndSelection();

  const vnode = useAtomValue(VnodeAtom, RaisinScope);
  frameProps.renderInIframe(vnode);
  return {
    ...frameProps,
  };
}
