import { h, FunctionalComponent, VNode } from '@stencil/core';
import { Model } from '../model/Dom';
import { css } from '@emotion/css';
import { NodeVisitor, visit } from '../util';
import serialize from 'dom-serializer';

const wrapper = css`
  background-image: linear-gradient(45deg, #cccccc 25%, transparent 25%), linear-gradient(-45deg, #cccccc 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #cccccc 75%), linear-gradient(-45deg, transparent 75%, #cccccc 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
  padding: 100px;
`;
const content = css`
  background: white;
  margin: 0 auto;
  padding: 20px;

  .selected {
    border: 1px solid red;
  }
`;

export const Canvas: FunctionalComponent<Model> = props => {
  const CanvasVisitor: NodeVisitor<VNode | string> = {
    onRoot(root, children) {
      return <div>{children}</div>;
    },
    onText(text) {
      return text.data;
    },
    onElement(element, children) {
      const claz = element === props.selected ? 'selected' : '';

      if (element.tagName === 'template') {
        return (
          <div class={claz}>
            <h1>Template:</h1>
            {element.children.map(c => visit(c, CanvasVisitor))}
          </div>
        );
      }
      if (element.tagName === 'script') {
        return (
          <div class={claz}>
            Script:
            <br />
            <textarea>
              {
                // @ts-ignore
                serialize(element.children)
              }
            </textarea>
          </div>
        );
      }
      // const id = 'element-' + Math.random();
      const onClick = (e: Event) => {
        // const el = e.target as HTMLElement;
          props.setSelected(element);
      };
      // @ts-ignore
      return h(element.tagName, { ...element.attribs, 'class': claz, onClick}, children);
    },
  };
  return (
    <div class={wrapper}>
      <div class={content}>{visit(props.node, CanvasVisitor)}</div>
    </div>
  );
};
