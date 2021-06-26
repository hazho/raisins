import { css } from '@emotion/css';
import { h } from '@stencil/core';
import { Model } from '../model/EditorModel';

const ToolbarStyle = css`
  padding: 10px;
  & > * {
    margin-left: 5px;
  }
`;
export function ToolbarView(props: Model) {
  return (
    <div class={ToolbarStyle}>
      Toolbar
      <sl-button-group>
        <sl-button size="small" pill onClick={() => props.undo()} disabled={!props.hasUndo}>
          <sl-icon slot="prefix" name="arrow-90deg-left"></sl-icon>
          Undo
        </sl-button>
        <sl-button size="small" pill onClick={() => props.redo()} disabled={!props.hasRedo}>
          <sl-icon slot="prefix" name="arrow-90deg-right"></sl-icon>
          Redo
        </sl-button>
      </sl-button-group>
      <sl-button-group>
        {props.mode}
        <sl-button size="small" pill type={props.mode === 'edit' ? 'success' : 'default'} onClick={()=>props.setMode("edit")}>
          <sl-icon slot="prefix" name="pencil"></sl-icon>
          Edit
        </sl-button>
        <sl-button size="small" pill type={props.mode === 'preview' ? 'success' : 'default'} onClick={()=>props.setMode("preview")}>
          <sl-icon slot="prefix" name="eye"></sl-icon>
          Preview
        </sl-button>
        <sl-button size="small" pill type={props.mode === 'html' ? 'success' : 'default'} onClick={()=>props.setMode("html")}>
          <sl-icon slot="prefix" name="eye"></sl-icon>
          HTML
        </sl-button>
      </sl-button-group>
      <sl-button-group>
        <sl-button size="small" pill type="default" disabled style={{ cursor: 'initial' }}>
          <sl-icon slot="prefix" name="window"></sl-icon>
          Screen
        </sl-button>

        {props.sizes.map(s => (
          <sl-button size="small" pill onClick={() => props.setSize(s)} type={props.size === s ? 'success' : 'default'}>
            {s.name}
          </sl-button>
        ))}
      </sl-button-group>
    </div>
  );
}