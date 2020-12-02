
import React, {
  useEffect,
  useState,
  useRef,
  useContext,
  useReducer,
} from 'react';

import classnames from 'classnames';

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

import './Messengers.scss';

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
  useSetRecoilState,
} from 'recoil';

import {
  postbox_list_atom,
} from '../../recoil/postbox';

export default (props = {}) => {

  const [ deleting, setDeleting ] = useState(false);

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

  function cancelDelete() {

    setDeleting(false);
  }

  function deleteItem(deleting) {
    setDeleting(false);

    socket.emit('postbox_delete', deleting.id);
  }

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
        <Breadcrumb.Divider />
        <Breadcrumb.Section
          // onClick={loginSignOut}
          size="mini"
          as={Link}
          to="/messengers/create"
        >Create messengers</Breadcrumb.Section>
      </Breadcrumb>
      <div className="postbox_list">
        {postbox_list.map(m => (
          <div key={m.id} className={classnames('box', {
            disabled: !m.enabled
          })}>
            <div>{m.id}</div>
            <Link to={`/messengers/edit/${m.id}`}>{m.name} [{m.box}]</Link>
            <div className="actions">
              <Button
                icon="trash"
                size="mini"
                color="red"
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDeleting(m);
                }}
              />
              {/*<Button*/}
              {/*  size="mini"*/}
              {/*  as={Link}*/}
              {/*  color="olive"*/}
              {/*  to={`/users/${p.id}`}*/}
              {/*>Edit</Button>*/}
            </div>
          </div>
        ))}
      </div>

      <Modal
        basic
        size='small'
        dimmer="blurring"
        closeOnDimmerClick={true}
        open={!!deleting}
        onClose={cancelDelete}
      >
        <Header icon='trash alternate outline' content='Deleting messenger...' />
        <Modal.Content>
          <p>Do you really want to delete messenger ?</p>
          <p>"<b>{deleting.name} [{deleting.box}]</b>" - (id: {deleting.id})</p>
        </Modal.Content>
        <Modal.Actions>
          <Button
            color="red"
            onClick={() => deleteItem(deleting)}
          >
            <Icon name='trash alternate outline' /> Yes
          </Button>
          <Button
            basic
            color='green'
            inverted
            onClick={cancelDelete}
          >
            <Icon name='remove' /> No
          </Button>
        </Modal.Actions>
      </Modal>
    </div>
  )
}