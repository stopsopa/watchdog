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
                    "sent_to": {
                        "type": "nested"
                    },
                    "sent": {
                        "type": "date"
                    },
                    "created": {
                        "type": "date"
                    },
                    "data": {
                        "type": "nested"
                    },
                }
            }
        }
    }
]