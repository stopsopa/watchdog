
import React, {
  useEffect,
  useState,
  useContext,
} from 'react';

import './UsersEdit.scss';

import log from 'inspc';

import isObject from 'nlab/isObject';

import NoInput from '../../components/NoInput/NoInput';

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

  const history = useHistory();

  useContext(StoreContextAssoc);

  useContext(StoreContextProjects);

  const messengers_detection = getStoreAssoc('messengers_detection');

  /**
   * That's actually recommended way to detect if any messenger system is registered in .env
   * because messengers_detection might be like:
   * messengers_detection = {}
   * or
   * messengers_detection = {
   *   telegram: false
   * }
   * or
   * messengers_detection = {
   *   telegram: { ... object with any properties for telegram ... }
   * }
   */
  let found = Object.values(messengers_detection || {}).find(Boolean);

  const socket = getSocket();

  let {
    id,
  } = useParams();

  if ( /^\d+$/.test(id) ) {

    id = parseInt(id, 10);
  }

  const [ tab, setTab ] = useState(false);

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

          history.push(`/users`);

          notificationsAdd(`User '<b>${form.label}</b>' have been ${id ? 'edited': 'created'}`)

          if ( ! form.password ) {

            try {
              window.scrollTo(0, document.body.scrollHeight || document.documentElement.scrollHeight);
            }
            catch (e) {}
          }
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

  if ( ! isObject(messengers_detection) ) {

    return "Loading..."
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
      <div className="users_edit">
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

              {found && (function ({
                moreThanOneMessengerType,
                telegram = false, // from: messengers_detection
                other,
              }) {

                const buttons = {};

                if (telegram) {

                  buttons.telegram = (
                    <Button size="mini"
                            key="telegram"
                            color={(tab === 'telegram') ? 'grey' : undefined}
                            onClick={e => {e.preventDefault(); setTab('telegram')}}
                    >
                      <Icon name="telegram" />
                      Telegram
                    </Button>
                  );
                }

                // if (other) {
                //
                //   buttons.other = (
                //     <Button size="mini"
                //             key="other"
                //             color={(tab === 'other') ? 'grey' : undefined}
                //             onClick={e => {e.preventDefault(); setTab('other')}}
                //     >
                //       <Icon name="telegram" />
                //       other
                //     </Button>
                //   );
                // }

                if (tab === false) {

                  setTimeout(() => setTab(Object.keys(buttons)[0] || ''), 0);
                }

                return (
                  <>
                    {moreThanOneMessengerType && Object.values(buttons)}
                    {(tab === 'telegram') && <div>
                      <h5>Telegram settings</h5>
                      <Form.Field
                        disabled={loading}
                        error={!!(function (){try {return errors.config.telegram.id}catch(e){return false}})()}
                      >
                        <label>User id</label>
                        <input placeholder='User id' value={(function (){try {return form.config.telegram.id}catch(e){return ''}})()}
                               onChange={e => editField('config.telegram.id', e.target.value)}
                               autoComplete="nope"
                        />
                        {(function (){try {return errors.config.telegram.id}catch(e){return false}})() && <div className="error">{errors.config.telegram.id}</div>}
                      </Form.Field>
                    </div>}
                    {(tab === 'other') && <div>
                      other...
                    </div>}
                  </>
                )

              }({
                ...messengers_detection,
                // other: true,
                moreThanOneMessengerType: Object.values(messengers_detection).length > 1
              }))}
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


