CXX = g++

# Get qminer from https://github.com/qminer/qminer/tree/master/src
QMINER=qminer/src
GLIB=$(QMINER)/glib
LIBUV=$(QMINER)/third_party/libuv
LIBSVM=$(QMINER)/third_party/libsvm

# -I/usr/pgsql-9.5/include/
CXXFLAGS += -std=c++11 -fopenmp -march=native \
	-I$(LIBUV)/include \
	-I$(GLIB) \
	-I$(GLIB)/mine \
	-I$(GLIB)/base \
	-I$(GLIB)/net \
	-I$(GLIB)/misc 

# -L/usr/pgsql-9.5/lib/   -lpqxx -lpq  
LDFLAGS += -L$(LIBUV) -lrt -luuid -fopenmp -Wl,--build-id

debug: CXXFLAGS += -g -ggdb
debug: StreamStory2Debug

release: CXXFLAGS += -O9 -g -ggdb -march=native
release: StreamStory2Release

OBJECTS = Ss2Main.o StreamStory2.o JbUtils.o svm.o

# Note: build glib from https://github.com/qminer/qminer/tree/master/src/glib
# and rename glib.a to glib-debug.a or glib-release.a.

StreamStory2Debug: $(OBJECTS) $(GLIB)/glib-debug.a
	$(CXX) -o ss2 $(OBJECTS) $(GLIB)/glib-debug.a $(LDFLAGS) $(LIBUV)/libuv.a

StreamStory2Release: $(OBJECTS) $(GLIB)/glib-release.a
	$(CXX) -o ss2 $(OBJECTS) $(GLIB)/glib-release.a $(LDFLAGS) $(LIBUV)/libuv.a

%.o: src/%.cpp
	$(CXX) -c $(CXXFLAGS) $<

svm.o: $(LIBSVM)/svm.cpp
	$(CXX) -c $(CXXFLAGS) $<

clean:
	rm -f *.o ss2
