
import {
  RecoilRoot,
  atom,
  selector,
  useRecoilState,
  useRecoilValue,
  useSetRecoilState,
} from 'recoil';

export const postbox_list_atom = (function (reset) {
  const use = atom({
    key: 'postbox_list_atom',
    default: reset(),
  });
  use.reset = reset;
  return use;
}(() => []));

export const postbox_form_atom = (function (reset) {
  const use = atom({
    key: 'postbox_form_atom',
    default: reset(),
  });
  use.reset = reset;
  return use;
}(() => ({})));

export const postbox_form_error_atom = (function (reset) {
  const use = atom({
    key: 'postbox_form_error_atom',
    default: reset(),
  });
  use.reset = reset;
  return use;
}(() => ({})));