
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
  Link
} from 'react-router-dom';

import {
  StoreContext as StoreContextProjects,
  actionProjectsListPopulate,
  getProjectList,
} from '../../_storage/storeProjects';

export default function Projects() {

  const {
    state: stateProjects,
  } = useContext(StoreContextProjects);

  useEffect(() => {

    return actionProjectsListPopulate();

  }, []);

  return (
    <div className="projects">
      <Breadcrumb>
        <Breadcrumb.Section>Dashboard</Breadcrumb.Section>
        <Breadcrumb.Divider />
        <Breadcrumb.Section
          // onClick={loginSignOut}
          size="mini"
          as={Link}
          to="/create"
        >Create project</Breadcrumb.Section>
      </Breadcrumb>
      <hr />
      <div>
        {getProjectList().map(p => (
          <div key={p.id}>#{p.id} - {p.name}</div>
        ))}
      </div>
    </div>
  );
}


