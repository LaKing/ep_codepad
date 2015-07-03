#!/bin/bash

json="../../settings.json"

DB="$(cat $json | grep -A 5 dbSettings | grep user | tr '"' ' ' | tr ',' ' ' | tr -d '[[:space:]]' )"
db_usr="${DB:5}"
echo "user: $db_usr"


DB="$(cat $json | grep -A 5 dbSettings | grep host | tr '"' ' ' | tr ',' ' ' | tr -d '[[:space:]]' )"
db_host="${DB:5}"
echo "host: $db_host"


DB="$(cat $json | grep -A 5 dbSettings | grep password | tr '"' ' ' | tr ',' ' ' | tr -d '[[:space:]]' )"
db_pwd="${DB:9}"
echo "password: $db_pwd"


DB="$(cat $json | grep -A 5 dbSettings | grep database | tr '"' ' ' | tr ',' ' ' | tr -d '[[:space:]]' )"
db_name="${DB:9}"
echo "database: $db_name"

MDA="-u root"

SQL1="DROP DATABASE $db_name;"
echo "$SQL1"

SQL2="CREATE DATABASE IF NOT EXISTS $db_name;"
echo "$SQL2"

SQL3="GRANT ALL ON $db_name.* TO '$db_usr'@'localhost' IDENTIFIED BY '$db_pwd'; flush privileges;"
echo "$SQL3"

mysql $MDA -e "$SQL1 $SQL2 $SQL3"



