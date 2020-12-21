module.exports = [
    {
        "watchdog": {
            "settings": {
                "number_of_shards": 1,
                "number_of_replicas": 0
            },
            "mappings": {
                "properties": {
                    "probe_id": { // usually one value
                        "type": "keyword"
                    },
                    "probe": {
                        "type": "boolean"
                    },
                    "created": {
                        "type": "date"
                    },
                    "log": {
                        "type": "nested"
                    },
                }
            }
        }
    },
    {
        "messengers": {
            "settings": {
                "number_of_shards": 1,
                "number_of_replicas": 0
            },
            "mappings": {
                "properties": {
                    "messenger_id": {
                        "type": "keyword"
                    },
                    "data": { // data comming from body and query from http request
                        "type": "nested"
                    },
                    "status": {
                        // suspended (default)  - just logged, not sent
                        // sent                 - sent successfully
                        // errors               - sent but there were some errors
                        "type": "keyword"
                    },
                    "sent": { // last attempt to sent - no matter if status = sent or errors
                        "type": "date"
                    },
                    "log": {
                        // detailed log object with key (user id) and value,
                        // status of sending through particular channel
                        "type": "nested"
                    },
                    "created": { // when record was created - no matter if sent or not
                        "type": "date"
                    },
                }
            }
        }
    }
]