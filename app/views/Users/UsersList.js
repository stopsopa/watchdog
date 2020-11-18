
import React, {
  useEffect,
  useState,
  useRef,
  useContext,
} from 'react';

import './UsersList.scss';

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
  getStatusPoject,
} from '../../_storage/storeAssoc'

export default function UsersList() {

  const [ deleting, setDeleting ] = useState(false);

  function cancelDelete() {
    setDeleting(false);
  }

  function deleteItem(deleting) {
    setDeleting(false);
    actionProjectsDelete(deleting.id);
  }

  useContext(StoreContextProjects);

  useContext(StoreContextAssoc);

  useEffect(() => {

    return actionProjectsListPopulate({
      projects_delete: ({
        error,
        found,
      }) => {

        if ( typeof error === 'string' ) {

          notificationsAdd(error, 'error');
        }
        else {

          notificationsAdd(`User "${found.name}" has been removed`)
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
        {getProjectList().map(p => (
          <div className='project' key={p.id}>
            <Link to={`/users/${p.id}`}>
              <FitText text={p.name} />
              <div>
                <StatusComponent project={p.id}/>
              </div>
            </Link>
            <div className="helpers">
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
              <Button
                size="mini"
                as={Link}
                color="olive"
                to={`/users/edit/${p.id}`}
              >Edit</Button>
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
          <p>"<b>{deleting.name}</b>" - (id: {deleting.id})</p>
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


