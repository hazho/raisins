import { useMemo, useRef, useState } from '@saasquatch/universal-hooks';
import { RaisinNode } from '../core/html-dom/RaisinNode';
import { VirtualElement } from '@popperjs/core';
import flip from '@popperjs/core/lib/modifiers/flip';
import preventOverflow from '@popperjs/core/lib/modifiers/preventOverflow';
import { sameWidth } from '../popper/sameWidth';
import { StateUpdater } from '../util/NewState';
import { usePopper } from '../popper/usePopper';
import { getRectOffset } from '@interactjs/modifiers/Modification';
import { h, FunctionalComponent } from '@stencil/core';
import { useIframeRenderer } from './useIFrameRenderer';

export type Size = {
  name: string;
  width: string;
  height: number;
};
const sizes: Size[] = [
  { name: 'Auto', width: 'auto', height: 1080 },
  { name: 'Large', width: '992px', height: 1080 },
  { name: 'Medium', width: '768px', height: 1080 },
  { name: 'Small', width: '576px', height: 1080 },
  { name: 'X-Small', width: '400px', height: 1080 },
];

/**
 * A virtual Ref object that works with Interact.js
 */
function useVirtualRef() {
  const ref = useRef<HTMLElement>(undefined);

  const virtualElement = useMemo(() => {
    const ve: VirtualElement = {
      getBoundingClientRect() {
        return (
          ref.current?.getBoundingClientRect() || {
            bottom: 0,
            height: 0,
            left: 0,
            right: 0,
            top: 0,
            width: 0,
          }
        );
      },
      get contextElement() {
        return ref.current;
      },
    };
    return ve;
  }, []);

  return {
    ref,
    virtualElement,
  };
}

const scripts = [
  `    <script type="module" src="/build/raisins-js.esm.js"></script>
<script nomodule src="/build/raisins-js.js"></script>

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.0.0-beta.25/dist/shoelace/shoelace.css" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.0.0-beta.27/themes/dark.css" />
<script type="module" src="https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.0.0-beta.25/dist/shoelace/shoelace.esm.js"></script>

<!-- TODO: Script management -->
<script type="text/javascript" src="https://fast.ssqt.io/npm/@saasquatch/vanilla-components@1.0.x/dist/widget-components.js"></script>
<link href="https://fast.ssqt.io/npm/@saasquatch/vanilla-components-assets@0.0.x/icons.css" type="text/css" rel="stylesheet" />`,
];

const iframeSrc = `
<!DOCTYPE html>
<html>
<head>
  ${scripts}
</head>
<style>
[rjs-selected]{
  outline: 1px solid red;
}
</style>
<body>
  <stencil-view></stencil-view>
</body>
</html>`;

function useStencilIframeRenderer() {
  const renderer = (iframe: HTMLIFrameElement, Comp: FunctionalComponent) => {
    if (!Comp) return; // no Component yet
    const stencilView = iframe.contentDocument.querySelector('stencil-view');
    stencilView.view = <Comp />;
  };

  const props = useIframeRenderer({
    src: iframeSrc,
    renderer,
    initialComponent: <div />,
  });

  return { renderInIframe: props.renderInIframe, containerRef: props.container };
}

const refToInlinEditor = new WeakMap<HTMLElement, unknown>();
export default function useCanvas(props: { selected: RaisinNode; setNodeInternal: StateUpdater<RaisinNode> }) {
  const frameProps = useStencilIframeRenderer();
  const [size, setSize] = useState<Size>(sizes[0]);

  const { ref, virtualElement } = useVirtualRef();

  const clientRect = frameProps.containerRef.current?.getBoundingClientRect();
  const containerOffsetTopPos = clientRect?.y;
  const containerOffsetLeftPos = clientRect?.x;

  const toolbarRef = useRef<HTMLElement>(undefined);
  const toolbarPopper = usePopper(virtualElement, toolbarRef.current, {
    modifiers: [
      flip,
      preventOverflow,
      sameWidth,
      clientRect ? {
        name: 'offset',
        options: {
          offset: [containerOffsetLeftPos, containerOffsetTopPos],
        },
      } : undefined,
    ],
    placement: 'top-start',
  });

  const editorRef = useRef<HTMLElement>(undefined);
  const editorPopper = usePopper(virtualElement, toolbarRef.current, {
    modifiers: [flip, preventOverflow],
    placement: 'bottom-start',
  });

  function registerRef(node: RaisinNode, element: HTMLElement) {
    if (node === props.selected && element) {
      // Check for infinite loop
      if (ref.current !== element) {
        ref.current = element;
        editorPopper.update();
        toolbarPopper.update();
      }

      // if (refToInlinEditor.has(element)) {
      //   return;
      // }
      // // See TinyMCE React
      // // Stolen from: https://github.com/tinymce/tinymce-react/blob/c2072fe6ef840a1a90a19c48e32855223bff2e0d/src/main/ts/components/Editor.tsx#L191
      // var dfreeHeaderConfig = {
      //   selector: undefined,
      //   target: element,
      //   menubar: false,
      //   inline: true,
      //   toolbar: false,
      //   plugins: ['quickbars'],
      //   quickbars_insert_toolbar: 'undo redo',
      //   quickbars_selection_toolbar: 'italic underline',
      //   setup: editor => {
      //     editor.on('change keyup setcontent', e => console.log('Editor change event', e));
      //   },
      // };
      // // @ts-ignore
      // const newEditor = tinymce.init(dfreeHeaderConfig);
      // console.log('New INline Editor', newEditor.then(console.log));
      // refToInlinEditor.set(element, newEditor);
    }
  }
  return {
    toolbarRef,
    toolbarPopper,
    editorRef,
    editorPopper,
    registerRef,
    sizes,
    size,
    setSize,
    ...frameProps,
  };
}
