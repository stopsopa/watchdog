
import React, {
  useEffect,
  useState,
  useRef,
  useContext,
} from 'react';

import './UsersList.scss';

import classnames from 'classnames';

import log from 'inspc';

import FitText from '../../components/FitText';

import StatusIcon from '../../views/StatusIcon'

import StatusComponent from '../../views/StatusComponent'

import {
  Button,
  Breadcrumb,
  Icon,
  Modal,
  Header,
} from 'semantic-ui-react';

import {
  Link,
  NavLink,
} from 'react-router-dom';

import {
  StoreContext as StoreContextProjects,

  actionProjectsListPopulate,
  actionProjectsDelete,

  getProjectList,
} from '../../views/Projects/storeProjects';

import {
  notificationsAdd,
} from '../../components/Notifications/storeNotifications';

import {
  StoreContext as StoreContextAssoc,
  actionUsersListPopulate,
  setStoreAssoc,
  setStoreAssocDelete,
  getStoreAssoc, actionUsersDelete,
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
      }) => {

        if ( typeof error === 'string' ) {

          notificationsAdd(error, 'error');
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
          // onClick={loginSignOut}
          size="mini"
          as={Link}
          to="/users/create"
        >Create user</Breadcrumb.Section>
      </Breadcrumb>
      <div className="users-list">
        {getStoreAssoc(assocKeyUsersList, []).map(p => (
          <div className={classnames('user', {
            disabled: !p.enabled
          })} key={p.id}>
            <div>{p.id}</div>
            <Link to={`/users/${p.id}`}>
              {p.label}
            </Link>
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
        //dimmer="blurring"
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


