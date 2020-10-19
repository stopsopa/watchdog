
import React, {
  useEffect,
  useState,
  useRef,
  useContext,
  useReducer,
  useCallback,
} from 'react';

import './ProbeLog.scss';

import log from 'inspc';

import all from 'nlab/all';

import Textarea from '../../components/Textarea';

import NoInput from '../../components/NoInput/NoInput';

import IntervalInput from '../../components/IntervalInput/IntervalInput';

import DatePicker from "react-datepicker";

// https://usehooks.com/useWindowSize/
function useWindowSize() {
  // Initialize state with undefined width/height so server and client renders match
  // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    // Handler to call on window resize
    function handleResize() {
      // Set window width/height to state
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Call handler right away so state gets updated with initial window size
    handleResize();

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Empty array ensures that effect is only run on mount

  return windowSize;
}

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

function range(date, offsetDays) {

  const abs = Math.abs(offsetDays);

  if (offsetDays < 0) {

    date = new Date( date.getTime() - ( 60 * 60 * 24 * abs * 1000)   )
  }

  const list = [];

  for (var i = 0 ; i < abs ; i += 1 ) {

    var offset = i;

    if (offsetDays > 0) {

      offset += 1;
    }

    list.push(new Date( date.getTime() + ( 60 * 60 * 24 * offset * 1000)   ))
  }

  return list;
}

export default function ProbeLog() {

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

          history.push(`/${project_id}`);

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

  const [ viewBoxX, setViewBoxX ] = useState(10080);

  const [ xy, setXY ] = useState({x: 0, y: 0})

  const viewBoxRatio = 0.05;

  // const svgDOM = useRef(null);


  const [height, setHeight] = useState(0);

  const [startDate, setStartDate] = useState(new Date());

  const [endDate, setEndDate] = useState(new Date( (new Date()).getTime() + ( 60 * 60 * 24 * 1000)   ));

  useEffect(() => {

    setEndDate(new Date( startDate.getTime() + ( 60 * 60 * 24 * 1000)   ))
  }, [startDate]);

  log.dump({
    startDate: startDate
  })

  const windowSize = useWindowSize();

  const svgDOM = useCallback(svgDOM => {
    if (svgDOM !== null) {
      setHeight(svgDOM.getBoundingClientRect().width);
      log.dump({
        ddd: svgDOM.getBoundingClientRect()
      })
    }
  }, [windowSize]);


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
        <Breadcrumb.Section>{probe_id && `Logs of ${type} probe "${form.name}"`}</Breadcrumb.Section>
      </Breadcrumb>
      <hr />
      <div className="probe-log">
        {loading ? (
          `Loading...`
        ) : (
          <div>
            <h1>
              <Icon name={(type === 'active') ? `paper plane` : `assistive listening systems`} />
              Logs of {type} probe "{form.name}"
            </h1>

            <div className="chart">

              <input type="range"
                     min="200" max="10080"
                     value={viewBoxX}
                     style={{width: '500px'}}
                     onChange={e => setViewBoxX(e.target.value)}
              />

              <br />
              <DatePicker selected={startDate} onChange={date => setStartDate(date)}
                          dateFormat="yyyy-MM-dd"
              /> {endDate.toISOString()}
              <pre>
{viewBoxX} {parseInt(viewBoxX * viewBoxRatio, 10)} {`\n`}
{xy.x} - {xy.y} {`\n`}
[height:{height}] {`\n`}
parseInt((viewBoxX * xy.x) / height, 10):{parseInt((viewBoxX * xy.x) / height, 10)}  {`\n`}
                {`\n${startDate.toISOString()}---\n`}
                {range(startDate, 7).map(d => d.toISOString()).join("\n")}
              </pre>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${viewBoxX} ${parseInt(viewBoxX * viewBoxRatio, 10)}`} style={{border: '1px solid gray'}}
                   onMouseMove={e => setXY({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY })}
                   ref={svgDOM}
              >

                <rect
                  width="10"
                  height="400"
                  x={parseInt((viewBoxX * xy.x) / height, 10)}
                  y="20"
                  fill="red"
                />
              </svg>

            </div>


          </div>
        )}
      </div>
    </div>
  );
}


