/**

 Usage:

    import { StoreGlobalLoaderProvider } from './components/GlobalLoader/storeGlobalLoader';
    import GlobalLoader from './components/GlobalLoader/GlobalLoader';

    const Main = () => {

        return (
            <StoreGlobalLoaderProvider>
                <GlobalLoader/>
                <App />
            </StoreGlobalLoaderProvider>
        )
    }

    render(
        <Main />,
        document.getElementById('app')
    );
*/


import React, {
    useEffect,
    useContext,
} from 'react';

import './GlobalLoader.scss';

import classnames from 'classnames';

import {
    StoreContext,
    getGlobalLoaderStatus,
    getGlobalLoaderMsg,
    actionGlobalLoaderButtonsShow,
    actionGlobalLoaderButtonsHide,
} from './storeGlobalLoader';

let visible = undefined;

export default function GlobalLoader() {

    useContext(StoreContext);

    const status = getGlobalLoaderStatus();

    const msg = getGlobalLoaderMsg();

    useEffect(() => {

        const event = e => {
            if (e.keyCode === 192) {
                visible ? actionGlobalLoaderButtonsHide() : actionGlobalLoaderButtonsShow();
            }
        };

        try {
            document.addEventListener('keydown', event, true);
        } catch (e) {}

        return () => {
            try {
                document && document.removeEventListener('keydown', this.event, true);
            } catch (e) {}
        }
    }, []);

    if ( status === 'off' ) {

        return null;
    }

    if ( status === 'err' || status === 'msg' ) {

        return (
          <div className={classnames(
            'global-loader-component',
            status
          )}>
              <span>{msg}</span>
          </div>
        );
    }

    return (
      <div className="global-loader-component load">
          {/*<Loader size='mini' active inline />*/}
          <span>Loading ...</span>
      </div>
    );
};