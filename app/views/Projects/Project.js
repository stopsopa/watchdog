
import React, {
  useEffect,
  useState,
  useRef,
  useContext,
} from 'react';

import './Project.scss';

import log from 'inspc';

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
} from 'semantic-ui-react';

import {
  Link,
  useHistory,
  useParams,
} from 'react-router-dom';

import {
  StoreContext as StoreContextProjects,

  actionProjectsFormPopulate,
  actionProjectsFormFieldEdit,
  actionProjectsFormSubmit,

  getProjectForm,
  getProjectFormErrors,
} from '../../_storage/storeProjects';

import {
  StoreContext as StoreContextNotifications,

  notificationsAdd,
} from '../../components/Notifications/storeNotifications';

export default function Project() {

  const { id } = useParams();

  useContext(StoreContextProjects);

  useContext(StoreContextNotifications);

  const [ loading, setLoading ] = useState(true);

  const [ sending, setSending ] = useState(false);

  const history = useHistory();

  const form = getProjectForm();

  const errors = getProjectFormErrors();

  useEffect(() => {

    return actionProjectsFormPopulate({
      id,
      onLoad: ({
        form,
        errors = {},
        submitted,
      }) => {
        setLoading(false);
        setSending(false);

        if (submitted) {

          if (Object.keys(errors).length === 0) {

            history.push(`/`);

            notificationsAdd(`Project '<b>${form.name}</b>' have been ${id ? 'edited': 'created'}`)
          }
          else {

            notificationsAdd(`Validation error has been detected, please check the data in the form and submit again.`, 'error');
          }
        }
      }
    })

  }, []);

  function onSubmit() {

    setSending(true);

    actionProjectsFormSubmit({
      form,
    });
  }

  return (
    <div>
      <Breadcrumb>
        <Breadcrumb.Section
          // onClick={loginSignOut}
          size="mini"
          as={Link}
          to="/"
        >Dashboard</Breadcrumb.Section>
        <Breadcrumb.Divider />
        <Breadcrumb.Section>{`Project "${form.name}"`}</Breadcrumb.Section>
      </Breadcrumb>
      <hr />
      <div className="project">

        {loading ? (
          `Loading...`
        ) : (
          <div>
            <div className="header">
              <div>
                <h1>{`Project "${form.name}"`}</h1>
              </div>
              <div>
                <span className="add-probe-span">
                  add probe:
                </span>
                <Button icon="paper plane" content="Active" />
                <Button icon="assistive listening systems" content="Passive" />
              </div>
            </div>
            <div className="project-probes">
              <div className="probe">

              </div>
              <div className="probe">

              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}


