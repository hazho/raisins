import { css } from '@emotion/css';
import { h } from '@stencil/core';
import { ElementType } from 'domelementtype';
import { Model } from '../model/Dom';
import { RaisinElementNode, RaisinTextNode } from '../model/RaisinNode';
import { Handle } from './Handle';

const Block = css`
  padding: 20px;
  background: #eee;
  border: 1px solid #ccc;
  border-radius: 3px;
`;

export default function BlocksList(props: Model) {
  const blocks: RaisinElementNode[] = [
    {
      type: ElementType.Tag,
      tagName: 'div',
      nodeType: 1,
      attribs: {},
      children: [{ type: ElementType.Text, data: 'I am a div' } as RaisinTextNode],
    },
    {
      type: ElementType.Tag,
      tagName: 'span',
      nodeType: 1,
      attribs: {},
      children: [{ type: ElementType.Text, data: 'I am a div' } as RaisinTextNode],
    },
  ];

  return (
    <div>
      <h1>Blocks</h1>
      {blocks.map(block => {
        // TODO: Make draggable onto the canvas or onto into layers
        const meta = props.getComponentMeta(block);
        return (
          <div class={Block}>
            <Handle />
            {meta.title}
          </div>
        );
      })}
    </div>
  );
}
