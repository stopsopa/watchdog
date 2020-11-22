
import React, {
  useEffect,
  useState,
  useRef,
  useContext,
  useReducer,
} from 'react';

import './UsersEdit.scss';

import isObject from 'nlab/isObject';

import log from 'inspc';

import all from 'nlab/all';

import AceEditor from '../../components/AceEditor/AceEditor';

import NoInput from '../../components/NoInput/NoInput';

import IntervalInput from '../../components/IntervalInput/IntervalInput';

import ArchiveIcon from '../ArchiveIcon';

import ServiceIcon from '../ServiceIcon';

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

  actionProbesFormPopulate,
  actionProbesFormFieldEdit,
  actionProbesFormSubmit,

  actionProbesRunCode,

  getProbesTestResult,

  getProjectForm,
  getProjectFormErrors,
  getProbesForm,
  getProbesFormErrors, actionProbesSetTestResult,
} from '../../views/Projects/storeProjects'

import {
  StoreContext as StoreContextNotifications,

  notificationsAdd,
} from '../../components/Notifications/storeNotifications';

import {
  StoreContext as StoreContextAssoc,

  setStoreAssoc,
  setStoreAssocDelete,
  actionUsersEditFormPopulate,
  getStoreAssoc,
  actionUsersFormSubmit,
} from '../../_storage/storeAssoc'

const assocKeyUsersEdit     = 'users_form_populate';

const editField = (key, value) => {

  const ktmp = [assocKeyUsersEdit, 'form'];

  if (typeof key === 'string') {

    ktmp.push(key);
  }

  setStoreAssoc(ktmp.join('.'), value);
}

export default function UsersEdit() {

  useContext(StoreContextAssoc);

  useContext(StoreContextProjects);

  let {
    id,
  } = useParams();

  if ( /^\d+$/.test(id) ) {

    id = parseInt(id, 10);
  }

  const [ loading, setLoading ] = useState(true);

  const [ sending, setSending ] = useState(false);

  const history = useHistory();

  const {
    form = {},
    errors = {},
  } = getStoreAssoc(assocKeyUsersEdit, {});

  useEffect(() => {

    const onLoad = ({
      form = {},
      errors = {},
      submitted,
    }) => {

      setLoading(false);
      setSending(false);

      if (submitted) {

        if (Object.keys(errors).length === 0) {

          history.push(`/users`);

          notificationsAdd(`User '<b>${form.label}</b>' have been ${id ? 'edited': 'created'}`)
        }
        else {

          notificationsAdd(`Validation error has been detected, please check the data in the form and submit again.`, 'error');
        }
      }
    }

    return actionUsersEditFormPopulate({
      // project_id,
      key: assocKeyUsersEdit,
      id,
      onLoad,
    });

  }, []);

  function onSubmit() {

    setSending(true);

    actionUsersFormSubmit({
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
          to="/users"
        >Users</Breadcrumb.Section>
        <Breadcrumb.Divider />
        <Breadcrumb.Section>{id ? `Edit user ${form.label ? `"${form.label}"` : `...`}`: `Create user`}</Breadcrumb.Section>
      </Breadcrumb>
      <div className="user">
        {loading ? (
          `Loading...`
        ) : (
          <div>
            <h1>
              <Icon name="user" />
              {id ? `Edit user "${form.label}"` : `Create user`}
            </h1>

            <Form onSubmit={onSubmit}
                  autoComplete="off"
            >
              <Form.Field
                disabled={loading}
                error={!!errors.firstName}
              >
                <label>First name</label>
                <input placeholder='First name' value={form.firstName || ''}
                       onChange={e => editField('firstName', e.target.value)}
                       autoComplete="nope"
                />
                {errors.firstName && <div className="error">{errors.firstName}</div>}
              </Form.Field>
              <Form.Field
                disabled={loading}
                error={!!errors.lastName}
              >
                <label>Last name</label>
                <input placeholder='Last name' value={form.lastName || ''}
                       onChange={e => editField('lastName', e.target.value)}
                       autoComplete="nope"
                />
                {errors.lastName && <div className="error">{errors.lastName}</div>}
              </Form.Field>
              {/*<Form.Field*/}
              {/*  disabled={loading}*/}
              {/*  error={!!errors.description}*/}
              {/*>*/}
              {/*  <label>Description</label>*/}
              {/*  <AceEditor*/}
              {/*    value={form.description || ``}*/}
              {/*    onChange={value => editField('description', value)}*/}
              {/*  />*/}
              {/*  {errors.description && <div className="error">{errors.description}</div>}*/}
              {/*</Form.Field>*/}
              <Form.Field
                disabled={loading}
                error={!!errors.password}
              >
                <label>Password</label>
                <input placeholder='Password' value={form.password || ''}
                       onChange={e => editField('password', e.target.value)}
                       autoComplete="nope"
                />
                {errors.password && <div className="error">{errors.password}</div>}
              </Form.Field>
              <Form.Field
                disabled={loading}
                error={!!errors.email}
              >
                <label>Email</label>
                <input placeholder='Email' value={form.email || ''}
                       onChange={e => editField('email', e.target.value)}
                       autoComplete="nope"
                />
                {errors.email && <div className="error">{errors.email}</div>}
              </Form.Field>
              <Form.Field
                disabled={loading}
                error={!!errors.enabled}
              >
                <NoInput
                  checked={Boolean(form.enabled)}
                  onChange={() => editField('enabled', !form.enabled)}
                >Enabled</NoInput>
                {errors.enabled && <div className="error">{errors.enabled}</div>}
              </Form.Field>
              <Form.Field disabled={sending}>
                <Button type='submit'
                        autoComplete="nope"
                >
                  {form.id ? 'Save changes' : 'Create'}
                </Button> {sending && `Sending data...`}
              </Form.Field>
            </Form>
          </div>
        )}
      </div>
    </div>
  );
}


