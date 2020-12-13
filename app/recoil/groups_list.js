
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

export const groups_list_atom = atom({
  key: 'groups_list_atom',
  default: [],
});

export const GroupsListAtomMount = ({
  onLoad = () => {},
}) => {

  let {
    state: socket,
  } = useContext(StoreContextSocket);

  const [ list, set_list ] = useRecoilState(groups_list_atom);

  const reset_list = useResetRecoilState(groups_list_atom);

  useEffect(() => {

    const groups_list_populate = ({
      list,
    }) => {

      set_list(list);
    }

    socket.on('groups_list_populate', groups_list_populate);

    if (list.length === 0) {

      socket.emit('groups_list_populate');
    }

    return () => {

      socket.off('groups_list_populate', groups_list_populate);

      reset_list();
    }

  }, []);

  return null;
}