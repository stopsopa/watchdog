/**

  Usage:

    import { StoreNotificationsProvider } from './components/Notifications/storeNotifications';
    import Notifications from './components/Notifications/Notifications';

    const Main = () => {
      return (
        <StoreNotificationsProvider>
          <Notifications/>
          <App />
        </StoreNotificationsProvider>
      )
    }

    render(
      <Main />,
      document.getElementById('app')
    );

    Then in the target component:

      import {
        StoreContext as StoreContextNotifications,

        notificationsAdd,
      } from '../../components/Notifications/storeNotifications';

    ...

      useContext(StoreContextNotifications);

    ...

      notificationsAdd(`Project '<b>${form.name}</b>' have been ${id ? 'edited': 'created'}`)
 */


import React, {
    useContext,
} from 'react';

import './Notifications.scss';

import {
    StoreContext,

    getNotificationsState,
    notificationsRemove,
} from './storeNotifications';

const Notifications = () => {

    useContext(StoreContext);

    const list = getNotificationsState();

    return (
      <div className="react-notifications" key="k">
          {list.map(item => (
            <div
              key={item.id}
              className={item.type}
              onClick={() => notificationsRemove(item.id)}
            >
                <div dangerouslySetInnerHTML={{ __html: item.msg }} />
            </div>
          ))}
      </div>
    );
};

export default Notifications;