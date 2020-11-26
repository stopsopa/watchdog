
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

import isObject from 'nlab/isObject';

import log from 'inspc';

import {
  StoreContext as StoreContextAssoc,

  getStoreAssoc,
  setStoreAssoc,
} from '../../../_storage/storeAssoc';

import {
  StoreContext as StoreContextSocket,
} from '../../../_storage/storeSocket';

import './Telegram.scss'

export default (props = {}) => {

  useContext(StoreContextAssoc)

  let {
    state: socket,
  } = useContext(StoreContextSocket);

  if ( ! socket) {

    socket = {};
  }

  const {
    telegram = {},
  } = getStoreAssoc('messengers_detection', {});

  const {
    PROTECTED_TELEGRAM_ENABLE_SOCKET_PROXY,
    webhook_can_be_refreshed_in_browser,
  } = telegram || {};

  const PROTECTED_TELEGRAM_ENABLE_SOCKET_PROXY_clients_connected    = getStoreAssoc('PROTECTED_TELEGRAM_ENABLE_SOCKET_PROXY_clients_connected', 0);

  const PROTECTED_TELEGRAM_ENABLE_SOCKET_PROXY_connected_to_server  = getStoreAssoc('PROTECTED_TELEGRAM_ENABLE_SOCKET_PROXY_connected_to_server', false);

  let telegram_get_current_webhook                                  = getStoreAssoc('telegram_get_current_webhook', false);

  (function () {

    if (typeof telegram_get_current_webhook !== 'string') {

      try {

        if (typeof telegram_get_current_webhook.url === 'string') {

          telegram_get_current_webhook = telegram_get_current_webhook.url || "empty string, not defined";
        }
      }
      catch (e) {}
    }

    if (typeof telegram_get_current_webhook !== 'string' && typeof telegram_get_current_webhook.error === 'string') {

      telegram_get_current_webhook = telegram_get_current_webhook.error;
    }

    if (typeof telegram_get_current_webhook !== 'string') {

      telegram_get_current_webhook = 'Wrong server response'
    }
  }());

  const refresh_telegram_get_current_webhook = () => {

    setStoreAssoc('telegram_get_current_webhook', false);

    try {

      socket.emit('telegram_get_current_webhook');
    }
    catch (e) {}
  }

  const telegram_reset_webhook = () => {

    setStoreAssoc('telegram_get_current_webhook', 'click refresh');

    try {

      socket.emit('telegram_reset_webhook');
    }
    catch (e) {}
  }

  useEffect(() => {

    refresh_telegram_get_current_webhook();

  }, [socket.id]);

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
              {(PROTECTED_TELEGRAM_ENABLE_SOCKET_PROXY === 'telegramproxyserver') ? (
                <tr>
                  <td>connected clients</td>
                  <td>{PROTECTED_TELEGRAM_ENABLE_SOCKET_PROXY_clients_connected}</td>
                </tr>
              ) : (
                <tr>
                  <td>connected to server</td>
                  <td>{String(Boolean(PROTECTED_TELEGRAM_ENABLE_SOCKET_PROXY_connected_to_server))}</td>
                </tr>
              )}
            </>
          )}
          <tr>
            <td>
              Current webhook
              <Button size="mini" onClick={refresh_telegram_get_current_webhook}>refresh</Button>
              {webhook_can_be_refreshed_in_browser && <Button size="mini" onClick={telegram_reset_webhook}>reset</Button>}
            </td>
            <td>{telegram_get_current_webhook}</td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}