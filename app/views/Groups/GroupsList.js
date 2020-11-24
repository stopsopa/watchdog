
import React, {
  useEffect,
  useState,
  useContext,
} from 'react';

import './GroupsList.scss';

import classnames from 'classnames';

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
  notificationsAdd,
} from '../../components/Notifications/storeNotifications';

import {
  StoreContext as StoreContextAssoc,
  actionGroupsListPopulate,
  getStoreAssoc,
  actionGroupsDelete,
} from '../../_storage/storeAssoc'

const assocKeyGroupsList     = 'groups_list_populate';

export default function GroupsList() {

  const [ deleting, setDeleting ] = useState(false);

  function cancelDelete() {
    setDeleting(false);
  }

  function deleteItem(deleting) {
    setDeleting(false);
    actionGroupsDelete(deleting.id);
  }

  useContext(StoreContextAssoc);

  useEffect(() => {

    return actionGroupsListPopulate({
      key: assocKeyGroupsList,
      groups_delete: ({
        error,
        found,
      }) => {

        if ( typeof error === 'string' ) {

          notificationsAdd(error, 'error');
        }
        else {

          notificationsAdd(`Group "${found.name}" has been removed`)
        }
      }
    });

  }, []);

  return (
    <div>
      <Breadcrumb>
        <Breadcrumb.Section>Groups</Breadcrumb.Section>
        <Breadcrumb.Divider />
        <Breadcrumb.Section
          // onClick={loginSignOut}
          size="mini"
          as={Link}
          to="/groups/create"
        >Create group</Breadcrumb.Section>
      </Breadcrumb>
      <div className="groups-list">
        {getStoreAssoc(assocKeyGroupsList, []).map(p => (
          <div className={classnames('group')} key={p.id}>
            <div>{p.id}</div>
            <Link to={`/groups/${p.id}`}>
              {p.name}
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
              {/*  to={`/groups/${p.id}`}*/}
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
        <Header icon='trash alternate outline' content='Deleting group...' />
        <Modal.Content>
          <p>Do you really want to delete group ?</p>
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


