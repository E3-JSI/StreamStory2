// Tips for Getting Started: 
//   1. Use the Solution Explorer window to add/manage files
//   2. Use the Team Explorer window to connect to source control
//   3. Use the Output window to see build output and other messages
//   4. Use the Error List window to view errors
//   5. Go to Project > Add New Item to create new code files, or Project > Add Existing Item to add existing code files to the project
//   6. In the future, to open this project again, go to File > Open > Project and select the .sln file

#ifndef PCH_H
#define PCH_H

// TODO: add headers that you want to pre-compile here
#pragma once

#ifdef _WIN32
//#include "targetver.h"
#endif

#define _CRT_SECURE_NO_WARNINGS

#include <stdio.h>
#ifdef _WIN32
#include <tchar.h>
#endif

#include <thread>
#include <mutex>
#include <functional>
#include <algorithm>
#include <atomic>
#include <condition_variable>
#include <chrono>
#include <algorithm>
#include <regex>
#include <iostream>
#include <iomanip>
#include <limits>

// using namespace std;

#define DISABLE_TSTR_WIN32_DEBUG_NEW  // otherwise dt.cpp tries to #define new to something else

#include <base.h>
#include <mine.h>
#include <net.h>

// #include <libpq-fe.h>
#include "Identifier.h"
#include "JbUtils.h"
#include "StreamStory2.h"

#endif //PCH_H
