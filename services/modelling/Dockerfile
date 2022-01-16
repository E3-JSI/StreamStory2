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

# TODO: Remove commit checkout and fix glib compilation error
RUN cd qminer/src/glib && \
    git checkout a7aa7b8d843b6d75eca6f870c054bec9684a978a && \
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

# Install production dependencies
RUN apt-get update
RUN apt-get install -y libgomp1

# Run service
EXPOSE 8096
ENTRYPOINT ["./ss2", "-port:8096", "-logfile:modelling.log"]
