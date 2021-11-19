// StreamStory2.cpp : This file contains the 'main' function. Program execution begins and ends there.
//

#include "pch.h"
#include "StreamStory2.h"

//-----------------------------------------------------------------------------
//
// Idle event handler
//
//-----------------------------------------------------------------------------

// Cannibalized from net.cpp.
#ifdef GLib_WIN
	#include <uv.h>
#else
	typedef size_t ULONG;
	#include <uv.h>
#endif

class TUvAsyncDetails
{
public:
	bool initialized;
	uv_loop_t *loop;
	uv_async_t async;
	TUvAsyncDetails() : initialized(false), loop(0) { }
	void TriggerAsyncEvent() { uv_async_send(&async); }
	static void MyUvAsyncHandler(uv_async_t *handle, int status /* unused */);

	void SetNotificationHandler();
	void CleanUpNotificationHandler();
};

TUvAsyncDetails uvAsync;

void TUvAsyncDetails::MyUvAsyncHandler(uv_async_t *handle, int status /* unused */)
{
	/*
	//uvAsync.clusteringSet->UvAsyncEventHandler();
	static time_t lastTime = 0;
	static long long counter = 0;
	counter += 1;
	time_t t = time(nullptr);
	if (t != lastTime) { NotifyInfo("MyUvAsyncHandler called! (%u) %lld\n", (unsigned int) t, counter); lastTime = t; }
	//if (counter  % 1000 == 0) NotifyInfo("MyUvAsyncHandler called! (%d)\n", counter);
	*/
	static time_t lastTime = 0;
	time_t t = time(nullptr);
	if (t != lastTime) 
	{
		lastTime = t;
		/*
		TSchedulerThread *scheduler = uvAsync.scheduler;
		if (scheduler) scheduler->SendResponses();
		else 
		{
			// In the single-threaded version, we should occasionally save the incremental indexes.
			// (In the multi-threaded version, the scheduler handles that during its barrier processing.)
			TDocumentAnnotatorSet *das = uvAsync.annotatorSet;
			if (das) das->SaveIncIndexes(false);
		}
		*/
	}
	std::this_thread::sleep_for(std::chrono::milliseconds(1));
	uvAsync.TriggerAsyncEvent();
}

// We don't have access to TSockSys, as the class is declared in socksys.cpp, not in a header file.
// We likewise don't have access to the SockSys global variable.  We'll work around this by assuming
// that an instance of TSockSys starts with a member of type 'uv_loop_t *'.
class TSockSys;
extern TSockSys SockSys;

void TUvAsyncDetails::SetNotificationHandler(/*TDocumentAnnotatorSet *annotatorSet_, TSchedulerThread *scheduler_*/)
{
	TUvAsyncDetails &uvAsync = *this;
	IAssert(! uvAsync.initialized);
	uvAsync.initialized = true;
	uvAsync.loop = *(reinterpret_cast<uv_loop_t **>(&SockSys));
	//annotatorSet = annotatorSet_; scheduler = scheduler_;
	NotifyInfo("TUvAsyncDetails::SetNotificationHandler: SockSys is at %p, loop = %p\n", &SockSys, uvAsync.loop);
	uvAsync.async.data = 0;
	uv_async_init(uvAsync.loop, &uvAsync.async, &TUvAsyncDetails::MyUvAsyncHandler);
}

void TUvAsyncDetails::CleanUpNotificationHandler()
{
	TUvAsyncDetails &uvAsync = *this;
	uv_close((uv_handle_t *) &uvAsync.async, 0);
	//annotatorSet = nullptr; scheduler = nullptr;
}

//-----------------------------------------------------------------------------
//
// Web service classes
//
//-----------------------------------------------------------------------------

ClassTE(TExitSFun, TSAppSrvFun)//{
private:
public:
    TExitSFun(): TSAppSrvFun("exit", saotJSon){ }
    static PSAppSrvFun New() { return new TExitSFun(); }

	virtual TStr ExecJSon(const TStrKdV& FldNmValPrV, const PSAppSrvRqEnv& RqEnv) {
		// send message to server to quit
		TLoop::Stop();
		return "{}"; 
	}
}; 

class TJsonRequest
{
public:
	PJsonVal inJson, outJson;
	TStrV errList;
	TStr status;
	TJsonRequest() : inJson({}), outJson(TJsonVal::NewObj()), status("undefined") { }
	bool InitInJson(PSIn& SIn)
	{
		bool ok = false; TStr msgStr;
		inJson = TJsonVal::GetValFromSIn(SIn, ok, msgStr);
		if (! ok) { errList.Add(msgStr); inJson.Clr(); status = "error"; return false; }
		return true;
	}
	bool InitInJson(const PSAppSrvRqEnv& RqEnv) { PSIn SIn = RqEnv->GetHttpRq()->GetBodyAsSIn(); return InitInJson(SIn); }
	bool InitInJsonFromFile(const TStr& fn)
	{
		try { 
			PSIn SIn = new TFIn(fn);
			return InitInJson(SIn); }
		catch (PExcept& Except) {
			errList.Add(Except->GetMsgStr()); status = "error"; return false; }
	}
	TStr FinalizeResponse()
	{
		outJson->AddToObj("status", status);
		if (! errList.Empty()) outJson->AddToObj("errors", TJsonVal::NewArr(errList));
		return TJsonVal::GetStrFromVal(outJson);
	}
};

ClassTE(TBuildModelFun, TSAppSrvFun)//{
private:
public:
    TBuildModelFun(): TSAppSrvFun("buildModel", saotJSon){ }
    static PSAppSrvFun New() { return new TBuildModelFun(); }

protected:
public:

	// This function assumes that req.inJson has already been initialized.
	static bool ProcessRequest(TJsonRequest &req)
	{
		// Read the configuration object.
		PModelConfig config = new TModelConfig();
		if (! config->InitFromJson(req.inJson->GetObjKey("config"), req.errList)) { req.status = "error"; return false; }
		// Initialize the dataset.
		PDataset dataset = new TDataset();
		dataset->InitColsFromConfig(config);
		if (! dataset->ReadDataFromJsonDataSourceSpec(req.inJson->GetObjKey("dataSource"), req.errList)) { req.status = "error"; return false; }
		if (! dataset->ApplyOps(req.errList)) { req.status = "error"; return false; }
		if (dataset->nRows < config->numInitialStates) { req.status = "error"; req.errList.Add(TStr::Fmt("Not enough data (%d initial states were requested, %d rows are available).", config->numInitialStates, dataset->nRows)); return false; }
		dataset->CalcDefaultDistWeights();
		// Build the model.
		PModel model = new TModel(dataset);
		TKMeansRunner::BuildInitialStates(*model);
		TStatePartitionV allPartitions; TStateAggregator::BuildPartitionsBottomUp(*model, allPartitions);
		TStatePartitionV &selectedPartitions = model->statePartitions;
		int nScales = TInt::GetMn(10, allPartitions.Len() / 2); if (nScales < 2 || nScales >= allPartitions.Len()) selectedPartitions = allPartitions;
		else TStateAggScaleSelector::SelectScales(*model, allPartitions, nScales, selectedPartitions);
		// Calculate various statistics about the model.
		if (config->includeHistograms) model->CalcHistograms();
		model->CalcLabels();
		model->CalcStatePositions();
		if (config->includeDecisionTrees) model->BuildDecTrees(config->decTreeConfig.maxDepth, config->decTreeConfig.minEntropyToSplit, config->decTreeConfig.minNormInfGainToSplit);
		// Export the model to json.
		req.outJson->AddToObj("model",  model->SaveToJson());
		//
		req.status = "ok"; return true;
	}

	virtual TStr ExecJSon(const TStrKdV& FldNmValPrV, const PSAppSrvRqEnv& RqEnv) {
		TJsonRequest req;
		if (req.InitInJson(RqEnv)) ProcessRequest(req);
		return req.FinalizeResponse();
	}
}; 

int TestBuildModelRequest()
{
	TJsonRequest req;
	if (req.InitInJsonFromFile("call-braila.json")) TBuildModelFun::ProcessRequest(req);
	TStr resultStr = req.FinalizeResponse();
	FILE *f = fopen("callResult.json", "wt");
	fprintf(f, "%s\n", resultStr.CStr());
	fclose(f);
	printf("%s\n", resultStr.CStr());
	return 0;
}

void TestStrPFTime();

//-----------------------------------------------------------------------------

int main(int argc, char** argv)
{
	TStr s = "Hello World!";
	//printf("%s\n", s.CStr());
	//TestStrPFTime(); return 0;

    // create environment
    Env = ::TEnv(argc, argv, TNotify::StdNotify);
    // command line parameters
    Env.PrepArgs("StreamStory2", 0);
	int portNo = Env.GetIfArgPrefixInt("-port:", 0, "Server Port (-1 = use a number assigned by the OS)"); 
	TStr logFileName = Env.GetIfArgPrefixStr("-logfile:", "", "Log file name (use * to get a suitable default filename)");
	bool logStdOut = Env.GetIfArgPrefixBool("-logstdout:", true, "Log to stdout");
	TStr fnUnicodeDef = Env.GetIfArgPrefixStr("-fnUnicodeDef:", "UnicodeDef.bin", "UnicodeDef.bin path and file name");
	TStr command = Env.GetIfArgPrefixStr("-cmd:", "runServer", "What to do (runServer)");
	TStr fnSettingsJson = Env.GetIfArgPrefixStr("-fnSettingsJson:", "settingsStreamStory2.json", "JSON settings file name");
    if (Env.IsEndOfRun()) { return 0; }

	TUnicodeDef::Load(fnUnicodeDef);
	TUnicodeDef::GetDef()->codec.errorHandling = uehIgnore;

	// Set up a file notifier.
	NotifyVAdd(new TStdNotify());
	if (logFileName.StartsWith("*")) logFileName = "StreamStory2-serverLog.txt";
	if (! logFileName.Empty()) { PNotify fileNotify = new TFileNotify(logFileName); NotifyVAdd(fileNotify); }

	if (false) return TestBuildModelRequest();
	if (command == "runServer")
	{
		// Initialize the app-server functions.
		TSAppSrvFunV SrvFunV;
		SrvFunV.Add(TExitSFun::New());
		SrvFunV.Add(TBuildModelFun::New());
		// Start the web server.
		//if (portNo == 0) portNo = settingsH.portNo; // QW
		if (portNo == 0) portNo = 8096; // default port number
		PNotify srvNotify = new TNotifyVWrapper(NotifyVGet());
		PWebSrv WebSrv = TSAppSrv::New(portNo, SrvFunV, srvNotify, false);
		uvAsync.SetNotificationHandler(/*annotatorSet(), scheduler()*/);
		uvAsync.TriggerAsyncEvent();
		TLoop::Run();
		uvAsync.CleanUpNotificationHandler();
	}

    return 0;
}

// Run program: Ctrl + F5 or Debug > Start Without Debugging menu
// Debug program: F5 or Debug > Start Debugging menu

// Tips for Getting Started: 
//   1. Use the Solution Explorer window to add/manage files
//   2. Use the Team Explorer window to connect to source control
//   3. Use the Output window to see build output and other messages
//   4. Use the Error List window to view errors
//   5. Go to Project > Add New Item to create new code files, or Project > Add Existing Item to add existing code files to the project
//   6. In the future, to open this project again, go to File > Open > Project and select the .sln file
