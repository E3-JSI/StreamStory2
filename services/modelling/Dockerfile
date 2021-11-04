# Build stage
# ===========

FROM ubuntu:focal AS build-stage

ARG ROOT
ENV BUILD=release

WORKDIR /app

# Install dependencies
RUN apt-get update
RUN apt-get install -y build-essential
RUN apt-get install -y git
RUN apt-get install -y python2
RUN apt-get install -y uuid-dev

# Build glib
RUN git clone https://github.com/qminer/qminer.git
RUN cd qminer/src/glib && \
    make ${BUILD} && \
    mv glib.a glib-${BUILD}.a

# Copy project files from host
COPY $ROOT .

# Build service
RUN make ${BUILD}


# Production stage
# ================

FROM ubuntu:focal

WORKDIR /app

# Copy from build stage
COPY --from=build-stage /app/ss2 /app
COPY --from=build-stage /app/src/UnicodeDef.bin /app

# Run service
EXPOSE 8096
ENTRYPOINT ["./ss2", "-port:8096", "-logfile:modelling.log"]
