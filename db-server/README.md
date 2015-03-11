Adapted from https://github.com/openstreetmap/osmosis/tree/master/db-server

### Dependencies 

- [Docker](https://docs.docker.com/installation/#Installation)

On Ubuntu, it is necessary to install the Docker maintained package, since the one maintained by Ubuntu is outdated.

### Installation

This directory contains the scripts to create a docker-based database server to be used for  testing. In order to use this server, docker must be installed on the local workstation. Beyond that, no additional configuration should be required.

To build the docker image, run the following script.

``` sh
./build.sh
```

To run the docker image, run the following command. You will get a container ID that you can use to [start/stop](https://docs.docker.com/userguide/usingdocker/) the process.

```sh
docker run -ti -p 5432:5432 developmentseed/openroads-db
```