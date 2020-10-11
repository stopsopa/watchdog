
import React, {
    useEffect,
    useContext,
} from 'react';

import './GlobalLoader.scss';

import classnames from 'classnames';

import {
    StoreContext,
    getLoaderStatus,
    getLoaderMsg,
    loaderButtonsShow,
    loaderButtonsHide,
} from './storeGlobalLoader';

let visible = undefined;

export default function GlobalLoader() {

    const {
        state: stateLoader,
    } = useContext(StoreContext);

    const status = getLoaderStatus();

    const msg = getLoaderMsg();

    useEffect(() => {

        const event = e => {
            if (e.keyCode === 192) {
                visible ? loaderButtonsHide() : loaderButtonsShow();
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