CXX = g++

QMINER2=../qminer2/src   # get it from https://github.com/qminer/qminer/tree/master/src
GLIB=$(QMINER2)/glib
LIBUV=$(QMINER2)/third_party/libuv

# -I/usr/pgsql-9.5/include/
CXXFLAGS += -std=c++11 -fopenmp -I $(LIBUV)/include -I $(GLIB) -I $(GLIB)/mine -I $(GLIB)/base -I $(GLIB)/net -I $(GLIB)/misc   -march=native 

# -L/usr/pgsql-9.5/lib/   -lpqxx -lpq  
LDFLAGS += -L$(LIBUV) -lrt -luuid -fopenmp -Wl,--build-id

debug: CXXFLAGS += -g -ggdb
debug: StreamStory2Debug

release: CXXFLAGS += -O9 -g -ggdb -march=native
release: StreamStory2Release

OBJECTS = Ss2Main.o StreamStory2.o JbUtils.o

# Note: build glib from https://github.com/qminer/qminer/tree/master/src/glib
# and rename glib.a to glib-debug.a or glib-release.a.

StreamStory2Debug: $(OBJECTS) $(GLIB)/glib-debug.a
	$(CXX) -o ss2.exe $(OBJECTS) $(GLIB)/glib-debug.a $(LDFLAGS) $(LIBUV)/libuv.a

StreamStory2Release: $(OBJECTS) $(GLIB)/glib-release.a
	$(CXX) -o ss2.exe $(GLIB)/glib-release.a $(OBJECTS) $(GLIB)/glib-release.a $(LDFLAGS)  $(LIBUV)/libuv.a

%.o: %.cpp
	$(CXX) -c $(CXXFLAGS) $<

clean:
	rm -f *.o ss2.exe
	
