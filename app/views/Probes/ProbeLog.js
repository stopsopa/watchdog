
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

import { parseFromTimeZone, formatToTimeZone } from 'date-fns-timezone';

window.tz = formatToTimeZone;

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
function range(date, offsetDays, dateAdjustment = 0) {

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
      d: offsetDay(date, offset + dateAdjustment),
      o: offset,
    })
  }

  return list;
}

function ratio(viewBoxX, width) {
  return x => {
    // return (viewBoxX * (d.o * dayWidth)) / width
    return parseInt((viewBoxX * x) / width, 10) || 0;
  }
}

function percent(width) {
  return x => {
    // return (viewBoxX * (d.o * dayWidth)) / width
    return (x / width) || 0;
  }
}

function timeOffset(date, seconds) {

  if (seconds < 0) {

    seconds = 0
  }

  var tmp = new Date(date.getTime() + (seconds * 1000));

  return tmp;
}

function flip(s = {}) {

  if ( s.start && s.end && s.start.date > s.end.date ) {

    return {
      start: s.end,
      end: s.start
    }
  }

  return s;
}

function UTCClock() {
  const [time, setTime] = useState({
    char: ':',
    time: new Date(),
  });
  useEffect(() => {
    let l = true;
    const handler = setInterval(() => {
      setTime({
        char: l ? ' ' : ':',
        time: new Date(),
      });
      l = !l;
    }, 500);
    return () => clearInterval(handler);
  }, []);
  return (
    <span style={{fontFamily:'monospace'}}>[UTC time {formatToTimeZone(time.time, 'YYYY-MM-DD HH:mm:ss', {timeZone:'UTC'}).replace(/:/g, time.char)}]</span>
  )
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

  const r = ratio(viewBoxX, width);

  const p = percent(width);

  const rangeSeconds = (60 * 60 * 24 * offset);

  const startDateMidnight = new Date(startDate);
  startDateMidnight.setUTCHours(0,0,0,0);

  const [selected , setSelected] = useState({});

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
                      setSelected({})
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
                      setSelected({})
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
                        setSelected({})
                      }}
                    >
                      {formatToTimeZone(d.d, 'D dddd', {timeZone:'UTC'})}
                    </Button>
                  ))}
                </tr>
                </tbody>
              </table>
              <pre>{`
${viewBoxX} ${parseInt(viewBoxX * viewBoxRatio, 10)}
${xy.x} - ${xy.y}
[width:${width}]
[offset:${offset}]
[ratio:${r(xy.x)}]
[%:${p(xy.x)}]
[rangeSeconds:${rangeSeconds}]
[rangeSeconds * %:${parseInt(rangeSeconds * p(xy.x), 10)}] 
[dayWidth:${parseInt(width / offset, 10)}] 
[startDateMidnight:${startDateMidnight.toISOString()}] 
[offsetdate_______:${timeOffset(startDateMidnight, parseInt(rangeSeconds * p(xy.x), 10) || 0).toISOString()}] 
parseInt((viewBoxX * xy.x) / width, 10):${parseInt((viewBoxX * xy.x) / width, 10)}  
startDate:${startDate.toISOString()}
endDate__:${endDate.toISOString()}             
selected.start:${selected && selected.start && selected.start.date.toISOString()}     
selected.end__:${selected && selected.end && selected.end.date.toISOString()} 
              `}</pre>
              <table className="timetable">
                <tbody>
                <tr>
                  <td>
                    <UTCClock />
                    {xy && xy.x && formatToTimeZone(timeOffset(startDateMidnight, parseInt(rangeSeconds * p(xy.x), 10) || 0), 'YYYY-MM-DD HH:mm:ss', {timeZone:'UTC'})}
                  </td>
                  <td>
                    {selected && selected.start && formatToTimeZone(selected.start.date, 'YYYY-MM-DD HH:mm:ss', {timeZone:'UTC'})}
                    {selected.end && ` - `}
                    {selected && selected.end && formatToTimeZone(selected.end.date, 'YYYY-MM-DD HH:mm:ss', {timeZone:'UTC'})}
                  </td>
                  <td>

                  </td>
                </tr>
                </tbody>
              </table>

              {(function ({
                viewBoxX,
                viewBoxY,
                dayWidth,
                ratio,
                s,
              }) {
                return (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      // viewBox={`0 0 ${viewBoxX} ${parseInt(viewBoxX * viewBoxRatio, 10)}`}
                      viewBox={`0 0 ${viewBoxX} ${viewBoxY}`}
                      ref={svgDOM}
                      onMouseDown={e => {
                        log('onMouseDown')
                        var s = {};
                        s.start = s.end = {
                          date: timeOffset(startDateMidnight, parseInt(rangeSeconds * p(xy.x), 10) || 0),
                          x: xy.x
                        }
                        setSelected(s);
                      }}
                      onMouseMove={e => {
                        setXY({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY })
                        if ( ! selected || ! selected.start || selected.locked ) {
                          log('onMouseMove return')
                          return
                        }

                        const s = flip(selected);

                        let key = 'end';

                        let tmp = timeOffset(startDateMidnight, parseInt(rangeSeconds * p(xy.x), 10) || 0);

                        if ( Math.abs(tmp - selected.start.date) < Math.abs(tmp - selected.end.date) ) {

                          key = 'start';
                        }

                        log('onMouseOver', key)
                        return setSelected({
                          ...s,
                          [key]: {
                            date: tmp,
                            x: xy.x
                          }
                        })
                      }}
                      onMouseUp={e => {

                        if ( selected.start && selected.end && selected.start.date == selected.end.date) {
                          log('onMouseUp clear')

                          setSelected({})
                        }
                        else {

                          const s = {
                            ...flip(selected),
                            locked: true,
                          }

                          setSelected(s)
                          log('onMouseUp trigger', s)
                        }
                      }}
                    >
                      {s.start && s.end && (
                        <rect
                          width={r(s.end.x - s.start.x)}
                          height="380"
                          x={r(s.start.x)}
                          y="20"
                          // fill="blue"
                          stroke="#3e7c48"
                          fill="url(#brush_pattern)"
                        />
                      )}
                      {range(startDate, offset, -1).map(d => (
                        <Fragment key={d.d.toISOString()}>
                          <rect width="5" height="70" x={r((d.o - 1) * dayWidth) - 5} y="420" fill="black"></rect>
                          <text x={r((d.o - 1) * dayWidth) - 5} y="470"> &nbsp; {formatToTimeZone(d.d, 'D dddd', {timeZone:'UTC'})}</text>
                        </Fragment>
                      ))}
                      <rect
                        width="10"
                        height="380"
                        x={r(xy.x)}
                        y="20"
                        fill="red"
                      />

                      <defs>

                        <pattern id="brush_pattern" width="60" height="60" patternUnits="userSpaceOnUse">
                          <path className="visx-pattern-line" d="M 0,60 l 60,-60 " stroke="#3e7c48" stroke-width="3"
                                stroke-linecap="square" shape-rendering="auto"></path>

                          {/*<path className="visx-pattern-line" d="M 0,8 l 8,-8 M -2,2 l 4,-4 M 6,10 l 4,-4"*/}
                          {/*      stroke="red" stroke-width="1" stroke-linecap="square" shape-rendering="auto"*/}
                          {/*></path>*/}
                        </pattern>
                      </defs>
                    </svg>
                  </>
                )
              }({
                viewBoxX,
                viewBoxY: 500,
                dayWidth: parseInt(width / offset, 10),
                r: ratio,
                s: (flip(selected))
              }))}
            </div>


          </div>
        )}
      </div>
    </div>
  );
}


