
import React, {
  useEffect,
  useState,
  useRef,
  useContext,
  useReducer,
} from 'react';

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

import {
  StoreContext as StoreContextAssoc,

  getStoreAssoc,
} from '../../../_storage/storeAssoc';

import './Telegram.scss'

export default (props = {}) => {

  useContext(StoreContextAssoc);

  const {
    telegram = {},
  } = getStoreAssoc('messengers_detection', {});

  const {
    PROTECTED_TELEGRAM_ENABLE_SOCKET_PROXY,
  } = telegram || {};

  const PROTECTED_TELEGRAM_ENABLE_SOCKET_PROXY_clients_connected = getStoreAssoc('PROTECTED_TELEGRAM_ENABLE_SOCKET_PROXY_clients_connected', 0);

  const [ loading, setLoading ] = useState(true);

  useEffect(() => {

    // const onLoad = ({
    //   form,
    //   errors = {},
    //   submitted,
    // }) => {
    //
    //   setLoading(false);
    // }
    //
    // return actionProbesFormPopulate({
    //   onLoad,
    // });
  }, []);

  return (
    <div className="messenger-console-telegram">
      <Breadcrumb>
        <Breadcrumb.Section
          size="mini"
          as={Link}
          to="/messengers"
        >Messengers</Breadcrumb.Section>
        <Breadcrumb.Divider />
        <Breadcrumb.Section>
          <Icon name="telegram" />
          Telegram
        </Breadcrumb.Section>
      </Breadcrumb>
      <div>
        <table border="1" className="status">
          <tbody>
          <tr>
            <td>Is PROTECTED_TELEGRAM_ENABLE_SOCKET_PROXY mode on</td>
            <td>{String(Boolean(PROTECTED_TELEGRAM_ENABLE_SOCKET_PROXY))}</td>
          </tr>
          {(typeof PROTECTED_TELEGRAM_ENABLE_SOCKET_PROXY === 'string') && (
            <>
              <tr>
                <td>PROTECTED_TELEGRAM_ENABLE_SOCKET_PROXY value</td>
                <td>"{PROTECTED_TELEGRAM_ENABLE_SOCKET_PROXY}"</td>
              </tr>
              {(PROTECTED_TELEGRAM_ENABLE_SOCKET_PROXY === 'telegramproxyserver') && (
                <tr>
                  <td>connected clients</td>
                  <td>{PROTECTED_TELEGRAM_ENABLE_SOCKET_PROXY_clients_connected}</td>
                </tr>
              )}
            </>
          )}
          </tbody>
        </table>
      </div>
    </div>
  )
}