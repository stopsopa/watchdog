
import React, {
  useEffect,
  useState,
  useContext,
} from 'react';

import './UsersList.scss';

import classnames from 'classnames';

// https://github.com/atomiks/tippyjs-react#default-tippy
import Tippy from '@tippyjs/react';

import {
  Button,
  Breadcrumb,
  Icon,
  Modal,
  Header,
} from 'semantic-ui-react';

import {
  Link,
} from 'react-router-dom';

import {
  notificationsAdd,
} from '../../components/Notifications/storeNotifications';

import {
  StoreContext as StoreContextAssoc,
  actionUsersListPopulate,
  getStoreAssoc,
  actionUsersDelete,
} from '../../_storage/storeAssoc'

const assocKeyUsersList     = 'users_list_populate';

export default function UsersList() {

  const [ deleting, setDeleting ] = useState(false);

  function cancelDelete() {
    setDeleting(false);
  }

  function deleteItem(deleting) {
    setDeleting(false);
    actionUsersDelete(deleting.id);
  }

  useContext(StoreContextAssoc);

  useEffect(() => {

    return actionUsersListPopulate({
      key: assocKeyUsersList,
      users_delete: ({
        error,
        found,
        miliseconds,
      }) => {

        if ( typeof error === 'string' ) {

          notificationsAdd(error, 'error', miliseconds);
        }
        else {

          notificationsAdd(`User "${found.label}" has been removed`)
        }
      }
    });

  }, []);

  return (
    <div>
      <Breadcrumb>
        <Breadcrumb.Section>Users</Breadcrumb.Section>
        <Breadcrumb.Divider />
        <Breadcrumb.Section
          size="mini"
          as={Link}
          to="/users/create"
        >Create user</Breadcrumb.Section>
      </Breadcrumb>
      <div className="users_list">
        {getStoreAssoc(assocKeyUsersList, []).map(p => (
          <div className={classnames('user', {
            disabled: !p.enabled
          })} key={p.id}>
            <div>{p.id}</div>
            <Link to={`/users/${p.id}`}>
              {p.label}
            </Link>
            <Tippy content={p.password ? `password set` : `password not set`}>
              <span>
                <Icon name={p.password ? `check` : `close`} color={p.password ? null : 'red'} />
              </span>
            </Tippy>
            <div className="actions">
              <Button
                icon="trash"
                size="mini"
                color="red"
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDeleting(p);
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
        <Header icon='trash alternate outline' content='Deleting user...' />
        <Modal.Content>
          <p>Do you really want to delete user ?</p>
          <p>"<b>{deleting.label}</b>" - (id: {deleting.id})</p>
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
  );
}


