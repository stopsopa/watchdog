
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

export const users_list_atom = atom({
  key: 'users_list_atom',
  default: [],
});

export const UsersListAtomMount = ({
  onLoad = () => {},
}) => {

  let {
    state: socket,
  } = useContext(StoreContextSocket);

  const [ list, set_list ] = useRecoilState(users_list_atom);

  const reset_list = useResetRecoilState(users_list_atom);

  useEffect(() => {

    const users_list_populate = ({
      list,
    }) => {

      set_list(list);
    }

    socket.on('users_list_populate', users_list_populate);

    if (list.length === 0) {

      socket.emit('users_list_populate');
    }

    return () => {

      socket.off('users_list_populate', users_list_populate);

      reset_list();
    }

  }, []);

  return null;
}