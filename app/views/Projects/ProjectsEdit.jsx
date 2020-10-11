
import React, {
  useEffect,
  useState,
  useRef,
  useContext,
} from 'react';

import './ProjectsEdit.scss';

import log from 'inspc';

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
  Link
} from 'react-router-dom';

import {
  StoreContext as StoreContextProjects,

  actionProjectsListPopulate,
  actionProjectsFormPopulate,
  actionProjectsFormReset,
  actionProjectsFormEditField,
  actionProjectsFormSubmit,

  getProjectList,
  getProjectForm,
  getProjectFormErrors,
} from '../../_storage/storeProjects';

export default function ProjectsEdit({
  id,
}) {

  const [ loading, setLoading ] = useState(true);

  const [ sending, setSending ] = useState(false);

  const {
    state: stateProjects,
  } = useContext(StoreContextProjects);

  useEffect(() => {

    return actionProjectsFormPopulate({
      id,
      onLoad: () => {
        setLoading(false);
        setSending(false);
      }
    })

  }, []);

  const form = getProjectForm();

  const errors = getProjectFormErrors();

  function onSubmit() {

    setSending(true)

    actionProjectsFormSubmit({
      form,
    });
  }

  return (
    <div className="projects">
      <Breadcrumb>
        <Breadcrumb.Section
          // onClick={loginSignOut}
          size="mini"
          as={Link}
          to="/"
        >Dashboard</Breadcrumb.Section>
        <Breadcrumb.Divider />
        <Breadcrumb.Section>{id ? `Create` : `Edit ${'..name..'}`}</Breadcrumb.Section>
      </Breadcrumb>
      <hr />
      <div>

        {loading ? (
          `Loading...`
        ) : (
          <Form onSubmit={onSubmit}
                autoComplete="off"
          >
            <Form.Field
              disabled={loading}
              error={!!errors.name}
            >
              <label>Name</label>
              <input placeholder='Name' value={form.name}
                     onChange={e => actionProjectsFormEditField('name', e.target.value)}
                     autoComplete="nope"
              />
              {errors.name && <div className="error">{errors.name}</div>}
            </Form.Field>
            <Form.Field disabled={sending}>
              <Button type='submit'
                      autoComplete="nope"
              >
                {form.id ? 'Save changes' : 'Create'}
              </Button> {sending && `Sending data...`}
            </Form.Field>
          </Form>
        )}

      </div>
    </div>
  );
}


