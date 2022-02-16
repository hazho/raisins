import { htmlParser, RaisinDocumentNode, RaisinNode } from '@raisins/core';
import { Meta } from '@storybook/react';
import { atom, PrimitiveAtom, useAtom } from 'jotai';
import React, { useMemo, useRef } from 'react';
import {
  AtomProseEditor,
  ProseTextSelection,
} from '../src/prosemirror/ProseEditor';

const meta: Meta = {
  title: 'Rich Text (Prose) Editor',
};
export default meta;

const span: RaisinNode = htmlParser(
  `A bunch of text nodes with <b>inline content</b> and <a href="example">links</a>`
);

export const Span = () => (
  <div>
    <AtomEditor
      initial={htmlParser(
        `A bunch of text nodes with <b>inline content</b> and <a href="example">links</a>`
      )}
    />
    <AtomEditor
      initial={htmlParser(
        `A bunch of text nodes with <b>inline content</b> and <a href="example">links</a>`
      )}
    />
  </div>
);

export const TextWithBreaks = () => (
  <AtomEditor initial={htmlParser(`Text<br/>with<br/>breaks`)} />
);
export const Paragraphs = () => (
  <AtomEditor
    initial={htmlParser(`<p>First paragrpah</p><p>second paragrapj</p>`)}
  />
);

function AtomEditor({ initial }: { initial: RaisinNode }) {
  const { nodeAtom, selectionAtomRef } = useMemo(() => {
    return {
      nodeAtom: atom<RaisinDocumentNode>(initial as RaisinDocumentNode),
      selectionAtomRef: atom(undefined) as PrimitiveAtom<ProseTextSelection>,
    };
  }, []);

  const [selection] = useAtom(selectionAtomRef);
  const [node] = useAtom(nodeAtom);
  return (
    <div>
      <AtomProseEditor
        {...{
          nodeAtom: nodeAtom,
          selectionAtom: selectionAtomRef,
        }}
      />
      <hr />
      Here is my state:
      <pre>{JSON.stringify({ selection, node }, null, 2)}</pre>
    </div>
  );
}
