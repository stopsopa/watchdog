
# todo

- [ ] single server.sh running everything (webpack build and dev server)
- [x] refresh param ?_=time (browser cache)
- [ ] extend webpack to be able to import semantic ui css
- [ ] parameter to skip cache-loader in webpack.config.js for docker image build mode
- [x] deleteing projects with probes
- [x] favicon
- [x] probeClass()->status() - add/calculate next trigger time
- [x] Flip days selectors next to the datepicker
- [x] log stats page, listen to get parameters
- [x] fix resizing of the graph with selection (it would require to convert positon of mouse to percentage of with of the svg - not worth of effort)
- [x] buttons to navigate from logs to edit probe and back
- [x] add ace editor
- [x] update live graph and list below
- [x] service flag
- [ ] commenting individual logs
- [x] current time on the graph
- [x] add icon informing about collecting full log when probe=true - archive mode
- [ ] extend project - add telegram integration with proxy users management - sending to to particular use but to group (to group id)
- [x] status icon
- [ ] 'some probes are disabled' icon
- [x] widget informing about incomming execution (for active) or incomming request (for passive) expected trigger (countdown)
- [ ] creating new probes by copying settings from another
- [ ] whether icons https://www.s-ings.com/typicons/
- [x] issue fix, updating probe updates list of probes in other browser instance
- [x] issue fix, probes countdown - not always lowest number of seconds
- [x] restart on update
- [x] require-from-string
- [x] autoscroll
- [ ] chrome notifications https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API

https://github.com/stopsopa/watchdog

https://www.geeksforgeeks.org/how-to-use-animation-on-favicon-image/#:~:text=An%20animated%20favicon%20is%20created,within%20a%20specific%20time%20frame.&text=Note%3A%20Animated%20images%20of%20type%20GIF%20will%20work%20in%20Firefox%20browser.

--------- logger ----

https://docs.python.org/3/howto/logging.html


error_uuid: [string]
ip || password [string]
env: [string] (prod|stage|test|... so on)

if ip provided:
    url [string]
    useragent [string]
    session_uuid [string]
    session_interaction_history: (array of few previous important events) Array([string]) 
    user_id [string] ?

else (if no ip then password have to be provided - for server)
    machine_hostname: [string]
    server_instance_uuid: [string] ?
    cluster: [string] ?
    node: [string] ?
    pod: [string] ?

error_symbol: [string] 
level: DEBUG INFO WARNING+ ERROR CRITICAL [string]    

created: [datetime]

# deleting es index

just run server specifying --delete parameter
then run server normally to recreate index in new format

```

node server.js --delete messengers
node server.js --delete watchdog
```

see mapping.js file

# Requirements:

- es version 7.6.0
- node.js - look to .nvmrc
- mysql version - docker image (see docker/docker-compose.yml file)

# changing structure of index in es

https://www.elastic.co/blog/reindex-is-coming
 
investigate strucutre of index

    curl -H "authorization: Basic xxx" 'elastic.xxx.com/watchdog_watchdog?format=yaml'
    
    curl -XPOST -H "authorization: Basic xxx" -H 'Content-Type: application/json' elastic.xxx.com/_reindex?pretty -d '{
        "source": {
            "index": "watchdog_watchdog"
        },
        "dest": {
            "index": "watchdogg_watchdog"
        }
    }'
    
    watch "curl -H \"authorization: Basic xxx\" 'elastic.xxx.com/_cat/indices?v' | grep watch"

when ready, then just clone index:
https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-clone-index.html

    curl -XPUT -H "authorization: Basic xxx" -H 'Content-Type: application/json' elastic.xxx.com/watchdog_watchdog/_settings -d '{
        "settings": {
            "index.blocks.write": false
        }
    }'

    curl -XPOST -H "authorization: Basic xxx" elastic.xxx.com/source_index/_clone/target_index

and remove old index:
https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-delete-index.html

    curl -XDELETE -H "authorization: Basic xxx" elastic.xxx.com/watchdog_watchdog

