import { Model, StateUpdater } from '../model/EditorModel';
import { h, VNode } from '@stencil/core';
import * as Css from 'css-tree';
import { createChildUpdater, createUpdater, HasChildren } from './_StyleMutation';
import Fragment from './Fragment';

export function StyleEditor(model: Model) {
  if (!model.stylesheet) {
    return <div>No stylesheet</div>;
  }
  return <StyleNodeEditor node={model.stylesheet} setNode={model.setStyleSheet} />;
}

export type StyleNodeProps<T extends Css.CssNodePlain = Css.CssNodePlain> = {
  node: T;
  setNode: StateUpdater<T>;
};

function cleanlyGenerateCssString(node: Css.CssNodePlain) {
  const cloned = JSON.parse(JSON.stringify(node));
  // `fromPlainObject` is unsafe! It mutates the input object, and breaks JSX/Stencil rendering
  const richNode = Css.fromPlainObject(cloned);
  const cssText = Css.generate(richNode);
  return cssText;
}

export function StyleNodeEditor(props: StyleNodeProps) {
  const { node, ...rest } = props;
  const { type } = node;
  if (type === 'StyleSheet') return <StylesheetEditor node={node as Css.StyleSheetPlain} {...rest} />;
  if (type === 'Rule') return <RuleEditor node={node as Css.RulePlain} {...rest} />;
  if (type === 'Block') return <BlockEditor node={node as Css.BlockPlain} {...rest} />;
  if (type === 'Declaration') return <DeclarationEditor node={node as Css.DeclarationPlain} {...rest} />;
  if (type === 'Raw') return <RawEditor node={node as Css.Raw} {...rest} />;
  if (type === 'Value') return <ValueEditor node={node as Css.ValuePlain} {...rest} />;
  if (type === 'Identifier') return <IdentifierEditor node={node as Css.Identifier} {...rest} />;
  if (type === 'SelectorList') return <SelectorListEditor node={node as Css.SelectorListPlain} {...rest} />;
  if (type === 'Selector') return <SelectorEditor node={node as Css.SelectorPlain} {...rest} />;
  if (type === 'TypeSelector') return <TypeSelectorEditor node={node as Css.TypeSelector} {...rest} />;
  if (type === 'ClassSelector') return <ClassSelectorEditor node={node as Css.ClassSelector} {...rest} />;
  if (type === 'PseudoClassSelector') return <PseudoClassSelectorEditor node={node as Css.PseudoClassSelectorPlain} {...rest} />;
  if (type === 'Dimension') return <DimensionEditor node={node as Css.Dimension} {...rest} />;
  if (type === 'WhiteSpace') return <WhiteSpaceEditor node={node as Css.WhiteSpace} {...rest} />;
  return <div>"{type}" is unhandled</div>;
}

function StylesheetEditor(props: StyleNodeProps<Css.StyleSheetPlain>) {
  const { node } = props;

  let rawSheet: string;
  try {
    // rawSheet = Css.generate(Css.fromPlainObject(node));
  } finally {
  }

  return (
    <div data-type={props.node.type}>
      StyleSheet!
      <hr />
      <Children {...props} />
      <hr />
      <pre style={{ overflow: 'hidden' }}>{rawSheet}</pre>
      <pre>{JSON.stringify(node, null, 2)}</pre>
    </div>
  );
}

function RuleEditor(props: StyleNodeProps<Css.RulePlain>) {
  const setPrelude = createUpdater<Css.RulePlain, Css.SelectorListPlain | Css.Raw>(
    props,
    prev => prev.prelude,
    (prev, next) => (prev.prelude = next),
  );
  const setBlock = createUpdater<Css.RulePlain, Css.BlockPlain>(
    props,
    prev => prev.block,
    (prev, next) => (prev.block = next),
  );

  return (
    <div data-type={props.node.type}>
      <StyleNodeEditor node={props.node.prelude} setNode={setPrelude} />
      <StyleNodeEditor node={props.node.block} setNode={setBlock} />
    </div>
  );
}

function BlockEditor(props: StyleNodeProps<Css.BlockPlain>) {
  return (
    <div data-type={props.node.type}>
      {'{'}
      <div style={{ paddingLeft: '20px;' }}>
        <Children {...props} />
      </div>
      {'}'}
    </div>
  );
}

function SelectorListEditor(props: StyleNodeProps<Css.SelectorListPlain>) {
  return <Children {...props} />;
}
function SelectorEditor(props: StyleNodeProps<Css.SelectorPlain>) {
  return <Children {...props} />;
}
function TypeSelectorEditor(props: StyleNodeProps<Css.TypeSelector>) {
  return <span data-type={props.node.type}>{props.node.name}</span>;
}
function ClassSelectorEditor(props: StyleNodeProps<Css.ClassSelector>) {
  return <span data-type={props.node.type}>.{props.node.name}</span>;
}
function PseudoClassSelectorEditor(props: StyleNodeProps<Css.PseudoClassSelectorPlain>) {
  return <span data-type={props.node.type}>::{props.node.name}</span>;
}

function DeclarationEditor(props: StyleNodeProps<Css.DeclarationPlain>) {
  const setValue = createUpdater<Css.DeclarationPlain, Css.ValuePlain | Css.Raw>(
    props,
    prev => prev.value,
    (prev, next) => (prev.value = next),
  );
  return (
    <div data-type={props.node.type}>
      {props.node.property} : <StyleNodeEditor node={props.node.value} setNode={setValue} />
    </div>
  );
}

function RawEditor(props: StyleNodeProps<Css.Raw>) {
  const onInput = (e: InputEvent) => {
    const next = (e.target as HTMLInputElement).value;
    props.setNode(current => {
      return { ...current, value: next };
    });
  };
  return <input type="text" value={props.node.value} onInput={onInput} data-type={props.node.type} />;
}

function ValueEditor(props: StyleNodeProps<Css.ValuePlain>) {
  return <Children {...props} />;
}

function IdentifierEditor(props: StyleNodeProps<Css.Identifier>) {
  return <span data-type={props.node.type}>{props.node.name}</span>;
}
function DimensionEditor(props: StyleNodeProps<Css.Dimension>) {
  return (
    <span data-type={props.node.type}>
      {props.node.value}
      {props.node.unit}
    </span>
  );
}
function WhiteSpaceEditor(props: StyleNodeProps<Css.WhiteSpace>) {
  return <span data-type={props.node.type}>{props.node.value}</span>;
}
/**
 * Renders children, with the right mutation wired up
 *
 * @param props Re
 * @returns
 */
export function Children(props: StyleNodeProps<HasChildren>): VNode[] {
  return props.node.children.map((n, idx) => {
    const subUpdate: StateUpdater<Css.CssNodePlain> = createChildUpdater(props.setNode, idx);
    return <StyleNodeEditor node={n} setNode={subUpdate} />;
  });
}
