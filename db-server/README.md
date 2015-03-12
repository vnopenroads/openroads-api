Adapted from https://github.com/openstreetmap/osmosis/tree/master/db-server

### Dependencies 

- [Docker](https://docs.docker.com/installation/#Installation)

On Ubuntu, it is necessary to install the Docker maintained package, since the one maintained by Ubuntu is outdated.

### Installation

This directory contains the scripts to create a docker-based database server to be used for  testing. In order to use this server, docker must be installed on the local workstation. Beyond that, no additional configuration should be required.

Initialize the docker VM (on Mac this is done by running boot2docker)

When the VM loads, it will show you variables to add to your environment, it should be something like 

```
To connect the Docker client to the Docker daemon, please set:
    export DOCKER_TLS_VERIFY=1
    export DOCKER_HOST=tcp://192.168.59.103:2376
    export DOCKER_CERT_PATH=/Users/flasher/.boot2docker/certs/boot2docker-vm
```

To build the docker image, run the following script.

``` sh
./build.sh
```

To run the docker image, run the following command. You will get a container ID that you can use to [start/stop](https://docs.docker.com/userguide/usingdocker/) the process.

```sh
docker run -ti -p 5432:5432 developmentseed/openroads-db
```

Note that you are no longer using the standard PostgreSQL port of 5434 but should instead use 5434 when connecting to the database.
