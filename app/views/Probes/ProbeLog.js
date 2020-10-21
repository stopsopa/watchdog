
const _data = require('./data');

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

import classnames from 'classnames';

import log from 'inspc';

const ms        = require('nlab/ms');

const generate  = ms.generate;

const raw       = ms.raw;

import all from 'nlab/all';

import format from 'date-fns/format';

import { parseFromTimeZone, formatToTimeZone } from 'date-fns-timezone';

import Textarea from '../../components/Textarea';

import NoInput from '../../components/NoInput/NoInput';

import IntervalInput from '../../components/IntervalInput/IntervalInput';

import {
  StoreContext as StoreContextAssoc,
  getStoreAssoc,
  setStoreAssoc,
  setStoreAssocDelete,

  actionFetchFullRangeStats,
  actionFetchSelectionStats,
  actionFetchSelectedLog,
  actionDeleteSelectedLog,

} from '../../_storage/storeAssoc'

const assocKeyFullRange     = 'log_full_range';
const assocKeySelection     = 'log_selection';
const assocKeySelectedLog   = 'log_selected_log';

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

    list.push({
      d: offsetDay(date, i),
      o: i + 1,
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

function widthBasedOnDateBuilder(rangeSeconds, width, rangeStartDate) {

  // log('rangeSeconds',rangeSeconds,'width',width,'rangeStartDate', rangeStartDate);

  const rangeStartDateTime = rangeStartDate.getTime();

  return function (givenDateString) {

    const xsec = parseInt(((new Date(givenDateString)).getTime() - rangeStartDateTime) / 1000, 10);

    return parseInt((xsec * width) / rangeSeconds, 10);

    // const final = parseInt((xsec * width) / rangeSeconds, 10);
    //
    // // log('w type', typeof givenDateString, 'givenDateString', givenDateString, 'xsec', xsec, 'width', width, '(xsec * width)',(xsec * width), 'final', final);
    //
    // return final;
  }
}

function timeOffset(date, seconds) {

  if (seconds < 0) {

    seconds = 0
  }

  return new Date(date.getTime() + (seconds * 1000));
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

function DateColour({
  date,
  char= ':',
}) {
  return (
    <>
      <span className="date">{formatToTimeZone(date, 'YYYY-MM-DD', {timeZone:'UTC'})}</span>
      {` `}
      <span className="hour">{formatToTimeZone(date, 'HH:mm:ss', {timeZone:'UTC'}).replace(/:/g, char)}</span>
    </>
  )
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
    <span style={{fontFamily:'monospace'}}>[UTC time {<DateColour date={time.time} char={time.char}/>}]</span>
  )
}

export default function ProbeLog() {

  const deletemode = new URLSearchParams(location.search).has('deletemode');

  useContext(StoreContextAssoc);

  useContext(StoreContextProjects);

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

  const rangeSeconds = (60 * 60 * 24 * offset);

  const startDateMidnight = new Date(startDate);
  startDateMidnight.setUTCHours(0,0,0,0);

  const [selected , setSelected] = useState({});

  const r = ratio(viewBoxX, width);

  const p = percent(width);

  const w = widthBasedOnDateBuilder(rangeSeconds, viewBoxX, startDateMidnight);

  const eraseStats = () => {
    setStoreAssocDelete(assocKeyFullRange);
    setStoreAssocDelete(assocKeySelection);
    setStoreAssocDelete(assocKeySelectedLog);
  };

  useEffect(eraseStats, []);

  useEffect(() => {

    eraseStats();

    const endDate = offsetDay(startDate, offset - 1);

    endDate.setUTCHours(23, 59, 59, 0);

    return actionFetchFullRangeStats({
      probe_id,
      startDate: startDateMidnight,
      endDate,
      key: assocKeyFullRange
    });
  }, [startDate, offset]);

  const assocFullRange    = getStoreAssoc(assocKeyFullRange);

  const assocSelection    = getStoreAssoc(assocKeySelection);

  const assocSelectedLog  = getStoreAssoc(assocKeySelectedLog);

  function fetchSelectionData(s) {
    actionFetchSelectionStats({
      probe_id,
      startDate: s.start.date,
      endDate: s.end.date,
      key: assocKeySelection,
    })
  }

  function fetchSelectedLog(log_id) {
    actionFetchSelectedLog({
      log_id,
      key: assocKeySelectedLog,
    })
  }

  const onModalClose = () => {
    setStoreAssocDelete(assocKeySelectedLog)
  }

  const onDeleteLog = log_id => {
    actionDeleteSelectedLog({
      log_id,
      probe_id,
      startDate: selected.start.date,
      endDate: selected.end.date,
      key: assocKeySelection,
    })
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

              <Button
                icon="edit"
                content="Edit"
                as={Link}
                to={`/${pform.id}/probe/edit/${form.id}`}
                className="right"
              />
            </h1>

            <div className="chart">

              {/*<input type="range"*/}
              {/*       min="200" max="10080"*/}
              {/*       value={viewBoxX}*/}
              {/*       style={{width: '500px'}}*/}
              {/*       onChange={e => setViewBoxX(e.target.value)}*/}
              {/*/>*/}

              {/*<br />*/}
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
                  {range(startDate, 7, -1).map(d => (
                    <td key={d.o}>
                      <Button
                        size="mini"
                        primary={d.o <= offset}

                        onClick={e => {e.preventDefault();
                          setOffset(d.o)
                          setSelected({})
                        }}
                      >
                        {formatToTimeZone(d.d, 'D dddd', {timeZone:'UTC'})}
                      </Button>
                    </td>
                  ))}
                </tr>
                </tbody>
              </table>
{/*              <pre>{`*/}
{/*${viewBoxX} ${parseInt(viewBoxX * viewBoxRatio, 10)}*/}
{/*${xy.x} - ${xy.y}*/}
{/*[width:${width}]*/}
{/*[offset:${offset}]*/}
{/*[ratio:${r(xy.x)}]*/}
{/*[%:${p(xy.x)}]*/}
{/*[rangeSeconds:${rangeSeconds}]*/}
{/*[rangeSeconds * %:${parseInt(rangeSeconds * p(xy.x), 10)}] */}
{/*[dayWidth:${parseInt(width / offset, 10)}] */}
{/*[startDateMidnight:${startDateMidnight.toISOString()}] */}
{/*[offsetdate_______:${timeOffset(startDateMidnight, parseInt(rangeSeconds * p(xy.x), 10) || 0).toISOString()}] */}
{/*parseInt((viewBoxX * xy.x) / width, 10):${parseInt((viewBoxX * xy.x) / width, 10)}  */}
{/*startDate:${startDate.toISOString()}*/}
{/*endDate__:${endDate.toISOString()}             */}
{/*selected.start:${selected && selected.start && selected.start.date.toISOString()}     */}
{/*selected.end__:${selected && selected.end && selected.end.date.toISOString()} */}
{/*              `}</pre>*/}
              <table className="timetable">
                <tbody>
                <tr>
                  <td>
                    <UTCClock />
                    {` `}
                    <DateColour date={timeOffset(startDateMidnight, parseInt(rangeSeconds * p(xy.x), 10))} />
                  </td>
                  <td></td>
                  <td>
                    {selected && selected.start && <DateColour date={selected.start.date}/>}
                    {selected.end && ` - `}
                    {selected && selected.end && <DateColour date={selected.end.date}/>}
                  </td>
                  <td></td>
                  <td>{selected && selected.start && selected.end && ms(Math.abs(selected.start.date - selected.end.date))}</td>
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
                          // log('onMouseMove return')
                          return
                        }

                        const s = flip(selected);

                        let key = 'end';

                        let tmp = timeOffset(startDateMidnight, parseInt(rangeSeconds * p(xy.x), 10) || 0);

                        if ( Math.abs(tmp - selected.start.date) < Math.abs(tmp - selected.end.date) ) {

                          key = 'start';
                        }

                        // log('onMouseOver', key)
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
                          return setSelected({})
                        }

                        const s = {
                          ...flip(selected),
                          locked: true,
                        };

                        setSelected(s)

                        fetchSelectionData(s)
                      }}
                    >
                      {assocFullRange && assocFullRange.map((d, i) => {
                        const x = w(d.f);
                        return (
                          <rect
                            key={i}
                            width={(function (x) {
                              return x < 5 ? 5 : x;
                            }(w(d.t) - x))}

                            height="380"
                            y="20"

                            x={x}
                            fill={d.p ? '#65dcb5' : '#e65424'}
                          />
                        );
                      })}
                      {s.start && s.end && (
                        <rect
                          width={r(s.end.x - s.start.x)}
                          height="230"
                          y="170"
                          x={r(s.start.x)}
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

                        // height="380"
                        // y="20"

                        height="230"
                        y="170"
                        x={r(xy.x)}
                        fill="green"
                      />

                      <defs>
                        <pattern id="brush_pattern" width="60" height="60" patternUnits="userSpaceOnUse">
                          <path className="visx-pattern-line" d="M 0,60 l 60,-60" stroke="#3e7c48" strokeWidth="3"
                                strokeLinecap="square" shapeRendering="auto"></path>
                          {/*https://airbnb.io/visx/brush*/}
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

            <div className="list">
              {assocSelection === null && (<div style={{textAlign:'center'}}>Loading...</div>)}

              {Array.isArray(assocSelection) && (assocSelection.length ? (
                <table className="probes_logs_selection">
                  <thead>
                  <tr>
                    <th></th>
                    <th>Id</th>
                    <th>Date</th>
                    <th>probe</th>
                    {deletemode && <th>actions</th>}
                  </tr>
                  </thead>
                  <tbody>
                  {assocSelection.map((r, i) => {
                    return (
                      <tr key={i} className={classnames('select_log', {
                        error: !r.p,
                      })} onClick={() => fetchSelectedLog(r.id)}>
                        <th>{i + 1}</th>
                        <td>{r.id}</td>
                        <td>
                          <DateColour date={r.f} />
                        </td>
                        <td>
                          <Icon color={r.p ? `green` : `red`} name={r.p ? `check` : `x`}/>
                        </td>
                        {deletemode && <td className="actions">
                          <Button size="mini" color="red" icon="trash" onClick={e => {
                            e.preventDefault();
                            e.stopPropagation();

                            onDeleteLog(r.id)
                          }}/>
                        </td>}
                      </tr>
                    )
                  })}
                  </tbody>
                </table>
              ) : <span><Icon name="search"/> No results found</span>)}
            </div>

            <a href="javascript:void(0)" onClick={() => {

              var k = (function (p, h, k) {
                p.has(k) ? p.delete(k) : p.set(k, '');
                p = String(p);
                p ? (p = '?' + p) : (p = '');
                location.href = (location.href.split('#')[0]).split('?')[0] + p + h;
              }(new URLSearchParams(location.search), location.hash, 'deletemode'))
              
            }}>delete mode</a>


            <Modal
              onClose={onModalClose}
              // onOpen={e => {
              //   e && e.preventDefault();
              //   setTestModal(true)
              // }}
              open={Boolean(assocSelectedLog)}
              closeOnEscape={true}
              closeOnDimmerClick={true}
              // trigger={<Button className="test-code">Run code</Button>}
              // size="fullscreen"
            >
              <Modal.Header>Log</Modal.Header>
              <Modal.Content scrolling>
                <pre className="code-test-result">{JSON.stringify((assocSelectedLog || "No result yet"), null, 4)}</pre>
              </Modal.Content>
              <Modal.Actions>
                <Button color='black' onClick={onModalClose}>
                  Close
                </Button>
              </Modal.Actions>
            </Modal>


          </div>
        )}
      </div>
    </div>
  );
}


