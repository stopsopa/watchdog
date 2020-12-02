
import React, {
  useEffect,
  useState,
  useRef,
  useContext,
} from 'react';

import './ProjectsList.scss';

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
  Link
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
  getProjectInArchiveMode,
  getProjectInServiceMode,
  getProjectInNotAllEnabledMode,
} from '../../_storage/storeAssoc'

import ArchiveIcon        from '../ArchiveIcon';

import ServiceIcon        from '../ServiceIcon';

import NotAllEnabledIcon  from '../NotAllEnabledIcon';

export default function ProjectsList() {

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

          notificationsAdd(`Project "${found.name}" has been removed`)
        }
      }
    });

  }, []);

  return (
    <div>
      <Breadcrumb>
        <Breadcrumb.Section>Projects</Breadcrumb.Section>
        <Breadcrumb.Divider />
        <Breadcrumb.Section
          // onClick={loginSignOut}
          size="mini"
          as={Link}
          to="/projects/create"
        >Create project</Breadcrumb.Section>
      </Breadcrumb>
      <div className="projects-list">
        {getProjectList().map(p => (
          <div className='project' key={p.id}>
            <Link to={`/projects/${p.id}`}>
              <FitText text={p.name} />
              <div>
                <StatusComponent project={p.id}/>
                <div className="flags">
                  {getProjectInNotAllEnabledMode(p.id)  && <NotAllEnabledIcon content={`Not all probes are enabled`}/>}
                  {getProjectInArchiveMode(p.id)        && <ArchiveIcon content={`At least one probe is in archive mode`}/>}
                  {getProjectInServiceMode(p.id)        && <ServiceIcon content={`At least one probe is in service mode`}/>}
                </div>
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
                to={`/projects/edit/${p.id}`}
              >Edit</Button>
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
        <Header icon='trash alternate outline' content='Deleting project...' />
        <Modal.Content>
          <p>Do you really want to delete project ?</p>
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


