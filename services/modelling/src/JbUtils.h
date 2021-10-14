#ifndef __JBUTILS_H_INCLUDED__
#define __JBUTILS_H_INCLUDED__

//-----------------------------------------------------------------------------
// Miscellaneous utility functions
//-----------------------------------------------------------------------------

void MyExcNotify(const char *p1, const char *p2 = nullptr, const char *p3 = nullptr, const char *p4 = nullptr);
void MyExcHandler(const char *pHead, const PExcept& Except);

inline FILE *fopen(const TStr& fileName, const char* mode) { FILE *f = fopen(fileName.CStr(), mode); IAssertR(f, fileName); return f; }

TStr AugmentFileName(const TStr& fileName, const TStr& suffix);
TStr ChangeFileExt(const TStr& fileName, const TStr& newExtIncludingDot);
TStr ExtractFileName(const TStr& fileName);
TStr PathJoin(const TStr& path, const TStr& morePath);

inline TStr GetUtcTimeStamp(const TTm& t) { char buf[100]; sprintf(buf, "%04d-%02d-%02dT%02d:%02d:%02dZ", t.GetYear(), t.GetMonth(), t.GetDay(), t.GetHour(), t.GetMin(), t.GetSec()); return buf; }

template<typename T> T LoadFromSIn(TSIn& SIn) { T t; SIn.Load(t); return t; }
//template<typename T> T LoadFromSIn(TSIn& SIn) { T t; SIn.Load(t); return t; }
template<typename T> T LoadFromSIn(TSIn& SIn, T& t) { SIn.Load(t); return t; }

inline bool IsValidId(int x) { return x >= 0; }
inline bool IsValidId(int64 x) { return x >= 0; }
inline bool IsValidId(const TInt x) { return x.Val >= 0; }
inline bool IsValidId(const TUInt64 x) { return ((long long) x.Val) >= 0; }

template<class T> long long GetPoolLen(const T &strHash) { auto pool = strHash.GetPool(); if (pool.Empty()) return -1; else return pool->Len(); }
template<class T> long long GetPoolSize(const T &strHash) { auto pool = strHash.GetPool(); if (pool.Empty()) return -1; else return pool->Size(); }

template<typename T> T LoadA_Helper(TSIn& SIn) { T t; SIn.Load(t); return t; }
#define LoadA(SIn, x) x(LoadA_Helper<decltype(x)>((SIn)))

inline void LoadStrPool(TSIn& SIn, TStrPool& StrPool) { StrPool.~TStrPool(); new (&StrPool) TStrPool(SIn); }

// Force the TStrHash to compute hash codes directly from char * rather than wrapping
// each char * into a temporary TStr copy every time.
using TStrHashFunc = TStrHashF_DJB;

// The unix version of TDir::Exists just calls TFile::Exists -- which tests not only whether
// the file exists but also whether it can be opened; but which does *not* check if the 
// file is in fact a directory...
#ifdef GLib_WIN

inline bool TDir_Exists(const TStr& FPathFNm) { return TDir::Exists(FPathFNm); }

#elif defined(GLib_UNIX)

inline bool TDir_Exists(const TStr& FPathFNm) 
{ 
	struct stat st;
	// Check if it exists.  stat returns 0 on success, -1 on failure.
	if (stat(FPathFNm.CStr(), &st) != 0) return false; 
	// Check if it's a directory.
	return S_ISDIR(st.st_mode);
}

#endif

// Adds, to 'dest', the names of the files (and optionally also subdirectories)
// in the directory 'dirName'.  The returned names do not include the path (i.e. dirName).
// 'dirName' may contain a trailing '/' (on unix) or '\\' (on windows), but doesn't have to.
bool ListDir(const TStr& dirName, TStrV& dest, bool includeSubDirNames, bool clrDest = true);

//-----------------------------------------------------------------------------
// String slicing
//-----------------------------------------------------------------------------
// TStr::GetSubStr(b, e) returns the substring b..e and throws an error if e <= b.  
// The following is a more useful alternative: Slice(b, e) returns b..(e-1);
// it returns an empty string if e <= b.  It also  supports python-style 
// negative indices (-x is equivalent to str.Len() - x).

inline TStr Slice(const TStr& s, int from, int to)
{
	int n = s.Len();
	if (from < 0) from += n;
	if (to < 0) to += n;
	if (to < from) to = from;
	if (from < 0 || from >= n || to <= from) return TStr{};
	return s.GetSubStr(from, to - 1);
}

inline TStr Slice(const TStr& s, int from) { return Slice(s, from, s.Len()); }

//-----------------------------------------------------------------------------
// Forward helper
//-----------------------------------------------------------------------------

// Note: MSVC seems to have a bug involving the forwarding of a const char[] as a const char *; see
//     http://stackoverflow.com/questions/33763873/visual-c-forward-an-array-as-a-pointer
// and https://connect.microsoft.com/VisualStudio/feedback/details/1037806/implicit-conversion-doesnt-perform-for-fund
// The following is a workaround -- we use myforward instead of std::forward.
// I'm not really sure why this works better, but it does :P

template<typename T>
struct Forwarder
{
	// This works exactly like std::forward from <type_traits>.

	inline static T&& fwd(typename std::remove_reference<T>::type& t)
	{
		return static_cast<T&&>(t);
	}
	inline static T&& fwd(typename std::remove_reference<T>::type&& t)
	{
		static_assert(!std::is_lvalue_reference<T>::value, "bad forward call");
		return static_cast<T&&>(t);
	}
};

#define myforward(x) (Forwarder<decltype(x)>::fwd(x))

//-----------------------------------------------------------------------------
//
// Ranged for loop support for glib vectors
//
//-----------------------------------------------------------------------------

template<typename T, typename I> T* begin(TVec<T, I>& v) { return v.Empty() ? nullptr : &v[0]; }
template<typename T, typename I> T* end(TVec<T, I>& v) { return v.Empty() ? nullptr : &v[0] + v.Len(); }
template<typename T, typename I> const T* begin(const TVec<T, I>& v) { return v.Empty() ? nullptr : &v[0]; }
template<typename T, typename I> const T* end(const TVec<T, I>& v) { return v.Empty() ? nullptr : &v[0] + v.Len(); }

//-----------------------------------------------------------------------------
//
// Template argument extractors 
//
//-----------------------------------------------------------------------------
// If T = U<V_0, V_1, ...>, the type GetTemplArg<i, T> will be equal to V_i.
// GetTemplArgC<i, U', T> works the same, except that the program will fail to
// compile if U != U'.
// 
// Concrete instantiations for some popular glib templates are also provided,
// e.g. THash_DatT extract the second argument of an instantiation of THash.
// Thus, THash_DatT<TIntStrH> is TStr.

template<template<typename...> class T, typename... Args> struct THelper_UnpackTemplateType
{
	using TTuple = std::tuple<Args...>;
	using TTemplate = T<Args...>;
};

template<template<typename...> class T, typename... Args> THelper_UnpackTemplateType<T, Args...> HelperFunc_UnpackTemplateType(const T<Args...>&);

template<size_t idx, typename T> struct GetTemplArgS
{
	static const T& TReturner();
	using THelper = decltype(HelperFunc_UnpackTemplateType(TReturner()));
	using TTuple = typename THelper::TTuple;
	using type = typename std::tuple_element<idx, TTuple>::type;
};

// If T = U<V_0, V_1, ...>, the type GetTemplArg<i, T> will be equal to V_i.
template<size_t idx, typename T>
using GetTemplArg = typename GetTemplArgS<idx, T>::type;

// TIsTemplate<U, T>::value is 'true' iff T is of the form U<...>, otherwise 'false'.
template<template<typename...> class TTemplate, typename T> struct TIsTemplate { enum { value = false }; };
template<template<typename...> class TTemplate, typename... Args> struct TIsTemplate<TTemplate, TTemplate<Args...>> { enum { value = true }; };

template<bool ok, size_t idx, typename T> struct THelper_GetTemplArgChecked { };
template<size_t idx, typename T> struct THelper_GetTemplArgChecked<true, idx, T>
{
	using type = typename GetTemplArgS<idx, T>::type;
};

// Checked version of GetTemplArg: it also checks that T is an instantiation of a
// given template U; if it isn't, the program won't compile.
// - If T = U<V_0, V_1, ...>, the type GetTemplArgByIdxSpec<i, T, U> will be equal to V_i.
// - If T is based on some other template than U, it won't compile.
template<size_t idx, template<typename...> class U, typename T>
using GetTemplArgC = typename THelper_GetTemplArgChecked<TIsTemplate<U, T>::value, idx, T>::type; 

// This should work, but causes the VC 2013 compiler to crash.
//template<typename T> using TVec_DatT = GetTemplArgC<0, TVec, T>;
//template<typename T> using TVec_IdxT = GetTemplArgC<1, TVec, T>;
// The following versions are equivalent and compile fine.
template<typename T> using TVec_DatT = typename THelper_GetTemplArgChecked<TIsTemplate<TVec, T>::value, 0, T>::type; 
template<typename T> using TVec_IdxT = typename THelper_GetTemplArgChecked<TIsTemplate<TVec, T>::value, 1, T>::type; 
template<typename T> using THash_KeyT = typename THelper_GetTemplArgChecked<TIsTemplate<THash, T>::value, 0, T>::type; 
template<typename T> using THash_DatT = typename THelper_GetTemplArgChecked<TIsTemplate<THash, T>::value, 1, T>::type; 
template<typename T> using THash_FuncT = typename THelper_GetTemplArgChecked<TIsTemplate<THash, T>::value, 2, T>::type; 
template<typename T> using TKd_KeyT = typename THelper_GetTemplArgChecked<TIsTemplate<TKeyDat, T>::value, 0, T>::type; 
template<typename T> using TKd_DatT = typename THelper_GetTemplArgChecked<TIsTemplate<TKeyDat, T>::value, 1, T>::type; 
template<typename T> using TPr_Val1T = typename THelper_GetTemplArgChecked<TIsTemplate<TPair, T>::value, 0, T>::type; 
template<typename T> using TPr_Val2T = typename THelper_GetTemplArgChecked<TIsTemplate<TPair, T>::value, 1, T>::type; 
template<typename T> using TPt_RecT = typename THelper_GetTemplArgChecked<TIsTemplate<TPt, T>::value, 0, T>::type; 

//-----------------------------------------------------------------------------
//
// Ranged for loop support for glib hash tables
//
//-----------------------------------------------------------------------------
//
// THash doesn't support the begin/end methods for ranged-for statements,
// and that might be for the best, due to the ambiguity -- do you want
// to iterate over the keys, the dats, or keydat pairs?  So we have
// the following helper classes instead.  All iterators return references
// (all key references are const; dat references are only const if you started
// with a const hash table); the KeyDat iterator returns pairs of references.
// Thus, you can modify the dat's of the original hash table through these
// references.
//
// Usage:
//    TStrFltH myHash;
//    const TStrFltH myConstHash;
//    for (const TStr& key : KeyIt(myHash)) { ... }
//    for (const TStr& key : KeyIt(myConstHash)) { ... }
//    for (TFlt& dat : DatIt(myHash)) { ... } // you can modify the hash table by modifying the 'dat' inside the loop
//    for (const TFlt& dat : DatIt(myConstHash)) { ... }
//    for (TKeyDat<const TStr&, TFlt&> kd : KdIt(myHash)) { ... } // you can modify the hash table by modifying the 'kd.Dat' inside the loop
//    for (TKeyDat<const TStr&, const TFlt&> kd : KdIt(myConstHash)) { ... }

template<typename T, bool b> struct set_const
{
	using type = typename std::remove_const<T>::type;
};

template<typename T> struct set_const<T, true>
{
	using type = const typename std::remove_const<T>::type;
};

template<typename TKey_, typename TDat_, typename THashFunc_, typename TDeref_, bool constHash_>
class THashIterator
{
public:
	typedef TKey_ TKey;
	typedef TDat_ TDat;
	typedef THashFunc_ THashFunc;
	typedef THash<TKey, TDat, THashFunc> THashTable;
	enum { constHash = constHash_ };
	typedef typename set_const<THashTable, constHash>::type THashTableC;
	typedef TDeref_ TDeref;
	typedef int TKeyId;

protected:
	THashTableC *h;
	TKeyId keyId;
public:
	THashIterator(THashTableC *h_, TKeyId keyId_) : h(h_), keyId(keyId_) { }
	bool operator != (const THashIterator &other) const { return other.h != h || other.keyId != keyId; }
	THashIterator& operator ++() {
		if (h) { if (! h->FNextKeyId(keyId)) { h = nullptr; keyId = -1; } }
		return *this; }
	typename TDeref::TResult operator *() const { Assert(h); return TDeref::Deref(h, keyId); }
};

template<typename TResult_, typename THash_>
struct TKeyDeref
{
	typedef TResult_& TResult;
	inline static TResult Deref(THash_ *h, int keyId) { return h->GetKey(keyId); }
};

template<typename TResult_, typename THash_>
struct TDatDeref
{
	typedef TResult_& TResult;
	inline static TResult Deref(THash_ *h, int keyId) { return (*h)[keyId]; }
};

template<typename TResult_, typename THash_>
struct TKeyDatDeref
{
	typedef TResult_ TResult;
	inline static TResult Deref(THash_ *h, int keyId) { return {h->GetKey(keyId), (*h)[keyId]}; }
};

template<typename TKey_, typename TDat_, typename THashFunc_, typename TDeref_, bool constHash_>
class THashIterationWrapper
{
public:
	typedef TKey_ TKey;
	typedef TDat_ TDat;
	typedef THashFunc_ THashFunc;
	typedef THash<TKey, TDat, THashFunc> THashTable;
	enum { constHash = constHash_ };
	typedef typename set_const<THashTable, constHash>::type THashTableC;
	typedef TDeref_ TDeref;
	typedef THashIterator<TKey, TDat, THashFunc, TDeref, constHash> THashIt;
	typedef typename THashIt::TKeyId TKeyId;
protected:
	THashTableC *h;
public:
	THashIterationWrapper(THashTableC *h_) : h(h_) { }
	THashIt end() const { return THashIt(nullptr, -1); }
	THashIt begin() const { auto keyId = h->FFirstKeyId(); if (h->FNextKeyId(keyId)) return THashIt(h, keyId); else return end(); }
};

template<typename TKey, typename TDat, typename THashFunc>
THashIterationWrapper<TKey, TDat, THashFunc, TKeyDeref<const TKey&, const THash<TKey, TDat, THashFunc>>, true>
KeyIt(const THash<TKey, TDat, THashFunc>& h) { return &h; }

template<typename TKey, typename TDat, typename THashFunc>
THashIterationWrapper<TKey, TDat, THashFunc, TDatDeref<const TDat&, const THash<TKey, TDat, THashFunc>>, true>
DatIt(const THash<TKey, TDat, THashFunc>& h) { return &h; }

template<typename TKey, typename TDat, typename THashFunc>
THashIterationWrapper<TKey, TDat, THashFunc, TDatDeref<TDat&, THash<TKey, TDat, THashFunc>>, false>
DatIt(THash<TKey, TDat, THashFunc>& h) { return &h; }

template<typename TKey, typename TDat, typename THashFunc>
THashIterationWrapper<TKey, TDat, THashFunc, TKeyDatDeref<TKeyDat<const TKey&, const TDat&>, const THash<TKey, TDat, THashFunc>>, true>
KdIt(const THash<TKey, TDat, THashFunc>& h) { return &h; }

template<typename TKey, typename TDat, typename THashFunc>
THashIterationWrapper<TKey, TDat, THashFunc, TKeyDatDeref<TKeyDat<const TKey&, TDat&>, THash<TKey, TDat, THashFunc>>, false>
KdIt(THash<TKey, TDat, THashFunc>& h) { return &h; }

//-----------------------------------------------------------------------------
// Typecasts for glib smart pointers
//-----------------------------------------------------------------------------
// Ideally, this sort of things would be added to TPt<TDest_> itself.
// Similar things exists in the standard library for smart pointers from 
// there: see e.g. static_pointer_cast.

template<typename TDest, typename TSrc>
inline TPt<TDest> static_TPt_cast(const TPt<TSrc>& src) { TSrc *pSrc = src(); return TPt<TDest>(pSrc ? static_cast<TDest *>(pSrc) : nullptr); }

template<typename TDest, typename TSrc>
inline TPt<TDest> dynamic_TPt_cast(const TPt<TSrc>& src) { TSrc *pSrc = src(); return TPt<TDest>(pSrc ? dynamic_cast<TDest *>(pSrc) : nullptr); }

//-----------------------------------------------------------------------------
// Poor man's Clr (for classes that don't have a Clr() method)
//-----------------------------------------------------------------------------

template<typename T> void PoorMansClr(T& t) { t.~T(); new (&t) T(); }

// We can also do a not-so-poor-man's Clr(): if T has a Clr method,
// we'll call it, otherwise we'll do a poor man's Clr.  But usually
// the caller knows whether T has Clr or not.

template<typename T>
struct TClrSniffer
{
	typedef char yes[1];
	typedef char no[2];
	template<typename U> static yes& Test(decltype(&(((U *) nullptr)->Clr())));
	template<typename U> static no& Test(...);
	static const bool value = sizeof(Test<T>(nullptr)) == sizeof(yes);
};

template<typename T, bool hasClr> struct TClrCaller { static inline void Clr(T& t) { t.~T(); new (&t) T(); } };
template<typename T> struct TClrCaller<T, true> { static inline void Clr(T& t) { t.Clr(); } };

template<typename T> inline void NotSoPoorMansClr(T& t) { TClrCaller<T, TClrSniffer<T>::value>::Clr(t); }

// ClrAll(foo, bar, baz) calls NotSoPoorMansClr for each of its arguments.

inline void ClrAll() { }

template<typename Head, typename... Tail>
inline void ClrAll(Head& head, Tail&... tail)
{
	NotSoPoorMansClr(head); ClrAll(tail...);
}

//-----------------------------------------------------------------------------
// Convenience methods for saving/loading multiple objects
//-----------------------------------------------------------------------------
// Usage:  SaveAll(mySOut, foo, bar, baz);
// SaveAll will call foo.Save(mySOut) or mySOut.Save(foo) (whichever is available),
// and likewise for bar, baz, etc.
// LoadAll works analogously.

struct TChecksumHelper
{
	inline void Save(TSOut& SOut) const { SOut.SaveCs(); }
	inline void Load(TSIn& SIn) { SIn.LoadCs(); }
};

inline TChecksumHelper& CheckSum() { static TChecksumHelper instance; return instance; };

template<typename T>
struct TSaveSniffer
{
	typedef char yes[1];
	typedef char no[2];
	static TSOut& SOut();
	static TSIn& SIn();
	template<typename U> static U& Ref();
	template<typename U> static yes& TestSaveInClass(decltype(Ref<U>().Save(SOut()), nullptr));
	template<typename U> static no& TestSaveInClass(...);
	static const bool hasSaveInClass = (sizeof(TestSaveInClass<T>(nullptr)) == sizeof(yes));
	template<typename U> static yes& TestSaveInStream(decltype(SOut().Save(Ref<U>()), nullptr));
	template<typename U> static no& TestSaveInStream(...);
	static const bool hasSaveInStream = (sizeof(TestSaveInStream<T>(nullptr)) == sizeof(yes));
	template<typename U> static yes& TestLoadInClass(decltype(Ref<U>().Load(SIn()), nullptr));
	template<typename U> static no& TestLoadInClass(...);
	static const bool hasLoadInClass = (sizeof(TestLoadInClass<T>(nullptr)) == sizeof(yes));
	// Note: hasLoadInClass can't tell if the Load method it has found is static or not.
	// We don't want to use a static method because even if we call it on an existing instance
	// of the class, it will just ignore it and (typically) return a smart pointer to a
	// newly allocated instance (see e.g. TVecPool::Load).  Thus we have to check if a static Load
	// is available; if yes, we won't use the U::Load method.
	template<typename U> static yes& TestStaticLoadInClass(decltype(U::Load(SIn()), nullptr));
	template<typename U> static no& TestStaticLoadInClass(...);
	static const bool hasStaticLoadInClass = (sizeof(TestStaticLoadInClass<T>(nullptr)) == sizeof(yes));
	template<typename U> static yes& TestLoadCtor(decltype(U { SIn() }, nullptr));
	template<typename U> static no& TestLoadCtor(...);
	static const bool hasLoadCtor = (sizeof(TestLoadCtor<T>(nullptr)) == sizeof(yes));
	template<typename U> static yes& TestLoadInStream(decltype(SIn().Load(Ref<U>()), nullptr));
	template<typename U> static no& TestLoadInStream(...);
	static const bool hasLoadInStream = (sizeof(TestLoadInStream<T>(nullptr)) == sizeof(yes));
};

template<typename T, int how> struct TSaveCaller { };
template<typename T> struct TSaveCaller<T, 1> { static inline void Save(TSOut& SOut, const T& t) { t.Save(SOut); } };
template<typename T> struct TSaveCaller<T, 2> { static inline void Save(TSOut& SOut, const T& t) { SOut.Save(t); } };

inline void SaveAll(TSOut& SOut) { }

template<typename Head, typename... Tail>
inline void SaveAll(TSOut& SOut, const Head& head, const Tail&... tail)
{
	using S = TSaveSniffer<Head>;
	TSaveCaller<Head, S::hasSaveInClass ? 1 : S::hasSaveInStream ? 2 : 0>::Save(SOut, head);
	SaveAll(SOut, tail...);
}

template<typename T, int how> struct TLoadCaller { };
template<typename T> struct TLoadCaller<T, 1> { static inline void Load(TSIn& SIn, T& t) { t.Load(SIn); } };
template<typename T> struct TLoadCaller<T, 2> { static inline void Load(TSIn& SIn, T& t) { SIn.Load(t); } };
template<typename T> struct TLoadCaller<T, 3> { static inline void Load(TSIn& SIn, T& t) { t.~T(); new (&t) T(SIn); } };

inline void LoadAll(TSIn& SIn) { }

template<typename Head, typename... Tail>
inline void LoadAll(TSIn& SIn, Head& head, Tail&... tail)
{
	using S = TSaveSniffer<Head>;
	TLoadCaller<Head, (S::hasLoadInClass && ! S::hasStaticLoadInClass) ? 1 : S::hasLoadInStream ? 2 : S::hasLoadCtor ? 3 : 0>::Load(SIn, head);
	LoadAll(SIn, tail...);
}

// ----------------------------------------------------------------------------
//
// Time-related utilities
//
// ----------------------------------------------------------------------------

// The motivation for this section is the fact that TFile::GetLastWriteTm and
// similar functions are currently a mess.  On Windows, they return milliseconds
// since 1 Jan 1601; on Unix, they return seconds since 1 Jan 1970.

// In older versions of unix, the 'stat' structure had members 
// 'st_[cma]time' of type time_t.  Later they were replaced by members 'st_[cma]tim'
// of type 'timespec', which then contains two members, a time_t (seconds) and a long (nanoseconds).
// The following tester class tests whether st_mtim is present (and thus we can
// assume that nanoseconds will be available).
template <typename TStat_> struct TStatDetailsTester
{
protected:
	typedef char yes[1], no[2];
	template<typename T> static yes& HasDetailsFunc(decltype(((T *) nullptr)->st_mtim) *);
	template<typename T> static no& HasDetailsFunc(...);
public:
	typedef TStat_ TStat;
	enum { HasDetails = (sizeof(decltype(HasDetailsFunc<TStat>(nullptr))) == sizeof(yes)) };
};

// TStatTimeGetter contains three functions, Get[ACM]Time, that return the
// corresponding times from the given 'stat' instance.  If 'stat' does not
// contain nanoseconds, 'ns' will be set to 0.

template <typename TStat_, bool hasDetails> struct TStatTimeGetter_
{
	typedef TStat_ TStat;
	static void GetATime(const TStat &s, time_t &sec, int &ns) { sec = s.st_atime; ns = 0; }
	static void GetCTime(const TStat &s, time_t &sec, int &ns) { sec = s.st_ctime; ns = 0; }
	static void GetMTime(const TStat &s, time_t &sec, int &ns) { sec = s.st_mtime; ns = 0; }
};

template <typename TStat_> struct TStatTimeGetter_<TStat_, true>
{
	typedef TStat_ TStat;
	static void GetATime(const TStat &s, time_t &sec, int &ns) { sec = s.st_atim.tv_sec; ns = (int) s.st_atim.tv_nsec; }
	static void GetCTime(const TStat &s, time_t &sec, int &ns) { sec = s.st_ctim.tv_sec; ns = (int) s.st_ctim.tv_nsec; }
	static void GetMTime(const TStat &s, time_t &sec, int &ns) { sec = s.st_mtim.tv_sec; ns = (int) s.st_mtim.tv_nsec; }
};

typedef TStatTimeGetter_<struct stat, TStatDetailsTester<struct stat>::HasDetails> TStatTimeGetter;

// gmtime is a function that converts a time_t (counter of seconds since 1 Jan 1970 UTC)
// into a 'tm' structure.  However, on Unix it is not guaranteed to be thread-safe; instead
// a thread-safe function named gmtime_r is likely to be available.  But this function
// is not available on Windows, where we can use gmtime_s instead (the latter is
// also included in the C11 standard).  The following class tests whether gmtime_r and/or gmtime_s are available.
struct TGmTimeTester
{
protected:
	typedef char yes[1], no[2];
	template<typename TSrc, typename TDest> static yes& HasGmTimeRFunc(decltype(gmtime_r((const TSrc *) nullptr, (TDest *) nullptr), (void *) nullptr)); // Should be available on Unix.
	template<typename TSrc, typename TDest> static no& HasGmTimeRFunc(...);
	template<typename TSrc, typename TDest> static yes& HasGmTimeSFunc(decltype(gmtime_s((TDest *) nullptr, (const TSrc *) nullptr), (void *) nullptr)); // Should be available on Windows and is also part of the C11 standard.
	template<typename TSrc, typename TDest> static no& HasGmTimeSFunc(...);
public:
	enum { HasGmTimeR = (sizeof(HasGmTimeRFunc<time_t, struct tm>(nullptr)) == sizeof(yes)),
		HasGmTimeS = (sizeof(HasGmTimeSFunc<time_t, struct tm>(nullptr)) == sizeof(yes)) };
};

// TGmTimeCaller contains a function named GmTime(dest, src) that calls either gmtime_r, gmtime_s, 
// or gmtime if neither of the first two are available.
template <typename TSrc, typename TDest, int i> struct TGmTimeCaller_ { // Note: not guaranteed to be thread-safe.
	static bool GmTime(TDest& dest, const TSrc src) { struct tm *temp = gmtime(&src); if (temp) dest = *temp; return temp != nullptr; } };
template <typename TSrc, typename TDest> struct TGmTimeCaller_<TSrc, TDest, 1> {
	static bool GmTime(TDest& dest, const TSrc src) { /*printf("Using gmtime_s!\n");*/ return 0 == gmtime_s(&dest, &src); }};
template <typename TSrc, typename TDest> struct TGmTimeCaller_<TSrc, TDest, 2> {
	static bool GmTime(TDest& dest, const TSrc src) { /*printf("Using gmtime_r!\n");*/ return nullptr != gmtime_r(&src, &dest); } };
typedef TGmTimeCaller_<time_t, struct tm, TGmTimeTester::HasGmTimeR ? 2 : TGmTimeTester::HasGmTimeS ? 1 : 0> TGmTimeCaller;

// Converts the given (time_t, nanoseconds) pair into a glib TTm structure.
// Since this structure supports only milliseconds, some information from 'ns' is lost in the process.
inline TTm TimeTToTTm(const time_t &sec, const int ns)
{
	// First convert 'sec' from 'time_t' to a 'struct tm'.
	struct tm t; TGmTimeCaller::GmTime(t, sec);
	// 'struct tm' uses zero-based month and weekday numbers, and its year is relative to 1900.
	// 'TTm' uses 1-based month and weekday numbers, and its year is relative to 0.
	return TTm(t.tm_year + 1900, t.tm_mon + 1, t.tm_mday, t.tm_wday + 1, t.tm_hour, t.tm_min, t.tm_sec, ns / 1000000);
}

// GetFileTimes(const char *, TTm *, TTm *, TTm *) returns the creation, access and last modification time 
// (as TTm) for the given file name.  If you don't need all of them, just set the corresponding pointers to 0.
// On Windows, it uses the 'GetFileTime' API function instead of 'stat' because the latter, even if it is
// available, is likely to contain only seconds, whereas GetFileTime returns FILETIME timestamps whose
// resolution is 100 ns.
bool GetFileTimes(const char *pFileName, TTm *createTime, TTm *accessTime, TTm *modifyTime);

// A few wrappers around GetFileTimes for convenience.
inline bool GetFileTimes(const TStr &fileName, TTm *createTime, TTm *accessTime, TTm *modifyTime) { return GetFileTimes(fileName.CStr(), createTime, accessTime, modifyTime); }
inline bool GetLastWriteTime(const char *fileName, TTm& dest) { return GetFileTimes(fileName, nullptr, nullptr, &dest); }
inline bool GetLastWriteTime(const TStr& fileName, TTm& dest) { return GetFileTimes(fileName.CStr(), nullptr, nullptr, &dest); }
inline TTm GetLastWriteTime(const char *fileName) { TTm tm; GetLastWriteTime(fileName, tm); return tm; }
inline TTm GetLastWriteTime(const TStr &fileName) { TTm tm; GetLastWriteTime(fileName.CStr(), tm); return tm; }
inline bool GetLastAccessTime(const char *fileName, TTm& dest) { return GetFileTimes(fileName, nullptr, &dest, nullptr); }
inline bool GetLastAccessTime(const TStr& fileName, TTm& dest) { return GetFileTimes(fileName.CStr(), nullptr, &dest, nullptr); }
inline TTm GetLastAccessTime(const char *fileName) { TTm tm; GetLastAccessTime(fileName, tm); return tm; }
inline TTm GetLastAccessTime(const TStr &fileName) { TTm tm; GetLastAccessTime(fileName.CStr(), tm); return tm; }
inline bool GetCreateTime(const char *fileName, TTm& dest) { return GetFileTimes(fileName, &dest, nullptr, nullptr); }
inline bool GetCreateTime(const TStr& fileName, TTm& dest) { return GetFileTimes(fileName.CStr(), &dest, nullptr, nullptr); }
inline TTm GetCreateTime(const char *fileName) { TTm tm; GetCreateTime(fileName, tm); return tm; }
inline TTm GetCreateTime(const TStr &fileName) { TTm tm; GetCreateTime(fileName.CStr(), tm); return tm; }


//-----------------------------------------------------------------------------
//
// String joining
//
//-----------------------------------------------------------------------------

template<typename TDest, typename TMid, typename TSeq>
void StrJoin(TDest& dest, const TMid &mid, const TSeq& seq)
{
	bool first = true; for (const auto &item : seq) { 
		if (first) first = false; else dest += mid;
		dest += item; }
}

template<typename TMid, typename TSeq>
TStr StrJoin(const TMid &mid, const TSeq& seq)
{
	TChA buf;
	bool first = true; for (const auto &item : seq) { 
		if (first) first = false; else buf += mid;
		buf += item; }
	return TStr(buf);
}

//-----------------------------------------------------------------------------
// Logging
//-----------------------------------------------------------------------------

class TNotifyVWrapper : public TNotify
{
private:
	const TVec<PNotify>& v;
public:
	TNotifyVWrapper(const TVec<PNotify> &V) : v(V) { }
	static PNotify New(const TVec<PNotify> &V) { return PNotify(new TNotifyVWrapper(V)); }
	void OnNotify(const TNotifyType& Type, const TStr& MsgStr) { for (int i = 0; i < v.Len(); i++) if (! v[i].Empty()) v[i]->OnNotify(Type, MsgStr); }
	void OnStatus(const TStr& MsgStr) { for (int i = 0; i < v.Len(); i++) if (! v[i].Empty()) v[i]->OnStatus(MsgStr); }
	void OnLn(const TStr& MsgStr) { for (int i = 0; i < v.Len(); i++) if (! v[i].Empty()) v[i]->OnLn(MsgStr); }
	void OnTxt(const TStr& MsgStr) { for (int i = 0; i < v.Len(); i++) if (! v[i].Empty()) v[i]->OnTxt(MsgStr); }
};

void NotifyVAdd(const PNotify& Notify);
TVec<PNotify>& NotifyVGet();
void NotifyV(const TNotifyType& Type, const char *FmtStr, va_list argptr);
void NotifyRaw(const TNotifyType& Type, const TStr& msg);

void Notify(const TNotifyType& Type, const char *FmtStr, ...);
void NotifyInfo(const char *FmtStr, ...);
void NotifyErr(const char *FmtStr, ...);
void NotifyWarn(const char *FmtStr, ...);


#endif // __JBUTILS_H_INCLUDED__