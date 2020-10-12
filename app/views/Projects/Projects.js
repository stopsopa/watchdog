
/* eslint-disable */

import React, {
  useEffect,
  useState,
  useRef,
  useContext,
} from 'react';

import './Projects.scss';

import log from 'inspc';

import {
  Button,
  Breadcrumb,
  Icon,
  Modal,
  Header,
} from 'semantic-ui-react';

import {
  Link
} from 'react-router-dom';

import {
  StoreContext as StoreContextProjects,

  actionProjectsListPopulate,
  actionProjectsDelete,

  getProjectList,
} from '../../_storage/storeProjects';

export default function Projects() {

  const [ deleting, setDeleting ] = useState(false);

  function cancelDelete() {
    setDeleting(false);
  }

  function deleteItem() {
    setDeleting(false);


  }

  useContext(StoreContextProjects);

  useEffect(() => {

    return actionProjectsListPopulate();

  }, []);

  return (
    <div>
      <Breadcrumb>
        <Breadcrumb.Section>Dashboard</Breadcrumb.Section>
        <Breadcrumb.Divider />
        <Breadcrumb.Section
          // onClick={loginSignOut}
          size="mini"
          as={Link}
          to="/create"
        >Create project</Breadcrumb.Section>
      </Breadcrumb>
      <hr />
      <div className="projects-list">
        {getProjectList().map(p => (
          <Link key={p.id} className='project' to={`/${p.id}`} style={{border: '2px solid red'}}>
            <div>
              #{p.id} - {p.name}
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
                  color="red"
                  as={Link}
                  to={`/edit/${p.id}`}
                >Edit</Button>
              </div>
            </div>
            <div>

            </div>
            <div>
progress
            </div>
          </Link>
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
        <Header icon='trash alternate outline' content='Delete user...' />
        <Modal.Content>
          <p>Do you really want to delete project ?</p>
          <p>"<b>{deleting.name}</b>" - (id: {deleting.id})</p>
        </Modal.Content>
        <Modal.Actions>
          <Button
            color="red"
            onClick={() => {
              cancelDelete()
              actionProjectsDelete(deleting.id)
            }}
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


