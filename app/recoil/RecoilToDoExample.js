
import React, {
  useEffect,
  useState,
  useRef,
  useContext,
  useReducer,
} from 'react';

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

import log from 'inspc';

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


const taskListAtom = atom({
  key: 'taskList',
  default: []
})

const getId = (function () {
  let i = 1;
  return () => i++;
}());

const taskListFilterAtom = atom({
  key: 'taskListFilterAtom',
  default: 'Show All',
})

const taskListFilterSelector = selector({
  key: 'taskListFilterSelector',
  get: ({get}) => {
    const list = get(taskListAtom);
    const filter = get(taskListFilterAtom);
    switch (filter) {
      case 'Show Completed':
        return list.filter(t => t.completed)
      case 'Show Uncompleted':
        return list.filter(t => !t.completed)
      default:
        return list;
    }
  }
})

const TodoItemCreator = () => {

  const [ value, setValue ] = useState('');

  const setListAtom = useSetRecoilState(taskListAtom);

  const addItem = () => {
    if (value.trim()) {
      setListAtom(list => {
        return [
          ...list,
          {
            id: getId(),
            completed: false,
            value,
          }
        ]
      });
      setValue('');
    }
  }

  return (
    <div>
      <input type="text" value={value} onChange={e => setValue(e.target.value)} />
      <button onClick={addItem}>add</button>
    </div>
  )
}

const TodoItemFilters = () => {

  const [ value, setValue ] = useRecoilState(taskListFilterAtom);

  return (
    <select value={value} onChange={e => setValue(e.target.value)}>
      <option value="Show All">Show All</option>
      <option value="Show Completed">Show Completed</option>
      <option value="Show Uncompleted">Show Uncompleted</option>
    </select>
  )
}

const TodoItem = ({
  item,
}) => {

  const [ taskList, setTaskList ] = useRecoilState(taskListAtom);

  const index = taskList.findIndex(listItem => listItem === item);

  const update = values => {

    setTaskList(replace(taskList, index, {
      ...item,
      ...values,
    }))
  }

  return (
    <div>
      <input type="text" value={item.value} onChange={e => update({value: e.target.value})} />
      <input type="checkbox" checked={item.completed} onChange={e => update({completed: !item.completed})} />
      <button onClick={() => setTaskList(remove(taskList, index))}>delete</button>
    </div>
  )
}

export default () => {

  const taskList = useRecoilValue(taskListFilterSelector);

  log.dump(JSON.stringify(taskList, null, 4));

  return (
    <>
      <TodoItemFilters />
      <TodoItemCreator />
      {taskList.map(t => (
        <TodoItem key={t.id} item={t} />
      ))}
    </>
  )
}

function replace(list, index, item) {
  return [...list.slice(0, index), item, ...list.slice(index + 1)];
}
function remove(list, index) {
  return [...list.slice(0, index), ...list.slice(index + 1)];
}