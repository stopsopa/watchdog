
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
  notificationsAdd,
} from '../../components/Notifications/storeNotifications';

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

import './MessengersLog.scss';

import log from 'inspc';

import delay from 'nlab/delay';

import {
  StoreContext as StoreContextSocket,
} from '../../_storage/storeSocket';

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

import {
  RecoilRoot,
  atom,
  selector,
  useRecoilState,
  useRecoilValue,
  useSetRecoilState,
  useResetRecoilState,
} from 'recoil';

export default () => {

  let {
    state: socket,
  } = useContext(StoreContextSocket);

  const form = useRecoilValue(postbox_form_atom);

  const users = useRecoilValue(users_list_atom);

  const groups = useRecoilValue(groups_list_atom);

  const [ loading, setLoading ] = useState(true);

  let { id } = useParams();

  // const history = useHistory();

  const onLoad = ({
    form,
    errors = {},
    error,
    submitted,
  }) => {

    setLoading(false);

    // setSending(false);

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

  return (
    <div className="postbox_log">

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
        <Breadcrumb.Section>{`Messenger ${form.name ? `"${form.name}" log` : `...`}`}</Breadcrumb.Section>
      </Breadcrumb>

      <div>
        {form.id && <Button
          content="Edit"
          as={Link}
          to={`/messengers/edit/${form.id}`}
          className="logbutton"
        />}
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="main-flex">
          logs
        </div>
      )}
    </div>
  )
}