#ifndef __STREAMSTORY2_H_DEFINED__
#define __STREAMSTORY2_H_DEFINED__

enum class TAttrType { Time, Numeric, Categorical, Text };
enum class TAttrSubtype { String, Int, Flt };
enum class TAttrSource { Input, Synthetic };
enum class TTimeType { Time, Int, Flt };

class TTimeStamp
{
public:
	TTimeType type;
	// If type == Time, the value is stored in (sec, ns), 'sec' represents the value of TSecTm::AbsSecs.
	// if type == Int, the value is stored in 'sec';
	// if type == Flt, the value is stored in 'flt'.
	int64_t sec; 
	int ns;
	double flt;

	void SetTime(int64_t sec_, int ns_) { type = TTimeType::Time; sec = sec_; ns = ns_; flt = double(sec) + double(ns) / 1e9; }
	void SetInt(int64_t value) { type = TTimeType::Int; sec = value; ns = 0; flt = double(sec); }
	void SetFlt(double value) { type = TTimeType::Flt; flt = value;
		double f = floor(value); sec = (int64_t) f; ns = (int) ((value - f) * 1e9);
		if (ns < 0) ns = 0; else if (ns >= 1000000000) { ns -= 1000000000; ++sec; } }
	void SetTime(double value) { SetFlt(value); type = TTimeType::Time; }
	double GetFlt() const {
		if (type == TTimeType::Time) return double(sec) + double(ns) / 1e9;
		else if (type == TTimeType::Flt) return flt;
		else if (type == TTimeType::Int) return sec;
		else { Assert(false); return std::numeric_limits<double>::quiet_NaN(); } }

	TStr ToStr() const;

	static TStr GetDowName(int dowOneBased);
	static TStr GetMonthName(int monthOneBased);
};

typedef TVec<TTimeStamp> TTimeStampV;

class TAttrDesc;
typedef TVec<TAttrDesc> TAttrDescV;

class TAttrDesc
{
public:
	// Allowed combinations of type and subtype: Time/{String, Int, Flt}, Numeric/{Int, Flt}, Categorical/{String, Int}, Text/{String}.
	TAttrType type;
	TAttrSubtype subType;
	TAttrSource source; 
	TStr name; // internal name; should be unique
	TStr sourceName; // name of this attribute in the data source; relevant only if type == Input
	TStr userFriendlyLabel; // name by which this attribute appears in the output
	TTimeType timeType; // only if type == Time
	TStr formatStr;
	double distWeight; // weight of this attribute in the distance function

	bool InitFromJson(const PJsonVal& jsonVal, const TStr& whatForErrMsg, TStrV& errList);
};

enum class TOpType { LinMap, LinTo01, SetMeanAndStd, Standardize, SubtractMean, RestrictRange };
enum class TTimeWindowType { Time, Samples };
enum class TResampleType { SetTimeStep, SetNumSamples };
enum class TTimeCategoricalUnit { Sec, Min, Hour, DayOfWeek, Month };

class TFltEx
{
public:
	typedef enum { Flt, Min, Max, Avg, Std } Type;
	Type type;
	TFlt value;
};

class TOpDesc;
typedef TPt<TOpDesc> POpDesc;
typedef TVec<POpDesc> TOpDescV;

class TOpDesc
{
protected:
	TCRef CRef;
	friend TPt<TOpDesc>;
public:
	virtual ~TOpDesc() { }
	virtual bool InitFromJson(const PJsonVal& jsonVal, TStrV& errList) { return true; }
	static POpDesc New(const PJsonVal& jsonVal, TStrV& errList);
};

bool Json_GetObjStr(const PJsonVal& jsonVal, const char *key, bool allowMissing, const TStr& defaultValue, TStr& value, const TStr& whereForErrorMsg, TStrV& errList);

class TOpDesc_SingleAttrMap : public TOpDesc
{
public:
	TStr inAttrName, outAttrName;	
	bool InitFromJson(const PJsonVal& jsonVal, TStrV& errList) override { 
		if (! TOpDesc::InitFromJson(jsonVal, errList)) return false;
		if (! Json_GetObjStr(jsonVal, "inAttr", false, {}, inAttrName, "an op description", errList)) return false;
		if (! Json_GetObjStr(jsonVal, "outAttr", true, inAttrName, outAttrName, "an op description", errList)) return false;
		return true; }
};

class TOpDesc_TimeCategorical : public TOpDesc_SingleAttrMap
{
public:
	TTimeCategoricalUnit unit;
};

class TOpDesc_AttrLinMap : public TOpDesc_SingleAttrMap
{
public:
	TFltEx x1, y1, x2, y2; 
};

class TOpDesc_AttrStdMap : public TOpDesc_SingleAttrMap
{
public:
	TFltEx newMean, newStd; 
};

class TOpDesc_AttrRestrictRange : public TOpDesc_SingleAttrMap
{
public:
	TFltEx newMin, newMax; 
};

class TOpDesc_TimeWindow : public TOpDesc_SingleAttrMap
{
public:
	TTimeWindowType windowType;
	TTimeStamp windowSize;
};

class TOpDesc_Trend : public TOpDesc_TimeWindow
{
public:
};

class TOpDesc_Delta : public TOpDesc_TimeWindow
{
public:
};

class TOpDesc_Resample : public TOpDesc
{
	TResampleType resampleType;
	TTimeStamp timeStep;
	int numSamples; // = -1 to keep the existing number of samples
};

/*
class TAttrOpDesc
{
public:
	TAttrOpType type;
	TStrV inAttrNames; // input attribute name(s)
	TStrV outAttrName, outAttrLabel; // if a new attribute is being added
	TFltEx x1, y1, x2, y2; // for linear maps
	TFltEx newMean, newStd; // for SetMeanAndStd 
	TFltEx newMin, newMax; // for RestrictRange
	TFlt timeWindow; // for shift/trend
};
*/

class TDecTreeConfig
{
public:
	int maxDepth = -1; 
	double minEntropyToSplit = -1;
	double minNormInfGainToSplit = -1;
	void Clr() { *this = {}; }
};

class TModelConfig;
typedef TPt<TModelConfig> PModelConfig;

class TModelConfig
{
protected:
	TCRef CRef; friend TPt<TModelConfig>;
public:
	TAttrDescV attrs;
	TOpDescV ops;
	int numInitialStates;
	int numHistogramBuckets;
	TDecTreeConfig decTreeConfig;
	void Clr() { ClrAll(attrs, ops); numInitialStates = -1; numHistogramBuckets = -1; decTreeConfig.Clr(); }
	bool InitFromJson(const PJsonVal& val, TStrV& errors);
protected:
	bool AddAttrsFromOps(TStrV& errors);
};

class TDataColumn;
typedef TVec<TDataColumn> TDataColumnV;

class TDataColumn
{
public:
	int idxInConfig;
	// The following fields are copied from TAttrDesc, for convenience.
	TStr name, sourceName, userFriendlyLabel, formatStr;
	TAttrType type;
	TAttrSubtype subType;
	TTimeType timeType;
	double distWeight; // from the config
	// Possible types:
	// - numeric/{int, float}
	// - categorical/{single-value, mixed-value}/{int-keys, string-keys}
	// - sparse/{int-keys, string-keys}
	// For categorical attributes, single-value is useful in the input data, but mixed-value is
	// needed for centroids.  
	// Thus, in TDataColumn, a categorical attribute is single-value and its index stored in 'intVals',
	// with intKeyMap/strKeyMap use to map values to indices.
	//
	// The following vectors are used (or rather, one of them is used) while reading
	// the data source and applying the ops.  Later we'll switch to a row-based representation;
	// or will we?  We don't really have to, since we just need to compute the distances between
	// all the input instances and all the centroids.
	TFltV fltVals;             // type = numeric, subtype = flt
	TIntV intVals;             // type = numeric, subtype = int; or type = categorical (in which case this vector stores the keyIds from intKeyMap/strKeyMap)
	TIntIntH intKeyMap;        // type = categorical, subtype = int
	TStrHash<TInt> strKeyMap;  // type = categorical, subtype = str
	TIntFltKdV sparseVecData;  // type = text;  for each row, the keydats must be sorted by key
	TIntPrV sparseVecIndex;    // (firstValue, nValues) pairs
	TTimeStampV timeVals;      // type = time, any subtype and timetype
	void ClrVals() { ClrAll(fltVals, intVals, intKeyMap, strKeyMap, sparseVecData, sparseVecIndex); }
	void Gen(int nRows) {  
		ClrVals();
		if (type == TAttrType::Numeric && subType == TAttrSubtype::Flt) fltVals.Gen(nRows);
		if (type == TAttrType::Numeric && subType == TAttrSubtype::Int || type == TAttrType::Categorical) intVals.Gen(nRows);
		if (type == TAttrType::Text) sparseVecIndex.Gen(nRows);
		if (type == TAttrType::Time) timeVals.Gen(nRows);
		// ToDO: more?
	}
};

class TCentroidComponent;
typedef TVec<TCentroidComponent> TCentroidComponentV;

class TDataset;

class TCentroidComponent
{
public:
	double fltVal;   // type = numeric (subtype = flt or int) or time (any subtype)
	TFltV denseVec;  // type = categorical (subtype = str or int); index: keyId from intKeyMap/strKeyMap of the TDataColumn
	TIntFltH sparseVec; // type = text
protected:
	// 'sparseVec2' gets invalidated when 'Add' modifies 'sparseVec'.  Theoretically Add could
	// update 'sparseVec2' suitably but it should be cheaper to just recalculate 'sparseVec2' from
	// scratch once we're doine adding row vectors to the centroid.
	mutable double sparseVec2; // sum of squares of 'sparseVec'
	mutable bool sparseVec2Valid;
public:
	double GetSparseVec2() const;
	void Clr(const TDataColumn &col) {
		fltVal = 0; sparseVec.Clr();
		sparseVec2 = 0; sparseVec2Valid = true;
		if (col.type == TAttrType::Categorical) { 
			if (col.subType == TAttrSubtype::Int) denseVec.Gen(col.intKeyMap.Len());
			else if (col.subType == TAttrSubtype::String) denseVec.Gen(col.strKeyMap.Len());
			else IAssert(false); 
			denseVec.PutAll(0); }
		else denseVec.Clr(); }
	void Add(const TDataColumn &col, const int rowNo, double coef); // Works like *this += coef * col[rowNo].
	void Add(const TDataColumn &col, const TCentroidComponent& other, double coef); // *this += coef * other.
	void MulBy(double coef);
	PJsonVal SaveToJson(const TDataset& dataset, int colNo) const;
};

class THistogram;
typedef TPt<THistogram> PHistogram;
typedef TVec<PHistogram> THistogramV;

class THistogram
{
protected:
	TCRef CRef;
	friend TPt<THistogram>;
public:
	int nBuckets; // only if the attribute is a numeric one
	// If the attribute is a numeric one, 'freqs' is indexed by a bucket number of 0 to nBuckets - 1.
	// If the attribute is a categorical one, 'freqs' is indexed by the keyIDs from TDataColumn.intKeyMap/strKeyMap.
	TIntV freqs;
	int freqSum; // sum of all the frequencies in 'freqs'
	TFltV bounds; // numeric attributes only; freqs[i] counts instances where the attribute value is in [bounds[i], bounds[i + 1])
	TIntV dowFreqs, monthFreqs, hourFreqs; // Time attributes only.   dowFreqs[0] = Sunday; monthFreqs[0] = January.   [Same as 'struct tm' from the standard library.]

	void Clr() { nBuckets = 0; freqSum = 0; ClrAll(freqs, bounds, dowFreqs, monthFreqs, hourFreqs); }
	void Init(const TDataColumn &col, int nBuckets_, const TIntV& rowNos);
	PJsonVal SaveToJson(const TDataColumn &col) const;
	static void CalcHistograms(THistogramV& dest, const TDataset& dataset, const TIntV& rowNos, bool allRows = false, int nBucketsOverride = -1);
};

enum class TDecTreeTimeUnit { Hour, Month, DayOfWeek };

class TDecTreeNode;
typedef TPt<TDecTreeNode> PDecTreeNode;
typedef TVec<PDecTreeNode> TDecTreeNodeV;

struct TDecTreeNodeStats
{
	double entropyBeforeSplit, entropyAfterSplit;
	double splitCost, infGain, normInfGain;
};

class TDecTreeNode
{
protected:
	TCRef CRef;
	friend TPt<TDecTreeNode>;
public:
	TDecTreeNodeV children;
	// Number of instances that reach this node and are positive (inside the state) or negative (outside the state).
	int nPos, nNeg;
	// The attribute used to split the instances amongst subtrees; -1 if this is a leaf.
	int attrNo;
	int intThresh; // used if the attribute is Numeric/Int; the first subtree is for <, the second for >=
	double fltThresh; // used if the attribute is Numeric/Flt; the first subtree is for <, the second for >=
	// Time attributes are used only if their timeType is Time (and not Int or Flt).
	// They are first converted to 'unit' (hour / month / day of week) and then
	// used in the following way: if intThresh <= attribute value < intThresh2, go to the left subtree,
	// otherwise go to the second subtree.  Note that for months and days of week, the thresholds are 0-based, not 1-based.
	TDecTreeTimeUnit timeUnit;
	int intThresh2;
	TDecTreeNodeStats stats;

protected:
	void BuildSubtree(const TDataset& dataset, const TIntV& posList, const TIntV& negList, TBoolV& attrToIgnore, int maxDepth, double minEntropyToSplit, double minNormInfGainToSplit);
	void SelectBestSplit(const TDataset& dataset, const TIntV& posList, const TIntV& negList, const TBoolV& attrToIgnore, double &bestNormInfGain);
public:
	static inline PDecTreeNode New(const TDataset& dataset, const TIntV& posList, const TIntV& negList, TBoolV& attrToIgnore, int maxDepth, double minEntropyToSplit, double minNormInfGainToSplit) {
		PDecTreeNode node = new TDecTreeNode();
		node->BuildSubtree(dataset, posList, negList, attrToIgnore, maxDepth, minEntropyToSplit, minNormInfGainToSplit); 
		return node; }
	PJsonVal SaveToJson(const TDataset& dataset) const;
public:
	static inline double Entropy(int nPos, int nNeg) { // in bits
		Assert(nPos >= 0); Assert(nNeg >= 0);
		if (nPos <= 0 || nNeg <= 0) return 0;
		// H = - pPos ln pPos - pNeg ln pNeg
		//   = - (nPos/N) ln (nPos/N) - (nNeg/N) ln (nNeg/N)
		//   = - [nPos ln (nPos/N) + nNeg ln (nNeg/N)] / N
		//   = - [nPos ln nPos - nPos ln N + nNeg ln nNeg - nNeg ln N)] / N
		//   = - [nPos ln nPos + nNeg ln nNeg - N ln N] / N
		//   = - [nPos ln nPos + nNeg ln nNeg] / N + ln N
		int N = nPos + nNeg;
		const double inv_ln2 = 1.0 / 0.69314718055994530941723212145818;
		return (log(N) - (nPos * log(nPos) + nNeg * log(nNeg)) / double(N)) * inv_ln2; }
	static inline double Entropy(const TIntPr pr) { return Entropy(pr.Val1, pr.Val2); }
};

class TState;
typedef TPt<TState> PState;
typedef TVec<PState> TStateV;

class TStatePartition;
typedef TPt<TStatePartition> PStatePartition;
typedef TVec<PStatePartition> TStatePartitionV;

class TDataset;

class TStateLabel
{
public:
	TStr label;
	int nCoveredInState, nNotCoveredInState, nCoveredOutsideState, nNotCoveredOutsideState;
	double logOddsRatio;
	TStateLabel() { nCoveredInState = 0; nNotCoveredInState = 0; nCoveredOutsideState = 0; nNotCoveredOutsideState = 0; logOddsRatio = std::numeric_limits<double>::quiet_NaN(); }
	bool SetIfBetter(int nCoveredInState_, int nStateMembers, int nCoveredTotal, int nAllInstances, double eps, int nBuckets);
};

class TState
{
protected:
	TCRef CRef;
	friend TPt<TState>;
public:
	TCentroidComponentV centroid; // index: column number from TDataset.cols
	TIntV members; // contains row indices into the dataset
	TIntV initialStates; // indexes of initial states from which this state has been aggregated; sorted incrementally
	THistogramV histograms; // index: column number, same as TDataset::cols
	TStateLabel label;
	PDecTreeNode decTree;
	double xCenter, yCenter, radius;
	void InitCentroid0(const TDataset& dataset);
	void AddToCentroid(const TDataset& dataset, int rowNo, double coef);  // Works like centroid += coef * dataset[rowNo].
	void AddToCentroid(const TDataset& dataset, const TCentroidComponentV& other, double coef); // centroid += coef * other.
	void MulCentroidBy(double coef) { for (TCentroidComponent &comp : centroid) comp.MulBy(coef); }
	void CalcHistograms(const TDataset& dataset) { THistogram::CalcHistograms(histograms, dataset, members, false); }
	void CalcLabel(const TDataset& dataset, int thisStateNo, const THistogramV& totalHists, double eps);
	static void CalcLabels(const TDataset& dataset, const TStateV& states, const THistogramV& totalHists);
	PJsonVal SaveToJson(int thisStateNo, const TDataset& dataset, const PStatePartition& nextLowerScale) const;
};

// Represents a partition of initial states into a smaller number of aggregate states.
class TStatePartition 
{
protected:
	TCRef CRef;
	friend TPt<TStatePartition>;
public:
	TStateV aggStates;
	TIntV initToAggState; // initToAggState[i] = j means that aggStates[j].initialStates contains 'i'
	TFltVV transMx; // transMx(i, j) =  probability that the next agg-state will be j if the previous one was i
	TFltV statProbs; // statProbs[i] = stationary probability of being in agg-state i
	TFltV eigenVals; // of the transMx
	TStatePartition(int nInitialStates) : initToAggState(nInitialStates) { initToAggState.PutAll(-1); }
	void CalcTransMx(const TFltVV& initStateTransMx, const TFltV& initStateStatProbs);
	void CalcEigenVals();
	void CalcHistograms(const TDataset& dataset) { for (const PState& state : aggStates) state->CalcHistograms(dataset); }
	void CalcLabels(const TDataset& dataset, const THistogramV& totalHists) { TState::CalcLabels(dataset, aggStates, totalHists); }
	PJsonVal SaveToJson(const TDataset& dataset, bool areTheseInitialStates, const PStatePartition& nextLowerScale) const;
	void CalcRadiuses() { for (int stateNo = 0; stateNo < aggStates.Len(); ++stateNo) aggStates[stateNo]->radius = sqrt(statProbs[stateNo] / TMath::Pi); }
	void CalcCentersUsingSvd(const TDataset& dataset); // assumes that centroids and statProbs are already available; doesn't try to avoid overlaps
};

typedef TPt<TDataset> PDataset;

class TDataset
{
protected:
	TCRef CRef;
	friend TPt<TDataset>;
public:
	int nRows;
	TDataColumnV cols;
	PModelConfig config;
	void InitColsFromConfig(const PModelConfig& config_);
	bool ReadDataFromJsonArray(const PJsonVal &jsonData, TStrV& errors);
	bool ReadDataFromCsv(TSIn& SIn, const TStr& fieldSep, const TStr& fileName, TStrV& errors);
	// jsonSpec must be a JSON object corresponding to the 'dataSource' attribute of a JSON request.
	bool ReadDataFromJsonDataSourceSpec(const PJsonVal &jsonSpec, TStrV& errors);
	bool ApplyOps(TStrV& errors); // applies ops from 'config'
	double RowDist2(int row1, int row2) const;
	double RowCentrDist2(int rowNo, const TCentroidComponentV& centroid) const;
	double RowCentrDist2(int rowNo, const PState& state) const { return RowCentrDist2(rowNo, state->centroid); }
	double RowCentrDist2(int rowNo, const TState& state) const { return RowCentrDist2(rowNo, state.centroid); }
	double CentrDist2(const TCentroidComponentV& centroid1, const TCentroidComponentV& centroid2) const;
	double CentrDist2(const TState& state1, const TState& state2) const { return CentrDist2(state1.centroid, state2.centroid); }
	double CentrDist2(const PState& state1, const PState& state2) const { return CentrDist2(state1->centroid, state2->centroid); }
};

class TModel;
typedef TPt<TModel> PModel;

class TModel
{
protected:
	TCRef CRef;
	friend TPt<TModel>;
public:
	PDataset dataset;
	TStateV initialStates;
	TIntV rowToInitialState;
	TStatePartitionV statePartitions; // ordered in decreasing number of states; statePartitions[0] contains the original initial states without aggregation
	THistogramV totalHistograms; // histograms for the entire dataset, as opposed to for an individual state
	TModel(const PDataset& dataset_) : dataset(dataset_) { }
	void CalcTransMx(TFltV& statProbs, TFltVV& transMx) const;
	void BuildRowToInitialState();
	double RowCentrDist2(int rowNo, int initialStateNo) const { return dataset->RowCentrDist2(rowNo, initialStates[initialStateNo]->centroid); }
	void CalcHistograms() { 
		THistogram::CalcHistograms(totalHistograms, *dataset, {}, true); 
		for (const PState& state : initialStates) state->CalcHistograms(*dataset); 
		for (const PStatePartition& scale : statePartitions) scale->CalcHistograms(*dataset); }
	void CalcLabels() { 
		THistogramV totalHists; THistogram::CalcHistograms(totalHists, *dataset, {}, true, 5); 
		TState::CalcLabels(*dataset, initialStates, totalHists);
		for (const PStatePartition& scale : statePartitions) scale->CalcLabels(*dataset, totalHists); }
	void CalcStatePositions(); // requires static probabilities and centroids
	void BuildDecTrees(int maxDepth, double minEntropyToSplit, double minNormInfGainToSplit);

	PJsonVal SaveToJson() const;
};

class TKMeansRunner
{
protected:
	TDataset &dataset;
	TModel &model;
	TRnd rnd;
	PModelConfig config;
	TStateV &states; int nStates, nCols, nRows;
	// TFltVV distances; // distances(i, j) = distance of row i from the centroid of state j -- eh, we probably don't really need this
	TKMeansRunner(TModel& model_) : dataset(*model_.dataset), model(model_), states(model_.initialStates), config(model_.dataset->config), rnd(123) { 
		nStates = config->numInitialStates; nCols = dataset.cols.Len(); IAssert(nCols == config->attrs.Len()); 
		nRows = dataset.nRows; }
	void Go();
	void SelectInitialCentroids(TIntV& dest);
public:
	inline static void BuildInitialStates(TModel& model) { TKMeansRunner r { model }; r.Go(); }
};

class TStateAggregator
{
protected:
	TFltVV initStateDist; // distances between initial states - useful for calculating average-link distances between clusters
	TDataset &dataset;
	TModel &model;
	int nInitialStates;
	TStatePartitionV allPartitions;
	TStateAggregator(TModel& model_) : dataset(*model_.dataset), model(model_) { nInitialStates = model.initialStates.Len(); }
	PStatePartition BuildInitialPartition();
	PStatePartition BuildNextPartition(const PStatePartition &part);
	void CalcInitStateDist();
	void BuildPartitionsBottomUp();
public:
	inline static void BuildPartitionsBottomUp(TModel &model, TStatePartitionV& dest) { TStateAggregator a { model }; a.BuildPartitionsBottomUp(); dest = std::move(a.allPartitions); }
};

class TStateAggScaleSelector
{
protected:
	TDataset &dataset;
	TModel &model;
	int nInitialStates;
	TRnd rnd;
	TStatePartitionV allPartitions;
	TStateAggScaleSelector(TModel& model_, TStatePartitionV allPartitions_) : dataset(*model_.dataset), model(model_), allPartitions(std::move(allPartitions_)), rnd(123) { nInitialStates = model.initialStates.Len(); }
	void CalcTransMatricesAndEigenVals();
	void SelectInitialCentroids(int nClusters, TIntV& dest);
	void SelectScales(int nToSelect, TStatePartitionV& dest);
	struct TCluster
	{
		TFltV centroid;
		TIntV members;
		void Clr(int nDim) { centroid.Clr(); centroid.Gen(nDim); centroid.PutAll(0); members.Clr(); }
		void Add(int memberNo, const TFltV& vec) { members.Add(memberNo); IAssert(centroid.Len() == vec.Len()); for (int i = 0; i < vec.Len(); ++i) centroid[i] += vec[i]; }
		void Normalize() { for (TFlt& x : centroid) x.Val /= double(TInt::GetMx(1, members.Len())); }
		static double Dist2(const TFltV& x, const TFltV& y) { IAssert(x.Len() == y.Len()); double d = 0; for (int i = 0; i < x.Len(); ++i) { double dx = x[i] - y[i]; d += dx * dx; } return d; }
		double Dist2(const TFltV& other) const { return Dist2(centroid, other); }
		double Dist2(const TCluster& other) const { return Dist2(other.centroid); }
		double Dist2(const TStatePartition& other) const { return Dist2(other.eigenVals); }
		double Dist2(const PStatePartition& other) const { return Dist2(other->eigenVals); }
	};
public:
	inline static void SelectScales(TModel& model, TStatePartitionV allPartitions, int nToSelect, TStatePartitionV &dest) { TStateAggScaleSelector s { model, std::move(allPartitions) }; s.SelectScales(nToSelect, dest); }
};

bool Json_GetObjStr(const PJsonVal& jsonVal, const char *key, bool allowMissing, const TStr& defaultValue, TStr& value, const TStr& whereForErrorMsg, TStrV& errList);
bool Json_GetObjNum(const PJsonVal& jsonVal, const char *key, bool allowMissing, double defaultValue, double& value, const TStr& whereForErrorMsg, TStrV& errList);
bool Json_GetObjInt(const PJsonVal& jsonVal, const char *key, bool allowMissing, int defaultValue, int& value, const TStr& whereForErrorMsg, TStrV& errList);
bool Json_GetObjKey(const PJsonVal& jsonVal, const char *key, bool allowMissing, bool allowNull, PJsonVal& value, const TStr& whereForErrorMsg, TStrV& errList);

#endif // __STREAMSTORY2_H_DEFINED__

