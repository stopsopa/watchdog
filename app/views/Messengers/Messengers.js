
import React, {
  useEffect,
  useState,
  useRef,
  useContext,
  useReducer,
} from 'react';

import {
  Link,
  useHistory,
  useParams,
} from 'react-router-dom';

import {
  Breadcrumb,
  List,
  Button,
  Icon,
  Form,
  Checkbox,
  Loader,
  Modal,
  Header,
  Dropdown,
  Image,
  Tab,
} from 'semantic-ui-react';

import isObject from 'nlab/isObject';

import log from 'inspc';

import {
  StoreContext as StoreContextSocket,
} from '../../_storage/storeSocket';

import {
  StoreContext as StoreContextAssoc,

  getStoreAssoc,
} from '../../_storage/storeAssoc';

import {
  RecoilRoot,
  atom,
  selector,
  useRecoilState,
  useRecoilValue,
} from 'recoil';

import {
  postbox_list_atom,
} from '../../recoil/postbox';

export default (props = {}) => {

  useContext(StoreContextAssoc);

  let {
    state: socket,
  } = useContext(StoreContextSocket);

  const [ postbox_list, set_postbox_list ] = useRecoilState(postbox_list_atom);

  const messengers_detection = getStoreAssoc('messengers_detection');

  useEffect(() => {

    const postbox_list_atom_populate = ({
      list,
    }) => {

      log.dump({
        fetttt: list
      })

      set_postbox_list(list);
    }

    socket.on('postbox_list_atom_populate', postbox_list_atom_populate);

    if (postbox_list.length === 0) {

      socket.emit('postbox_list_atom_populate');
    }

    return () => {

      socket.off('postbox_list_atom_populate', postbox_list_atom_populate);

      set_postbox_list(postbox_list_atom.reset());
    }

  }, [socket.id]);

  if ( ! isObject(messengers_detection) ) {

    return "Loading..."
  }

  let found = Object.values(messengers_detection).find(Boolean);

  const messengersPages = (
    <div>
      {found ? (
        <>
          {
            messengers_detection.telegram && <Link to="/messengers/telegram">
              <Icon name="telegram" />
              Telegram
            </Link>
          }
        </>
      ) : (
        <div>No messengers registered</div>
      )}
    </div>
  );

  return (
    <div>
      {messengersPages}
      <hr />
      <Breadcrumb>
        <Breadcrumb.Section>Messengers</Breadcrumb.Section>
      </Breadcrumb>
      {postbox_list.map(m => (
        <div key={m.id}>
          <Link to={`/messengers/edit/${m.id}`}>{m.name}</Link>
        </div>
      ))}
    </div>
  )
}