#!/usr/bin/env bash
# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
# Copyright (C) 2019 Northwestern University.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.


# Verify that all services are running before continuing
check_ready() {
    RETRIES=20
    while ! $2
    do
        echo "Waiting for $1, $((RETRIES--)) remaining attempts..."
        sleep 2
        if [ $RETRIES -eq 0 ]
        then
            echo "Couldn't reach $1"
            exit 1
        fi
    done
}
_db_check(){ docker-compose exec --user postgres db bash -c "pg_isready" &>/dev/null; }
check_ready "Postgres" _db_check

_es_check(){ curl --output /dev/null --silent --head --fail http://localhost:9200 &>/dev/null; }
check_ready "Elasticsearch" _es_check

_redis_check(){ docker-compose exec cache bash -c 'redis-cli ping' | grep 'PONG' &> /dev/null; }
check_ready "Redis" _redis_check

_rabbit_check(){ docker-compose exec mq bash -c "rabbitmqctl status" &>/dev/null; }
check_ready "RabbitMQ" _rabbit_check

_web_server_check_css(){
    string="Content-Type: text/css"
    OUT=$(wget --spider -S -r -l 1 --page-requisites --no-check-certificate https://localhost 2>&1)
    if echo $OUT | grep -q "$string"
    then
        return 0
    else
        return 1
    fi
}

if [ "$1" == "--full" ]
then
    check_ready "CSS" _web_server_check_css

    _web_server_check_http(){ curl --output /dev/null --silent --head --fail http://localhost:80 &>/dev/null; }
    check_ready "Web Server HTTP" _web_server_check_http

    _web_server_check_https(){ curl --output /dev/null --silent --head --fail -k https://localhost:443 &>/dev/null; }
    check_ready "Web Server HTTPS" _web_server_check_https
fi
