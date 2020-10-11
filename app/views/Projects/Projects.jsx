
import React, {
  useEffect,
  useState,
  useRef,
  useContext,
} from 'react';

import './Projects.scss';

import log from 'inspc';

import {
  Button,
  Breadcrumb,
} from 'semantic-ui-react';

import {
  StoreContext as StoreContextProjects,
  actionProjectsGetList,
  getProjectList,
} from '../../_storage/storeProjects';

export default function Projects({
  socket,
}) {

  const {
    state: stateProjects,
  } = useContext(StoreContextProjects);

  useEffect(() => {

    return actionProjectsGetList({
      socket,
    });

  }, []);

  return (
    <div className="projects">
      <Breadcrumb>
        <Breadcrumb.Section link>Dashboard</Breadcrumb.Section>
        {/*<Breadcrumb.Divider />*/}
        {/*<Breadcrumb.Section link>Store</Breadcrumb.Section>*/}
        {/*<Breadcrumb.Divider />*/}
        {/*<Breadcrumb.Section active>T-Shirt</Breadcrumb.Section>*/}
      </Breadcrumb>
      <div>
        {getProjectList().map(p => (
          <div key={p.id}>#{p.id} - {p.name}</div>
        ))}
      </div>
    </div>
  );
}


