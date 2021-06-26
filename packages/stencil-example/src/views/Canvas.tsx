import { css } from '@emotion/css';
import { FunctionalComponent, h, VNode } from '@stencil/core';
import styleToObject from 'style-to-object';
import cssSerializer from '../core/css-om/serializer';
import { RaisinElementNode } from '../core/html-dom/RaisinNode';
import serializer from '../core/html-dom/serializer';
import { NodeVisitor, visit } from '../core/html-dom/util';
import { Model } from '../model/EditorModel';
import { Button } from './Button';

const wrapper = css`
  background-image: linear-gradient(45deg, #cccccc 25%, transparent 25%), linear-gradient(-45deg, #cccccc 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #cccccc 75%), linear-gradient(-45deg, transparent 75%, #cccccc 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
  padding: 50px;
`;
const content = css`
  background: white;
  margin: 0 auto;
  padding: 20px;
`;

const SelectedToolbar = css`
  background: red;
  color: white;
  display: flex;
  padding: 4px;

  flex-wrap: wrap;
  sl-button-group {
    justify-self: end;
  }
  // CSS from: https://shoelace.style/components/button-group?id=toolbar-example
  sl-button-group:not(:last-of-type) {
    margin-right: var(--sl-spacing-x-small);
  }
`;
const SelectedTitle = css`
  line-height: 28px;
  flex-grow: 1;
`;

const Selectable = css`
  position: relative;
  &:hover {
    outline: 1px solid #ccc;
  }
  // &:hover::before {
  //   content: attr(data-tagname);
  //   position: absolute;
  //   color: #fff;
  //   background: blue;
  //   top: -20px;
  //   height: 20px;
  //   z-index: 9;
  // }
`;

export const Canvas: FunctionalComponent<Model> = props => {
  if (props.mode === 'html') {
    return <pre>{props.serialized}</pre>;
  }
  return <WYSWIGCanvas {...props} />;
};
export const WYSWIGCanvas: FunctionalComponent<Model> = props => {
  const CanvasVisitor: NodeVisitor<VNode | string> = {
    onCData() {
      return '';
    },
    onComment() {
      return '';
    },
    onDirective() {
      return '';
    },
    onRoot(_, children) {
      return <div>{children}</div>;
    },
    onText(text) {
      const textValue = text.data;
      // const parent = props.parents.get(text);
      // if ((props.selected === text || props.selected === parent) && props.mode === 'edit') {
      //   return (
      //     <input
      //       value={textValue}
      //       onInput={e => {
      //         const newText = (e.target as HTMLInputElement).value as string;
      //         const newNode = {
      //           ...text,
      //           data: newText,
      //         };
      //         props.replaceNode(text, newNode);
      //       }}
      //     />
      //   );
      //   // return <div ref={e => props.useInlineHTMLEditorRef(e, text)} />;
      // }
      return textValue;
    },
    onStyle(style) {
      const cssContent = style.contents && cssSerializer(style.contents);
      return <style innerHTML={cssContent} />;
    },
    onElement(element, children) {
      const claz = {
        [Selectable]: props.mode === 'edit',
      };

      const onClick = (e: Event) => {
        // Relevant reading if this causes problems later: https://javascript.info/bubbling-and-capturing#stopping-bubbling
        e.stopPropagation();
        props.setSelected(element);
      };

      const innerProps = {
        'rjs-selected': element === props.selected,
        'class': { ...claz, [element.attribs.class]: true },
        'onClick': props.mode === 'edit' ? onClick : () => {},
        'data-tagname': element.tagName,
        'ref': (el: HTMLElement) => props.registerRef(element, el),
        // Don't use -- element changes evey time!
        // key: getId(element),
      };
      if (element.tagName === 'template') {
        return (
          <div {...innerProps}>
            <h1>Template:</h1>
            {children}
          </div>
        );
      }
      if (element.tagName === 'script') {
        return (
          <div {...innerProps}>
            Script:
            <br />
            <textarea>{serializer(element.children)}</textarea>
          </div>
        );
      }
      const { style, ...rest } = element.attribs;
      const styleObj = styleToObject(style);

      let p = { style: styleObj, ...rest, ...innerProps };
      return (
        <HTMLCompont as={element.tagName} inner={p}>
          {children}
        </HTMLCompont>
      );
    },
  };

  const selectedAncestry = props.getAncestry(props.selected).reverse();
  const hasSelectedAncestry = selectedAncestry.length > 1 ? true : false;
  const hasSelected = typeof props.selected !== 'undefined';
  const ContentComponent: FunctionalComponent = () => {
    return <div>{visit(props.node, CanvasVisitor)}</div>;
  };
  props.renderInIframe(ContentComponent);

  return (
    <div>
      <div class={wrapper} onClick={() => props.setSelected(undefined)}>
        <div class={content} data-content style={{ width: props.size.width }} ref={el => (props.containerRef.current = el)} />
      </div>
      <div
        ref={el => (props.toolbarRef.current = el)}
        data-toolbar
        {...props.toolbarPopper.attributes.popper}
        // @ts-ignore
        style={props.toolbarPopper.styles.popper}
      >
        {hasSelected && (
          <div class={SelectedToolbar}>
            <div class={SelectedTitle}>{props.getComponentMeta(props.selected as RaisinElementNode)?.title || props.selected?.nodeType}</div>
            <sl-button-group>
              <Button onClick={() => props.duplicateNode(props.selected)}>
                <sl-icon name="files"></sl-icon>
              </Button>
              <Button onClick={() => props.removeNode(props.selected)}>
                <sl-icon name="trash"></sl-icon>
              </Button>
              <Button onClick={() => props.moveUp(props.selected)}>
                {' '}
                <sl-icon name="arrow-bar-up"></sl-icon>
              </Button>
              <Button onClick={() => props.moveDown(props.selected)}>
                {' '}
                <sl-icon name="arrow-bar-down"></sl-icon>
              </Button>
            </sl-button-group>{' '}
            {hasSelectedAncestry && (
              <sl-button-group>
                <sl-dropdown placement="top-end">
                  <sl-button slot="trigger" caret pill size="small">
                    <sl-icon name="bar-chart-steps"></sl-icon>
                  </sl-button>
                  <sl-menu>
                    <sl-menu-label>Select Parent</sl-menu-label>

                    {selectedAncestry.map((n, idx) => {
                      const meta = props.getComponentMeta(n as any);
                      return (
                        <sl-menu-item onClick={() => props.setSelected(n)}>
                          {'-'.repeat(idx)} {meta?.title || 'Root'}
                        </sl-menu-item>
                      );
                    })}
                    <sl-menu-item>
                      {'-'.repeat(selectedAncestry.length)} <b>{props.getComponentMeta(props.selected as RaisinElementNode).title}</b>
                    </sl-menu-item>
                  </sl-menu>
                </sl-dropdown>
              </sl-button-group>
            )}
          </div>
        )}
      </div>

      {/* <div
        class={EditorPopper}
        ref={el => (props.editorRef.current = el)}
        data-toolbar
        {...props.editorPopper.attributes.popper}
        // @ts-ignore
        style={props.editorPopper.styles.popper}
      >
        <EditorPanel {...props} />
      </div> */}
    </div>
  );
};

const HTMLCompont: FunctionalComponent<{ as: string; inner: Record<any, any> }> = (props, children) => {
  return <props.as {...props.inner}>{children}</props.as>;
};