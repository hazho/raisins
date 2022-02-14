import type { NPMRegistry } from '../../util/NPMRegistry';
import { ChildAPIModule } from './RaisinsChildAPI';

export type Props = {
  selector: string;
};
export const childApiSrc = (registry: NPMRegistry, selector: string) => {
  const props: Props = { selector };
  return `<style>
  body{ margin: 0 }
  </style>
  <script src="${registry.resolvePath(
    {
      name: 'penpal',
      version: '6.2.1',
    },
    'dist/penpal.min.js'
  )}"></script>
  <script type="module">
  import * as snabbdom from "${registry.resolvePath(
    {
      name: 'snabbdom',
      version: '3.1.0',
    },
    'build/index.js'
  )}"
  const props = ${JSON.stringify(props)};
  (${ChildAPIModule})();
  </script>
  `;
};