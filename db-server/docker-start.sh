#!/bin/bash

DATADIR="/var/lib/pgsql/data"

# test if DATADIR has content
if [ ! "$(ls -A $DATADIR)" ]; then
	# Create the en_US.UTF-8 locale.  We need UTF-8 support in the database.
	localedef -v -c -i en_US -f UTF-8 en_US.UTF-8

	echo "Initializing Postgres Database at $DATADIR"
	su postgres sh -lc "initdb --encoding=UTF-8 --locale=en_US.UTF-8"

	su postgres sh -lc "postgres --single -jE" <<-EOSQL
		CREATE USER osm WITH SUPERUSER PASSWORD 'password';
	EOSQL

	# Allow the osm user to connect remotely with a password.
	echo "listen_addresses = '*'" >> "${DATADIR}/postgresql.conf"
	echo "host all osm 0.0.0.0/0 md5" >> "${DATADIR}/pg_hba.conf"

	# Create the apidb database owned by osm.
	su postgres sh -lc "postgres --single -jE" <<-EOSQL
		CREATE DATABASE api06_test OWNER osm;
	EOSQL

	# Start the database server temporarily while we configure the databases.
	su postgres sh -lc "pg_ctl -w start"

	# Configure the api06_test database as the OSM user.
	su postgres sh -lc "psql -U osm api06_test" <<-EOSQL
		\i /install/script/apidb_0.6.sql
		\i /install/script/apidb_0.6_admin_boundaries.sql
	EOSQL

        # Add admin boundaries
        su postgres sh -c "cat admin_boundaries.csv | psql postgres://osm:password@192.168.99.100/api06_test -c "'"'"copy admin_boundaries FROM stdin DELIMITER ',' CSV HEADER;"'"'" "
	# Stop the database.
	su postgres sh -lc "pg_ctl -w stop"
fi

SHUTDOWN_COMMAND="echo \"Shutting down postgres\"; su postgres sh -lc \"pg_ctl -w stop\""
trap "${SHUTDOWN_COMMAND}" SIGTERM
trap "${SHUTDOWN_COMMAND}" SIGINT

# Start the database server.
su postgres sh -lc "pg_ctl -w start"

echo "Docker container startup complete"

# Wait for the server to exit.
while test -e "/var/lib/pgsql/data/postmaster.pid"; do
	sleep 0.5
done
