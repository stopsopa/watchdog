
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
} from '../../_storage/storeAssoc';

export default (props = {}) => {

  useContext(StoreContextAssoc);

  const messengers_detection = getStoreAssoc('messengers_detection');

  if ( ! isObject(messengers_detection) ) {

    return "Loading..."
  }

  let found = Object.values(messengers_detection).find(Boolean);

  return (
    <div>
      <div>
        {found ? (
          <>
            {
              messengers_detection.telegram && <Link to="/messengers/telegram">
                <Icon name="telegram" />
                Telegram
              </Link>
            }
          </>
        ) : (
          <div>No messengers registered</div>
        )}
      </div>
    </div>
  )
}