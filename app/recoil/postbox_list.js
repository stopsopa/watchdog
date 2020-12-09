
import log from 'inspc';

import React, {
  useEffect,
  useState,
  useRef,
  useContext,
  useReducer,
} from 'react';

import {
  RecoilRoot,
  atom,
  selector,
  useRecoilState,
  useRecoilValue,
  useSetRecoilState,
  useResetRecoilState,

  atomFamily,
  selectorFamily,
  waitForAll,
  waitForNone,
} from 'recoil';

import {
  StoreContext as StoreContextSocket,
} from '../_storage/storeSocket';

export const postbox_list_atom = atom({
  key: 'postbox_list_atom',
  default: [],
});

export const PostboxListAtomMount = ({
  onLoad = () => {},
}) => {

  let {
    state: socket,
  } = useContext(StoreContextSocket);

  const [ list, set_list ] = useRecoilState(postbox_list_atom);

  const reset_list = useResetRecoilState(postbox_list_atom);

  useEffect(() => {

    const postbox_list_atom_populate = ({
      list,
    }) => {

      set_list(list);
    }

    socket.on('postbox_list_atom_populate', postbox_list_atom_populate);

    if (list.length === 0) {

      socket.emit('postbox_list_atom_populate');
    }

    return () => {

      socket.off('postbox_list_atom_populate', postbox_list_atom_populate);

      reset_list();
    }

  }, [socket.id]);

  return null;
}