
import React, {
  useEffect,
  useState,
  useRef,
  useContext,
  useReducer,
} from 'react';

import all from 'nlab/all';

import './GroupsEdit.scss';

import AceEditor from '../../components/AceEditor/AceEditor';

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
} from '../../views/Projects/storeProjects'

import {
  StoreContext as StoreContextNotifications,

  notificationsAdd,
} from '../../components/Notifications/storeNotifications';

import {
  StoreContext as StoreContextAssoc,

  setStoreAssoc,
  actionGroupsEditFormPopulate,
  getStoreAssoc,
  actionGroupsFormSubmit,
  actionUsersListPopulate,

  getSocket,
} from '../../_storage/storeAssoc'

const assocKeyGroupsEdit     = 'groups_form_populate';

const assocKeyUsersList     = 'users_list_populate';

const editField = (key, value) => {

  const ktmp = [assocKeyGroupsEdit, 'form'];

  if (typeof key === 'string') {

    ktmp.push(key);
  }

  setStoreAssoc(ktmp.join('.'), value);
}

export default function GroupsEdit() {

  useContext(StoreContextAssoc);

  useContext(StoreContextProjects);

  const socket = getSocket();

  let {
    id,
  } = useParams();

  if ( /^\d+$/.test(id) ) {

    id = parseInt(id, 10);
  }

  const [ loading, setLoading ] = useState(true);

  const [ sending, setSending ] = useState(false);

  const [ passwordModal, setShowPasswordModal ] = useState(false);

  const [ password, setPassword ] = useState('');

  const [ passwordError, setPasswordError ] = useState('');

  const [ passwordSending, setPasswordSending ] = useState(false);

  const history = useHistory();

  const {
    form = {},
    errors = {},
  } = getStoreAssoc(assocKeyGroupsEdit, {});

  function closeModal() {
    setShowPasswordModal(false);
    setPasswordSending(false);
    setPassword('');
    setPasswordError('');
  }

  useEffect(() => {

    const onLoad = ([{
      form = {},
      errors = {},
      submitted,
    }]) => {

      setLoading(false);
      setSending(false);

      if (submitted) {

        if (Object.keys(errors).length === 0) {

          history.push(`/groups`);

          notificationsAdd(`Group '<b>${form.name}</b>' have been ${id ? 'edited': 'created'}`)
        }
        else {

          notificationsAdd(`Validation error has been detected, please check the data in the form and submit again.`, 'error');
        }
      }
    }

    const [a, b] = all([a => a, () => {}], onLoad);

    const groupUnbind = actionGroupsEditFormPopulate({
      // project_id,
      key: assocKeyGroupsEdit,
      id,
      onLoad: a,
      groups_set_password: error => {

        setPasswordSending(false);

        if (error) {

          setPasswordError(error);
        }
        else {

          editField(`password`, true);

          closeModal();

          notificationsAdd(`Password saved`);
        }
      }
    });

    const usersUnbind = actionUsersListPopulate({
      key: assocKeyUsersList,
      onLoad: b,
    });

    return () => {

      groupUnbind();

      usersUnbind();
    }

  }, []);

  function onSubmit() {

    setSending(true);

    actionGroupsFormSubmit({
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
          to="/groups"
        >Groups</Breadcrumb.Section>
        <Breadcrumb.Divider />
        <Breadcrumb.Section>{id ? `Edit group ${form.name ? `"${form.name}"` : `...`}`: `Create group`}</Breadcrumb.Section>
      </Breadcrumb>
      <div className="group_edit">
        {loading ? (
          `Loading...`
        ) : (
          <div>
            <h1>
              <Icon name="group" />
              {id ? `Edit group "${form.name}"` : `Create group`}
            </h1>

            <Form onSubmit={onSubmit}
                  autoComplete="off"
            >
              <Form.Field
                disabled={loading}
                error={!!errors.name}
              >
                <label>Name</label>
                <input placeholder='Name' value={form.name || ''}
                       onChange={e => editField('name', e.target.value)}
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
                  onChange={value => editField('description', value)}
                />
                {errors.description && <div className="error">{errors.description}</div>}
              </Form.Field>
              <Form.Field>
                <label>Users:</label>
                <div className="groups">
                  <div className="added">
                    <h4>In group</h4>
                    {getStoreAssoc(assocKeyUsersList, []).filter(u => form.users.includes(u.id)).map(u => (
                      <div key={u.id}>
                        <span>{u.label}</span>
                        <Button
                          size="mini"
                          onClick={e => {
                            e.preventDefault();
                            e.stopPropagation();
                            editField('users', (form.users || []).filter(id => id !== u.id))
                          }}
                        >&gt;</Button>
                      </div>
                    ))}
                  </div>
                  <div className="available">
                    <h4>Available</h4>
                    {getStoreAssoc(assocKeyUsersList, []).filter(u => !form.users.includes(u.id)).map(u => (
                      <div key={u.id}>
                        <Button
                          size="mini"
                          onClick={e => {
                            e.preventDefault();
                            e.stopPropagation();
                            const list = [...form.users || []];
                            list.push(u.id);
                            editField('users', list)
                          }}
                        >&lt;</Button>
                        <span>{u.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
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


