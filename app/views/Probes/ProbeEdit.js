
import React, {
  useEffect,
  useState,
  useRef,
  useContext,
  useReducer,
} from 'react';

import './ProbeEdit.scss';

import log from 'inspc';

import all from 'nlab/all';

import Textarea from '../../components/Textarea';

import NoInput from '../../components/NoInput/NoInput';

import IntervalInput from '../../components/IntervalInput/IntervalInput';

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

  actionProbesFormPopulate,
  actionProbesFormFieldEdit,
  actionProbesFormSubmit,

  actionProbesRunCode,

  getProbesTestResult,

  getProjectForm,
  getProjectFormErrors,
  getProbesForm,
  getProbesFormErrors, actionProbesSetTestResult,
} from '../../views/Projects/storeProjects'

import {
  StoreContext as StoreContextNotifications,

  notificationsAdd,
} from '../../components/Notifications/storeNotifications';

export default function ProbeEdit() {

  let {
    project_id,
    probe_id,
    type,
  } = useParams();

  if ( /^\d+$/.test(project_id) ) {

    project_id = parseInt(project_id, 10);
  }

  if ( /^\d+$/.test(probe_id) ) {

    probe_id = parseInt(probe_id, 10);
  }

  log.dump({
    ProbeEdit: {
      project_id,
      probe_id,
      type,
    }
  })

  useContext(StoreContextProjects);

  const [ loading, setLoading ] = useState(true);

  const [ sending, setSending ] = useState(false);

  const [ testModal, setTestModal ] = useState(false);

  const history = useHistory();

  const pform = getProjectForm();

  const form = getProbesForm();

  const errors = getProbesFormErrors();

  const testResult = getProbesTestResult();

  useEffect(() => {

    const onLoad = ([{
      form,
      errors = {},
      submitted,
    }]) => {

      setLoading(false);
      setSending(false);

      log.dump({
        onLoad_back: {
          form,
          errors,
          submitted,
        }
      })

      if (submitted) {

        if (Object.keys(errors).length === 0) {

          history.push(`/${project_id}`);

          notificationsAdd(`Probe '<b>${form.name}</b>' have been ${probe_id ? 'edited': 'created'}`)
        }
        else {

          notificationsAdd(`Validation error has been detected, please check the data in the form and submit again.`, 'error');
        }
      }
    }

    const [a, b] = all([d => d, () => {}], onLoad);

    const probesUnbind = actionProbesFormPopulate({
      project_id,
      probe_id,
      type,
      onLoad: a,
    });

    const projectUnbind = actionProjectsFormPopulate({
      id: project_id,
      onLoad: b,
    });

    return () => {
      probesUnbind();
      projectUnbind();
    }

  }, []);

  function onSubmit() {

    setSending(true);

    actionProbesFormSubmit({
      form,
    });
  }

  const onModalClose = () => {
    setTestModal(false);
    actionProbesSetTestResult(null);
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
        <Breadcrumb.Section
          // onClick={loginSignOut}
          size="mini"
          as={Link}
          to={`/${pform.id}`}
        >{`Project "${pform.name}"`}</Breadcrumb.Section>
        <Breadcrumb.Divider />
        <Breadcrumb.Section>{probe_id ? `Edit ${type} probe "${form.name}"`: `Create ${type} probe`}</Breadcrumb.Section>
      </Breadcrumb>
      <hr />
      <div className="probe">
        {loading ? (
          `Loading...`
        ) : (
          <div>
            <h1>
              <Icon name={(type === 'active') ? `paper plane` : `assistive listening systems`} />
              {probe_id ? `Edit ${type} probe #${form.id}` : `Create ${type} probe`}
            </h1>

            <Form onSubmit={onSubmit}
                  autoComplete="off"
            >
              <Form.Field
                disabled={loading}
                error={!!errors.name}
              >
                <label>Name</label>
                <input placeholder='Name' value={form.name}
                       onChange={e => actionProbesFormFieldEdit('name', e.target.value)}
                       autoComplete="nope"
                />
                {errors.name && <div className="error">{errors.name}</div>}
              </Form.Field>
              <Form.Field
                disabled={loading}
                error={!!errors.description}
              >
                <label>Description</label>
                <Textarea
                  autoComplete="nope"
                  value={form.description || ""}
                  onChange={e => actionProbesFormFieldEdit('description', e.target.value)}
                  spellCheck={false}
                  correct={10}
                />
                {errors.description && <div className="error">{errors.description}</div>}
              </Form.Field>
              <Form.Field
                disabled={loading}
                error={!!errors.enabled}
              >
                <NoInput
                  checked={Boolean(form.enabled)}
                  onChange={() => actionProbesFormFieldEdit('enabled', !form.enabled)}
                >Enabled</NoInput>
                {errors.enabled && <div className="error">{errors.enabled}</div>}
              </Form.Field>
              <Form.Field
                disabled={loading}
                error={!!errors.interval_ms}
              >
                <label>Interval</label>
                <IntervalInput
                  value={form.interval_ms}
                  onChange={v => actionProbesFormFieldEdit('interval_ms', v)}
                  include="d"
                />
                {errors.interval_ms && <div className="error">{errors.interval_ms}</div>}
              </Form.Field>
              <Form.Field
                disabled={loading}
                error={!!errors.code}
                className="relative"
              >
                <label>Code</label>
                <Textarea
                  className="textarea-code"
                  autoComplete="nope"
                  value={form.code}
                  onChange={e => actionProbesFormFieldEdit('code', e.target.value)}
                  spellCheck={false}
                  correct={10}
                />
                {errors.code && <pre className="error">{errors.code}</pre>}
                <Modal
                  onClose={onModalClose}
                  onOpen={e => {
                    e && e.preventDefault();
                    setTestModal(true)
                  }}
                  open={testModal}
                  closeOnEscape={true}
                  closeOnDimmerClick={true}
                  trigger={<Button className="test-code">Run code</Button>}
                  // size="fullscreen"
                >
                  <Modal.Header>Run code</Modal.Header>
                  <Modal.Content scrolling>
                    {(testResult === 'executing') ? (
                      <div>Executing...</div>
                    ) : (
                      <>
                        {(testResult && typeof testResult.status === 'string') && (
                          <table>
                            <tbody>
                            <tr>
                              <td>Is code working properly and return valid object:</td>
                              <td><span style={{
                                color: testResult.status === 'working' ? 'green' : 'red'
                              }}>{testResult.status}</span></td>
                            </tr>
                            <tr>
                              <td>Probe passed:</td>
                              <td><span style={{
                                color: testResult && testResult.data && testResult.data.probe ? 'green' : 'red'
                              }}>{(testResult && testResult.data && testResult.data.probe ? 'passed' : 'failed')}</span></td>
                            </tr>
                            </tbody>
                          </table>
                        )}
                        <pre className="code-test-result">{JSON.stringify((testResult && testResult.data ? testResult.data : "No result yet"), null, 4)}</pre>
                      </>
                    )}
                  </Modal.Content>
                  <Modal.Actions>
                    <Button
                      content="Run"
                      labelPosition='right'
                      icon='checkmark'
                      disabled={testResult === 'executing'}
                      onClick={() => actionProbesRunCode(form.code, type)}
                      positive
                    />
                    <Button color='black' onClick={onModalClose}>
                      Close
                    </Button>
                  </Modal.Actions>
                </Modal>
              </Form.Field>
              <Form.Field disabled={sending}>
                <Button type='submit'
                        autoComplete="nope"
                >
                  {form.id ? 'Save changes' : 'Create'}
                </Button> {sending && `Sending data...`}
              </Form.Field>
            </Form>
          </div>
        )}
      </div>
    </div>
  );
}


