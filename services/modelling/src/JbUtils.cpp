#include "pch.h"
#include "JbUtils.h"
using namespace std;

//-----------------------------------------------------------------------------
// Logging
//-----------------------------------------------------------------------------

TVec<PNotify> notifyVec;

void NotifyVAdd(const PNotify& Notify) { notifyVec.Add(Notify); }
TVec<PNotify>& NotifyVGet() { return notifyVec;}

void NotifyRaw(const TNotifyType& Type, const TStr& msg)
{
	TTm tm = TTm::GetCurLocTm();
	char cuf[50]; sprintf(cuf, "[%04d-%02d-%02d %02d:%02d:%02d] ",
		tm.GetYear(), tm.GetMonth(), tm.GetDay(), tm.GetHour(), tm.GetMin(), tm.GetSec());
	//
	TStr msg_ = TStr(cuf) + msg;
	for (int i = 0; i < notifyVec.Len(); i++)
		if (! notifyVec[i].Empty())
			notifyVec[i]->OnNotify(Type, msg_); 
}

void NotifyV(const TNotifyType& Type, const char *FmtStr, va_list argptr) 
{
	char buf[10*1024];
	const int RetVal = vsnprintf(buf, sizeof(buf)-2, FmtStr, argptr);
	int i = 0; while (buf[i] != 0) i++; if (i > 0 && buf[i - 1] == '\n') buf[i - 1] = 0;
	if (RetVal < 0) return;
	//
	TTm tm = TTm::GetCurLocTm();
	char cuf[50]; sprintf(cuf, "[%04d-%02d-%02d %02d:%02d:%02d] ",
		tm.GetYear(), tm.GetMonth(), tm.GetDay(), tm.GetHour(), tm.GetMin(), tm.GetSec());
	//
	TStr msg = TStr(cuf) + buf;
	for (int i = 0; i < notifyVec.Len(); i++)
		if (! notifyVec[i].Empty())
			notifyVec[i]->OnNotify(Type, msg); 
}

void Notify(const TNotifyType& Type, const char *FmtStr, ...) {
	va_list valist; va_start(valist, FmtStr);
	NotifyV(Type, FmtStr, valist); va_end(valist); }
void NotifyInfo(const char *FmtStr, ...) {
	va_list valist; va_start(valist, FmtStr);	
	NotifyV(ntInfo, FmtStr, valist); va_end(valist); }
void NotifyErr(const char *FmtStr, ...) {
	va_list valist; va_start(valist, FmtStr);
	NotifyV(ntErr, FmtStr, valist); va_end(valist); }
void NotifyWarn(const char *FmtStr, ...) {
	va_list valist; va_start(valist, FmtStr);
	NotifyV(ntWarn, FmtStr, valist); va_end(valist); }

class TFileNotify2 : public TNotify
{
private:
	TStr fileName;
	FILE *f; time_t tmLastOpen, tmLastFlush;
	std::mutex mx;
	bool isRolling; int curRollingNo;
	bool Open(); 
	void Flush();
	// Interesting: 
	//   "If you're using a single FILE object to perform output on an open file, then whole fprintf 
	//   calls on that FILE will be atomic, i.e. lock is held on the FILE for the duration of the fprintf call."
	//   http://stackoverflow.com/questions/11664434/how-fprintf-behavior-when-multi-threaded-and-multi-processed
	//   http://stackoverflow.com/a/11664743
	// I'm not sure how widely this applies, but the fact is that the heavily multi-threaded version of the
	// Wikifier on the posta server has been running without locking on TFileNotify for ages and never had any problems.
	// So there does seem to be some internal locking there at least.
	// - But if we use a rolling log, then locking with our mutex is definitely needed, otherwise one thread could close the file
	// and another thread could try writing into it afterwards.
	// - If we do use our mutex to synchronize access to the logs, then it's unnecessary for fprintf to do its own
	// locking in addition to that.  On some Unix systems there seems to be a fprintf_unlocked, but not on the posta server.  
	// On MSVC, fprintf always calls _lockfile to lock the stream; some file functions have a _nolock counterpart, 
	// but fprintf doesn't seem to be one of them.
	bool useLocking;

	class TMyLock {
	private:
		mutex& mx; bool really;
	public:
		TMyLock(mutex& mx_, bool really_) : mx(mx_), really(really_) { if (really) mx.lock(); }
		~TMyLock() { if (really) mx.unlock(); }
	};
	
public:
	// If the file name contains "%d", this will be replaced by the current date (yyyymmdd), and a new file
	// will be opened whenever a new day begins.
	TFileNotify2(const TStr& fileName_) : fileName(fileName_) { 
		f = 0; tmLastOpen = 0; tmLastFlush = 0; 
		isRolling = (fileName.IsStrIn("%d")); curRollingNo = -1; 
		useLocking = isRolling; }
	~TFileNotify2() { if (f) { fclose(f); f = 0; } }
	static PNotify New(const TStr& fileName_) { return PNotify(new TFileNotify2(fileName_)); }

	void OnNotify(const TNotifyType& Type, const TStr& MsgStr);
	void OnStatus(const TStr& MsgStr);
};

bool TFileNotify2::Open()
{
	if (isRolling)
	{
		TTm tm = TSysTm::GetCurUniTm();
		int newRollingNo = tm.GetYear() * 10000 + tm.GetMonth() * 100 + tm.GetDay();
		//newRollingNo = tm.GetHour() * 100 + tm.GetMin(); // for testing
		if (f && curRollingNo != newRollingNo) { fclose(f); f = nullptr; }
		curRollingNo = newRollingNo; 
	}
	if (f) return true;
	time_t now; time(&now);
	if (now < tmLastOpen + 10) return false;
	tmLastOpen = now; 
	if (!isRolling)
		f = fopen(fileName.CStr(), "act");
	else
	{
		char buf[10]; sprintf(buf, "%08d", curRollingNo);
		TStr s = fileName; s.ChangeStrAll("%d", buf);
		f = fopen(s.CStr(), "act");
	}
	return f != 0;
}

void TFileNotify2::Flush()
{
	if (! f) return;
	time_t now; time(&now);
	if (now < tmLastFlush + 10) return;
	tmLastFlush = now; 
	fflush(f);
}

// #define fprintf_unlocked_available

void TFileNotify2::OnNotify(const TNotifyType& Type, const TStr& MsgStr)
{
	TMyLock lock { mx, useLocking };
	if (! Open()) return;
	if (Type==ntInfo) 
	{
#ifdef fprintf_unlocked_available
		if (useLocking) fprintf_unlocked(f, "%s\n", MsgStr.CStr()); else
#endif
		fprintf(f, "%s\n", MsgStr.CStr());
	}
	else 
	{
		TStr TypeStr=TNotify::GetTypeStr(Type, false);
#ifdef fprintf_unlocked_available
		if (useLocking) fprintf_unlocked(f, "%s: %s\n", TypeStr.CStr(), MsgStr.CStr()); else
#endif
		fprintf(f, "%s: %s\n", TypeStr.CStr(), MsgStr.CStr()); 
	}
	Flush();
}

void TFileNotify2::OnStatus(const TStr& MsgStr)
{
	TMyLock lock { mx, useLocking };
	if (! Open()) return;
#ifdef fprintf_unlocked_available
	if (useLocking) fprintf_unlocked(f, "%s\n", MsgStr.CStr()); else
#endif
	fprintf(f, "%s\n", MsgStr.CStr());
	Flush();
}

void MyExcNotify(const char *p1, const char *p2, const char *p3, const char *p4)
{
	if (p1) { fwrite(p1, 1, strlen(p1), stderr); fflush(stderr); }
	if (p2) { fwrite(p2, 1, strlen(p2), stderr); fflush(stderr); }
	if (p3) { fwrite(p3, 1, strlen(p3), stderr); fflush(stderr); }
	if (p4) { fwrite(p4, 1, strlen(p4), stderr); fflush(stderr); }
	if (p1) SaveToErrLog(p1);
	if (p2) SaveToErrLog(p2);
	if (p3) SaveToErrLog(p3);
	if (p4) SaveToErrLog(p4);
	NotifyErr("%s%s%s%s", p1 ? p1 : "", p2 ? p2 : "", p3 ? p3 : "", p4 ? p4 : "");
}

void MyExcHandler(const char *pHead, const PExcept& Except)
{
	if (Except.Empty()) { MyExcNotify(pHead, "MyExcHandler: <empty_PExcept>\n"); return; }
	else
	{
		MyExcNotify(pHead, "MyExcHandler: PExcept>\n");
		MyExcNotify(pHead, "MyExcHandler: PExcept.MsgStr = \"", Except->GetMsgStr().CStr(), "\"\n");
		MyExcNotify(pHead, "MyExcHandler: PExcept.LocStr = \"", Except->GetLocStr().CStr(), "\"\n");
	}
}

//-----------------------------------------------------------------------------
// File names
//-----------------------------------------------------------------------------

TStr AugmentFileName(const TStr& fileName, const TStr& suffix)
{
	int i = fileName.Len(); if (i == 0) return suffix;
	while (i > 0 && fileName[i - 1] != '/' && fileName[i - 1] != '\\' && fileName[i - 1] != '.') i--;
	if (i > 0 && fileName[i - 1] == '.') i--;
	if (i <= 0) return suffix + fileName;
	return fileName.GetSubStr(0, i - 1) + suffix + fileName.GetSubStr(i);
}

TStr ChangeFileExt(const TStr& fileName, const TStr& newExtIncludingDot)
{
	int i = fileName.Len(); if (i == 0) return newExtIncludingDot;
	while (i > 0 && fileName[i - 1] != '/' && fileName[i - 1] != '\\' && fileName[i - 1] != '.') i--;
	if (i > 0 && fileName[i - 1] == '.') i--;
	if (i <= 0) return newExtIncludingDot;
	return fileName.GetSubStr(0, i - 1) + newExtIncludingDot;

}

TStr ExtractFileName(const TStr& fileName)
{
	int i = fileName.Len(); if (i == 0) return fileName;
	while (i > 0 && fileName[i - 1] != '/' && fileName[i - 1] != '\\' && fileName[i - 1] != ':') i--;
	return fileName.GetSubStr(i);
}

TStr PathJoin(const TStr& path, const TStr& morePath)
{
	if (path.Empty()) return morePath;
	char c = path[path.Len() - 1];
#ifdef GLib_WIN
	const char pathSep[] = "\\";
#else
	const char pathSep[] = "/";
#endif
	if (c == ':' || c == '\\' || c == '/') return path + morePath;
	else return path + pathSep + morePath;
}

bool ListDir(const TStr& dirName, TStrV& dest, bool includeSubDirNames, bool clrDest)
{
	if (clrDest) dest.Clr();
#ifdef GLib_WIN
	WIN32_FIND_DATA fd;
	HANDLE h = FindFirstFile(PathJoin(dirName, "*").CStr(), &fd);
	if (h == INVALID_HANDLE_VALUE) return false;
	do {
		if (((fd.dwFileAttributes & FILE_ATTRIBUTE_DIRECTORY) == FILE_ATTRIBUTE_DIRECTORY) && ! includeSubDirNames) continue;
		TStr fn = fd.cFileName; 
		if (fn == "." || fn == "..") continue;
		dest.Add(fn);
	} while (FindNextFile(h, &fd));
	FindClose(h);
	return true;
#elif defined(GLib_UNIX)
	DIR *d = opendir(dirName.CStr());
	if (! d) return false;
	enum { verbose = false };
	while (true)
	{
		struct dirent *de = readdir(d); if (! de) break;
		if (verbose) printf("fn = \"%s\", type = %d\n", de->d_name, (int) de->d_type);
		// My tests show that d_type is unreliable; "." and ".." had DT_DIR while an
		// actual subdirectory had d_type == 0.
		//if ((de->d_type == DT_DIR) && ! includeSubDirNames) continue;
		TStr fn = de->d_name; 
		if (fn == "." || fn == "..") continue;
		if (! includeSubDirNames) {
			TStr fullName = PathJoin(dirName, fn);
			if (verbose) printf("FullName = \"%s\"\n", fullName.CStr());
			struct stat st;
			// stat returns 0 on success, -1 on failure.
			if (stat(fullName.CStr(), &st) != 0) { if (verbose) printf("stat failed\n"); continue; }
			// Check if it's a directory.
			bool isDir = S_ISDIR(st.st_mode);
			if (verbose) printf("stat returns st_mode = %d, isDir = %s\n", int(st.st_mode), isDir ? "true" : "false");
			if (isDir) continue; }
			//if (TDir_Exists(fullName)) continue; }
		dest.Add(fn);
	}
	closedir(d);
	return true;
#else
#error Unsupported operating system.
#endif
}

// ----------------------------------------------------------------------------
// Time-related utilities - implementation
// ----------------------------------------------------------------------------

#ifdef GLib_WIN

TTm SystemTimeToTTm(const SYSTEMTIME &st) 
{ 
	// SYSTEMTIME has 0-based days of week (0 = Sunday), TTm expects 1-based (1 = Sunday)
	return TTm(st.wYear, st.wMonth, st.wDay, st.wDayOfWeek + 1, st.wHour, st.wMinute, st.wSecond, st.wMilliseconds);
}
TTm FileTimeToTTm(const FILETIME &ft) { SYSTEMTIME st; FileTimeToSystemTime(&ft, &st); return SystemTimeToTTm(st); }

bool GetFileTimes(const char *pFileName, TTm *createTime, TTm *accessTime, TTm *modifyTime)
{
	if (! pFileName) return false;
    // open 
    HANDLE hFile = CreateFile(
       pFileName,       // file to open
       GENERIC_READ,          // open for reading
       FILE_SHARE_READ | FILE_SHARE_WRITE,       // share for reading
       NULL,                  // default security
       OPEN_EXISTING,         // existing file only
       FILE_ATTRIBUTE_NORMAL, // normal file
       NULL);                 // no attr. template
    // check if we could open it
    if (hFile == INVALID_HANDLE_VALUE) return false; // TExcept::Throw("Can not open file " + fileName + "!"); 
    // read file times
    FILETIME ct, at, mt; BOOL ok = GetFileTime(hFile, &ct, &at, &mt);
    // close file
    CloseHandle(hFile);
	if (! ok) return false; // TExcept::Throw("Can not read time from file " + fileName + "!"); 
	// convert to TTm
	if (createTime) *createTime = FileTimeToTTm(ct);
	if (accessTime) *accessTime = FileTimeToTTm(at);
	if (modifyTime) *modifyTime = FileTimeToTTm(mt);
	return true;
}

#else

// Note: with some luck, 'stat' is available on Windows too, so this implementation should work
// on windows as well.  But there we're likely to have the old sort of stat where the times
// are just time_t (and thus in seconds), without nanoseconds.  In this case it's better to
// call GetFileTime, which returns a FILETIME with a 100-ns accuracy.
bool GetFileTimes(const char *pFileName, TTm *createTime, TTm *accessTime, TTm *modifyTime)
{
	struct stat st;
	if (! pFileName) return false;
	if (0 != stat(pFileName, &st)) return false;
	time_t sec; int ns;
	if (createTime) { TStatTimeGetter::GetCTime(st, sec, ns); *createTime = TimeTToTTm(sec, ns); }
	if (accessTime) { TStatTimeGetter::GetATime(st, sec, ns); *accessTime = TimeTToTTm(sec, ns); }
	if (modifyTime) { TStatTimeGetter::GetMTime(st, sec, ns); *modifyTime = TimeTToTTm(sec, ns); }
	return true;
}

#endif

int TestFileTime(int argc, char **argv)
{
	TStr fn = argv[1];
	auto u = TFile::GetLastWriteTm(fn.CStr());
	printf("Filename: %s -- GetLastWriteTm returns %lld\n", fn.CStr(), (long long) u);
	TTm tm; bool ok = GetLastWriteTime(fn, tm);
	printf("ok = %d, last write time = %04d-%02d-%02d %s (dow = %d %s), %02d:%02d:%02d.%03d\n",
		(int) ok, tm.GetYear(), tm.GetMonth(), tm.GetDay(), 
		tm.GetMonthNm().CStr(),
		tm.GetDayOfWeek(), tm.GetDayOfWeekNm().CStr(),
		tm.GetHour(), tm.GetMin(), tm.GetSec(), tm.GetMSec());
	return 0;
}

