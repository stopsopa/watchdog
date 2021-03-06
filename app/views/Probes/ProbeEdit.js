
import React, {
  useEffect,
  useState,
  useRef,
  useContext,
  useReducer,
} from 'react';

import './ProbeEdit.scss';

import isObject from 'nlab/isObject';

import log from 'inspc';

import all from 'nlab/all';

import AceEditor from '../../components/AceEditor/AceEditor';

import NoInput from '../../components/NoInput/NoInput';

import IntervalInput from '../../components/IntervalInput/IntervalInput';

import ArchiveIcon from '../ArchiveIcon';

import ServiceIcon from '../ServiceIcon';

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
import { setStoreAssoc, setStoreAssocDelete } from '../../_storage/storeAssoc'

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

  useContext(StoreContextProjects);

  const [ loading, setLoading ] = useState(true);

  const [ sending, setSending ] = useState(false);

  const [ testModal, setTestModal ] = useState(false);

  const history = useHistory();

  const pform = getProjectForm();

  const form = getProbesForm();

  if ( typeof type !== 'string' && form && typeof form.type === 'string') {

    type = form.type
  }

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

      if (submitted) {

        if (Object.keys(errors).length === 0) {

          history.push(`/projects/${project_id}`);

          notificationsAdd(`Probe '<b>${form.name}</b>' have been ${probe_id ? 'edited': 'created'}`)
        }
        else {

          notificationsAdd(`Validation error has been detected, please check the data in the form and submit again.`, 'error');
        }
      }
    }

    const [a, b] = all([a => a, () => {}], onLoad);

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

    setStoreAssoc('log_page_current_probe_id', probe_id);

    return () => {

      probesUnbind();

      projectUnbind();

      setStoreAssocDelete('log_page_current_probe_id');
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
          to="/projects"
        >Projects</Breadcrumb.Section>
        <Breadcrumb.Divider />
        <Breadcrumb.Section
          // onClick={loginSignOut}
          size="mini"
          as={Link}
          to={`/projects/${pform.id}`}
        >{`Project ${pform.name ? `"${pform.name}"` : `...`}`}</Breadcrumb.Section>
        <Breadcrumb.Divider />
        <Breadcrumb.Section>{probe_id ? `Edit ${type || '...'} probe ${form.name ? `"${form.name}"` : `...`}`: `Create ${type || '...'} probe`}</Breadcrumb.Section>
      </Breadcrumb>
      <div className="probe">
        {loading ? (
          `Loading...`
        ) : (
          <div>
            <h1>
              <Icon name={(type === 'active') ? `paper plane` : `assistive listening systems`} />
              {probe_id ? `Edit ${type} probe #${form.id || ''}` : `Create ${type} probe`}
              {form.id && <Button
                icon="chart bar outline"
                content="Logs"
                as={Link}
                to={`/projects/${pform.id}/log/${form.id}`}
                className="right"
              />}
            </h1>

            <Form onSubmit={onSubmit}
                  autoComplete="off"
            >
              <Form.Field
                disabled={loading}
                error={!!errors.name}
              >
                <label>Name</label>
                <input placeholder='Name' value={form.name || ''}
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
                <AceEditor
                  mode='python'
                  value={form.description || ``}
                  onChange={value => actionProbesFormFieldEdit('description', value)}
                />
                {errors.description && <div className="error">{errors.description}</div>}
              </Form.Field>
              {(type === 'passive') && <Form.Field
                disabled={loading}
                error={!!errors.password}
              >
                <label>Password</label>
                <input placeholder='Password' value={form.password || ''}
                       onChange={e => actionProbesFormFieldEdit('password', e.target.value)}
                       autoComplete="nope"
                />
                {errors.password && <div className="error">{errors.password}</div>}
              </Form.Field>}
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
                error={!!errors.detailed_log}
              >
                <NoInput
                  checked={Boolean(form.detailed_log)}
                  onChange={() => actionProbesFormFieldEdit('detailed_log', !form.detailed_log)}
                  className="warning"
                ><ArchiveIcon content={`archive mode`}/> Save detailed logs also for "probe": true</NoInput>
                {errors.detailed_log && <div className="error">{errors.detailed_log}</div>}
              </Form.Field>
              <Form.Field
                disabled={loading}
                error={!!errors.service_mode}
              >
                <NoInput
                  checked={Boolean(form.service_mode)}
                  onChange={() => actionProbesFormFieldEdit('service_mode', !form.service_mode)}
                  className="warning"
                ><ServiceIcon content={`service mode`}/> Means that this probe still have to be tuned in the future</NoInput>
                {errors.service_mode && <div className="error">{errors.service_mode}</div>}
              </Form.Field>
              <Form.Field
                disabled={loading}
                error={!!errors.interval_ms}
              >
                <label>Interval</label>
                <IntervalInput
                  value={form.interval_ms}
                  onChange={v => actionProbesFormFieldEdit('interval_ms', v)}
                  valueunit="ms"
                  rangestart="s"
                  rangeend="d"
                />
                {errors.interval_ms && <div className="error">{errors.interval_ms}</div>}
              </Form.Field>
              <Form.Field
                disabled={loading}
                error={!!errors.code}
                className="relative"
              >
                <label>Code</label>
                <AceEditor
                  value={form.code || ''}
                  onChange={value => actionProbesFormFieldEdit('code', value)}
                />
                {errors.code && <pre className="error">{errors.code}</pre>}

                {(type === 'active') && (<Modal
                    onClose={onModalClose}
                    onOpen={e => {
                      e && e.preventDefault();
                      setTestModal(true)
                    }}
                    open={testModal}
                    closeOnEscape={true}
                    dimmer="blurring"
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
                          {(testResult) && (
                            <table>
                              <tbody>
                              <tr>
                                <td>Is code working properly and return valid object:</td>
                                <td><span style={{
                                  color: (isObject(testResult) && typeof testResult.probe === 'boolean') ? 'green' : 'red'
                                }}>{String((isObject(testResult) && typeof testResult.probe === 'boolean'))}</span></td>
                              </tr>
                              <tr>
                                <td>Probe passed:</td>
                                <td><span style={{
                                  color: isObject(testResult) && testResult.probe ? 'green' : 'red'
                                }}>{(isObject(testResult) && testResult.probe ? 'passed' : 'failed')}</span></td>
                              </tr>
                              </tbody>
                            </table>
                          )}
                          <AceEditor
                            mode="json"
                            value={JSON.stringify((testResult || "No result yet"), null, 4)}
                          />
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
                )}
                {(type === 'passive' && form.id) && (<Modal
                    onClose={onModalClose}
                    onOpen={e => {
                      e && e.preventDefault();
                      setTestModal(true)
                    }}
                    open={testModal}
                    closeOnEscape={true}
                    dimmer="blurring"
                    closeOnDimmerClick={true}
                    trigger={<Button className="test-code">Examples</Button>}
                    // size="fullscreen"
                  >
                    <Modal.Header>Examples</Modal.Header>
                    <Modal.Content scrolling>
                      <Tab panes={[
                        { menuItem: 'Curl', render: () => <Tab.Pane>
                            <AceEditor
                              mode="batchfile"
                              key="curl"
                              value={`

curl "${location.protocol}//${location.host}/passive/${form.id}?password=${form.password}"

// or 

curl -XPOST -H "Content-Type: application/json" ${`\\`}
    "${location.protocol}//${location.host}/passive/${form.id}" ${`\\`}
    -d '${JSON.stringify({password:form.password})}'
                              
// or 

curl -H "x-password: ${form.password}" "${location.protocol}//${location.host}/passive/${form.id}"

// extra:
// you can also send extra get|post parameters and headers

curl -XPOST -H "x-extra-header: hvalue" ${`\\`}
    -H "Content-Type: application/json" ${`\\`}
    "${location.protocol}//${location.host}/passive/${form.id}?password=${form.password}&extraget=gval" ${`\\`}
    -d '{"jsonkey":"jsonvalue"}'
 

`}
                            />
                          </Tab.Pane> },
                        { menuItem: 'Node.js module', render: () => <Tab.Pane>
                            <AceEditor
                              key="n1"
                              value={`

// watchdog.js
module.exports = function watchdog(url, opt = {}) {
  let {
    method      = 'GET',
    timeout     = 30 * 1000,
    get         = {},
    headers     = {},
    body,
  } = opt;
  method = method.toUpperCase();
  const uri   = new (require('url').URL)(url);
  const lib   = (uri.protocol === 'https:') ? require('https') : require('http');
  const query = require('querystring').stringify(get);
  if (Object.prototype.toString.call(body) === '[object Object]' || Array.isArray(body)) {
    if (method === 'GET'){method = 'POST'}try {body = JSON.stringify(body)} catch (e) {}
    headers['Content-Type'] = 'application/json; charset=utf-8';
  }
  var req = lib.request({
    hostname    : uri.hostname,
    port        : uri.port || ( (uri.protocol === 'https:') ? '443' : '80'),
    path        : uri.pathname + uri.search + (query ? (uri.search.includes('?') ? '&' : '?') + query : ''),
    method,
    headers,
  });
  req.on('socket', function (socket) {
    socket.setTimeout(timeout);
    socket.on('timeout', () => req.abort());
  });
  req.on('error', e => {})
  body && req.write(body);
  req.end();
};

// other file
require('./watchdog')("${location.protocol}//${location.host}/passive/${form.id}", {
  body: ${JSON.stringify({password:form.password})}
})

`}
                            />
                          </Tab.Pane> },
                        { menuItem: 'Node.js oneliner', render: () => <Tab.Pane>
                            <AceEditor
                              key="n2"
                              value={`

(function watchdog(url, opt = {}) {
  let {
    method      = 'GET',
    timeout     = 30 * 1000,
    get         = {},
    headers     = {},
    body,
  } = opt;
  method = method.toUpperCase();
  const uri   = new (require('url').URL)(url);
  const lib   = (uri.protocol === 'https:') ? require('https') : require('http');
  const query = require('querystring').stringify(get);
  if (Object.prototype.toString.call(body) === '[object Object]' || Array.isArray(body)) {
    if (method === 'GET'){method = 'POST'}try {body = JSON.stringify(body)} catch (e) {}
    headers['Content-Type'] = 'application/json; charset=utf-8';
  }
  var req = lib.request({
    hostname    : uri.hostname,
    port        : uri.port || ( (uri.protocol === 'https:') ? '443' : '80'),
    path        : uri.pathname + uri.search + (query ? (uri.search.includes('?') ? '&' : '?') + query : ''),
    method,
    headers,
  });
  req.on('socket', function (socket) {
    socket.setTimeout(timeout);
    socket.on('timeout', () => req.abort());
  });
  req.on('error', e => {})
  body && req.write(body);
  req.end();
})("${location.protocol}//${location.host}/passive/${form.id}", {
  body: ${JSON.stringify({password:form.password})}
});

`}
                            />
                          </Tab.Pane> },
                      ]} />
                    </Modal.Content>
                    <Modal.Actions>
                      <Button color='black' onClick={onModalClose}>
                        Close
                      </Button>
                    </Modal.Actions>
                  </Modal>
                )}


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


