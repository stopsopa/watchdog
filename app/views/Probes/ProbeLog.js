
import React, {
  useEffect,
  useState,
  useRef,
  useContext,
  useReducer,
  useCallback,
  Fragment,
} from 'react';

import './ProbeLog.scss';

import log from 'inspc';

import all from 'nlab/all';

import format from 'date-fns/format';

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



function offsetDay(date, days) {
  return new Date( date.getTime() + ( 60 * 60 * 24 * days * 1000)   )
}
function range(date, offsetDays) {

  const abs = Math.abs(offsetDays);

  if (offsetDays < 0) {

    date = offsetDays(date, abs)
  }

  const list = [];

  for (var i = 0 ; i < abs ; i += 1 ) {

    var offset = i;

    if (offsetDays > 0) {

      offset += 1;
    }

    list.push({
      d: offsetDay(date, offset),
      o: offset,
    })
  }

  return list;
}

function ratio(viewBoxX, width) {
  return x => {
    // return (viewBoxX * (d.o * dayWidth)) / width
    return (viewBoxX * x) / width
  }

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

  const [startDate, setStartDate] = useState(new Date());

  const [offset, setOffset] = useState(1);

  const endDate = offsetDay(startDate, offset);

  const windowSize = useWindowSize();

  const [width, setWidth] = useState(0);

  const svgDOM = useCallback(svgDOM => { // https://reactjs.org/docs/hooks-faq.html#how-can-i-measure-a-dom-node
    if (svgDOM !== null) {
      setWidth(svgDOM.getBoundingClientRect().width);
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
              <table>
                <tbody>
                <tr>
                  <td>
                    <Button size="mini" primary className="arrow" onClick={e => {e.preventDefault();
                      setStartDate(offsetDay(startDate, -1))
                    }}>
                      <Icon name='chevron left' />
                    </Button>
                  </td>
                  <td>
                    <DatePicker
                      selected={startDate}
                      onChange={date => setStartDate(date)}
                      dateFormat="yyyy-MM-dd iiii"
                    />
                  </td>
                  <td>
                    <Button size="mini" primary className="arrow right" onClick={e => {e.preventDefault();
                      setStartDate(offsetDay(startDate, 1))
                    }}>
                      <Icon name='chevron right' />
                    </Button>
                  </td>
                  {range(startDate, 7).map(d => (
                    <Button
                      size="mini"
                      primary={d.o <= offset}
                      key={d.o}
                      onClick={e => {e.preventDefault();
                        setOffset(d.o)
                      }}
                    >
                      {format(d.d, 'd iiii')}
                    </Button>
                  ))}
                </tr>
                </tbody>
              </table>
              <pre>
{viewBoxX} {parseInt(viewBoxX * viewBoxRatio, 10)} {`\n`}
{xy.x} - {xy.y} {`\n`}
[width:{width}] {`\n`}
[offset:{offset}] {`\n`}
[dayWidth:{parseInt(width / offset, 10)}] {`\n`}
parseInt((viewBoxX * xy.x) / width, 10):{parseInt((viewBoxX * xy.x) / width, 10)}  {`\n`}
                {`\n${startDate.toISOString()}---\n`}
                {`\n${endDate.toISOString()}---\n`}
              </pre>
              {(function ({
                viewBoxX,
                viewBoxY,
                dayWidth,
                ratio,
              }) {
                return (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      // viewBox={`0 0 ${viewBoxX} ${parseInt(viewBoxX * viewBoxRatio, 10)}`}
                      viewBox={`0 0 ${viewBoxX} ${viewBoxY}`}
                      style={{border: '1px solid gray'}}
                      onMouseMove={e => setXY({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY })}
                      ref={svgDOM}
                    >
                      <rect
                        width="10"
                        height="400"
                        x={parseInt((viewBoxX * xy.x) / width, 10) || 0}
                        y="20"
                        fill="red"
                      />
                      {range(startDate, offset).map(d => (
                        <Fragment key={d.d.toISOString()}>
                          <rect width="5" height="70" x={ratio((d.o - 1) * dayWidth) - 5} y="420" fill="black" data-key={d.o}></rect>
                          <text x={ratio((d.o - 1) * dayWidth) - 5} y="470"> &nbsp; {format(d.d, 'd iiii')}</text>
                        </Fragment>
                      ))}
                    </svg>
                  </>
                )
              }({
                viewBoxX,
                viewBoxY: 500,
                dayWidth: parseInt(width / offset, 10),
                ratio: ratio(viewBoxX, width),
              }))}
            </div>


          </div>
        )}
      </div>
    </div>
  );
}


