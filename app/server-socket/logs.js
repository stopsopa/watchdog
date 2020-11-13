
const log = require('inspc');

const knex = require('knex-abstract');

const delay = require('nlab/delay');

const validator = require('@stopsopa/validator');

const estool                = require('../es/es');

const th = msg => new Error(`log.js error: ${msg}`);

const driver = require('../probeDriver');

module.exports = async ({
  io,
  socket,
}) => {

  const man   = knex().model.projects;

  let es = await estool;

  es = await es();

  const index = es.prefix('watchdog');

  socket.on('probes_logs_full', async ({
    probe_id,
    startDate,
    endDate,
  }) => {

    log.dump({
      probes_logs_full: {
        probe_id,
        startDate,
        endDate,
      }
    })

    try {

      const probe = driver.getProbe(probe_id);

      const interval_ms = probe.state().db.interval_ms;

      let data = [];

      const query = {
        method: "POST",
        body: {
          "query": {
            "bool": {
              "must": [
                {
                  "term" : {
                    "probe_id" : probe_id
                  }
                },
                {
                  "range": {
                    "created": {
                      "gte": startDate,
                      "lte": endDate
                    }
                  }
                }
              ]
            }
          },
          "sort": { "created": { "order": "asc" } },
          "_source": ["created", "probe"],
          "size": 10000
        }
      };

      const response = await es(`/${index}/_search?filter_path=hits.hits.*.created,hits.hits.*.probe,hits.hits.*.execution_time_ms`, query);
      // const response = await es(`/${index}/_search?filter_path=hits.hits.*.created,hits.hits.*.probe,hits.hits._id`, query);

      if ( response.status !== 200 ) {

        throw th(`probes_logs_full() response.status is not 200`);
      }

      let tmp;
      try {

        tmp = response.body.hits.hits;
      }
      catch (e) {

        throw th(`probes_logs_full() can't extract response.body.hits.hits from query: ${JSON.stringify(query, null, 4)}`);
      }

      // tmp = [
      //   {
      //     "_source": {
      //       "created": "2020-10-19T00:00:00.000Z",
      //       "probe": true,
      //       execution_time_ms: 300,
      //     }
      //   },
      //   {
      //     "_source": {
      //       "created": "2020-10-19T00:01:00.000Z",
      //       "probe": false,
      //       execution_time_ms: 500,
      //     }
      //   },
      //   // {
      //   //   "_source": {
      //   //     "created": "2020-10-19T00:02:00.000Z",
      //   //     "probe": true,
      //   //     execution_time_ms: 500,
      //   //   }
      //   // },
      //   // {
      //   //   "_source": {
      //   //     "created": "2020-10-19T00:03:11.831Z",
      //   //     "probe": true
      //   //   }
      //   // },
      //   {
      //     "_source": {
      //       "created": "2020-10-19T00:03:00.000Z",
      //       "probe": true,
      //       execution_time_ms: 500,
      //     }
      //   },
      //   {
      //     "_source": {
      //       "created": "2020-10-19T00:04:00.000Z",
      //       "probe": true,
      //       execution_time_ms: 100,
      //     }
      //   },
      //   // {
      //   //   "_source": {
      //   //     "created": "2020-10-19T00:05:00.000Z",
      //   //     "probe": true,
      //   //     execution_time_ms: 200,
      //   //   }
      //   // },
      //   {
      //     "_source": {
      //       "created": "2020-10-19T00:06:00.000Z",
      //       "probe": true,
      //       execution_time_ms: 500,
      //     }
      //   },
      //   {
      //     "_source": {
      //       "created": "2020-10-19T00:07:00.000Z",
      //       "probe": true,
      //       execution_time_ms: 500,
      //     }
      //   },
      //   {
      //     "_source": {
      //       "created": "2020-10-19T00:08:00.000Z",
      //       "probe": true,
      //       execution_time_ms: 500,
      //     }
      //   }
      // ]


      let last = false;

      let list = [];

      for (let i = 0, l = tmp.length, t, p ; i < l ; i += 1 ) {

        t = tmp[i]._source;

        t.unixTimestampMs = (new Date(t.created)).getTime();

        let execution_time_ms = t.execution_time_ms || (30 * 1000); // 30 sec because minimum interval is 1 minute

                list.push({
                  p: t.probe,
                  f: t.created,
                  t: t.created,
                })

                continue;

        // if (i == 500) {
        //
        //   console.log(JSON.stringify(tmp[i], null, 4))
        // }

        if ( ! last ) {

          last = {
            p: t.probe,
            f: t.created,
            t: t.created,
          };

          continue;
        }

        p = tmp[i - 1]._source;

        if (last.p === t.probe) {

          if ( (t.unixTimestampMs - p.unixTimestampMs) > (interval_ms + execution_time_ms) ) {

            // log.dump({
            //   't.unixTimestampMs': t.unixTimestampMs,
            //   'p.unixTimestampMs': p.unixTimestampMs,
            //   '(t.unixTimestampMs - p.unixTimestampMs)': (t.unixTimestampMs - p.unixTimestampMs),
            //   interval_ms,
            // })

            list.push(last);

            last = {
              p: t.probe,
              f: t.created,
              t: t.created,
            };
          }
          else {

            last.t = t.created;
          }

          continue;
        }
        else {

          list.push(last);

          last = {
            p: t.probe,
            f: t.created,
            t: t.created,
          };
        }
      }

      if (last !== false) {

        list.push(last);
      }

      // console.log(JSON.stringify(list, null, 4));

      socket.emit('probes_logs_full', {
        list,
      })
    }
    catch (e) {

      log.dump({
        probes_logs_full_error: e,
      }, 2);

      socket.emit('probes_logs_full', {
        error: `failed to fetch probe by id '${probe_id}' list from database`,
      })
    }
  });

  const probes_logs_selection = async ({
    probe_id,
    startDate,
    endDate,
    key,
  }) => {

    // log.dump({
    //   probes_logs_selection: {
    //     probe_id,
    //     startDate,
    //     endDate,
    //     key,
    //   }
    // })

    try {

      const query = {
        method: "POST",
        body: {
          "query": {
            "bool": {
              "must": [
                {
                  "term" : {
                    "probe_id" : probe_id
                  }
                },
                {
                  "range": {
                    "created": {
                      "gte": startDate,
                      "lte": endDate
                    }
                  }
                }
              ]
            }
          },
          "sort": { "created": { "order": "asc" } },
          "_source": ["created", "probe"],
          "size": 10000
        }
      };


      // const response = await es(`/${index}/_search?filter_path=hits.hits.*.created,hits.hits.*.probe`, query);
      const response = await es(`/${index}/_search?filter_path=hits.hits.*.created,hits.hits.*.probe,hits.hits._id`, query);

      if ( response.status !== 200 ) {

        throw th(`probes_logs_selection() response.status is not 200`);
      }

      let tmp;
      try {

        tmp = response.body.hits.hits;
      }
      catch (e) {

        throw th(`probes_logs_selection() can't extract response.body.hits.hits from query`);
      }

      let list = [];

      for (let i = 0, l = tmp.length, t ; i < l ; i += 1 ) {

        t = tmp[i];

        list.push({
          id: t._id,
          p: t._source.probe,
          f: t._source.created,
        })
      }

      socket.emit('probes_logs_selection', {
        list,
        key,
      })
    }
    catch (e) {

      log.dump({
        probes_logs_selection_error: e,
      }, 2);

      e = String(e);

      if (e.includes('can\'t extract response.body.hits.hits from que')) {

        e = 'No results found for this dates range';
      }

      socket.emit('probes_logs_selection', {
        error: e,
        key,
      })
    }
  }

  socket.on('probes_logs_selection', probes_logs_selection)



  socket.on('probes_logs_selected_log', async ({
    log_id,
    key,
  }) => {

    // log.dump({
    //   probes_logs_selected_log: {
    //     probe_id,
    //     startDate,
    //     endDate,
    //     key,
    //   }
    // })

    try {

      if ( typeof log_id !== 'string') {

        throw th("typeof log_id !== 'string'");
      }

      if ( ! log_id.trim() ) {

        throw th("!log_id.trim()");
      }

      // const response = await es(`/${index}/_search?filter_path=hits.hits.*.created,hits.hits.*.probe`, query);
      // const response = await es(`/${index}/_search?filter_path=hits.hits.*.created,hits.hits.*.probe,hits.hits._id`);
      // const response = await es(`/${index}/_doc/${log_id}?filter_path=hits.hits.*.created,hits.hits.*.probe,hits.hits._id`);
      const response = await es(`/${index}/_doc/${log_id}?filter_path=_source,_id`);

      if ( response.status !== 200 ) {

        throw th(`probes_logs_selected_log() response.status is not 200`);
      }

      // log.dump({
      //   response,
      // }, 100)

      let log;
      try {

        log = response.body;
      }
      catch (e) {

        throw th(`probes_logs_selected_log() can't extract response.body from query: ${JSON.stringify(query, null, 4)}`);
      }

      socket.emit('probes_logs_selected_log', {
        log,
        key,
      })
    }
    catch (e) {

      log.dump({
        probes_logs_selected_log_error: e,
      }, 2);

      socket.emit('probes_logs_selected_log', {
        error: `failed to fetch probe by id '${log_id}' list from database`,
      })
    }
  })

  socket.on('probes_delete_selected_log', async ({
    log_id,
    probe_id,
    startDate,
    endDate,
    key,
  }) => {

    // log.dump({
    //   probes_delete_selected_log: {
    //     probe_id,
    //     startDate,
    //     endDate,
    //     key,
    //   }
    // })

    try {

      if ( typeof log_id !== 'string') {

        throw th("typeof log_id !== 'string'");
      }

      if ( ! log_id.trim() ) {

        throw th("!log_id.trim()");
      }

      // const response = await es(`/${index}/_search?filter_path=hits.hits.*.created,hits.hits.*.probe`, query);
      // const response = await es(`/${index}/_search?filter_path=hits.hits.*.created,hits.hits.*.probe,hits.hits._id`);
      // const response = await es(`/${index}/_doc/${log_id}?filter_path=hits.hits.*.created,hits.hits.*.probe,hits.hits._id`);
      const response = await es(`/${index}/_doc/${log_id}`, {
        method: 'DELETE'
      });

      await delay(1000);

      await probes_logs_selection({
        probe_id,
        startDate,
        endDate,
        key,
      });
    }
    catch (e) {

      log.dump({
        probes_delete_selected_log_error: e,
      }, 2);

      socket.emit('probes_delete_selected_log', {
        error: `failed to fetch probe by id '${log_id}' list from database`,
      })
    }
  })

}