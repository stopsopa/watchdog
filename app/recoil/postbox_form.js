
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
} from 'recoil';

import {
  Link,
  useHistory,
  useParams,
} from 'react-router-dom';

import {
  StoreContext as StoreContextSocket,
} from '../_storage/storeSocket';

export const postbox_form_atom = atom({
  key: 'postbox_form_atom',
  default: {},
});

export const postbox_form_error_atom = atom({
  key: 'postbox_form_error_atom',
  default: {},
});

export const PostboxFormAtomMount = ({
  onLoad = () => {},
}) => {

  let {
    state: socket,
  } = useContext(StoreContextSocket);

  const set_form = useSetRecoilState(postbox_form_atom);

  const reset_form = useResetRecoilState(postbox_form_atom);

  const set_errors = useSetRecoilState(postbox_form_error_atom);

  const reset_errors = useResetRecoilState(postbox_form_error_atom);

  let { id } = useParams();

  useEffect(() => {

    const postbox_form_atom_populate = opt => {

      const {
        form,
        errors = {},
        submitted,
      } = opt || {};

      set_form(form);

      set_errors(errors || {});

      onLoad(opt);
    }

    socket.on('postbox_form_atom_populate', postbox_form_atom_populate);

    socket.emit('postbox_form_atom_populate', {
      id,
    });

    return () => {

      socket.off('postbox_form_atom_populate', postbox_form_atom_populate);

      reset_form();

      reset_errors();
    };

  }, [socket.id]);

  return null;
}