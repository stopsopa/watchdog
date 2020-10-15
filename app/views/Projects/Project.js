
import React, {
  useEffect,
  useState,
  useRef,
  useContext,
} from 'react';

import './Project.scss';

import log from 'inspc';

import all from 'nlab/all';

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
} from 'semantic-ui-react';

import {
  Link,
  useHistory,
  useParams,
} from 'react-router-dom';

import {
  StoreContext as StoreContextProjects,

  actionProjectsFormPopulate,
  actionProjectsFormFieldEdit,
  actionProjectsFormSubmit,

  actionProbesListPopulate,
  actionProbesDelete,

  getProbesList,

  getProjectForm,
  getProjectFormErrors,
} from '../../views/Projects/storeProjects';

import {
  StoreContext as StoreContextNotifications,

  notificationsAdd,
} from '../../components/Notifications/storeNotifications';

export default function Project() {

  const { id } = useParams();

  const [ deleting, setDeleting ] = useState(false);

  function cancelDelete() {
    setDeleting(false);
  }

  function deleteItem(deleting) {
    setDeleting(false);
    actionProbesDelete(deleting.id);
    notificationsAdd(`Probe "${deleting.name}" has been removed`)
  }

  useContext(StoreContextProjects);

  const [ loading, setLoading ] = useState(true);

  const [ sending, setSending ] = useState(false);

  const history = useHistory();

  const form = getProjectForm();

  const errors = getProjectFormErrors();

  useEffect(() => {

    const onLoad = ([{
      list,
    }]) => {

      setLoading(false);
      setSending(false);
    }

    const [a, b] = all([d => d, () => {}], onLoad);

    const probesUnbind = actionProbesListPopulate({
      project_id: id,
      onLoad: a
    })

    const projectUnbind = actionProjectsFormPopulate({
      id,
      onLoad: b
    })

    return () => {
      probesUnbind();
      projectUnbind();
    }

  }, []);

  function onSubmit() {

    setSending(true);

    actionProjectsFormSubmit({
      form,
    });
  }

  return (
    <div>
      <Breadcrumb>
        <Breadcrumb.Section
          // onClick={loginSignOut}
          size="mini"
          as={Link}
          to="/"
        >Dashboard</Breadcrumb.Section>
        <Breadcrumb.Divider />
        <Breadcrumb.Section>{`Project "${form.name}"`}</Breadcrumb.Section>
      </Breadcrumb>
      <hr />
      <div className="project">
        {loading ? (
          `Loading...`
        ) : (
          <div>
            <div className="header">
              <div>
                <h1>{`Project "${form.name}"`}</h1>
              </div>
              <div>
                <span className="add-probe-span">
                  add probe:
                </span>
                <Button
                  icon="paper plane"
                  content="Active"
                  as={Link}
                  to={`/${form.id}/probe/create/active`}
                />
                <Button
                  icon="assistive listening systems"
                  content="Passive"
                  as={Link}
                  to={`/${form.id}/probe/create/passive`}
                />
              </div>
            </div>
            <div className="project-probes">
              {getProbesList().map(p => (
                <Link key={p.id} className='probe' to={`/${form.id}/log/${p.id}`}>
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
                        as={Link}
                        color="olive"
                        to={`/${form.id}/probe/edit/${p.id}`}
                      >Edit</Button>
                    </div>
                  </div>
                  {/*<div>*/}

                  {/*</div>*/}
                  {/*<div>*/}
                  {/*  progress*/}
                  {/*</div>*/}
                </Link>
              ))}
            </div>

          </div>
        )}
      </div>


      <Modal
        basic
        size='small'
        //dimmer="blurring"
        closeOnDimmerClick={true}
        open={!!deleting}
        onClose={cancelDelete}
      >
        <Header icon='trash alternate outline' content='Deleting probe...' />
        <Modal.Content>
          <p>Do you really want to delete probe ?</p>
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


