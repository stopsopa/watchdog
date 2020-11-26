
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
} from '../../../_storage/storeAssoc';

export default (props = {}) => {

  useContext(StoreContextAssoc);

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
    <div>

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
    </div>
  )
}