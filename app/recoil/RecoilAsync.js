
import React, {
  useEffect,
  useState,
  useRef,
  useContext,
  useReducer,
} from 'react';

import log from 'inspc';

import delay from 'nlab/delay';

import ErrorBoundary from '../ErrorBoundary';

import {
  RecoilRoot,
  atom,
  selector,
  useRecoilState,
  useRecoilValue,
  useSetRecoilState,
  useResetRecoilState,

  atomFamily,
  selectorFamily,
  waitForAll,
  waitForNone,
} from 'recoil';

const userIdAtom = atom({
  key: 'userId',
  default: 1,
});

const getUser = async id => {
  console.log('getUser', id, 'start');
  await delay(1000);
  console.log('getUser', id, 'start');

  if (id == 14) {

    throw new Error(`getUser 14 async error`);
  }
  return `username_${id}`;
}

const userNameSelector = selector({
  key: 'userNameSelector',
  get: async ({get}) => {

    const id = get(userIdAtom);

    if (id) {

      return await getUser(id);
    }

    return 'default';
  }
});

const User = () => {

  let username = useRecoilValue(userNameSelector);

  if (username) {

    return (<div>username: {username}</div>)
  }

  return (<div>id not specified</div>)
}

const Main = () => {

  let [ id, setId ] = useRecoilState(userIdAtom);

  return (
    <div>
      <select value={id} onChange={e => setId(e.target.value)}>
        <option value={null}>----</option>
        {(function () {

          const list = [];

          for (let i = 0 ; i < 15 ; i += 1 ) {

            list.push(<option key={i} value={i}>{i}</option>)
          }

          return list;
        }())}
      </select>
      <ErrorBoundary>
        <React.Suspense fallback={<div>Loading...</div>}>
          <User />
        </React.Suspense>
      </ErrorBoundary>
    </div>
  )
}


export default () => {

  return (
    // <React.Suspense fallback={<div>Loading...</div>}>
      <Main />
    // </React.Suspense>
  )
}