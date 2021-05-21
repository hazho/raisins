import { h } from '@stencil/core';
import { css } from '@emotion/css';

import { Model } from '../model/EditorModel';
import { Canvas } from './Canvas';
import { Layers } from './Layers';
import { ToolbarView } from './Toolbar';
import { RaisinElementNode } from '../html-dom/RaisinNode';
import { EditorPanel } from './EditorPanel';
import { StyleEditor } from './StyleEditor';

export const Row = css`
  display: flex;
  flex-direction: row;
  flex-wrap: no-wrap;
  width: 100%;
`;

const Header = css`
  grid-area: header;
`;
const Footer = css`
  grid-area: footer;
`;
const Edits = css`
  grid-area: edits;
`;
const CanvasCss = css`
  grid-area: canvas;
`;
const LayersCss = css`
  grid-area: layers;
`;

export const Main = css`
  font-family: var(--sl-font-sans);
  font-size: var(--sl-font-size-medium);
  font-weight: var(--sl-font-weight-normal);
  letter-spacing: var(--sl-letter-spacing-normal);
  color: var(--sl-color-gray-800);
  line-height: var(--sl-line-height-normal);
  background: var(--sl-color-gray-900);
  color: var(--sl-color-gray-200);

  display: grid;
  grid-template-columns: 150px auto 150px;
  grid-template-rows: repeat(3, 100px);
  grid-gap: 1em;

  display: grid;
  grid-template-areas:
    'header header header'
    'edits canvas layers'
    'footer footer footer';
  grid-template-rows: auto 1fr auto;
  grid-template-columns: 20% 1fr 15%;
  grid-row-gap: 10px;
  grid-column-gap: 10px;
  height: 100vh;
  margin: 0;

  overflow: hidden;

  // Scrollbar colors: https://www.digitalocean.com/community/tutorials/css-scrollbars
  & > *::-webkit-scrollbar {
    width: 12px;
  }

  & > *::-webkit-scrollbar-track {
    background: var(--sl-color-gray-700);
  }

  & > *::-webkit-scrollbar-thumb {
    background-color: white;
    border-radius: 20px;
    border: 3px solid var(--sl-color-gray-700);
  }
  & > * {
    scrollbar-width: thin;
    scrollbar-color: white var(--sl-color-gray-700);
    overflow: auto;
  }
`;

export function EditorView(model: Model) {
  return (
    <sl-theme name="dark">
      <div class={Main}>
        <div class={Header}>
          <ToolbarView {...model} />
        </div>
        <div class={Edits}>
          {model.selected && `Attributes for ${model.getComponentMeta(model.selected as RaisinElementNode)?.title || 'Element'}`}
          <EditorPanel {...model} />
          <StyleEditor {...model} />
        </div>
        <div class={CanvasCss}>
          <Canvas {...model} />
        </div>

        <div class={LayersCss}>
          {' '}
          <Layers {...model} />
          {/* <EditorPanel {...model} /> */}
          {/* <h1>Editor</h1>
       
          <BlocksList {...model} />
          <h1>Input</h1>
          <pre style={{ wordWrap: 'break-word' }}>{model.initial}</pre>
          <h1>Output</h1>
          <pre style={{ wordWrap: 'break-word' }}>{serialized}</pre> */}
        </div>
        <div class={Footer}>Footer</div>
      </div>
    </sl-theme>
  );
}