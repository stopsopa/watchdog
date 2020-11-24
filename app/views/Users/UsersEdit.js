
import React, {
  useEffect,
  useState,
  useContext,
} from 'react';

import './UsersEdit.scss';

import NoInput from '../../components/NoInput/NoInput';

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
  useParams,
} from 'react-router-dom';

import {
  StoreContext as StoreContextProjects,
} from '../../views/Projects/storeProjects'

import {
  notificationsAdd,
} from '../../components/Notifications/storeNotifications';

import {
  StoreContext as StoreContextAssoc,

  setStoreAssoc,
  actionUsersEditFormPopulate,
  getStoreAssoc,
  actionUsersFormSubmit,

  getSocket,
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

  const {
    form = {},
    errors = {},
  } = getStoreAssoc(assocKeyUsersEdit, {});

  function closeModal() {
    setShowPasswordModal(false);
    setPasswordSending(false);
    setPassword('');
    setPasswordError('');
  }

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

          // history.push(`/users`);

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
      users_set_password: error => {

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
              {/*  error={!!errors.password}*/}
              {/*>*/}
              {/*  <label>Password</label>*/}
              {/*  <input placeholder='Password' value={form.password || ''}*/}
              {/*         onChange={e => editField('password', e.target.value)}*/}
              {/*         autoComplete="nope"*/}
              {/*  />*/}
              {/*  {errors.password && <div className="error">{errors.password}</div>}*/}
              {/*</Form.Field>*/}
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
              {form.id && (
                <Form.Field
                  disabled={loading}
                  error={!!errors.password}
                >
                  <label>Password</label>
                  <Button size="mini" onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();

                    setShowPasswordModal(true);
                  }}>{form.password ? `reset` : `set`}</Button>
                  <Icon name={form.password ? `check` : `close`} color={form.password ? null : 'red'}/>
                  password {form.password ? 'set' : 'not set'}
                  {errors.password && <div className="error">{errors.password}</div>}
                </Form.Field>
              )}
              <Form.Field disabled={sending}>
                <Button type='submit'
                        autoComplete="nope"
                >
                  {form.id ? 'Save changes' : 'Create'}
                </Button> {sending && `Sending data...`}
              </Form.Field>
            </Form>


            <Modal
              basic
              size='small'
              dimmer="blurring"
              closeOnDimmerClick={true}
              open={passwordModal}
              onClose={closeModal}
            >
              <Header icon='key' content='Set password' />
              <Modal.Content>
                <p>Set password</p>
                <Form onSubmit={e => {
                  e.preventDefault();
                  e.stopPropagation();
                }}>
                  <Form.Field
                    disabled={loading}
                    error={!!passwordError}
                  >
                    <input value={password}
                           onChange={e => setPassword(e.target.value)}
                           autoComplete="nope"
                    />
                    {passwordError && <div className="modal-error">{passwordError}</div>}
                  </Form.Field>
                </Form>
              </Modal.Content>
              <Modal.Actions>
                <Button
                  disabled={passwordSending}
                  onClick={() => {
                    setPasswordSending(true)
                    socket.emit('users_set_password', {
                      id: form.id,
                      password,
                    });
                  }}
                >
                  {passwordSending ?
                    `Sending ...` :
                    `Set password`
                  }
                </Button>
                <Button
                  basic
                  color='green'
                  inverted
                  onClick={closeModal}
                >
                  <Icon name='remove' /> Close
                </Button>
              </Modal.Actions>
            </Modal>
          </div>
        )}
      </div>
    </div>
  );
}


