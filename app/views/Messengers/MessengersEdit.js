
import React, {
  useEffect,
  useState,
  useRef,
  useContext,
  useReducer,
} from 'react';

import set from 'nlab/set';

import AceEditor from '../../components/AceEditor/AceEditor'

import NoInput from '../../components/NoInput/NoInput';

import {
  Link,
  useHistory,
  useParams,
} from 'react-router-dom';

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

import './MessengersEdit.scss';

import log from 'inspc';

import {
  StoreContext as StoreContextSocket,
} from '../../_storage/storeSocket';

import {
  RecoilRoot,
  atom,
  selector,
  useRecoilState,
  useRecoilValue,
  useSetRecoilState,
  useResetRecoilState,
} from 'recoil';

import delay from 'nlab/delay';

import {
  postbox_form_atom,
  postbox_form_error_atom,
  PostboxFormAtomMount,
} from '../../recoil/postbox_form';

import {
  users_list_atom,
  UsersListAtomMount,
} from '../../recoil/users_list';

import {
  groups_list_atom,
  GroupsListAtomMount,
} from '../../recoil/groups_list';

export const MessengersEdit = () => {

  let {
    state: socket,
  } = useContext(StoreContextSocket);

  const [ form, set_form ] = useRecoilState(postbox_form_atom);

  const errors = useRecoilValue(postbox_form_error_atom);

  const users = useRecoilValue(users_list_atom);

  const groups = useRecoilValue(groups_list_atom);

  const [ loading, setLoading ] = useState(true);

  const [ sending, setSending ] = useState(false);

  let { id } = useParams();

  const history = useHistory();

  const onLoad = ({
    form,
    errors = {},
    error,
    submitted,
  }) => {

    setLoading(false);

    setSending(false);

    if (submitted) {

      if (Object.keys(errors).length > 0 || error) {

        notificationsAdd(error || `Validation error has been detected, please check the data in the form and submit again.`, 'error');
      }
      else {

        // history.push(`/messengers`);

        notificationsAdd(`Messengers '<b>${form.name}</b>' have been ${id ? 'edited': 'created'}`)
      }
    }
  }

  const editField = (name, value) => {

    const data = JSON.parse(JSON.stringify(form));

    set(data, name, value);

    set_form(data)
  };

  function onSubmit() {

    // setSending(true);

    socket.emit('postbox_form_submit', form);
  }

  log.dump(JSON.stringify(form, null, 4))

  return (
    <div className="postbox_form">

      <PostboxFormAtomMount onLoad={onLoad} />

      <UsersListAtomMount />

      <GroupsListAtomMount />

      <Breadcrumb>
        <Breadcrumb.Section
          size="mini"
          as={Link}
          to="/messengers"
        >Messengers</Breadcrumb.Section>
        <Breadcrumb.Divider />
        <Breadcrumb.Section>{id ? `Edit messenger ${form.name ? `"${form.name}"` : `...`}`: `Create messenger`}</Breadcrumb.Section>
      </Breadcrumb>


      {loading ? (
        `Loading...`
      ) : (
        <div className="main-flex">
          <div className="left">
            <Form onSubmit={onSubmit}
                  autoComplete="off"
            >
              <Form.Field
                disabled={loading}
                error={!!errors.name}
              >
                <label>Name</label>
                <input placeholder='Name' value={form.name}
                       onChange={e => editField('name', e.target.value)}
                       autoComplete="nope"
                />
                {errors.name && <div className="error">{errors.name}</div>}
              </Form.Field>
              <Form.Field
                disabled={loading}
                error={!!errors.box}
              >
                <label>Endpoint name (unique)</label>
                <input placeholder='Endpoint name' value={form.box}
                       onChange={e => editField('box', e.target.value)}
                       autoComplete="nope"
                />
                {errors.box && <div className="error">{errors.box}</div>}
              </Form.Field>
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
                error={!!errors.enabled}
              >
                <NoInput
                  checked={Boolean(form.enabled)}
                  onChange={() => editField('enabled', !form.enabled)}
                >Enabled</NoInput>
                {errors.enabled && <div className="error">{errors.enabled}</div>}
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
              <Form.Field disabled={sending}>
                <Button type='submit'
                        autoComplete="nope"
                >
                  {form.id ? 'Save changes' : 'Create'}
                </Button> {sending && `Sending data...`}
              </Form.Field>
            </Form>
          </div>
          <div className="center">
            <h4>Users</h4>
            <div className="flex">
              <div>
                {users.filter(u => form.users.map(u => u.id).includes(u.id)).map(u => (
                  <div key={u.id}>
                    {(function (index) {
                      return (
                        <NoInput
                          checked={Boolean(form.users[index].enabled)}
                          onChange={() => editField(`users.${index}.enabled`, !form.users[index].enabled)}
                        >{u.firstName} {u.lastName}</NoInput>
                      )
                    }(form.users.findIndex(uu => uu.id === u.id)))}
                    <Button
                      size="mini"
                      onClick={e => {
                        e.preventDefault();
                        e.stopPropagation();
                        editField('users', (form.users || []).filter(uu => uu.id !== u.id))
                      }}
                    >&gt;</Button>
                  </div>
                ))}
              </div>
              <div>
                {users.filter(u => !form.users.map(u => u.id).includes(u.id)).map(u => (
                  <div key={u.id}>
                    <Button
                      size="mini"
                      onClick={e => {
                        e.preventDefault();
                        e.stopPropagation();
                        const list = [...form.users || []];
                        list.push({
                          id: u.id,
                          enabled: true,
                        });
                        editField('users', list)
                      }}
                    >&lt;</Button>
                    <span>{u.firstName} {u.lastName}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="right">
            <h4>Groups</h4>
            <div className="flex">
              <div>
                {groups.filter(g => form.groups.map(g => g.id).includes(g.id)).map(g => (
                  <div key={g.id}>
                    {(function (index) {
                      return (
                        <NoInput
                          checked={Boolean(form.groups[index].enabled)}
                          onChange={() => editField(`groups.${index}.enabled`, !form.groups[index].enabled)}
                        >{g.name}</NoInput>
                      )
                    }(form.groups.findIndex(ff => ff.id === g.id)))}
                    <Button
                      size="mini"
                      onClick={e => {
                        e.preventDefault();
                        e.stopPropagation();
                        editField('groups', (form.groups || []).filter(gg => gg.id !== g.id))
                      }}
                    >&gt;</Button>
                  </div>
                ))}
              </div>
              <div>
                {groups.filter(g => !form.groups.map(g => g.id).includes(g.id)).map(g => (
                  <div key={g.id}>
                    <Button
                      size="mini"
                      onClick={e => {
                        e.preventDefault();
                        e.stopPropagation();
                        const list = [...form.groups || []];
                        list.push({
                          id: g.id,
                          enabled: true,
                        });
                        editField('groups', list)
                      }}
                    >&lt;</Button>
                    <span>{g.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default () => {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <MessengersEdit />
    </React.Suspense>
  )
}