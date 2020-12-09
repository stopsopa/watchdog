/**
 * https://recoiljs.org/docs/guides/asynchronous-data-queries#data-flow-graph
 */

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

  selectorFamily,
  waitForAll,
  waitForNone,
} from 'recoil';


const users = (function (d) {
  d.forEach((d, i) => d.id = i+1);
  return d;
}([
  { // 1
    name: 'john',
    friends: [2, 3, 4, 6],
  },
  { // 2
    name: 'trevor',
    friends: [5, 1, 3, 6],
  },
  { // 3
    name: 'mike',
    friends: [2, 1],
  },
  { // 4
    name: 'tom',
    friends: [6, 5, 2, 1],
  },
  { // 5
    name: 'karl',
    friends: [2],
  },
  { // 6
    name: 'josh',
    friends: [4],
  },
]));

const myDBQuery = async (id, label) => {

  console.log(`myDBQuery ${id} start: ${label}`)

  await delay(500);

  console.log(`myDBQuery ${id} stop: ${label}`)

  // log.dump({
  //   id,
  //   ifno: users.find(u => u.id === id),
  // });

  return users.find(u => u.id === id);
}

const currentUserIDState = atom({
  key: 'DataFlowGraphParamFromUrl_CurrentUserID',
  default: 1,
});

const userInfoQuery = selectorFamily({
  key: 'DataFlowGraphParamFromUrl_UserInfoQuery',
  get: ({userID, label}) => () => myDBQuery(userID, label),
});

const currentUserInfoQuery = selector({
  key: 'DataFlowGraphParamFromUrl_CurrentUserInfoQuery',
  get: ({get}) => get(userInfoQuery({
    userID: get(currentUserIDState),
    label: 'currentUserInfoQuery',
  })),
});

const friendsInfoQuery = selector({
  key: 'DataFlowGraphParamFromUrl_FriendsInfoQuery',
  get: ({get}) => {

    const userInfo = get(currentUserInfoQuery);

    // queue
    // return userInfo.friends.map(id => get(userInfoQuery({
    //     userID: id,
    //     label: 'FriendsInfoQuery',
    // })));

    // parallel
    // return get(waitForAll(
    //   userInfo.friends.map(id => userInfoQuery({
    //     userID: id,
    //     label: 'FriendsInfoQuery',
    //   }))
    // ));

    const friendLoadables = get(waitForNone(
      userInfo.friends.map(id => userInfoQuery({
        userID: id,
        label: 'FriendsInfoQuery',
      }))
    ));
    return friendLoadables
      .filter(({state}) => state === 'hasValue')
      .map(({contents}) => contents);
  },
});

function CurrentUserInfo() {

  const currentUser = useRecoilValue(currentUserInfoQuery);
  const friends = useRecoilValue(friendsInfoQuery);
  const setCurrentUserID = useSetRecoilState(currentUserIDState);

  let {
    id = 1,
  } = useParams();

  return (
    <div>
      DataFlowGraphParamFromUrl.js
      <h1>{currentUser.name}</h1>
      <ul>
        {friends.map(friend =>
          <li key={friend.id} onClick={() => setCurrentUserID(friend.id)}>
            <h4>{friend.name}</h4>
          </li>
        )}
      </ul>
    </div>
  );
}

export default function DataFlowGraphParamFromUrl() {
  return (
    <RecoilRoot>
      <ErrorBoundary>
        <React.Suspense fallback={<div>Loading...</div>}>
          <CurrentUserInfo />
        </React.Suspense>
      </ErrorBoundary>
    </RecoilRoot>
  );
}

