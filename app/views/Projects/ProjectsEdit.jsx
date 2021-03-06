
import React, {
  useEffect,
  useState,
  useRef,
  useContext,
} from 'react';

import './ProjectsEdit.scss';

import AceEditor from '../../components/AceEditor/AceEditor'

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
  Link,
  useHistory,
  useParams,
} from 'react-router-dom';

import {
  StoreContext as StoreContextProjects,

  actionProjectsFormPopulate,
  actionProjectsFormFieldEdit,
  actionProjectsFormSubmit,

  getProjectForm,
  getProjectFormErrors,
} from '../../views/Projects/storeProjects';

import {
  StoreContext as StoreContextNotifications,

  notificationsAdd,
} from '../../components/Notifications/storeNotifications';

export default function ProjectsEdit() {

  const { id } = useParams();

  useContext(StoreContextProjects);

  const [ loading, setLoading ] = useState(true);

  const [ sending, setSending ] = useState(false);

  const history = useHistory();

  const form = getProjectForm();

  const errors = getProjectFormErrors();

  useEffect(() => {

    return actionProjectsFormPopulate({
      id,
      onLoad: ({
        form,
        errors = {},
        submitted,
      }) => {
        setLoading(false);
        setSending(false);

        if (submitted) {

          if (Object.keys(errors).length === 0) {

            history.push(`/projects/`);

            notificationsAdd(`Project '<b>${form.name}</b>' have been ${id ? 'edited': 'created'}`)
          }
          else {

            notificationsAdd(`Validation error has been detected, please check the data in the form and submit again.`, 'error');
          }
        }
      }
    })

  }, []);

  function onSubmit() {

    setSending(true);

    actionProjectsFormSubmit({
      form,
    });
  }

  return (
    <div className="project_edit">
      <Breadcrumb>
        <Breadcrumb.Section
          // onClick={loginSignOut}
          size="mini"
          as={Link}
          to="/projects"
        >Projects</Breadcrumb.Section>
        <Breadcrumb.Divider />
        <Breadcrumb.Section>{id ? `Edit project ${form.name ? `"${form.name}"` : `...`}`: `Create project`}</Breadcrumb.Section>
      </Breadcrumb>
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
                     onChange={e => actionProjectsFormFieldEdit('name', e.target.value)}
                     autoComplete="nope"
              />
              {errors.name && <div className="error">{errors.name}</div>}
            </Form.Field>
            <Form.Field
              disabled={loading}
              error={!!errors.description}
            >
              <label>Description</label>
              <AceEditor
                mode='python'
                value={form.description || ``}
                onChange={value => actionProjectsFormFieldEdit('description', value)}
              />
              {errors.description && <div className="error">{errors.description}</div>}
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


