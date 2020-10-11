
import React, {
  useEffect,
  useState,
  useRef,
  useContext,
} from 'react';

import './ProjectsEdit.scss';

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
  actionProjectsGetList,
  getProjectList,
} from '../../_storage/storeProjects';

export default function ProjectsEdit({
  socket,
  id,
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
        <Breadcrumb.Section
          // onClick={loginSignOut}
          icon
          size="mini"
          as={Link}
          to="/"
        >Dashboard</Breadcrumb.Section>
        <Breadcrumb.Divider />
        <Breadcrumb.Section>{id ? `Create` : `Edit ${'..name..'}`}</Breadcrumb.Section>
      </Breadcrumb>
      <hr />
      <div>
        Form...
      </div>
    </div>
  );
}


