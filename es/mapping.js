module.exports = [
    {
        "pendulum": {
            "settings": {
                "number_of_shards": 1,
                "number_of_replicas": 0
            },
            "mappings": {
                "properties": {
                    "address": { // usually one value
                        "type": "keyword"
                    },
                    "created": {
                        "type": "date"
                    },
                    "fetched": {
                        "type": "date"
                    },
                    "location": { // https://www.elastic.co/guide/en/elasticsearch/reference/current/geo-point.html#geo-point
                        "type": "geo_point"
                    },
                    "response_body": {
                        "type": "nested"
                    },
                    "location_type": {
                        "type": "keyword"
                    },
                    "administrative_area_level_2": {
                        "type": "keyword"
                    },
                    "administrative_area_level_1": {
                        "type": "keyword"
                    },
                    "country": {
                        "type": "keyword"
                    },
                    "country_code": { // pl, en
                        "type": "keyword"
                    },
                    "postal_code": {
                        "type": "keyword"
                    },
                }
            }
        }
    }
]