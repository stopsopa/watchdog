module.exports = [
    {
        "pendulum": {
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
    }
]