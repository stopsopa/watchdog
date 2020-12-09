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

  if (typeof id === 'undefined') {

    id = 4;
  }

  console.log(`myDBQuery ${id} start: ${label}`)

  await delay(500);

  console.log(`myDBQuery ${id} stop: ${label}`)

  return users.find(u => u.id === id);
}

// https://recoiljs.org/docs/guides/asynchronous-data-queries#query-default-atom-values
const currentUserIDState = atom({
  key: 'DataFlowGraph_CurrentUserID',
  default: selector({
    key: 'DataFlowGraph_CurrentUserID/Default',
    get: async () => {

      const user = await myDBQuery(undefined, 'DataFlowGraph_CurrentUserID/Default');

      return user.id;
    }
  }),
});

const userInfoQuery = selectorFamily({
  key: 'DataFlowGraph_UserInfoQuery',
  get: ({userID, label}) => async () => myDBQuery(userID, label),
});

const currentUserInfoQuery = selector({
  key: 'DataFlowGraph_CurrentUserInfoQuery',
  get: ({get}) => get(userInfoQuery({
    userID: get(currentUserIDState),
    label: 'currentUserInfoQuery',
  })),
});

const friendsInfoQuery = selector({
  key: 'DataFlowGraph_FriendsInfoQuery',
  get: ({get}) => {

    const userInfo = get(currentUserInfoQuery);

    if ( ! userInfo ) {

      return [];
    }

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

  return (
    <div>
      DataFlowGraph.js
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

export default function DataFlowGraph() {
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

