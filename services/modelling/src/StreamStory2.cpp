#include "pch.h"
#include "StreamStory2.h"

bool Json_GetObjStr(const PJsonVal& jsonVal, const char *key, bool allowMissing, const TStr& defaultValue, TStr& value, const TStr& whereForErrorMsg, TStrV& errList)
{
	if (jsonVal.Empty()) { errList.Add("Unexpected empty value in " + whereForErrorMsg + "."); return false; }
	if (! jsonVal->IsObj()) { errList.Add("Unexpected non-object value in " + whereForErrorMsg + "."); return false; }
	if (! jsonVal->IsObjKey(key))
		if (allowMissing) { value = defaultValue; return true; }
		else { errList.Add(TStr("Missing value \"") + key + "\" in " + whereForErrorMsg + "."); return false; }
	const PJsonVal& val = jsonVal->GetObjKey(key);
	if (val.Empty()) { errList.Add(TStr("Unexpected null value of \"") + key + "\" in " + whereForErrorMsg + "."); return false; }
	if (! val->IsStr()) { errList.Add(TStr("The value of \"") + key + "\" in " + whereForErrorMsg + " should be a string."); return false; }
	value = val->GetStr(); return true;
}

bool Json_GetObjNum(const PJsonVal& jsonVal, const char *key, bool allowMissing, double defaultValue, double& value, const TStr& whereForErrorMsg, TStrV& errList)
{
	if (jsonVal.Empty()) { errList.Add("Unexpected empty value in " + whereForErrorMsg + "."); return false; }
	if (! jsonVal->IsObj()) { errList.Add("Unexpected non-object value in " + whereForErrorMsg + "."); return false; }
	if (! jsonVal->IsObjKey(key))
		if (allowMissing) { value = defaultValue; return true; }
		else { errList.Add(TStr("Missing value \"") + key + "\" in " + whereForErrorMsg + "."); return false; }
	const PJsonVal& val = jsonVal->GetObjKey(key);
	if (val.Empty()) { errList.Add(TStr("Unexpected null value of \"") + key + "\" in " + whereForErrorMsg + "."); return false; }
	if (! val->IsNum()) { errList.Add(TStr("The value of \"") + key + "\" in " + whereForErrorMsg + " should be a number."); return false; }
	value = val->GetNum(); return true;
}

bool Json_GetObjInt(const PJsonVal& jsonVal, const char *key, bool allowMissing, int defaultValue, int& value, const TStr& whereForErrorMsg, TStrV& errList)
{
	double x; if (! Json_GetObjNum(jsonVal, key, allowMissing, defaultValue, x, whereForErrorMsg, errList)) return false;
	value = (int) floor(x);
	if (value != x) { errList.Add(TStr("The value of \"") + key + "\" in " + whereForErrorMsg + " is a number, but not an integer."); return false; }
	return true;
}

bool Json_GetObjBool(const PJsonVal& jsonVal, const char *key, bool allowMissing, bool defaultValue, bool& value, const TStr& whereForErrorMsg, TStrV& errList)
{
	if (jsonVal.Empty()) { errList.Add("Unexpected empty value in " + whereForErrorMsg + "."); return false; }
	if (! jsonVal->IsObj()) { errList.Add("Unexpected non-object value in " + whereForErrorMsg + "."); return false; }
	if (! jsonVal->IsObjKey(key))
		if (allowMissing) { value = defaultValue; return true; }
		else { errList.Add(TStr("Missing value \"") + key + "\" in " + whereForErrorMsg + "."); return false; }
	const PJsonVal& val = jsonVal->GetObjKey(key);
	if (val.Empty()) { errList.Add(TStr("Unexpected null value of \"") + key + "\" in " + whereForErrorMsg + "."); return false; }
	if (! val->IsBool()) { errList.Add(TStr("The value of \"") + key + "\" in " + whereForErrorMsg + " should be a boolean."); return false; }
	value = val->GetBool(); return true;
}

bool Json_GetObjKey(const PJsonVal& jsonVal, const char *key, bool allowMissing, bool allowNull, PJsonVal& value, const TStr& whereForErrorMsg, TStrV& errList)
{
	if (jsonVal.Empty()) { errList.Add("Unexpected empty value in " + whereForErrorMsg + "."); return false; }
	if (! jsonVal->IsObj()) { errList.Add("Unexpected non-object value in " + whereForErrorMsg + "."); return false; }
	if (! jsonVal->IsObjKey(key)) {
		if (allowMissing) { value = {}; return true; }
		else { errList.Add(TStr("Missing value \"") + key + "\" in " + whereForErrorMsg + "."); return false; } }
	value = jsonVal->GetObjKey(key);
	if (value.Empty()) {
		if (allowMissing) return true;
		else { errList.Add(TStr("Missing value \"") + key + "\" in " + whereForErrorMsg + "."); return false; } }
	if (value->IsNull()) {
		if (allowNull) return true;
		else { errList.Add(TStr("Null value \"") + key + "\" in " + whereForErrorMsg + "."); return false; } }
	return true;
}

POpDesc TOpDesc::New(const PJsonVal& jsonVal, TStrV& errList)
{
	if (jsonVal.Empty()) { errList.Add("Op descriptions must not be null."); return {}; }
	if (! jsonVal->IsObj()) { errList.Add("Op descriptions must be JSON objects."); return {}; }
	TStr opStr; if (! Json_GetObjStr(jsonVal, "op", false, {}, opStr, "an op description", errList)) return {};
	POpDesc o;
	if (opStr == "linMap") o = new TOpDesc_AttrLinMap();
	// ToDo: add other op types here.
	else { errList.Add("Invalid op type: \"" + opStr + "\"."); return {}; }
	if (! o->InitFromJson(jsonVal, errList)) return {};
	return o;
}

//-----------------------------------------------------------------------------
//
// TTimeStamp
//
//-----------------------------------------------------------------------------

TStr TTimeStamp::ToStr() const
{
	char buf[100];
	if (type == TTimeType::Flt) sprintf(buf, "%g", flt);
	else if (type == TTimeType::Int) sprintf(buf, "%jd", (intmax_t) sec);
	else if (type == TTimeType::Time)
	{
		TSecTm secTm(sec);
		sprintf(buf, "%04d-%02d-%02d %02d:%02d:%02d.%09d", secTm.GetYearN(), secTm.GetMonthN(), secTm.GetDayN(), secTm.GetHourN(), secTm.GetMinN(), secTm.GetSecN(), ns);
	}
	else { Assert(false); buf[0] = 0; }
	return buf;
}

//-----------------------------------------------------------------------------
//
// TModelConfig
//
//-----------------------------------------------------------------------------

bool TAttrDesc::InitFromJson(const PJsonVal& jsonVal, const TStr& whatForErrMsg, TStrV& errList)
{
	if (jsonVal.Empty()) { errList.Add("The value of \'" + whatForErrMsg + "\' should not be null."); return false; }
	if (! jsonVal->IsObj()) { errList.Add("The value of \'" + whatForErrMsg + "\' should be an object."); return false; }
	TStr s;
	//
	if (! Json_GetObjStr(jsonVal, "type", false, "", s, whatForErrMsg, errList)) return false;
	if (s == "time") type = TAttrType::Time, subType = TAttrSubtype::String, timeType = TTimeType::Time;
	else if (s == "numeric") type = TAttrType::Numeric, subType = TAttrSubtype::Flt;
	else if (s == "categorical") type = TAttrType::Categorical, subType = TAttrSubtype::String;
	else if (s == "text") type = TAttrType::Text, subType = TAttrSubtype::String;
	else { errList.Add("Invalid value \"" + s + "\" of \'" + whatForErrMsg + ".type\'."); return false; }
	//
	if (! Json_GetObjStr(jsonVal, "subType", true, "default", s, whatForErrMsg, errList)) return false;
	if (s == "string" || s == "str") subType = TAttrSubtype::String;
	else if (s == "float" || s == "flt") subType = TAttrSubtype::Flt;
	else if (s == "int" || s == "integer") subType = TAttrSubtype::Int;
	else if (s == "default") { } // keep the default subType that we initialized together with 'type'
	else { errList.Add("Invalid value \"" + s + "\" of \'" + whatForErrMsg + ".subType\'."); return false; }
	// ToDo: some combinations of type and subType make no sense, check for that.
	//
	if (! Json_GetObjStr(jsonVal, "source", true, "input", s, whatForErrMsg, errList)) return false;
	if (s == "input") source = TAttrSource::Input;
	else if (s == "synthetic") source = TAttrSource::Synthetic;
	else { errList.Add("Invalid value \"" + s + "\" of \'" + whatForErrMsg + ".source\'."); return false; }
	//
	if (! Json_GetObjStr(jsonVal, "name", false, "", name, whatForErrMsg, errList)) return false;
	if (! Json_GetObjStr(jsonVal, "sourceName", true, name, sourceName, whatForErrMsg, errList)) return false;
	if (! Json_GetObjStr(jsonVal, "label", true, name, userFriendlyLabel, whatForErrMsg, errList)) return false;
	//
	s = (subType == TAttrSubtype::String) ? (type == TAttrType::Time ? "%Y-%m-%d %H:%M:%S" : "%s") :
		(subType == TAttrSubtype::Flt) ? "%lf" : "%d";
	if (! Json_GetObjStr(jsonVal, "format", true, s, formatStr, whatForErrMsg, errList)) return false;
	//
	if (type == TAttrType::Time)
	{
		timeType = (subType == TAttrSubtype::Int) ? TTimeType::Int : (subType == TAttrSubtype::Flt) ? TTimeType::Flt : TTimeType::Time;
		if (! Json_GetObjStr(jsonVal, "timeType", true, "default", s, whatForErrMsg, errList)) return false;
		if (s == "time") timeType = TTimeType::Time;
		else if (s == "float" || s == "flt") timeType = TTimeType::Flt;
		else if (s == "int" || s == "integer") timeType = TTimeType::Int;
		else if (s == "default") { } // keep the default timeType that we initialized from 'subType'
		else { errList.Add("Invalid value \"" + s + "\" of \'" + whatForErrMsg + ".timeType\'."); return false; }
		// ToDo: some combinations of subType and timeType make no sense, e.g. subType = float and timeType = int.  Check for that.
		// ToDo: maybe warn about the possibility of a lossy conversion if subType = string, the format string has '%f' and timeType == int.
	}
	//
	if (! Json_GetObjNum(jsonVal, "distWeight", true, std::numeric_limits<double>::quiet_NaN(), distWeight, whatForErrMsg, errList)) return false;
	return true;
}

bool TModelConfig::InitFromJson(const PJsonVal& val, TStrV& errList)
{
	Clr();
	if (val.Empty()) { errList.Add("The json value is null."); return false; }
	if (! val->IsObj()) { errList.Add("The json value is not an object."); return false; }
	numInitialStates = -1; 
	if (! Json_GetObjInt(val, "numInitialStates", true, -1, numInitialStates, "model config", errList)) return false;
	// ToDo: the alternative to numInitialStates is to specify the radius and use DP-means.
	if (! Json_GetObjInt(val, "numHistogramBuckets", true, 10, numHistogramBuckets, "model config", errList)) return false;
	if (! Json_GetObjBool(val, "ignoreConversionErrors", true, true, ignoreConversionErrors, "model config", errList)) return false;
	if (! Json_GetObjBool(val, "includeDecisionTrees", true, true, includeDecisionTrees, "model config", errList)) return false;
	if (! Json_GetObjBool(val, "includeHistograms", true, true, includeHistograms, "model config", errList)) return false;
	if (! Json_GetObjBool(val, "includeStateHistory", true, true, includeStateHistory, "model config", errList)) return false;
	if (! Json_GetObjNum(val, "distWeightOutliers", true, 0.05, distWeightOutliers, "model config", errList)) return false;
	if (! Json_GetObjInt(val, "decTree_maxDepth", true, 3, decTreeConfig.maxDepth, "model config", errList)) return false;
	if (! Json_GetObjNum(val, "decTree_minEntropyToSplit", true, TDecTreeNode::Entropy(1, 3 * numInitialStates - 1), decTreeConfig.minEntropyToSplit, "model config", errList)) return false;
	if (! Json_GetObjNum(val, "decTree_minNormInfGainToSplit", true, -1, decTreeConfig.minNormInfGainToSplit, "model config", errList)) return false;
	// Parse the attribute decriptions.
	{
		PJsonVal jsonAttrs; if (! Json_GetObjKey(val, "attributes", false, false, jsonAttrs, "model config", errList)) return false; 
		if (! jsonAttrs->IsArr()) { errList.Add("The \'attributes\' value is not an array."); return false; }
		const int nAttrs = jsonAttrs->GetArrVals();
		for (int i = 0; i < nAttrs; ++i)
		{
			PJsonVal jsonAttr = jsonAttrs->GetArrVal(i);
			TStr s = TStr::Fmt("attributes[%d]", i);
			attrs.Add();
			if (! attrs.Last().InitFromJson(jsonAttr, s, errList)) return false;
		}
	}
	// Parse the ops.  
	do { 
		PJsonVal jsonOps; if (! Json_GetObjKey(val, "ops", true, true, jsonOps, "model config", errList)) return false; 
		if (! jsonOps.Empty() && ! jsonOps->IsArr() && ! jsonOps->IsNull()) { errList.Add("The \'ops\' value is not an array."); return false; }
		const int nOps = (jsonOps.Empty() || jsonOps->IsNull()) ? 0 : jsonOps->GetArrVals();
		for (int i = 0; i < nOps; ++i)
		{
			POpDesc opDesc = TOpDesc::New(jsonOps->GetArrVal(i), errList);
			if (opDesc.Empty()) continue;
			ops.Add(opDesc);
		}
	} while (false);
	return true;
}

bool TModelConfig::AddAttrsFromOps(TStrV& errors)
{
	// ToDo.  For each op, see if its outAttrName needs to be added; if its inAttrName is valid;
	// if there are any conflicts.
	return true;
}

//-----------------------------------------------------------------------------
//
// strptime-style parsing of timestamp strings
//
//-----------------------------------------------------------------------------

#if 0
// This is a wrapper around std::get_time, which according to https://en.cppreference.com/w/cpp/io/manip/get_time
// is supposed to be compatible with strptime, where the latter is available.  But it doesn't 
// seem to have support for %f, i.e. units less than a second.  (These couldn't be represented
// in a std::tm anyway.)
bool StrPTime(const char *s, const char *format, std::tm& tm)
{
	std::istringstream is {s};
	is >> std::get_time(&tm, format);
	return is.good();
}
#endif

// This supports only a subset of the format specifiers, but on the other hand this includes %f.
bool StrPTime_HomeGrown(const char *s, const char *format, TSecTm &secTm, int &ns)
{
	int year = -1, month = -1, day = -1, hour = -1, min = -1, sec = 0; ns = 0; 
	bool isPm = false, applyPm = false;
	if (! s || ! format) return false;
	while (true)
	{
		char fc = *format; if (! fc) break; else ++format;
		// 1 or more whitespace characters in 'format' can match 1 or more whitespace characters in 's'.
		if (isspace(uchar(fc)))
		{
			if (! isspace(uchar(*s))) return false;
			while (*s && isspace(uchar(*s))) ++s;
			while (*format && isspace(uchar(*format))) ++format;
			continue;
		}
		// Match other non-formatting characters.
		if (fc != '%') { 
			if (*s != fc) return false; 
			++s; continue; }
		// Match %%.
		fc = *format; if (! fc) return false; else ++format; // % at the end = invalid format string
		if (fc == '%') { if (*s == '%') s++; else return false; }
		// Match AM/PM.
		if (fc == 'p') { 
			if ((*s == 'a' || *s == 'A') && (s[1] == 'm' || s[1] == 'M')) { isPm = false; s += 2; continue; }
			if ((*s == 'p' || *s == 'P') && (s[1] == 'm' || s[1] == 'M')) { isPm = true; s += 2; continue; }
			return false; }
		// Match numeric %-formatted values.
		// - First determine how many digits we should consume.
		int minDigits = -1, maxDigits = -1;
		if (fc == 'y') minDigits = 2, maxDigits = 2;
		else if (fc == 'Y') minDigits = 4, maxDigits = 4;
		else if (fc == 'm' || fc == 'M' || fc == 'H' || fc == 'I' || fc == 'd' || fc == 'S') minDigits = 1, maxDigits = 2;
		else if (fc == 'f') minDigits = 1, maxDigits = 9;
		else return false; // invalid or unsupported format character
		// - Parse the digits.
		int x = 0, d = 0;
		while (d < maxDigits && s[d] >= '0' && s[d] <= '9') { x *= 10; x += s[d++] - '0'; }
		if (d < minDigits) return false;
		// - Store the value.
		if (fc == 'y') year = x + (x < 70 ? 2000 : 1900);
		else if (fc == 'Y') year = x;
		else if (fc == 'H') hour = x;
		else if (fc == 'I') hour = x, applyPm = true;
		else if (fc == 'M') min = x;
		else if (fc == 'm') month = x;
		else if (fc == 'S') sec = x;
		else if (fc == 'd') day = x;
		else if (fc == 'f') { ns = x; for (int D = d; D < 9; ++D) ns *= 10; }
		s += d;
	}
	if (applyPm) {
		if (hour == 12 && ! isPm) hour = 0; // 12 AM = midnight = 0 in 24-hour time
		else if (hour < 12 && isPm) hour += 12; }
	secTm = TSecTm(year, month, day, hour, min, sec); return true;
}

// The formatting counterpart to StrPTime_HomeGrown.
bool StrFTime_HomeGrown(TChA& dest, const char *format, const TSecTm &secTm, int ns, bool clrDest)
{
	if (clrDest) dest.Clr();
	if (! format) return false;
	while (true)
	{
		char fc = *format; if (! fc) break; else ++format;
		// Copy non-formatting characters.
		if (fc != '%') { dest += fc; continue; }
		// Handle %%.
		fc = *format; if (! fc) return false; else ++format; // % at the end = invalid format string
		int digits = -1, nDigits = 0; while (fc >= '0' && fc <= '9') { if (digits < 0) digits = 0; digits = 10 * digits + (fc - '0'); fc = *format++; ++nDigits; }
		if (! fc) return false; 
		if (nDigits > 3 || digits > 100) return false;
		if (fc == '%') { dest += fc; continue; }
		// Handle AM/PM.
		if (fc == 'p') { dest += (secTm.GetHourN() < 12) ? "AM" : "PM"; continue; }
		// Handle most other fields.
		int x = 0; bool xSet = false;
		if (fc == 'y') { x = secTm.GetYearN() % 100; xSet = true; if (digits < 0) digits = 2; }
		else if (fc == 'Y') { x = secTm.GetYearN(); xSet = true; if (digits < 0) digits = 4; }
		else if (fc == 'H') { x = secTm.GetHourN(); xSet = true; if (digits < 0) digits = 2; }
		else if (fc == 'I') { x = secTm.GetHourN(); xSet = true; if (x == 0) x = 12; else if (x > 12) x -= 12; if (digits < 0) digits = 2; }
		else if (fc == 'M') { x = secTm.GetMinN(); xSet = true; if (digits < 0) digits = 2; }
		else if (fc == 'm') { x = secTm.GetMonthN(); xSet = true; if (digits < 0) digits = 2; }
		else if (fc == 'S') { x = secTm.GetSecN(); xSet = true; if (digits < 0) digits = 2; }
		else if (fc == 'd') { x = secTm.GetDayN(); xSet = true; if (digits < 0) digits = 2; }
		if (xSet)
		{
			char buf[20]; int L = 0; do { buf[L++] = '0' + (x % 10); x /= 10; } while (x != 0);
			while (digits > L) dest += '0', digits--;
			for (int i = L - 1; i >= 0; --i) dest += buf[i]; 
			continue; 
		}
		// Handle fractions of a second.
		if (fc == 'f') { 
			x = ns; char buf[9]; int minDigits = 1;
			for (int i = 0; i < 9; ++i) { 
				int d = x % 10; x /= 10; buf[i] = '0' + d;
				if (d != 0 && minDigits == 1) minDigits = 9 - i; }
			if (digits < 0) digits = minDigits;
			for (int i = 0; i < digits && i < 9; ++i) dest += buf[8 - i]; 
			for (int i = 9; i < digits; ++i) dest += '0';
			continue; }
		// Otherwise we have an invalid/unsupported format specifier.
		return false;
	}
	return true;
}

TStr StrFTime_HomeGrown(const char *format, const TSecTm &secTm, int ns)
{
	TChA buf; StrFTime_HomeGrown(buf, format, secTm, ns);
	return buf;
}

void TestStrPFTime()
{
	TSecTm secTm; int ns;
	bool ok = StrPTime_HomeGrown("2012-11-10 23:22:05.970", "%Y-%m-%d %H:%M:%S.%f", secTm, ns);
	printf("StrPTime returns %s, sec = %d, ns = %d\n", (ok ? "T" : "F"), secTm.GetAbsSecs(), ns);
	TChA buf; ok = StrFTime_HomeGrown(buf, "%Y-%m-%d %H:%M:%S.%3f", secTm, ns, true); 
	printf("StrFTime returns %s \"%s\"\n", (ok ? "T" : "F"), buf.CStr());
	ok = StrFTime_HomeGrown(buf, "%Y-%m-%d %H:%M:%S.%f", secTm, ns, true); 
	printf("StrFTime returns %s \"%s\"\n", (ok ? "T" : "F"), buf.CStr());
	ok = StrFTime_HomeGrown(buf, "%Y-%m-%d %3H:%M:%S.%12f", secTm, ns, true); 
	printf("StrFTime returns %s \"%s\"\n", (ok ? "T" : "F"), buf.CStr());
}

//-----------------------------------------------------------------------------
//
// TDataColumn
//
//-----------------------------------------------------------------------------

template<typename TDat> 
double GetVariance(TVec<TDat> v, double propOutliersToIgnore) 
{
	v.Sort(); int n = v.Len(), nToIgnore = int(n * propOutliersToIgnore);
	if (nToIgnore < 0) nToIgnore = 0; 
	if (nToIgnore > n) nToIgnore = n;
	int L = nToIgnore / 2; int D = n - (nToIgnore - L);
	double sum = 0, sum2 = 0; int m = D - L;
	for (int i = L; i < D; ++i) { double x = v[i]; sum += x; sum2 += x * x; }
	NotifyInfo("GetVariance(%d; %g to ignore -> %d used): min[0] = %g, first[%d] = %g, last[%d] = %g, max[%d] = %g\n",
		n, propOutliersToIgnore, m, double(v[0]), L, double(v[L]), D - 1, double(v[D]), n - 1, double(v[n - 1]));
	// V = (1/m) sum_i (x_i - xAvg)^2 = (1/m) sum_i (x_i^2 + xAvg^2 - 2 xAvg x_i)
	// = (1/m) sum_i x_i^2 + (1/m) sum_i xAvg^2 - (2/m) sum_i xAvg x_i
	// = (1/m) sum_i x_i^2 + xAvg^2 - 2 xAvg^2
	// = (1/m) sum_i x_i^2 - xAvg^2
	if (m <= 0) return 0;
	double avg = sum / double(m);
	double variance = (sum2 / double(m)) - avg * avg;
	return variance;
}

double TDataColumn::GetDefaultDistWeight(double propOutliersToIgnore) const
{
	if (type != TAttrType::Numeric) return 1;
	double variance = 0;
	if (subType == TAttrSubtype::Flt) variance = GetVariance(fltVals, propOutliersToIgnore);
	else if (subType == TAttrSubtype::Int) variance = GetVariance(intVals, propOutliersToIgnore);
	else IAssert(false);
	if (variance < 1e-6) return 1;
	else return 1.0 / variance;
}

//-----------------------------------------------------------------------------
//
// TCsvReader 
//
//-----------------------------------------------------------------------------

class TCsvReader
{
public:
	TStr separator;
	TStr errMsg;
	TCsvReader(const TStr &separator_) : separator(separator_) { }
	// This reads the next value but doesn't consume the separator or EOL that follows it.
	bool ReadValue(TSIn& SIn, TChA& dest, int rowNo, int colNo);
	// This reads the next line and also consumes the EOL that follows it.
	bool ReadLine(TSIn& SIn, TStrV& dest, int rowNo);
};

bool TCsvReader::ReadLine(TSIn& SIn, TStrV& dest, int rowNo)
{
	dest.Clr();
	if (SIn.Eof()) return false;
	// Empty line?
	char ch = SIn.PeekCh();
	if (ch == '\x0a') { SIn.GetCh(); return true; }
	else if (ch == '\x0d') { 
		SIn.GetCh(); if (! SIn.Eof() && SIn.PeekCh() == '\x0a') SIn.GetCh(); 
		return true; }
	// Read the values.
	int colNo = 0; TChA buf;
	while (true)
	{
		// Read the next value.
		if (! ReadValue(SIn, buf, rowNo, ++colNo)) return false;
		dest.Add(TStr(buf));
		if (SIn.Eof()) return true;
		ch = SIn.PeekCh();
		// Eat the separator.
		if (separator.IsChIn(ch)) { SIn.GetCh(); continue; }
		// ...or the EOL.
		if (ch == '\x0d') {
			SIn.GetCh(); if (! SIn.Eof() && SIn.PeekCh() == '\x0a') SIn.GetCh();
			return true; }
		else if (ch == '\x0a') { SIn.GetCh(); return true; }
		else IAssert(false); // Why has ReadValue stopped here?
	}
}

bool TCsvReader::ReadValue(TSIn& SIn, TChA& dest, int rowNo, int colNo) 
{
	dest.Clr();
	if (SIn.Eof()) return false;
	char ch = SIn.PeekCh();
	const char Quote = '\"';
	bool quoted = (ch == Quote);
	if (! quoted)
	{
		while (! SIn.Eof()) {
			ch = SIn.PeekCh();
			if (ch == '\r' || ch == '\n' || separator.IsChIn(ch)) break;
			dest += SIn.GetCh(); }
		return true;
	}
	SIn.GetCh(); // Eat the quote character.
	while (! SIn.Eof())
	{
		ch = SIn.GetCh();
		// Non-quote character?
		if (ch != Quote) { dest += ch; continue; }
		// Quote followed by EOF?
		if (SIn.Eof()) { return true; } 
		char ch2 = SIn.PeekCh();
		// Double quote?
		if (ch2 == Quote) { dest += SIn.GetCh(); continue; }
		// Quote followed by a separator or EOL?
		if (ch2 == '\r' || ch2 == '\n' || separator.IsChIn(ch2)) { return true; }
		// Otherwise it's an error.
		errMsg = TStr::Fmt("Error in CSV data (row %d, col %d): unexpected character after the end of a quoted value (separator or EOL/EOF expected).", rowNo, colNo);
		return false;
	}
	errMsg = TStr::Fmt("Error in CSV data (row %d, col %d): unexpected EOF in a quoted value.", rowNo, colNo);
	return false;
}

//-----------------------------------------------------------------------------
//
// TDatasetCsvFeeder
//
//-----------------------------------------------------------------------------

class TDatasetCsvFeeder
{
protected:
	TDataset& dataset;
	TStr fileName;
	TIntV dataColToCsvCol; // index: the column index from 'dataset.cols'; value: index of the corresponding column in this CSV file
public:
	TDatasetCsvFeeder(TDataset& dataset_, const TStr& fileName_) : dataset(dataset_), fileName(fileName_) { }
	// Initializes 'dataColToCsvCol'.
	bool SetHeaders(const TStrV& headers, int rowNo, TStrV& errors);
	// Parses 'values' and adds them to the end of each column in 'dataset.cols'.
	bool AddRow(const TStrV& values, int rowNo, TConversionProgress& convProg);
};

bool TDatasetCsvFeeder::SetHeaders(const TStrV& headers, int rowNo, TStrV& errors)
{
	if (headers.Empty()) { errors.Add(TStr::Fmt("[%s] The header row is empty.", fileName.CStr())); return false; } 
	const int nCols = dataset.cols.Len(), nHeaders = headers.Len();
	dataColToCsvCol.Clr(); dataColToCsvCol.Gen(nCols); dataColToCsvCol.PutAll(-1);
	bool retVal = true;
	for (int colNo = 0; colNo < nCols; ++colNo)
	{
		const TDataColumn &col = dataset.cols[colNo];
		int found = -1;
		for (int headNo = 0; headNo < nHeaders; ++headNo)
			if (headers[headNo] == col.sourceName)
			{
				if (found < 0) found = headNo;
				else { errors.Add(TStr::Fmt("[%s] More than one header matches the attribute \"%s\": %d and %d.", fileName.CStr(), col.sourceName.CStr(), found, headNo)); retVal = false; }
			}
		if (found < 0) { errors.Add(TStr::Fmt("[%s] No header matches the attribute \"%s\".", fileName.CStr(), col.sourceName.CStr())); retVal = false; }
		dataColToCsvCol[colNo] = found;
	}
	return retVal;
}

bool TDatasetCsvFeeder::AddRow(const TStrV& values, int rowNo, TConversionProgress& convProg)
{
#define ON_ERROR(x) { \
		if (convProg.nErrorsReported >= convProg.maxErrorsToReport) convProg.nErrorsSuppressed++; \
		else { convProg.nErrorsReported++; convProg.errors.Add((x)); } \
		convProg.nRowsIgnored++; return convProg.ignoreErrors; } 
	const int nCols = dataset.cols.Len();
	TConvertedValueV convVals; convVals.Gen(nCols);
	for (int colNo = 0; colNo < nCols; ++colNo)
	{
		TDataColumn &col = dataset.cols[colNo];
		int csvColNo = dataColToCsvCol[colNo];
		if (csvColNo < 0 || csvColNo >= values.Len()) ON_ERROR(TStr::Fmt("[%s] Error in CSV data (row %d): this row has %d values, attribute \"%s\" should be in column %d based on headers.", fileName.CStr(), rowNo, int(values.Len()), col.name.CStr(), csvColNo + 1));
		const TStr& value = values[csvColNo];
		TConvertedValue &cv = convVals[colNo];
		//
		if (col.type == TAttrType::Numeric && (col.subType == TAttrSubtype::Flt || col.subType == TAttrSubtype::Int))
		{
			if (col.subType == TAttrSubtype::Flt) { if (1 != sscanf(value.CStr(), "%lf", &cv.fltVal)) ON_ERROR("The value of data[" + TInt::GetStr(rowNo - 1) + "].\"" + col.sourceName + "\" is not a floating-point number."); }
			else if (col.subType == TAttrSubtype::Int) { if (1 != sscanf(value.CStr(), "%d", &cv.intVal)) ON_ERROR("The value of data[" + TInt::GetStr(rowNo - 1) + "].\"" + col.sourceName + "\" is not an integer."); }
			else IAssert(false);
		}
		else if (col.type == TAttrType::Categorical)
		{
			if (col.subType == TAttrSubtype::String) cv.strVal = value; 
			else if (col.subType == TAttrSubtype::Int) { if (1 != sscanf(value.CStr(), "%d", &cv.intVal)) ON_ERROR("The value of data[" + TInt::GetStr(rowNo - 1) + "].\"" + col.sourceName + "\" is not an integer."); }
			else IAssert(false);
		}
		else if (col.type == TAttrType::Time)
		{
			TTimeStamp &ts = cv.tsVal; 
			if (col.subType == TAttrSubtype::String) {
				TSecTm secTm; int ns; if (! StrPTime_HomeGrown(value.CStr(), col.formatStr.CStr(), secTm, ns)) ON_ERROR(TStr::Fmt("Error parsing data[%d].\"%s\" = \"%s\" as a datetime value with the format \"%s\".", rowNo - 1, col.sourceName.CStr(), value.CStr(), col.formatStr.CStr())); 
				if (col.timeType == TTimeType::Time) ts.SetTime(secTm.GetAbsSecs(), ns);
				else if (col.timeType == TTimeType::Int) ts.SetInt(secTm.GetAbsSecs()); 
				else if (col.timeType == TTimeType::Flt) ts.SetFlt(secTm.GetAbsSecs() + double(ns) / 1e9);
				else IAssert(false); }
			else if (col.subType == TAttrSubtype::Int) {
				intmax_t intVal; if (1 != sscanf(value.CStr(), "%jd", &intVal)) ON_ERROR("The value of data[" + TInt::GetStr(rowNo - 1) + "].\"" + col.sourceName + "\" is not an integer."); 
				if (col.timeType == TTimeType::Time) ts.SetTime(intVal, 0);
				else if (col.timeType == TTimeType::Int) ts.SetInt(intVal); 
				else if (col.timeType == TTimeType::Flt) ts.SetFlt((double) intVal);
				else IAssert(false); }
			else if (col.subType == TAttrSubtype::Flt) {
				double x; if (1 != sscanf(value.CStr(), "%lf", &x)) ON_ERROR("The value of data[" + TInt::GetStr(rowNo - 1) + "].\"" + col.sourceName + "\" is not a floating-point number."); 
				double fx = floor(x);
				int64_t intVal = (int64_t) fx; int ns = int((x - fx) * 1e9);
				if (ns < 0) ns = 0; else if (ns >= 1000000000) { ns -= 1000000000; ++intVal; }
				if (col.timeType == TTimeType::Time) ts.SetTime(intVal, ns);
				else if (col.timeType == TTimeType::Int) ts.SetInt(intVal); 
				else if (col.timeType == TTimeType::Flt) ts.SetFlt(x);
				else IAssert(false); }
			else IAssert(false);
		}
		else if (col.type == TAttrType::Text)
		{
			// ToDo.
			IAssert(false);
		}
		else IAssert(false);
	}
	dataset.AddRow(convVals);
	return true;
#undef ON_ERROR
}

//-----------------------------------------------------------------------------
//
// TDataset
//
//-----------------------------------------------------------------------------

void TDataset::AddRow(const TConvertedValueV& values)
{
	const int nCols = cols.Len(); Assert(values.Len() == nCols);
	for (int colNo = 0; colNo < nCols; ++colNo)
	{
		TDataColumn &col = cols[colNo]; const TConvertedValue &cv = values[colNo];
		//
		if (col.type == TAttrType::Numeric) {
			if (col.subType == TAttrSubtype::Flt) col.fltVals.Add(cv.fltVal); 
			else if (col.subType == TAttrSubtype::Int) col.intVals.Add(cv.intVal);
			else IAssert(false); }
		else if (col.type == TAttrType::Categorical)
		{
			if (col.subType == TAttrSubtype::String) {
				const TStr& key = cv.strVal;
				int keyId = col.strKeyMap.GetKeyId(key);
				if (! IsValidId(keyId)) { keyId = col.strKeyMap.AddKey(key); col.strKeyMap[keyId] = 1; }
				else ++col.strKeyMap[keyId].Val;
				col.intVals.Add(keyId); }
			else if (col.subType == TAttrSubtype::Int) {
				int key = cv.intVal;
				int keyId = col.intKeyMap.GetKeyId(key);
				if (! IsValidId(keyId)) { keyId = col.intKeyMap.AddKey(key); col.intKeyMap[keyId] = 1; }
				else ++col.intKeyMap[key].Val;
				col.intVals.Add(keyId); }
			else IAssert(false);
		}
		else if (col.type == TAttrType::Time)
		{
			col.timeVals.Add(cv.tsVal);
		}
		else if (col.type == TAttrType::Text)
		{
			// ToDo.
			IAssert(false);
		}
		else IAssert(false);
	}
	nRows += 1;
}

void TDataset::InitColsFromConfig(const PModelConfig& config_)
{
	cols.Clr(); config = config_;
	for (int colIdx = 0; colIdx < config->attrs.Len(); ++colIdx)
	{
		const TAttrDesc &attr = config->attrs[colIdx];
		cols.Add(); TDataColumn &col = cols.Last();
		col.name = attr.name; col.sourceName = attr.sourceName; col.userFriendlyLabel = attr.userFriendlyLabel;
		col.idxInConfig = colIdx; col.distWeight = attr.distWeight;
		col.type = attr.type; col.subType = attr.subType; col.formatStr = attr.formatStr; col.timeType = attr.timeType;
	}
}

bool TDataset::AddRowFromJson(const PJsonVal &jsonRow, int jsonRowIdx, TConversionProgress& convProg)
{
#define ON_ERROR(x) { \
		if (convProg.nErrorsReported >= convProg.maxErrorsToReport) convProg.nErrorsSuppressed++; \
		else { convProg.nErrorsReported++; convProg.errors.Add((x)); } \
		convProg.nRowsIgnored++; return convProg.ignoreErrors; } 
	if (jsonRow.Empty()) ON_ERROR("The value of data[" + TInt::GetStr(jsonRowIdx) + "] is missing."); 
	if (! jsonRow->IsObj()) ON_ERROR("The value of data[" + TInt::GetStr(jsonRowIdx) + "] must be an object."); 
	const int nCols = cols.Len();
	TConvertedValueV convVals; convVals.Gen(nCols);
	for (int colIdx = 0; colIdx < nCols; ++colIdx)
	{
		TDataColumn &col = cols[colIdx]; TConvertedValue &cv = convVals[colIdx];
		if (! jsonRow->IsObjKey(col.sourceName)) ON_ERROR("The value of data[" + TInt::GetStr(jsonRowIdx) + "].\"" + col.sourceName + "\" is missing."); 
		PJsonVal val = jsonRow->GetObjKey(col.sourceName); if (val.Empty()) ON_ERROR("The value of data[" + TInt::GetStr(jsonRowIdx) + "].\"" + col.sourceName + "\" is empty."); 
		if (col.type == TAttrType::Numeric)
		{
			if (! val->IsNum()) ON_ERROR("The value of data[" + TInt::GetStr(jsonRowIdx) + "].\"" + col.sourceName + "\" is not a number."); 
			// ToDo: add support for the conversion of strings to ints/floats?
			double x = val->GetNum();
			if (col.subType == TAttrSubtype::Flt) cv.fltVal = x;
			else if (col.subType == TAttrSubtype::Int) {
				int y = (int) floor(x); if (x != y) ON_ERROR("The value of data[" + TInt::GetStr(jsonRowIdx) + "].\"" + col.sourceName + "\" is not an integer."); 
				cv.intVal = y; }
			else IAssert(false);
		}
		else if (col.type == TAttrType::Categorical)
		{
			if (col.subType == TAttrSubtype::String) {
				if (! val->IsStr()) ON_ERROR("The value of data[" + TInt::GetStr(jsonRowIdx) + "].\"" + col.sourceName + "\" is not a string."); 
				cv.strVal = val->GetStr(); }
			else if (col.subType == TAttrSubtype::Int) {
				if (! val->IsNum()) ON_ERROR("The value of data[" + TInt::GetStr(jsonRowIdx) + "].\"" + col.sourceName + "\" is not a number."); 
				double x = val->GetNum(); int key = (int) floor(x); if (key != x) ON_ERROR("The value of data[" + TInt::GetStr(jsonRowIdx) + "].\"" + col.sourceName + "\" is a number but not an integer."); 
				// ToDo: add support for the conversion of strings to ints?
				cv.intVal = key; }
			else IAssert(false);
		}
		else if (col.type == TAttrType::Time)
		{
			TTimeStamp &ts = cv.tsVal;
			if (col.subType == TAttrSubtype::String) {
				if (! val->IsStr()) ON_ERROR("The value of data[" + TInt::GetStr(jsonRowIdx) + "].\"" + col.sourceName + "\" is not a string."); 
				TStr s = val->GetStr();
				TSecTm secTm; int ns; if (! StrPTime_HomeGrown(s.CStr(), col.formatStr.CStr(), secTm, ns)) ON_ERROR(TStr::Fmt("Error parsing data[%d].\"%s\" = \"%s\" as a datetime value with the format \"%s\".", int(jsonRowIdx), col.sourceName.CStr(), s.CStr(), col.formatStr.CStr())); 
				if (col.timeType == TTimeType::Time) ts.SetTime(secTm.GetAbsSecs(), ns);
				else if (col.timeType == TTimeType::Int) ts.SetInt(secTm.GetAbsSecs()); 
				else if (col.timeType == TTimeType::Flt) ts.SetFlt(secTm.GetAbsSecs() + double(ns) / 1e9);
				else IAssert(false); }
			else if (col.subType == TAttrSubtype::Int) {
				if (! val->IsNum()) ON_ERROR("The value of data[" + TInt::GetStr(jsonRowIdx) + "].\"" + col.sourceName + "\" is not a number."); 
				double x = val->GetNum(); int64_t intVal = (int64_t) floor(x); if (intVal != x) ON_ERROR("The value of data[" + TInt::GetStr(jsonRowIdx) + "].\"" + col.sourceName + "\" is a number but not an integer."); 
				if (col.timeType == TTimeType::Time) ts.SetTime(intVal, 0);
				else if (col.timeType == TTimeType::Int) ts.SetInt(intVal); 
				else if (col.timeType == TTimeType::Flt) ts.SetFlt((double) intVal);
				else IAssert(false); }
			else if (col.subType == TAttrSubtype::Flt) {
				if (! val->IsNum()) ON_ERROR("The value of data[" + TInt::GetStr(jsonRowIdx) + "].\"" + col.sourceName + "\" is not a number."); 
				double x = val->GetNum(); double fx = floor(x);
				int64_t intVal = (int64_t) fx; int ns = int((x - fx) * 1e9);
				if (ns < 0) ns = 0; else if (ns >= 1000000000) { ns -= 1000000000; ++intVal; }
				if (col.timeType == TTimeType::Time) ts.SetTime(intVal, ns);
				else if (col.timeType == TTimeType::Int) ts.SetInt(intVal); 
				else if (col.timeType == TTimeType::Flt) ts.SetFlt(x);
				else IAssert(false); }
			else IAssert(false);
		}
		else if (col.type == TAttrType::Text)
		{
			// ToDo.
			IAssert(false);
		}
		else IAssert(false);
	}
	AddRow(convVals); return true;
#undef ON_ERROR
}

bool TDataset::ReadDataFromJsonArray(const PJsonVal &jsonData, TConversionProgress& convProg)
{
	if (jsonData.Empty()) { convProg.errors.Add("Empty JSON data value."); return false; }
	if (! jsonData->IsArr()) { convProg.errors.Add("The JSON data value must be an array."); return false; }
	const int nCols = cols.Len(); nRows = jsonData->GetArrVals();
	NotifyInfo("TDataset::ReadDataFromJsonArray: %d rows (if no errors), %d columns.\n", nRows, nCols);
	for (int colIdx = 0; colIdx < nCols; ++colIdx) cols[colIdx].ClrVals(); // (nRows);
	for (int rowIdx = 0; rowIdx < nRows; ++rowIdx)
	{
		PJsonVal jsonRow = jsonData->GetArrVal(rowIdx);
		if (! AddRowFromJson(jsonRow, rowIdx, convProg)) return false;
	}
	return true;
}

bool TDataset::ReadDataFromCsv(TSIn& SIn, const TStr& fieldSep, const TStr& fileName, TConversionProgress &convProg)
{
	// Clear the data.
	const int nCols = cols.Len(); 
	for (int colIdx = 0; colIdx < nCols; ++colIdx) cols[colIdx].ClrVals();
	// Read the headers;
	if (SIn.Eof()) { convProg.errors.Add(TStr::Fmt("[%s] Error in CSV data: the file is empty.", fileName.CStr())); return false; }
	int rowNo = 0; TStrV headers, values;
	TCsvReader reader { fieldSep };
	while (true) {
		++rowNo; if (! reader.ReadLine(SIn, headers, rowNo)) { convProg.errors.Add(TStr::Fmt("[%s] %s", fileName.CStr(), reader.errMsg.CStr())); return false; }
		if (! headers.Empty()) break; }
	TDatasetCsvFeeder feeder { *this, fileName };
	if (! feeder.SetHeaders(headers, rowNo, convProg.errors)) return false;
	// Process the rest of the data.
	while (! SIn.Eof())
	{
		++rowNo; if (! reader.ReadLine(SIn, values, rowNo)) { convProg.errors.Add(TStr::Fmt("[%s] %s", fileName.CStr(), reader.errMsg.CStr())); return false; }
		if (values.Empty()) continue; // skip empty lines
		if (! feeder.AddRow(values, rowNo, convProg)) return false;
	}
	NotifyInfo("TDataset::ReadDataFromCsv: %d rows, %d/%d columns.\n", nRows - 1, int(headers.Len()), nCols);
	return true;
}

bool TDataset::ReadDataFromJsonDataSourceSpec(const PJsonVal &jsonSpec, TStrV& errors)
{
	TStr type; if (! Json_GetObjStr(jsonSpec, "type", false, "", type, "dataSource", errors)) return false; 
	TConversionProgress convProg { errors, config->ignoreConversionErrors };
	if (type == "file")
	{
		TStr format; if (! Json_GetObjStr(jsonSpec, "format", true, "", format, "dataSource", errors)) return false; 
		TStr fileName; if (! Json_GetObjStr(jsonSpec, "fileName", true, "", fileName, "dataSource", errors)) return false; 
		if (format.Empty())
		{
			if (fileName.ToLc().EndsWith(".json")) format = "json";
			else if (fileName.ToLc().EndsWith(".csv")) format = "csv";
			else { errors.Add("dataSource[format] is missing and cannot be inferred from the file name."); return false; }
		}
		if (format == "json")
		{
			// QW ToDo: eventually we want some security precautions here so that the caller can't get us to open an arbitrary file.
			NotifyInfo("TDataset::ReadDataFromJsonDataSourceSpec: reading \"%s\".\n", fileName.CStr());
			PSIn SIn = TFIn::New(fileName);
			if (SIn.Empty()) { errors.Add("Error opening \"" + fileName + "\"."); return false; }
			bool ok = false; TStr msgStr;
			PJsonVal jsonData = TJsonVal::GetValFromSIn(SIn, ok, msgStr);
			if (! ok) { errors.Add(msgStr); return false; }
			if (! this->ReadDataFromJsonArray(jsonData, convProg)) return false;
		}
		else if (format == "csv")
		{
			TStr fieldSep; if (! Json_GetObjStr(jsonSpec, "fieldSep", true, ",", fieldSep, "dataSource", errors)) return true;
			PSIn SIn = TFIn::New(fileName);
			if (SIn.Empty()) { errors.Add("Error opening \"" + fileName + "\"."); return false; }
			if (! this->ReadDataFromCsv(*SIn, fieldSep, fileName, convProg)) return false;
		}
		else { errors.Add("Unsupported value of dataSource[format]: \"" + format + "\"."); return false; }
	}
	else if (type == "internal")
	{
		TStr format; if (! Json_GetObjStr(jsonSpec, "format", true, "", format, "dataSource", errors)) return false; 
		PJsonVal vData; if (! Json_GetObjKey(jsonSpec, "data", false, false, vData, "dataSource", errors)) return false;
		const TStr fileName = "<internal>";
		if (format == "json") {
			if (! this->ReadDataFromJsonArray(vData, convProg)) return false; }
		else if (format == "csv")
		{
			TStr fieldSep; if (! Json_GetObjStr(jsonSpec, "fieldSep", true, ",", fieldSep, "dataSource", errors)) return true;
			if (vData->IsStr()) 
			{ 
				PSIn SIn = TStrIn::New(vData->GetStr(), false);
				if (! this->ReadDataFromCsv(*SIn, fieldSep, fileName, convProg)) return false;
			}
			else if (vData->IsArr())
			{
				int nElts = vData->GetArrVals();
				// Clear the data.
				const int nCols = cols.Len(); nRows = 0;
				for (int colIdx = 0; colIdx < nCols; ++colIdx) cols[colIdx].ClrVals();
				//
				TCsvReader reader { fieldSep }; int rowNo = 1, nDataRows = 0;
				TDatasetCsvFeeder feeder { *this, fileName };
				TStrV v; int nHeaders = -1;
				for (int iElt = 0; iElt < nElts; ++iElt)
				{
					PJsonVal vElt = vData->GetArrVal(iElt); if (vElt.Empty() || ! vElt->IsStr()) { errors.Add(TStr::Fmt("Error: unexpected non-string value in \"dataSource\".\"data\"[%d].", iElt)); return false; }
					PSIn SIn = TStrIn::New(vElt->GetStr(), false);
					while (! SIn->Eof())
					{
						if (! reader.ReadLine(*SIn, v, rowNo)) { errors.Add(TStr::Fmt("[%s] %s", fileName.CStr(), reader.errMsg.CStr())); return false; }
						if (rowNo == 1) { nHeaders = v.Len(); if (! feeder.SetHeaders(v, rowNo, errors)) return false; }
						else { ++nDataRows; if (! feeder.AddRow(v, rowNo, convProg)) return false; }
						++rowNo;
					}
				}
				NotifyInfo("TDataset::ReadDataFromCsv: %d rows (%d elements in the internal string vector), %d/%d columns.\n", nDataRows, nElts, nHeaders, nCols);
			}
			else { errors.Add("Error reading internal CSV data from the request: the value of \"dataSource\".\"data\" should be a string or an array of strings."); return false; }
		}
		else { errors.Add("Unsupported value of dataSource[format]: \"" + format + "\"."); return false; }
	}
	// Probably the other type we want to support is reading data from a table, where the spec has
	// to provide a connection string and possibly a query.
	else
	{
		errors.Add("Unsupported value of dataSource[type]: \"" + type + "\"."); return false;
	}
	if (convProg.nErrorsSuppressed > 0) errors.Add(TStr::Fmt("%d more conversion errors were encountered but not reported here.", convProg.nErrorsSuppressed));
	if (convProg.nRowsIgnored > 0) errors.Add(TStr::Fmt("A total of %d input rows were ignored due to conversion errors or missing values.", convProg.nRowsIgnored));
	return true;
}

bool TDataset::ApplyOps(TStrV& errors)
{
	// ToDo. 
	return true;
}

void TDataset::CalcDefaultDistWeights() 
{ 
	for (TDataColumn& col : cols) if (isnan(col.distWeight)) 
	{
		col.distWeight = col.GetDefaultDistWeight(config->distWeightOutliers); 
		NotifyInfo("TDataset::CalcDefaultDistWeights: setting distWeight of \"%s\" to %g.\n", col.name.CStr(), col.distWeight);
	}
}

double TDataset::RowDist2(int row1, int row2) const
{
	double result = 0; const int nCols = cols.Len();
	for (int colNo = 0; colNo < nCols; ++colNo)
	{
		const TDataColumn &col = cols[colNo]; 
		if (col.distWeight == 0 || col.type == TAttrType::Time) continue;
		double delta2 = 0;
		if (col.type == TAttrType::Numeric) {
			if (col.subType == TAttrSubtype::Flt) delta2 = col.fltVals[row1] - col.fltVals[row2];
			else if (col.subType == TAttrSubtype::Int) delta2 = double(col.intVals[row1]) - double(col.intVals[row2]);
			else Assert(false); 
			delta2 *= delta2; }
		else if (col.type == TAttrType::Categorical) {
			delta2 = (col.intVals[row1] == col.intVals[row2]) ? 1 : 0; }
		else if (col.type == TAttrType::Text) {
			const auto &V = col.sparseVecData;
			const auto &pr1 = col.sparseVecIndex[row1]; const auto *from1 = &V[pr1.Val1]; const auto *to1 = from1 + pr1.Val2;
			const auto &pr2 = col.sparseVecIndex[row2]; const auto *from2 = &V[pr2.Val1]; const auto *to2 = from2 + pr2.Val2;
			double sum11 = 0, sum12 = 0, sum22 = 0;
			while (from1 < to1 && from2 < to2) {
				auto key1 = from1->Key, key2 = from2->Key; auto dat1 = from1->Dat, dat2 = from2->Dat;
				if (key1 == key2) sum12 += dat1 * dat2;
				if (key1 <= key2) { sum11 += dat1 * dat1; ++from1; }
				if (key2 <= key1) { sum22 += dat2 * dat2; ++from2; } }
			while (from1 < to1) { auto dat1 = from1->Dat; sum11 += dat1 * dat1; ++from1; }
			while (from2 < to2) { auto dat2 = from2->Dat; sum22 += dat2 * dat2; ++from2; }
			// sum_i (x_i - y_i)^2 = sum_i x_i^2 + sum_i y_i^2 - 2 sum_i x_i y_i
			delta2 = sum11 + sum22 - sum12 - sum12; }
		else Assert(false);
		result += col.distWeight * delta2;
	}
	return result;
}

double TDataset::RowCentrDist2(int rowNo, const TCentroidComponentV& centroid) const
{
	double result = 0; const int nCols = cols.Len();
	IAssert(centroid.Len() == nCols);
	for (int colNo = 0; colNo < nCols; ++colNo)
	{
		const TDataColumn &col = cols[colNo]; 
		const TCentroidComponent &comp = centroid[colNo];
		if (col.distWeight == 0 || col.type == TAttrType::Time) continue;
		double delta2 = 0;
		if (col.type == TAttrType::Numeric) {
			if (col.subType == TAttrSubtype::Flt) delta2 = col.fltVals[rowNo] - comp.fltVal;
			else if (col.subType == TAttrSubtype::Int) delta2 = double(col.intVals[rowNo]) - comp.fltVal;
			else Assert(false); 
			delta2 *= delta2; }
		else if (col.type == TAttrType::Categorical) {
			for (int keyId = 0; keyId < comp.denseVec.Len(); ++keyId) {
				double d = (col.intVals[rowNo] == keyId ? 1 : 0) - comp.denseVec[keyId];
				delta2 += d * d; } }
		else if (col.type == TAttrType::Text) {
			const auto &V = col.sparseVecData;
			const auto &pr1 = col.sparseVecIndex[rowNo]; const auto *from1 = &V[pr1.Val1]; const auto *to1 = from1 + pr1.Val2;
			double sum11 = 0, sum12 = 0, sum22 = comp.GetSparseVec2();
			while (from1 < to1) {
				auto key1 = from1->Key; auto dat1 = from1->Dat;
				auto keyId2 = comp.sparseVec.GetKeyId(key1);
				double dat2 = (keyId2 < 0) ? 0.0 : comp.sparseVec[keyId2].Val;
				sum11 += dat1 * dat1; sum12 = dat1 * dat2; }
			// sum_i (x_i - y_i)^2 = sum_i x_i^2 + sum_i y_i^2 - 2 sum_i x_i y_i
			delta2 = sum11 + sum22 - sum12 - sum12; }
		else Assert(false);
		result += col.distWeight * delta2;
	}
	return result;
}

double TDataset::CentrDist2(const TCentroidComponentV& centroid1, const TCentroidComponentV& centroid2) const
{
	double result = 0; const int nCols = cols.Len();
	IAssert(centroid1.Len() == nCols); IAssert(centroid2.Len() == nCols);
	for (int colNo = 0; colNo < nCols; ++colNo)
	{
		const TDataColumn &col = cols[colNo]; 
		const TCentroidComponent &comp1 = centroid1[colNo], &comp2 = centroid2[colNo];
		if (col.distWeight == 0 || col.type == TAttrType::Time) continue;
		double delta2 = 0;
		if (col.type == TAttrType::Numeric) {
			if (col.subType == TAttrSubtype::Flt) delta2 = comp1.fltVal - comp2.fltVal;
			else if (col.subType == TAttrSubtype::Int) delta2 = comp1.fltVal - comp2.fltVal;
			else Assert(false); 
			delta2 *= delta2; }
		else if (col.type == TAttrType::Categorical) {
			const int L = comp1.denseVec.Len(); IAssert(L == comp2.denseVec.Len());
			for (int keyId = 0; keyId < L; ++keyId) {
				double d = comp1.denseVec[keyId] - comp2.denseVec[keyId];
				delta2 += d * d; } }
		else if (col.type == TAttrType::Text) {
			const int L1 = comp1.sparseVec.Len(), L2 = comp2.sparseVec.Len();
			const auto &SV1 = (L1 < L2) ? comp1.sparseVec : comp2.sparseVec, &SV2 = (L1 < L2) ? comp2.sparseVec : comp1.sparseVec;
			double sum11 = comp1.GetSparseVec2(), sum12 = 0, sum22 = comp2.GetSparseVec2();
			for (auto keyId1 = SV1.FFirstKeyId(); SV1.FNextKeyId(keyId1); ) {
				auto key = SV1.GetKey(keyId1); double dat1 = SV1[keyId1];
				auto keyId2 = SV2.GetKeyId(key);
				double dat2 = (keyId2 <= 0) ? 0.0 : SV2[keyId2].Val;
				sum12 = dat1 * dat2; }
			// sum_i (x_i - y_i)^2 = sum_i x_i^2 + sum_i y_i^2 - 2 sum_i x_i y_i
			delta2 = sum11 + sum22 - sum12 - sum12; }
		else Assert(false);
		result += col.distWeight * delta2;
	}
	return result;
}

//-----------------------------------------------------------------------------
//
// TCentroidComponent
//
//-----------------------------------------------------------------------------

void TCentroidComponent::Add(const TDataColumn &col, const int rowNo, double coef)
{
	if (col.type == TAttrType::Categorical) {
		int keyId = col.intVals[rowNo];
		denseVec[keyId] += coef; }
	else if (col.type == TAttrType::Numeric) {
		if (col.subType == TAttrSubtype::Flt) fltVal += coef * col.fltVals[rowNo];
		else if (col.subType == TAttrSubtype::Int) fltVal += coef * col.intVals[rowNo];
		else IAssert(false); }
	else if (col.type == TAttrType::Text) {
		sparseVec2 = -1; sparseVec2Valid = false;
		int firstValue = col.sparseVecIndex[rowNo].Val1, nValues = col.sparseVecIndex[rowNo].Val2;
		for (int iValue = 0; iValue < nValues; ++iValue)
		{
			const TIntFltKd& kd = col.sparseVecData[firstValue + iValue];
			int keyId = sparseVec.GetKeyId(kd.Key); 
			if (keyId < 0) sparseVec.AddDat(kd.Key, coef * kd.Dat);
			else sparseVec[keyId].Val += coef * kd.Dat;
		} }
	else if (col.type == TAttrType::Time) { 
		fltVal += coef * col.timeVals[rowNo].GetFlt(); }
	else
		IAssert(false); 
}

void TCentroidComponent::Add(const TDataColumn &col, const TCentroidComponent& other, double coef)
{
	if (col.type == TAttrType::Categorical) {
		const int n = denseVec.Len(); IAssert(n == other.denseVec.Len());
		for (int i = 0; i < n; ++i) denseVec[i].Val += coef * other.denseVec[i].Val; }
	else if (col.type == TAttrType::Numeric) {
		if (col.subType == TAttrSubtype::Flt) fltVal += coef * other.fltVal;
		else if (col.subType == TAttrSubtype::Int) fltVal += coef * other.fltVal;
		else IAssert(false); }
	else if (col.type == TAttrType::Text) {
		sparseVec2 = -1; sparseVec2Valid = false;
		const auto &OSV = other.sparseVec;
		for (auto otherKeyId = OSV.FFirstKeyId(); OSV.FNextKeyId(otherKeyId); )
		{
			const auto key = OSV.GetKey(otherKeyId); const double otherDat = OSV[otherKeyId];
			auto ourKeyId = sparseVec.GetKeyId(key);
			if (ourKeyId < 0) sparseVec.AddDat(key, coef * otherDat);
			else sparseVec[ourKeyId].Val += coef * otherDat;
		} }
	else if (col.type == TAttrType::Time) { 
		fltVal += coef * other.fltVal; }
	else
		IAssert(false); 
}

void TCentroidComponent::MulBy(double coef)
{
	fltVal *= coef;
	for (TFlt &x : denseVec) x.Val *= coef;
	for (auto keyId = sparseVec.FFirstKeyId(); sparseVec.FNextKeyId(keyId); ) 
		sparseVec[keyId].Val *= coef; 
	if (sparseVec2Valid) sparseVec2 *= coef * coef;
}

double TCentroidComponent::GetSparseVec2() const
{
	if (! sparseVec2Valid) {
		sparseVec2 = 0; 
		for (auto keyId = sparseVec.FFirstKeyId(); sparseVec.FNextKeyId(keyId); ) {
			double val = sparseVec[keyId]; sparseVec2 += val * val; }
		sparseVec2Valid = true; }
	return sparseVec2;
}

PJsonVal TCentroidComponent::SaveToJson(const TDataset& dataset, int colNo) const
{
	PJsonVal vComp = TJsonVal::NewObj();
	TDataColumn col = dataset.cols[colNo];
	vComp->AddToObj("attrName", col.name);
	if (col.type == TAttrType::Numeric) vComp->AddToObj("value", fltVal);
	else if (col.type == TAttrType::Categorical)
	{
		PJsonVal vArr = TJsonVal::NewArr(); vComp->AddToObj("values", vArr);
		int nKeys = -1;
		if (col.subType == TAttrSubtype::Int) nKeys = col.intKeyMap.Len();
		else if (col.subType == TAttrSubtype::String) nKeys = col.strKeyMap.Len();
		else IAssert(false);
		IAssert(nKeys == denseVec.Len());
		for (int i = 0; i < nKeys; ++i) 
		{
			PJsonVal vVal = TJsonVal::NewObj(); vArr->AddToArr(vVal);
			if (col.subType == TAttrSubtype::Int) vVal->AddToObj("key", col.intKeyMap.GetKey(i).Val);
			else if (col.subType == TAttrSubtype::String) vVal->AddToObj("key", col.strKeyMap.GetKey(i));
			vVal->AddToObj("value", denseVec[i].Val);
		}
	}
	else if (col.type == TAttrType::Time)
	{
		if (col.timeType == TTimeType::Flt || col.timeType == TTimeType::Int)
			vComp->AddToObj("value", fltVal);
		else if (col.timeType == TTimeType::Time)
		{
			vComp->AddToObj("fltValue", fltVal);
			TTimeStamp ts; ts.SetTime(fltVal);
			vComp->AddToObj("value", ts.ToStr());
		}
		else IAssert(false);
	}
	else if (col.type == TAttrType::Text)
	{
		// QW ToDo, build a 'values' array similar to categorical attributes, but using this->sparseVec
		IAssert(false);
	}
	return vComp;
}

//-----------------------------------------------------------------------------
//
// THistogram
//
//-----------------------------------------------------------------------------

void THistogram::Init(const TDataColumn& col, int nBuckets_, const TIntV& rowNos) 
{
	Clr();
	if (col.type == TAttrType::Numeric) 
	{
		nBuckets = nBuckets_; bounds.Gen(nBuckets + 1);
		freqs.Gen(nBuckets); freqs.PutAll(0);
		if (col.subType == TAttrSubtype::Int) 
		{
			int minVal = 0, maxVal = 0;
			bool first = true; for (const TInt& val : col.intVals) {
				if (first || val < minVal) minVal = val;
				if (first || val > maxVal) maxVal = val;
				first = false; } 
			for (int bucketNo = 0; bucketNo <= nBuckets; ++bucketNo) bounds[bucketNo] = minVal + (maxVal - minVal) * double(bucketNo) / double(nBuckets <= 1 ? 1 : nBuckets);
			for (const int rowNo : rowNos) {
				const int val = col.intVals[rowNo];
				int bucketNo;
				if (val <= minVal) bucketNo = 0;
				else if (val >= maxVal) bucketNo = nBuckets - 1;
				else bucketNo = (int) ((((long long) (val - minVal)) * nBuckets) / (maxVal - minVal));
				freqs[bucketNo].Val += 1; ++freqSum; }
		}
		else if (col.subType == TAttrSubtype::Flt)
		{
			double minVal = 0, maxVal = 0;
			bool first = true; for (const TFlt& val : col.fltVals) {
				if (first || val < minVal) minVal = val;
				if (first || val > maxVal) maxVal = val;
				first = false; } 
			for (int bucketNo = 0; bucketNo <= nBuckets; ++bucketNo) bounds[bucketNo] = minVal + (maxVal - minVal) * double(bucketNo) / double(nBuckets <= 1 ? 1 : nBuckets);
			for (const int rowNo : rowNos) {
				const TFlt val = col.fltVals[rowNo];
				int bucketNo;
				if (val <= minVal) bucketNo = 0;
				else if (val >= maxVal) bucketNo = nBuckets - 1;
				else bucketNo = (int) floor((val - minVal) * nBuckets / (maxVal - minVal));
				if (bucketNo < 0) bucketNo = 0; else if (bucketNo >= nBuckets) bucketNo = nBuckets - 1;
				freqs[bucketNo].Val += 1; ++freqSum; }
		}
		else IAssert(false);
	}
	else if (col.type == TAttrType::Categorical) 
	{
		if (col.subType == TAttrSubtype::Int) nBuckets = col.intKeyMap.Len(); 
		else if (col.subType == TAttrSubtype::String) nBuckets = col.strKeyMap.Len();
		else IAssert(false);
		freqs.Gen(nBuckets); freqs.PutAll(0);
		for (const int rowNo : rowNos) freqs[col.intVals[rowNo].Val].Val += 1; 
	}
	else if (col.type == TAttrType::Text) 
		IAssert(false); // ToDo: not implemented yet.  Do we even want histograms for text attributes?
	else if (col.type == TAttrType::Time) {
		if (col.timeType == TTimeType::Time) 
		{
			dowFreqs.Gen(7); monthFreqs.Gen(12); hourFreqs.Gen(24);
			dowFreqs.PutAll(0); monthFreqs.PutAll(0); hourFreqs.PutAll(0); 
			for (const int rowNo : rowNos)
			{
				const TTimeStamp &ts = col.timeVals[rowNo];
				TSecTm secTm(ts.type == TTimeType::Flt ? uint(floor(ts.flt)) : ts.sec);
				dowFreqs[secTm.GetDayOfWeekN() - 1].Val += 1;
				monthFreqs[secTm.GetMonthN() - 1].Val += 1;
				hourFreqs[secTm.GetHourN()].Val += 1; ++freqSum;
			}
		}
	}
	else
		IAssert(false); // invalid type
}

PJsonVal THistogram::SaveToJson(const TDataColumn &col) const
{
	PJsonVal vResult = TJsonVal::NewObj();
	vResult->AddToObj("attrName", col.name);
	vResult->AddToObj("freqSum", freqSum);
	if (freqs.Len() > 0) vResult->AddToObj("freqs", TJsonVal::NewArr(freqs));
	if (bounds.Len() > 0) vResult->AddToObj("bounds", TJsonVal::NewArr(bounds));
	if (dowFreqs.Len() > 0) vResult->AddToObj("dayOfWeekFreqs", TJsonVal::NewArr(dowFreqs));
	if (monthFreqs.Len() > 0) vResult->AddToObj("monthFreqs", TJsonVal::NewArr(monthFreqs));
	if (hourFreqs.Len() > 0) vResult->AddToObj("hourFreqs", TJsonVal::NewArr(hourFreqs));
	if (col.type == TAttrType::Categorical)
	{
		PJsonVal vKeys = TJsonVal::NewArr();
		for (int keyId = 0; keyId < nBuckets; ++keyId)
			if (col.subType == TAttrSubtype::Int) vKeys->AddToArr(TJsonVal::NewNum(col.intKeyMap.GetKey(keyId)));
			else if (col.subType == TAttrSubtype::String) vKeys->AddToArr(TJsonVal::NewStr(col.strKeyMap.GetKey(keyId)));
			else IAssert(false);
	}
	return vResult;
}

void THistogram::CalcHistograms(THistogramV& dest, const TDataset& dataset, const TIntV& rowNos, bool allRows, int nBucketsOverride)
{
	const int nCols = dataset.cols.Len(); dest.Clr(); dest.Gen(nCols);
	TIntV allRowNos; if (allRows) for (int rowNo = 0; rowNo < dataset.nRows; ++rowNo) allRowNos.Add(rowNo); 
	int nBuckets = (nBucketsOverride >= 0) ? nBucketsOverride : dataset.config->numHistogramBuckets;
	for (int colNo = 0; colNo < nCols; ++colNo) {
		PHistogram hist = new THistogram(); dest[colNo] = hist;
		hist->Init(dataset.cols[colNo], nBuckets, allRows ? allRowNos : rowNos); }
}

//-----------------------------------------------------------------------------
//
// TState
//
//-----------------------------------------------------------------------------

bool TStateLabel::SetIfBetter(int nCoveredInState_, int nStateMembers, int nCoveredTotal, int nAllInstances, double eps, int nBuckets) 
{
	// We'll outright reject labels that cover a less than average number of state members.
	if (nCoveredInState_ * nBuckets < nStateMembers) return false;
	// Otherwise, keep the label with the best odds-ratio.
	int nNotCoveredInState_ = nStateMembers - nCoveredInState_;
	int nCoveredOutsideState_ = nCoveredTotal - nCoveredInState_;
	int nNotCoveredOutsideState_ = (nAllInstances - nStateMembers) - nCoveredOutsideState_;
	// OddsRatio = Odds(Covered | InState) / Odds(Covered | OutsideState) = 
	//             (nCoveredInState / nNotCoveredInState) / (nCoveredOutsideState / nNotCoveredOutsideState) 
	eps = 0.1;
	double candOddsRatio = (log(nCoveredInState_ + eps) - log(nNotCoveredInState_ + eps)) - (log(nCoveredOutsideState_ + eps) - log(nNotCoveredOutsideState_ + eps));
	if (isnan(logOddsRatio) || candOddsRatio > logOddsRatio) {
		logOddsRatio = candOddsRatio; nCoveredInState = nCoveredInState_; nNotCoveredInState = nNotCoveredInState_; nCoveredOutsideState = nCoveredOutsideState_; nNotCoveredOutsideState = nNotCoveredOutsideState_; 
		return true; }
	return false; 
}

void TState::InitCentroid0(const TDataset& dataset) 
{ 
	const int nCols = dataset.cols.Len(); centroid.Gen(nCols); 
	for (int colNo = 0; colNo < nCols; ++colNo) centroid[colNo].Clr(dataset.cols[colNo]); 
}

void TState::AddToCentroid(const TDataset& dataset, int rowNo, double coef)
{
	const int nCols = centroid.Len(); IAssert(dataset.cols.Len() == nCols);
	for (int iCol = 0; iCol < nCols; ++iCol) centroid[iCol].Add(dataset.cols[iCol], rowNo, coef);
}

void TState::AddToCentroid(const TDataset& dataset, const TCentroidComponentV& other, double coef)
{
	const int nCols = centroid.Len(); IAssert(dataset.cols.Len() == nCols); IAssert(other.Len() == nCols);
	for (int iCol = 0; iCol < nCols; ++iCol) centroid[iCol].Add(dataset.cols[iCol], other[iCol], coef);
}

void TState::CalcLabels(const TDataset& dataset, const TStateV& states, const THistogramV& totalHists)
{ 
	double eps = dataset.nRows / double(TInt::GetMx(states.Len(), 1));
	for (int stateNo = 0; stateNo < states.Len(); ++stateNo) 
		states[stateNo]->CalcLabel(dataset, stateNo, totalHists, eps); 
}

TStr TTimeStamp::GetDowName(int dowOneBased)
{
	static const char *dowNames[] = { "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" };
	Assert(1 <= dowOneBased); Assert(dowOneBased <= 7);
	return dowNames[dowOneBased - 1];
}

TStr TTimeStamp::GetMonthName(int monthOneBased)
{
	static const char *monthNames[] = { "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" };
	Assert(1 <= monthOneBased); Assert(monthOneBased <= 12);
	return monthNames[monthOneBased - 1];
}

void TState::CalcLabel(const TDataset& dataset, int thisStateNo, const THistogramV& totalHists, double eps)
{
	TStateLabel &bestLabel = this->label; bestLabel = TStateLabel(); bestLabel.label = TInt::GetStr(thisStateNo);
	static const char *bucketNames[] = { "LOWEST", "LOW", "MEDIUM", "HIGH", "HIGHEST", "ERROR" };
	const int nStateMembers = members.Len(), nAllInstances = dataset.nRows;
	for (int colNo = 0; colNo < dataset.cols.Len(); ++colNo) 
	{
		THistogram hist; hist.Init(dataset.cols[colNo], 5, members); 
		const THistogram& totalHist = *totalHists[colNo]; IAssert(hist.nBuckets == totalHist.nBuckets);
		const TDataColumn &col = dataset.cols[colNo];
		if (col.type == TAttrType::Numeric) 
		{ 
			IAssert(hist.nBuckets == 5);
			for (int bucketNo = 0; bucketNo < hist.nBuckets; ++bucketNo)
				if (bestLabel.SetIfBetter(hist.freqs[bucketNo], nStateMembers, totalHist.freqs[bucketNo], nAllInstances, eps, hist.freqs.Len()))
					bestLabel.label = col.userFriendlyLabel + " " + (0 <= bucketNo && bucketNo < 5 ? bucketNames[bucketNo] : bucketNames[5]); 
		}
		else if (col.type == TAttrType::Categorical) 
		{
			for (int bucketNo = 0; bucketNo < hist.nBuckets; ++bucketNo)
				if (bestLabel.SetIfBetter(hist.freqs[bucketNo], nStateMembers, totalHist.freqs[bucketNo], nAllInstances, eps, hist.freqs.Len())) {
					bestLabel.label = col.userFriendlyLabel + " = "; 
					if (col.subType == TAttrSubtype::String) bestLabel.label += col.strKeyMap[bucketNo];
					else if (col.subType == TAttrSubtype::Int) bestLabel.label += TInt::GetStr(col.intKeyMap[bucketNo]);
					else IAssert(false); } 
		}
		else if (col.type == TAttrType::Time && col.timeType == TTimeType::Time)
		{
			for (int bucketNo = 0; bucketNo < 24; ++bucketNo) if (bestLabel.SetIfBetter(hist.hourFreqs[bucketNo], nStateMembers, totalHist.hourFreqs[bucketNo], nAllInstances, eps, hist.hourFreqs.Len())) bestLabel.label = "HOUR(" + col.userFriendlyLabel + ") = " + TInt::GetStr(bucketNo); 
			for (int bucketNo = 0; bucketNo < 12; ++bucketNo) if (bestLabel.SetIfBetter(hist.monthFreqs[bucketNo], nStateMembers, totalHist.monthFreqs[bucketNo], nAllInstances, eps, hist.monthFreqs.Len())) bestLabel.label = col.userFriendlyLabel + " = " + TTimeStamp::GetMonthName(bucketNo + 1); 
			for (int bucketNo = 0; bucketNo < 7; ++bucketNo) if (bestLabel.SetIfBetter(hist.dowFreqs[bucketNo], nStateMembers, totalHist.dowFreqs[bucketNo], nAllInstances, eps, hist.dowFreqs.Len())) bestLabel.label = col.userFriendlyLabel + " = " + TTimeStamp::GetDowName(bucketNo + 1);
		}
	}
}

PJsonVal TState::SaveToJson(int thisStateNo, const TDataset& dataset, const PStatePartition& nextLowerScale) const
{
	PJsonVal vState = TJsonVal::NewObj();
	vState->AddToObj("stateNo", TJsonVal::NewNum(thisStateNo));
	vState->AddToObj("initialStates", TJsonVal::NewArr(initialStates));
	vState->AddToObj("nMembers", TJsonVal::NewNum(members.Len()));
	vState->AddToObj("xCenter", TJsonVal::NewNum(xCenter));
	vState->AddToObj("yCenter", TJsonVal::NewNum(yCenter));
	vState->AddToObj("radius", TJsonVal::NewNum(radius));
	PJsonVal vLabel = TJsonVal::NewObj(); vState->AddToObj("suggestedLabel", vLabel);
	vLabel->AddToObj("label", label.label);
	vLabel->AddToObj("nCoveredInState", label.nCoveredInState);
	vLabel->AddToObj("nCoveredOutsideState", label.nCoveredOutsideState);
	vLabel->AddToObj("nNotCoveredInState", label.nNotCoveredInState);
	vLabel->AddToObj("nNotCoveredOutsideState", label.nNotCoveredOutsideState);
	vLabel->AddToObj("logOddsRatio", label.logOddsRatio);
	PJsonVal vCentroid = TJsonVal::NewArr(); vState->AddToObj("centroid", vCentroid);
	PJsonVal vHistograms; if (dataset.config->includeHistograms) { vHistograms = TJsonVal::NewArr(); vState->AddToObj("histograms", vHistograms); }
	for (int colNo = 0; colNo < centroid.Len(); ++colNo)
	{
		vCentroid->AddToArr(centroid[colNo].SaveToJson(dataset, colNo));
		if (dataset.config->includeHistograms) vHistograms->AddToArr(histograms[colNo]->SaveToJson(dataset.cols[colNo]));
	}
	if (! nextLowerScale.Empty())
	{
		TIntV childStates;
		for (int childStateNo = 0; childStateNo < nextLowerScale->aggStates.Len(); ++childStateNo)
		{
			TState &child = *(nextLowerScale->aggStates[childStateNo]);
			bool isChild = true;
			for (int initState : child.initialStates) if (! this->initialStates.IsIn(initState)) { isChild = false; break; }
			if (isChild) childStates.Add(childStateNo);
		}
		vState->AddToObj("childStates", TJsonVal::NewArr(childStates));
	}	
	if (! decTree.Empty()) vState->AddToObj("decisionTree", decTree->SaveToJson(dataset));
	return vState;
}

//-----------------------------------------------------------------------------
//
// TModel
//
//-----------------------------------------------------------------------------

void TModel::CalcTransMx(TFltV& statProbs, TFltVV& transMx) const
{
	const int n = initialStates.Len(), nRows = dataset->nRows; statProbs.Gen(n); statProbs.PutAll(0); 
	transMx.Gen(n, n); transMx.PutAll(0);
	for (int i = 0; i < nRows; ++i) {
		int si = rowToInitialState[i];
		statProbs[si].Val += 1;
		if (i + 1 < nRows) { 
			int sj = rowToInitialState[i + 1];
			transMx(si, sj).Val += 1; } }
	for (int i = 0; i < n; ++i) {
		if (nRows > 0) statProbs[i].Val /= double(nRows);
		double total = 0; for (int j = 0; j < n; ++j) total += transMx(i, j);
		if (total > 0) for (int j = 0; j < n; ++j) transMx(i, j).Val /= total; }
}

void TModel::BuildRowToInitialState()
{
	const int nRows = dataset->nRows;
	rowToInitialState.Gen(nRows); rowToInitialState.PutAll(-1);
	int total = 0;
	for (int stateNo = 0; stateNo < initialStates.Len(); ++stateNo)
	{
		const TState &state = *initialStates[stateNo];
		for (int rowNo : state.members) { 
			IAssert(rowToInitialState[rowNo] < 0); 
			rowToInitialState[rowNo] = stateNo; ++total; }
	}
	IAssert(total == nRows);
}

void TModel::CalcStatePositions()
{
	const int nScales = statePartitions.Len();
	// Use SVD for the initial placement of the initial states.
	statePartitions[0]->CalcRadiuses();
	statePartitions[0]->CalcCentersUsingSvd(*dataset);
	// For aggregated states, their position is the average of the positions of the initial states.
	for (int scaleNo = 1; scaleNo < nScales; ++scaleNo)
	{
		statePartitions[scaleNo]->CalcRadiuses();
		TStatePartition &scale = *statePartitions[scaleNo];
		for (const PState& aggState : scale.aggStates)
		{
			const TIntV& v = aggState->initialStates;
			double xSum = 0, ySum = 0; for (int initStateNo : v) {
				TState &S = *initialStates[initStateNo];
				xSum += S.xCenter; ySum += S.yCenter; }
			aggState->xCenter = xSum / double(TMath::Mx(1, v.Len()));
			aggState->yCenter = ySum / double(TMath::Mx(1, v.Len()));
		}
	}
	// We'll move the states apart if needed to prevent overlap.    However,
	// if two states at different scales are identical (composed of the same set of initial states),
	// we'll keep them in the same place.  For this purpose it's useful to know if a state is the
	// same as its parent (at the next higher scale) or child (at the next lower scale).
	struct TSamePr { int parent, child; };
	TVec<TVec<TSamePr>> sameAs; sameAs.Gen(nScales);
	for (int scaleNo = 0; scaleNo < nScales; ++scaleNo) { auto &v = sameAs[scaleNo];
		v.Gen(statePartitions[scaleNo]->aggStates.Len()); v.PutAll({-1, -1}); }
	for (int scaleNo = 0; scaleNo < nScales - 1; ++scaleNo)
	{
		const TStatePartition &scale = *statePartitions[scaleNo]; int nStates = scale.aggStates.Len();
		const TStatePartition &parentScale = *statePartitions[scaleNo + 1]; int nParentStates = parentScale.aggStates.Len();
		for (int stateNo = 0; stateNo < nStates; ++stateNo)
		{
			const TIntV& v = scale.aggStates[stateNo]->initialStates; IAssert(v.IsSorted());
			for (int parentStateNo = 0; parentStateNo < nParentStates; ++parentStateNo)
				if (v == parentScale.aggStates[parentStateNo]->initialStates) { 
					sameAs[scaleNo][stateNo].parent = parentStateNo; sameAs[scaleNo + 1][parentStateNo].child = stateNo; break; }
		}
	}
	// Keep moving states apart until they stop overlapping.
	TRnd rnd(123);
	const double STEP_FACTOR = 0.02, OVERLAP_EXTRA = 1.1;
	while (true)
	{
		bool anyChanges = false;
		for (int scaleNo = 0; scaleNo < nScales; ++scaleNo)
		{
			TStatePartition &scale = *statePartitions[scaleNo]; int nStates = scale.aggStates.Len();
			TIntV order; order.Gen(nStates); for (int stateNo = 0; stateNo < nStates; ++stateNo) order[stateNo] = stateNo;
			order.Shuffle(rnd);
			// Check states at this scale for overlap, in a random order.
			for (int i = 0; i < nStates - 1; ++i) 
			{
				TState &state = *scale.aggStates[order[i]];
				for (int j = i + 1; j < nStates; ++j)
				{
					TState &otherState = *scale.aggStates[order[j]];
					double dx = state.xCenter - otherState.xCenter, dy = state.yCenter - otherState.yCenter;
					double dist = sqrt(dx * dx + dy * dy);
					if (dist > (state.radius + otherState.radius) * OVERLAP_EXTRA) continue; // no overlap
					anyChanges = true;
					// Move state i away from state j.
					if (dist < 1e-6) { double angle = rnd.GetUniDev() * 2 * TMath::Pi; dx = cos(angle); dy = sin(angle); dist = 1; }
					state.xCenter += dx * STEP_FACTOR / dist; 
					state.yCenter += dy * STEP_FACTOR / dist;
					if (isnan(state.xCenter) || isnan(state.yCenter))
						printf("!");
					// Propagate this change to identical states at other scales.
					for (int curScale = scaleNo, stateNo = order[i]; curScale > 0; ) {
						stateNo = sameAs[curScale][stateNo].child; if (stateNo < 0) break;
						TState &nextState = *statePartitions[--curScale]->aggStates[stateNo];
						nextState.xCenter = state.xCenter; nextState.yCenter = state.yCenter; }
					for (int curScale = scaleNo, stateNo = order[i]; curScale + 1 < nScales; ) {
						stateNo = sameAs[curScale][stateNo].parent; if (stateNo < 0) break;
						TState &nextState = *statePartitions[++curScale]->aggStates[stateNo];
						nextState.xCenter = state.xCenter; nextState.yCenter = state.yCenter; }
				}
			}
		}
		if (! anyChanges) break;
	}
}

void TModel::BuildDecTrees(int maxDepth, double minEntropyToSplit, double minNormInfGainToSplit)
{
	const int nRows = dataset->nRows, nInitialStates = initialStates.Len();
	for (const PStatePartition &scale : statePartitions)
	{
		// Prepare a mapping of initial states to aggregate states at this scale.
		TIntV iniToAgg; iniToAgg.Gen(nInitialStates);
		int nAggStates = scale->aggStates.Len(); iniToAgg.PutAll(-1);
		for (int aggStateNo = 0; aggStateNo < nAggStates; ++aggStateNo)
			for (int iniStateNo : scale->aggStates[aggStateNo]->initialStates) 
				iniToAgg[iniStateNo] = aggStateNo;
		// Build decision trees for all the aggregate states.
		for (int aggStateNo = 0; aggStateNo < nAggStates; ++aggStateNo)
		{
			const PState &state = scale->aggStates[aggStateNo];
			// Prepare a list of rows that belond to the state and a list of those that don't.
			TIntV posList, negList; 
			for (int rowNo = 0; rowNo < nRows; ++rowNo)
			{
				int iniStateNo = rowToInitialState[rowNo]; IAssert(iniStateNo >= 0);
				int aggStateNo2 = iniToAgg[iniStateNo]; IAssert(aggStateNo >= 0);
				(aggStateNo2 == aggStateNo ? posList : negList).Add(rowNo);
			}
			IAssert(posList.Len() == state->members.Len());
			TBoolV attrToIgnore; attrToIgnore.Gen(dataset->cols.Len()); attrToIgnore.PutAll(false);
			// Build the tree.
			NotifyInfo("TModel::BuildDecTrees %d/%d\n", aggStateNo, scale->aggStates.Len());
			state->decTree = TDecTreeNode::New(*dataset, posList, negList, attrToIgnore, maxDepth, minEntropyToSplit, minNormInfGainToSplit);
		}
	}
}

PJsonVal TModel::SaveToJson() const
{
	PJsonVal vModel = TJsonVal::NewObj();
	PJsonVal vScales = TJsonVal::NewArr(); vModel->AddToObj("scales", vScales);
	for (int scaleNo = 0; scaleNo < statePartitions.Len(); ++scaleNo)
	{
		const PStatePartition scale = statePartitions[scaleNo];
		PJsonVal vScale = scale->SaveToJson(*dataset, scale->aggStates.Len() == initialStates.Len(), (scaleNo == 0) ? PStatePartition{} : statePartitions[scaleNo - 1]);
		vScales->AddToArr(vScale);
	}
	// Save the histograms of the entire dataset (as opposed to state-specific ones).
	if (dataset->config->includeHistograms)
	{
		PJsonVal vHistograms = TJsonVal::NewArr(); vModel->AddToObj("totalHistograms", vHistograms);
		for (int colNo = 0; colNo < totalHistograms.Len(); ++colNo)
			vHistograms->AddToArr(totalHistograms[colNo]->SaveToJson(dataset->cols[colNo]));
	}
	if (dataset->config->includeStateHistory)
	{
		// To save the state history, we have to find the time column first.
		int timeColNo = -1; TTimeType timeType; TAttrSubtype timeSubType; TStr timeFormatStr;
		for (int colNo = 0; colNo < dataset->cols.Len(); ++colNo) {
			const TDataColumn &col = dataset->cols[colNo];
			if (col.type == TAttrType::Time) { timeColNo = colNo; timeType = col.timeType; timeSubType = col.subType; timeFormatStr = col.formatStr; break; } }
		// We'll save two arrays, where the state 'stateHistoryInitialStates[i]' applies 
		// from time 'stateHistoryTimes[i]' to time 'stateHistoryTimes[i + 1]'.
		PJsonVal vShTimes = TJsonVal::NewArr(); vModel->AddToObj("stateHistoryTimes", vShTimes);
		PJsonVal vShStates = TJsonVal::NewArr(); vModel->AddToObj("stateHistoryInitialStates", vShStates);
		int prevState = -1; const int nRows = dataset->nRows;
		for (int rowNo = 0; rowNo <= nRows; ++rowNo)
		{
			int curState = (rowNo < nRows) ? rowToInitialState[rowNo].Val : prevState; 
			if (rowNo < nRows && curState == prevState) continue;
			prevState = curState;
			// If no time column was found, we'll use row numbers instead of times.
			if (timeColNo < 0) vShTimes->AddToArr(rowNo);
			else
			{
				// Otherwise save the timestamp in a suitable format, depending on the subType of the time column.
				const TTimeStamp &ts = dataset->cols[timeColNo].timeVals[rowNo < nRows ? rowNo : nRows - 1];
				if (timeSubType == TAttrSubtype::String) {
					TSecTm secTm; int ns; ts.GetSecTm(secTm, ns); vShTimes->AddToArr(StrFTime_HomeGrown(timeFormatStr.CStr(), secTm, ns)); }
				else if (timeSubType == TAttrSubtype::Int) vShTimes->AddToArr((double) ts.GetInt());
				else if (timeSubType == TAttrSubtype::Flt) vShTimes->AddToArr((double) ts.GetFlt());
				else IAssert(false);
			}
			if (rowNo < nRows) vShStates->AddToArr(curState);
		}
		NotifyInfo("TModel::SaveToJson: %d rows -> %d/%d stateHistory times/states\n", nRows, vShTimes->GetArrVals(), vShStates->GetArrVals());
	}
	return vModel;
}

//-----------------------------------------------------------------------------
//
// TKMeansRunner
//
//-----------------------------------------------------------------------------

void TKMeansRunner::SelectInitialCentroids(TIntV& dest)
{
	if (nStates >= nRows) { dest.Gen(nStates); for (int i = 0; i < nStates; ++i) dest[i] = i % nRows; return; }
	// Choose a few instances at random as centroids, but try to make sure that they are as far apart
	// from each other as possible.  What we'll maximize is the sum, over all centroids, of the
	// distance from that centroid to the nearest other centroid.
	double bestScore = -1; dest.Clr();
	for (int nTries = 0; nTries < 30; ++nTries)
	{
		TIntV centroids(nStates); 
		for (int i = 0; i < nStates; ) {
			centroids[i] = rnd.GetUniDevInt(nRows);
			bool ok = true; for (int j = 0; j < i; ++j) if (centroids[i] == centroids[j]) { ok = false; break; }
			if (ok) ++i; }
		double score = 0; for (int i = 0; i < nStates; ++i) {
			bool first = true; double nNeigh = -1;
			for (int j = 0; j < nStates; ++j) if (j != i) {
				double dist = dataset.RowDist2(centroids[i], centroids[j]);
				if (first || dist < nNeigh) first = false, nNeigh = dist; }
			score += nNeigh; }
		if (nTries == 0 || score > bestScore) bestScore = score, dest = centroids;
	}
}

void TKMeansRunner::Go()
{
	// Prepare the initial states with a random selection of centroids.
	TIntV initialCentroids; SelectInitialCentroids(initialCentroids);
	states.Gen(nStates); // distances.Gen(nRows, nStates);
	for (int stateNo = 0; stateNo < nStates; ++stateNo) {
		states[stateNo] = new TState();
		TState &state = *states[stateNo]; state.members.Clr(); state.InitCentroid0(dataset); }
	// Assign each row to the nearest centroid.
	double quality = 0; TIntV memberships(nRows); memberships.PutAll(-1);
	for (int rowNo = 0; rowNo < nRows; ++rowNo) {
		int bestState = -1; double bestDist = -1;
		for (int stateNo = 0; stateNo < nStates; ++stateNo) {
			double dist = dataset.RowDist2(rowNo, initialCentroids[stateNo]);
			if (bestState < 0 || dist < bestDist || rowNo == initialCentroids[stateNo]) {
				bestState = stateNo, bestDist = dist;
				// Make sure that if some row has been selected as the initial centroid of a state, it actually gets assigned to this state.  
				// This should be trivial except if there are several identical rows.
				if (rowNo == initialCentroids[stateNo]) break; } }
		TState &state = *(states[bestState]); 
		quality += sqrt(bestDist); memberships[rowNo] = bestState;
		state.members.Add(rowNo); state.AddToCentroid(dataset, rowNo, 1.0); }
	for (const PState& state : states) state->MulCentroidBy(1.0 / TFlt::GetMx(1, state->members.Len()));
	// Perform a few iterations of reassignment.
	const int MaxReassignmentPhases = 10;
	const double MinRelQualityImprovement = 0.01;
	const double MinRelReassignments = 0.01;
	for (int phaseNo = 0; phaseNo < MaxReassignmentPhases; ++phaseNo)
	{
		double newQuality = 0; TIntV newMemberships(nRows); newMemberships.PutAll(-1);
		// For each row, determine the nearest centroid.
		for (int rowNo = 0; rowNo < nRows; ++rowNo) {
			int bestState = -1; double bestDist = -1;
			for (int stateNo = 0; stateNo < nStates; ++stateNo) {
				double dist = dataset.RowCentrDist2(rowNo, states[stateNo]->centroid);
				if (bestState < 0 || dist < bestDist) bestState = stateNo, bestDist = dist; }
			newQuality += sqrt(bestDist); newMemberships[rowNo] = bestState; }
		// Clear the old membership and centroid info.
		for (int stateNo = 0; stateNo < nStates; ++stateNo) {
			TState &state = *(states[stateNo]); state.members.Clr(); state.InitCentroid0(dataset); }
		// Perform the reassignments and recalculate the centroids.
		int nMoves = 0;
		for (int rowNo = 0; rowNo < nRows; ++rowNo) {
			const int stateNo = newMemberships[rowNo]; if (stateNo != memberships[rowNo]) ++nMoves; 
			TState &state = *(states[stateNo]); state.members.Add(rowNo); state.AddToCentroid(dataset, rowNo, 1.0); }
		for (const PState& state : states) state->MulCentroidBy(1.0 / TFlt::GetMx(1, state->members.Len()));
		// Verify the termination conditions.
		bool shouldStop = false;
		if (newQuality > quality * (1 + MinRelQualityImprovement)) shouldStop = true; // the quality is no longer improving enough
		if (nMoves < nRows * MinRelReassignments) shouldStop = true; // not enough rows are being reassignment, the clustering looks stable enough
		NotifyInfo("TKMeansRunner::Go: phase %d/%d: %d/%d moves (%.2f %%), quality %.3f -> %.3f (= %.2f %%)\n", phaseNo, int(MaxReassignmentPhases),
			nMoves, nRows, nMoves * 100.0 / TFlt::GetMx(1, nRows), quality, newQuality, (newQuality / TFlt::GetMx(abs(newQuality) * 1e-8, quality) - 1.0) * 100.0);
		//
		quality = newQuality; memberships = newMemberships;
		if (shouldStop) break;
	}
	model.BuildRowToInitialState();
}

//-----------------------------------------------------------------------------
//
// TStatePartition
//
//-----------------------------------------------------------------------------

void TStatePartition::CalcTransMx(const TFltVV& initStateTransMx, const TFltV& initStateStatProbs)
{
	const int nAggStates = aggStates.Len(), nInitStates = initToAggState.Len(); 
	IAssert(initStateStatProbs.Len() == nInitStates);
	IAssert(initStateTransMx.GetXDim() == nInitStates); IAssert(initStateTransMx.GetYDim() == nInitStates);
	// Compute the stationary probabilities of the aggregate states.
	statProbs.Gen(nAggStates); statProbs.PutAll(0);
	for (int initStateNo = 0; initStateNo < nInitStates; ++initStateNo)
		statProbs[initToAggState[initStateNo]] += initStateStatProbs[initStateNo];
	if (true) {
		fprintf(stderr, "CalcTransMx(%d): statProbs [", nAggStates);
		for (int i = 0; i < nAggStates; ++i) fprintf(stderr, " %.4f", statProbs[i].Val); 
		fprintf(stderr, " ]\n"); }
	// Compute joint probabilities P(next = j, cur = i) for the aggregate states.
	transMx.Gen(nAggStates, nAggStates); transMx.PutAll(0);
	for (int i = 0; i < nInitStates; ++i) for (int j = 0; j < nInitStates; ++j)
		transMx(initToAggState[i], initToAggState[j]) += initStateTransMx(i, j) * initStateStatProbs[i];
	// Change them into conditional probabilities P(next = j | cur = i).
	for (int i = 0; i < nAggStates; ++i) 
	{
		double totalProb = 0; for (int j = 0; j < nAggStates; ++j) totalProb += transMx(i, j);
		IAssert(abs(totalProb - statProbs[i]) <= 1e-6 * statProbs[i]);
		double coef = (totalProb <= 1e-16) ? 0 : 1.0 / totalProb;
		for (int j = 0; j < nAggStates; ++j) transMx(i, j).Val *= coef;
	}
}

void TStatePartition::CalcEigenVals()
{
	const int n = aggStates.Len();  
	TFltVV eigenVectors; 
	/*
	TFltVV unitMx; unitMx.Gen(n, n);
	TLinAlgTransform::FillIdentity(unitMx);
	TLinAlg::GeneralizedEigDecomp(transMx, unitMx, eigenVals, eigenVectors);
	*/
	enum { verbose = true };
	if (verbose) fprintf(stderr, "EigenVals(%d) ", n);
	eigenVals.Gen(n); eigenVectors.Gen(n, n); TRnd rnd(123 + n);
	for (int i = 0; i < n; ++i)
	{
		TFltV x, y; TLinAlgTransform::FillRnd(n, x, rnd); y.Gen(n);
		TLinAlg::Normalize(x);
		int nIter_ = 0; double xyDot_  = -1;
		for (int nIter = 0; nIter < 30; ++nIter)
		{
			// y = A * x
			y.PutAll(0); for (int j = 0; j < n; ++j) for (int k = 0; k < n; ++k) y[j] += transMx(j, k) * x[k];
			// project away the other eigenvectors found so far
			for (int ii = 0; ii < i; ++ii)
			{
				double dot = 0; for (int j = 0; j < n; ++j) dot += y[j] * eigenVectors(j, ii);
				for (int j = 0; j < n; ++j) y[j] -= dot * eigenVectors(j, ii);
			}
			TLinAlg::Normalize(y);
			double xyDot = TLinAlg::DotProduct(x, y);
			nIter_ = nIter + 1; xyDot_ = xyDot;
			if (xyDot >= 1 - 1e-5) break;
			std::swap(x, y);
		}
		if (verbose) fprintf(stderr, " %d:%g", nIter_, 1 - xyDot_);
		// Calculate the eigenvalue.  If x is an eigenvector, then Ax = lambda x
		// and thus x^T Ax = lambda x^T x.  But we made sure that x is normalized, so x^T x = 1,
		// so lambda = x^T Ax.
		y.PutAll(0); for (int j = 0; j < n; ++j) for (int k = 0; k < n; ++k) y[j] += transMx(j, k) * x[k];  // y = A * x
		double lambda = TLinAlg::DotProduct(x, y);
		for (int j = 0; j < n; ++j) eigenVectors(j, i) = x[j];
		eigenVals[i] = lambda;
	}
	if (verbose) { fprintf(stderr, " -> ["); for (int i = 0; i < n; ++i) fprintf(stderr, " %g", eigenVals[i].Val); fprintf(stderr, " ]\n"); }
	IAssert(eigenVals.Len() == n); IAssert(eigenVectors.GetXDim() == n); IAssert(eigenVectors.GetYDim() == n);
}

PJsonVal TStatePartition::SaveToJson(const TDataset& dataset, bool areTheseInitialStates, const PStatePartition& nextLowerScale) const
{
	PJsonVal vPartition = TJsonVal::NewObj();
	const int nStates = aggStates.Len();
	vPartition->AddToObj("nStates", TJsonVal::NewNum(nStates));
	PJsonVal vStates = TJsonVal::NewArr(); vPartition->AddToObj("states", vStates);
	for (int i = 0; i < nStates; ++i)
	{
		PJsonVal vState = aggStates[i]->SaveToJson(i, dataset, nextLowerScale); vStates->AddToArr(vState);
		vState->AddToObj("stationaryProbability", TJsonVal::NewNum(statProbs[i]));
		PJsonVal vNextProb = TJsonVal::NewArr(); vState->AddToObj("nextStateProbDistr", vNextProb);
		for (int j = 0; j < nStates; ++j) vNextProb->AddToArr(TJsonVal::NewNum(transMx(i, j)));
	}
	vPartition->AddToObj("areTheseInitialStates", TJsonVal::NewBool(areTheseInitialStates));
	return vPartition;
}

void PrintMatrix(const TFltVV& mx, const TStr& intro)
{
	int nRows = mx.GetRows(), nCols = mx.GetCols();
	printf("%s (%d rows * %d cols) = \n", intro.CStr(), nRows, nCols);
	for (int i = 0; i < nRows; ++i)
	{
		printf("  [");
		for (int j = 0; j < nCols; ++j)
			printf("  %10.3g", mx(i, j).Val);
		printf(" ]\n");
	}
	fflush(stdout);
}

void TStatePartition::CalcCentersUsingSvd(const TDataset& dataset)
{
	// First, calculate a (dense) centroid matrix; each state gets one column.
	int nDim = 0, nDim2 = 0, nStates = aggStates.Len(); 
	TFltVV centroidMx;
	for (int pass = 0; pass < 2; ++pass)
	{
		for (int colNo = 0; colNo < dataset.cols.Len(); ++colNo)
		{
			const TDataColumn &col = dataset.cols[colNo];
			double colWgt = sqrt(col.distWeight);
			if (col.type == TAttrType::Time) continue;
			else if (col.type == TAttrType::Numeric) 
			{
				if (pass == 0) { ++nDim; continue; }
				for (int stateNo = 0; stateNo < nStates; ++stateNo) {
					const TCentroidComponent &cc = aggStates[stateNo]->centroid[colNo];
					centroidMx(nDim2, stateNo) = colWgt * cc.fltVal; }
				++nDim2;
			}
			else if (col.type == TAttrType::Categorical)
			{
				int nComps = 0;
				if (col.subType == TAttrSubtype::Int) nComps = col.intKeyMap.Len();
				else if (col.subType == TAttrSubtype::String) nComps = col.strKeyMap.Len();
				else IAssert(false);
				if (pass == 0) { nDim += nComps; continue; }
				for (int stateNo = 0; stateNo < nStates; ++stateNo) {
					const TCentroidComponent &cc = aggStates[stateNo]->centroid[colNo];
					IAssert(cc.denseVec.Len() == nComps);
					for (int i = 0; i < nComps; ++i) centroidMx(nDim2 + i, stateNo) = colWgt * cc.denseVec[i]; }
				nDim2 += nComps;
			}
			else if (col.type == TAttrType::Text)
			{
				int nComps = 0; for (const auto &kd : col.sparseVecData) if (kd.Key + 1 > nComps) nComps = kd.Key + 1;
				if (pass == 0) { nDim += nComps; continue; } 
				for (int stateNo = 0; stateNo < nStates; ++stateNo) {
					const TCentroidComponent &cc = aggStates[stateNo]->centroid[colNo];
					for (const auto &kd : cc.sparseVec) centroidMx(nDim2 + kd.Key, stateNo) = colWgt * kd.Dat; }
				nDim2 += nComps;
			}
			else IAssert(false);
		}
		if (pass == 0) { centroidMx.Gen(nDim, nStates); centroidMx.PutAll(0); }
		else IAssert(nDim2 == nDim);
	}
	if (nDim == 1)
	{
		// If we have just one attribute, we can't use SVD to project it into two dimensions.
		// Instead we'll use the attribute as a polar angle and project the states along 
		// the edge of a unit circle.
		double minVal = 0, maxVal = 0;
		for (int stateNo = 0; stateNo < nStates; ++stateNo)
		{
			double val = centroidMx(0, stateNo);
			if (stateNo == 0 || val < minVal) minVal = val;
			if (stateNo == 0 || val > maxVal) maxVal = val;
		}
		double valRange = (maxVal - minVal) * nStates / double(TInt::GetMx(nStates - 1, 1));
		for (int stateNo = 0; stateNo < nStates; ++stateNo)
		{
			double val = centroidMx(0, stateNo);
			double angle = (valRange < 1e-8) ? 0 : ((val - minVal) / valRange * 2 * TMath::Pi);
			TState &state = *aggStates[stateNo];
			state.xCenter = cos(angle); state.yCenter = sin(angle);
		}
	}
	else
	{
		enum { verbose = false };
		if (verbose) PrintMatrix(centroidMx, "centroidMx");
		// Center its rows.
		TFullMatrix X1(centroidMx, true); TLinAlgTransform::CenterRows(X1.GetMat());
		if (verbose) PrintMatrix(X1.GetMat(), "X1");
		// Perform a thin SVD decomposition.
		TMatVecMatTr svd = X1.Svd(2);
		// We got X = U S V', where X is nDim * nStates, U is nDim * 2, S is 2 * 2 and diagonal,
		// and V' is 2 * nStates; hence V is nStates * 2.  The columns of S * V' are a good two-dimensional
		// representation of our states.
		IAssert(svd.Val2.Len() == 2);
		double s0 = svd.Val2[0], s1 = svd.Val2[1]; 
		auto V = svd.Val3.GetMat(); IAssert(V.GetRows() == nStates); IAssert(V.GetCols() == 2);
		if (verbose) PrintMatrix(svd.Val1.GetMat(), "U");
		if (verbose) PrintMatrix(V, "V");
		for (int stateNo = 0; stateNo < nStates; ++stateNo)
		{
			TState &state = *aggStates[stateNo];
			state.xCenter = s0 * V(stateNo, 0);
			state.yCenter = s1 * V(stateNo, 1);
		}
	}
	// Make sure that the states do not cover too much of the screen area.
	// Instead of shrinking the states, we'll disperse them.
	double xMin = TFlt::Mx, yMin = TFlt::Mx, xMax = TFlt::Mn, yMax = TFlt::Mn;
	double totalStateArea = 0;
	for (const PState &state : aggStates) {
		xMin = TFlt::GetMn(xMin, state->xCenter - state->radius); xMax = TFlt::GetMx(xMax, state->xCenter + state->radius);
		yMin = TFlt::GetMn(yMin, state->yCenter - state->radius); yMax = TFlt::GetMx(yMax, state->yCenter + state->radius);
		totalStateArea += TMath::Pi * state->radius * state->radius; }
	const double STATE_OCCUPANCY_PERC = 0.5;
	const double screenArea = (xMax - xMin) * (yMax - yMin);
	const double desiredArea = totalStateArea * STATE_OCCUPANCY_PERC;
	const double scaleFactor = desiredArea / screenArea;
	const double scaleFactorX = sqrt(scaleFactor);
	const double scaleFactorY = scaleFactorX * (xMax - xMin) / (yMax - yMin);
	const double xMid = (xMin + xMax) / 2.0, yMid = (yMin + yMax) / 2.0;
	for (const PState &state : aggStates) {
		state->xCenter = (state->xCenter - xMid) * scaleFactorX;
		state->yCenter = (state->yCenter - yMid) * scaleFactorY; }
}

//-----------------------------------------------------------------------------
//
// TStateAggregator
//
//-----------------------------------------------------------------------------

PStatePartition TStateAggregator::BuildInitialPartition()
{
	PStatePartition partition = new TStatePartition(nInitialStates);
	for (int stateNo = 0; stateNo < nInitialStates; ++stateNo)
	{
		partition->initToAggState[stateNo] = stateNo;
		const PState &state = model.initialStates[stateNo];
		if (! state->initialStates.Empty()) IAssert(state->initialStates.Len() == 1 && state->initialStates[0] == stateNo);
		state->initialStates.Clr(); state->initialStates.Add(stateNo);
		partition->aggStates.Add(state);
	}
	return partition;
}

void TStateAggregator::CalcInitStateDist()
{
	initStateDist.Gen(nInitialStates, nInitialStates); 
	for (int i = 0; i < nInitialStates; ++i)
	{
		for (int j = 0; j <= i; ++j)
		{
			double d = (i == j) ? 0.0 : dataset.CentrDist2(model.initialStates[i], model.initialStates[j]);
			if (d <= 0) d = 0; else d = sqrt(d);
			initStateDist(i, j) = d; initStateDist(j, i) = d;
		}
	}
}

void TStateAggregator::BuildPartitionsBottomUp()
{
	CalcInitStateDist();
	PStatePartition part = BuildInitialPartition();
	allPartitions.Clr(); allPartitions.Add(part);
	while (part->aggStates.Len() > 2)
	{
		part = BuildNextPartition(part);
		allPartitions.Add(part);
	}
}

PStatePartition TStateAggregator::BuildNextPartition(const PStatePartition &part)
{
	// Calculate the distances between all the aggregated states of 'part' using mean linkage.
	const int nAggStates = part->aggStates.Len();
	TFltVV aggStateDist; aggStateDist.Gen(nAggStates, nAggStates); aggStateDist.PutAll(0);
	for (int s1 = 0; s1 < nInitialStates; ++s1) for (int s2 = 0; s2 < nInitialStates; ++s2) {
		const int a1 = part->initToAggState[s1], a2 = part->initToAggState[s2];
		aggStateDist(a1, a2) += initStateDist(s1, s2); }
	for (int a1 = 0; a1 < nAggStates; ++a1) for (int a2 = 0; a2 < nAggStates; ++a2) {
		const int n1 = part->aggStates[a1]->initialStates.Len(), n2 = part->aggStates[a2]->initialStates.Len();
		aggStateDist(a1, a2) /= double(n1 * n2); }
	// Find the two closest states.
	int b1 = 0, b2 = 1;
	for (int a1 = 0; a1 < nAggStates; ++a1) for (int a2 = 0; a2 < a1; ++a2)
		if (aggStateDist(a1, a2) < aggStateDist(b1, b2)) b1 = a1, b2 = a2;
	// Merge 'b1' into 'b2'.  In the new partition, all states with a number
	// greater then b1 will be shifted down by 1.
	// - Prepare the new 'initToAggState' vector.
	PStatePartition newPart = new TStatePartition(nInitialStates);
	for (int stateNo = 0; stateNo < nInitialStates; ++stateNo)
	{
		int aggStateNo = part->initToAggState[stateNo];
		if (aggStateNo == b1) aggStateNo = b2;
		if (aggStateNo > b1) --aggStateNo;
		newPart->initToAggState[stateNo] = aggStateNo;
	}
	// - Copy the other states and create a new merged one.
	for (int aggStateNo = 0; aggStateNo < nAggStates; ++aggStateNo)
	{
		if (aggStateNo == b1) continue;
		if (aggStateNo != b2) { newPart->aggStates.Add(part->aggStates[aggStateNo]); continue; }
		// Merge b1 and b2 into a new state.
		const PState &state1 = part->aggStates[b1], &state2 = part->aggStates[b2];
		PState newState = new TState();
		newState->members = state1->members; newState->members.AddV(state2->members);
		newState->initialStates = state1->initialStates; newState->initialStates.AddV(state2->initialStates);
		newState->initialStates.Sort();
		newState->InitCentroid0(dataset);
		const int n1 = state1->members.Len(), n2 = state2->members.Len();
		newState->AddToCentroid(dataset, state1->centroid, n1);
		newState->AddToCentroid(dataset, state2->centroid, n2);
		newState->MulCentroidBy(1.0 / double(n1 + n2));
		newPart->aggStates.Add(newState);
	}
	IAssert(newPart->aggStates.Len() == nAggStates - 1);
	return newPart;
}

//-----------------------------------------------------------------------------
//
// TStateAggScaleSelector
//
//-----------------------------------------------------------------------------

void TStateAggScaleSelector::CalcTransMatricesAndEigenVals()
{
	TFltV initStatProbs; TFltVV initTransMx;
	model.CalcTransMx(initStatProbs, initTransMx);
	for (const auto &p : allPartitions) 
	{
		p->CalcTransMx(initTransMx, initStatProbs);
		p->CalcEigenVals(); 
		while (p->eigenVals.Len() < nInitialStates) p->eigenVals.Add(0);
	}
}

void TStateAggScaleSelector::SelectInitialCentroids(int nClus, TIntV& dest)
{
	// Choose a few scales at random as centroids, but try to make sure that they are as far apart
	// from each other as possible.  What we'll maximize is the sum, over all centroids, of the
	// distance from that centroid to the nearest other centroid.
	const int nScales = allPartitions.Len() - 1;
	if (nClus >= nScales) { dest.Gen(nScales); for (int i = 0; i < nClus; ++i) dest[i] = i + 1; return; }
	double bestScore = -1; dest.Clr();
	for (int nTries = 0; nTries < 100; ++nTries)
	{
		TIntV centroids(nClus); 
		for (int i = 0; i < nClus; ) {
			centroids[i] = rnd.GetUniDevInt(nScales) + 1; // never select allPartitions[0] as this one doesn't participate in the clustering
			bool ok = true; for (int j = 0; j < i; ++j) if (centroids[i] == centroids[j]) { ok = false; break; }
			if (ok) i++; }
		double score = 0;
		for (int i = 0; i < nClus; ++i)
		{
			bool first = true; double nNeigh = -1;
			for (int j = 0; j < nClus; ++j) if (j != i) {
				double d = TCluster::Dist2(allPartitions[centroids[i]]->eigenVals, allPartitions[centroids[j]]->eigenVals);
				if (first || d < nNeigh) nNeigh = d, first = false; }
			score += nNeigh; 
		}
		if (nTries == 0 || score > bestScore) bestScore = score, dest = centroids;
	}
}

void TStateAggScaleSelector::SelectScales(int nToSelect, TStatePartitionV& dest)
{
	// Note that we'll always select the initial partition.
	const int nScales = allPartitions.Len(), nDim = nInitialStates;
	if (nToSelect > nScales) nToSelect = nScales;
	const int nClus = nToSelect;
	CalcTransMatricesAndEigenVals();
	// Prepare the initial set of scales with a random selection of centroids.
	TIntV initialCentroids; SelectInitialCentroids(nClus, initialCentroids);
	TVec<TCluster> clusters; clusters.Gen(nToSelect);
	for (int clusNo = 0; clusNo < nClus; ++clusNo) {
		int scaleNo = initialCentroids[clusNo];
		TCluster &C = clusters[clusNo]; C.Clr(nDim); }
	// Assign each scale to the nearest centroid.
	double quality = 0; TIntV memberships; memberships.Gen(nScales); memberships.PutAll(-1);
	for (int scaleNo = 1; scaleNo < nScales; ++scaleNo) {
		int bestClus = -1; double bestDist = -1;
		for (int clusNo = 0; clusNo < nClus; ++clusNo) {
			double dist = TCluster::Dist2(allPartitions[scaleNo]->eigenVals, allPartitions[initialCentroids[clusNo]]->eigenVals);
			if (bestClus < 0 || dist < bestDist || scaleNo == initialCentroids[clusNo]) {
				bestClus = clusNo, bestDist = dist;
				// Make sure that if some scale has been selected as the initial centroid of a cluster, it actually gets assigned to this cluster.  
				// This should be trivial except if there are several scales with identical lists of eigenvalues.
				if (scaleNo == initialCentroids[clusNo]) break; } }
		TCluster &C = clusters[bestClus];
		quality += sqrt(bestDist); memberships[scaleNo] = bestClus;
		C.Add(scaleNo, allPartitions[scaleNo]->eigenVals); }
	for (TCluster &C : clusters) C.Normalize();
	// Perform a few iterations of reassignment.
	const int MaxReassignmentPhases = 10;
	const double MinRelQualityImprovement = 0.01;
	const double MinRelReassignments = 0.1;
	for (int phaseNo = 0; phaseNo < MaxReassignmentPhases; ++phaseNo)
	{
		double newQuality = 0; TIntV newMemberships(nScales); newMemberships.PutAll(-1);
		// For each row, determine the nearest centroid.
		for (int scaleNo = 1; scaleNo < nScales; ++scaleNo) {
			int bestClus = -1; double bestDist = -1;
			for (int clusNo = 0; clusNo < nClus; ++clusNo) {
				double dist = clusters[clusNo].Dist2(allPartitions[scaleNo]);
				if (bestClus < 0 || dist < bestDist) bestClus = clusNo, bestDist = dist; }
			newQuality += sqrt(bestDist); newMemberships[scaleNo] = bestClus; }
		// Clear the old membership and centroid info.
		for (TCluster &C : clusters) C.Clr(nDim); 
		// Perform the reassignments and recalculate the centroids.
		int nMoves = 0;
		for (int scaleNo = 1; scaleNo < nScales; ++scaleNo) {
			const int clusNo = newMemberships[scaleNo]; if (clusNo != memberships[scaleNo]) ++nMoves; 
			TCluster &C = clusters[clusNo]; C.Add(scaleNo, allPartitions[scaleNo]->eigenVals); }
		for (TCluster &C : clusters) C.Normalize();
		// Verify the termination conditions.
		bool shouldStop = false;
		if (newQuality > quality * (1 + MinRelQualityImprovement)) shouldStop = true; // the quality is no longer improving enough
		if (nMoves < nScales * MinRelReassignments) shouldStop = true; // not enough rows are being reassigned, the clustering looks stable enough
		if (phaseNo < 3) shouldStop = false; // don't give up too soon
		NotifyInfo("TStateAggScaleSelector::SelectScales: phase %d/%d: %d/%d moves (%.2f %%), quality %.3f -> %.3f (= %.2f %%)\n", phaseNo, int(MaxReassignmentPhases),
			nMoves, nScales, nMoves * 100.0 / TFlt::GetMx(1, nScales), quality, newQuality, (newQuality / TFlt::GetMx(abs(newQuality) * 1e-8, quality) - 1.0) * 100.0);
		//
		quality = newQuality; memberships = newMemberships;
		if (shouldStop) break;
	}
	// From each cluster, select the member that is closest to the centroid.
	dest.Clr();
	dest.Add(allPartitions[0]);
	for (const TCluster &C : clusters)
	{
		if (C.members.Empty()) continue; 
		int bestScale = -1; double bestDist = -1;
		for (int scaleNo : C.members) { 
			double dist = C.Dist2(allPartitions[scaleNo]);
			if (bestScale < 0 || dist < bestDist) bestScale = scaleNo, bestDist = dist; }
		IAssert(bestScale > 0);
		dest.Add(allPartitions[bestScale]);
	}
	std::sort(dest.begin(), dest.end(), [] (const PStatePartition &x, const PStatePartition &y) { return x->aggStates.Len() > y->aggStates.Len(); });
}

//-----------------------------------------------------------------------------
//
// TDecTreeNode
//
//-----------------------------------------------------------------------------

// 'vals' must contain the values of this attribute; 'posList' and 'negList' are lists of indices (into 'vals')
// of positive and negative instances, respectively.  This function finds the best split of the form "if the value
// of this attribute is < thresh, go to the left subtree, otherwise go to the right subtree", and returns its
// threshold and normalized information gain.  If no split was found, it returns 'false', otherwise 'true'.
template<typename TDat>
bool NumericSplitHelper(const TVec<TDat>& vals, const TIntV& posList, const TIntV& negList, TDat &bestThresh, double &bestNormInfGain)
{
	int nPos = posList.Len(), nNeg = negList.Len();
	int nAll = nPos + nNeg;
	// Sort the instances by the value of this attribute.  
	typedef TTriple<TDat, bool, int> TTr; // the third element of the triple is the index of the instance, to ensure that the resulting sorted list is unique
	TVec<TTr> v; v.Reserve(nAll);
	for (int rowNo : posList) v.Add({vals[rowNo], true, rowNo});
	for (int rowNo : negList) v.Add({vals[rowNo], false, rowNo});
	v.Sort();
	// Evaluate all possible positions of the split.
	int nPosLeft = 0, nNegLeft = 0, nPosRight = nPos, nNegRight = nNeg;
	double origEntropy = TDecTreeNode::Entropy(nPos, nNeg);
	bestNormInfGain = -1; int bestLeft = -1;
	for (int nLeft = 1; nLeft + 1 < nAll; ++nLeft)
	{
		if (v[nLeft - 1].Val2) nPosLeft++, nPosRight--; else nNegLeft++, nNegRight--; // update the distributions left/right of the split
		if (v[nLeft - 1].Val1 == v[nLeft].Val1) continue; // we can't split between these two items since their value is identical
		// Evaluate this split position.
		int nRight = nAll - nLeft;
		double pLeft = nLeft / double(nAll), pRight = nRight / double(nAll);
		double splitCost = TDecTreeNode::Entropy(nLeft, nRight);
		double newEntropy = pLeft * TDecTreeNode::Entropy(nPosLeft, nNegLeft) + pRight * TDecTreeNode::Entropy(nPosRight, nNegRight);
		double infGain = origEntropy - newEntropy;
		double normInfGain = infGain / splitCost;
		if (normInfGain > bestNormInfGain) { bestNormInfGain = normInfGain; bestLeft = nLeft; }
	}
	if (bestLeft >= 0) { bestThresh = v[bestLeft].Val1; return true; }
	else return false;
}

// 'counts[i]' must contain the number of positive/negative instances whose value is 'i'.
// This function looks for the best split of the form "if thresh1 <= value of this attribute < thresh2,
// go to the left subtree, otherwise go to the right subtree".  
// Splits of this form are useful for such things as months, days of the week, or hours of the day.
bool TimeSplitHelper(const TIntPrV& counts, double &bestNormInfGain, int &bestThreshFrom, int &bestThreshToBelow)
{
	int M = counts.Len(), nPos = 0, nNeg = 0; for (const auto &pr : counts) { nPos += pr.Val1; nNeg += pr.Val2; }
	int nAll = nPos + nNeg;
	double origEntropy = TDecTreeNode::Entropy(nPos, nNeg);
	bestNormInfGain = -1; bool retVal = false;
	for (int threshFrom = 0; threshFrom < M; ++threshFrom)
	{
		int nInPos = 0, nInNeg = 0, nOutPos = nPos, nOutNeg = nNeg;
		for (int threshToBelow = threshFrom + 1; threshToBelow <= M; ++threshToBelow)
		{
			const auto &pr = counts[threshToBelow - 1];
			nInPos += pr.Val1; nInNeg += pr.Val2; nOutPos -= pr.Val1; nOutNeg -= pr.Val2;
			int nIn = nInPos + nInNeg, nOut = nOutPos + nOutNeg;
			if (nIn <= 0 || nOut <= 0) continue; // not really a split
			double splitCost = TDecTreeNode::Entropy(nIn, nOut);
			double pIn = nIn / double(nAll), pOut = nOut / double(nAll);
			double newEntropy = pIn * TDecTreeNode::Entropy(nInPos, nInNeg) + pOut * TDecTreeNode::Entropy(nOutPos, nOutNeg);
			double infGain = origEntropy - newEntropy;
			double normInfGain = infGain / splitCost;
			if (normInfGain > bestNormInfGain) { bestNormInfGain = normInfGain; bestThreshFrom = threshFrom; bestThreshToBelow = threshToBelow; retVal = true; }
		}
	}
	return retVal;
}

// Selects the best split and initializes the members of *this appropriately.
// The 'attrToIgnore' vector can be used to tell the function to ignore certain attributes
// (e.g. because they have already been used to split an ancestor of the current node).
void TDecTreeNode::SelectBestSplit(const TDataset& dataset, const TIntV& posList, const TIntV& negList, const TBoolV& attrToIgnore, double &bestNormInfGain)
{
	nPos = posList.Len(); nNeg = negList.Len(); attrNo = -1; children.Clr();
	bestNormInfGain = -1;
	double origEntropy = Entropy(nPos, nNeg);
	for (int candAttrNo = 0; candAttrNo < dataset.cols.Len(); ++candAttrNo)
	{
		if (attrToIgnore[candAttrNo]) continue;
		const TDataColumn &col = dataset.cols[candAttrNo];
		if (col.type == TAttrType::Categorical)
		{
			int nValues = 0;
			if (col.subType == TAttrSubtype::Int) nValues = col.intKeyMap.Len();
			else if (col.subType == TAttrSubtype::String) nValues = col.strKeyMap.Len();
			else IAssert(false);
			TIntPrV counts; counts.Gen(nValues); counts.PutAll({0, 0});
			for (int rowNo : posList) counts[col.intVals[rowNo]].Val1 += 1;
			for (int rowNo : negList) counts[col.intVals[rowNo]].Val2 += 1;
			double splitCost = 0, newEntropy = 0;
			for (TIntPr pr : counts) 
			{
				int nChild = pr.Val1 + pr.Val2; if (nChild <= 0) continue;
				double pChild = nChild / double(nPos + nNeg); splitCost -= pChild * log(pChild);
				newEntropy += Entropy(pr.Val1, pr.Val2) * pChild;
			}
			if (splitCost <= 1e-6) continue; // this doesn't seem to split anything, perhaps all instances have the same value of this attribute
			double infGain = origEntropy - newEntropy;
			double normInfGain = infGain / splitCost;
			if (normInfGain > bestNormInfGain) { bestNormInfGain = normInfGain; attrNo = candAttrNo; }
		}
		else if (col.type == TAttrType::Numeric)
		{
			if (col.subType == TAttrSubtype::Int)
			{
				TInt thresh; double normInfGain;
				if (! NumericSplitHelper(col.intVals, posList, negList, thresh, normInfGain)) continue;
				if (normInfGain > bestNormInfGain) { bestNormInfGain = normInfGain; attrNo = candAttrNo; intThresh = thresh; }
			}
			if (col.subType == TAttrSubtype::Flt)
			{
				TFlt thresh; double normInfGain;
				if (! NumericSplitHelper(col.fltVals, posList, negList, thresh, normInfGain)) continue;
				if (normInfGain > bestNormInfGain) { bestNormInfGain = normInfGain; attrNo = candAttrNo; fltThresh = thresh; }
			}
			else IAssert(false);
		}
		else if (col.type == TAttrType::Time)
		{
			if (col.timeType != TTimeType::Time) continue;
			TIntPrV hourCounts(24), dowCounts(7), monthCounts(12);
			hourCounts.PutAll({0, 0}); dowCounts.PutAll({0, 0}); monthCounts.PutAll({0, 0});
			for (int pass = 1; pass <= 2; ++pass) for (int rowNo : (pass == 1 ? posList : negList))
			{
				const TTimeStamp &ts = col.timeVals[rowNo]; IAssert(ts.type == TTimeType::Time);
				TSecTm secTm(ts.sec);
				auto &hc = hourCounts[secTm.GetHourN()], &dc = dowCounts[secTm.GetDayOfWeekN() - 1], &mc = monthCounts[secTm.GetMonthN() - 1];
				if (pass == 1) hc.Val1 += 1, dc.Val1 += 1, mc.Val1 += 1; else hc.Val2 += 1, dc.Val2 += 1, mc.Val2 += 1;
			}
			double normInfGain; int th1, th2;
			if (TimeSplitHelper(hourCounts, normInfGain, th1, th2)) if (normInfGain > bestNormInfGain) {
				bestNormInfGain = normInfGain; attrNo = candAttrNo; timeUnit = TDecTreeTimeUnit::Hour; intThresh = th1; intThresh2 = th2; }
			if (TimeSplitHelper(dowCounts, normInfGain, th1, th2)) if (normInfGain > bestNormInfGain) {
				bestNormInfGain = normInfGain; attrNo = candAttrNo; timeUnit = TDecTreeTimeUnit::DayOfWeek; intThresh = th1; intThresh2 = th2; }
			if (TimeSplitHelper(monthCounts, normInfGain, th1, th2)) if (normInfGain > bestNormInfGain) {
				bestNormInfGain = normInfGain; attrNo = candAttrNo; timeUnit = TDecTreeTimeUnit::Month; intThresh = th1; intThresh2 = th2; }
		}
		else if (col.type == TAttrType::Text)
		{
			// ToDo: do we want to do something about text attributes in the decision trees?
			continue;
		}
		else IAssert(false);
	}
}

// Selects the best split for this node and builds the subtrees recursively.
// Does not split the node if any of the following conditions are met:
// if no split can be found; if maxDepth = 0; if the entropy at the 
// current node is < minEntropyToSplit; if the normalized information
// gain of the best split if < minNormInfGainToSplit.
void TDecTreeNode::BuildSubtree(const TDataset& dataset, const TIntV& posList, const TIntV& negList, TBoolV& attrToIgnore, int maxDepth, double minEntropyToSplit, double minNormInfGainToSplit)
{
	nPos = posList.Len(); nNeg = negList.Len(); attrNo = -1; children.Clr();
	double origEntropy = Entropy(nPos, nNeg); stats.entropyBeforeSplit = origEntropy; 
	stats.entropyAfterSplit = origEntropy; stats.infGain = 0; stats.normInfGain = 0; stats.splitCost = 0;
	NotifyInfo("BuildSubtree (depth %d) (%d pos, %d neg; entropy %.2f bits)\n", maxDepth, nPos, nNeg, origEntropy);
	if (maxDepth == 0) return;
	if (origEntropy < minEntropyToSplit)  return;
	double bestNormInfGain = -1;
	SelectBestSplit(dataset, posList, negList, attrToIgnore, bestNormInfGain);
	if (attrNo < 0) return;
	NotifyInfo("-> best normInfGain = %.4f\n", bestNormInfGain);
	if (bestNormInfGain < minNormInfGainToSplit) { attrNo = -1; return; }
	// Now we can actually split the instances.
	// First determine how many children there will be.
	const TDataColumn &col = dataset.cols[attrNo];
	int nChildren = 0;
	if (col.type == TAttrType::Numeric || col.type == TAttrType::Time) nChildren = 2;
	else if (col.type == TAttrType::Categorical) {
		if (col.subType == TAttrSubtype::Int) nChildren = col.intKeyMap.Len();
		else if (col.subType == TAttrSubtype::String) nChildren = col.strKeyMap.Len();
		else IAssert(false); }
	else IAssert(false);
	// Prepare the list of instances for each child.
	TVec<TIntV> childPosLists(nChildren), childNegLists(nChildren);
	for (int pass = 1; pass <= 2; ++pass) for (int rowNo : (pass == 1 ? posList : negList))
	{
		int childNo = -1;
		if (col.type == TAttrType::Numeric) {
			if (col.subType == TAttrSubtype::Int) childNo = (col.intVals[rowNo] < intThresh) ? 0 : 1;
			else if (col.subType == TAttrSubtype::Flt) childNo = (col.fltVals[rowNo] < fltThresh) ? 0 : 1;
			else IAssert(false); }
		else if (col.type == TAttrType::Categorical) 
			childNo = col.intVals[rowNo];
		else if (col.type == TAttrType::Time) 
		{
			IAssert(col.timeType == TTimeType::Time);
			const TTimeStamp &ts = col.timeVals[rowNo]; IAssert(ts.type == TTimeType::Time);
			TSecTm secTm(ts.sec);
			int value = -1;
			if (timeUnit == TDecTreeTimeUnit::Hour) value = secTm.GetHourN();
			else if (timeUnit == TDecTreeTimeUnit::DayOfWeek) value = secTm.GetDayOfWeekN() - 1;
			else if (timeUnit == TDecTreeTimeUnit::Month) value = secTm.GetMonthN() - 1;
			else IAssert(false);
			if (intThresh < intThresh2) childNo = (intThresh <= value && value < intThresh2) ? 0 : 1;
			else childNo = (intThresh <= value || value < intThresh2) ? 0 : 1;
		}
		else
			IAssert(false);
		(pass == 1 ? childPosLists : childNegLists)[childNo].Add(rowNo);
	}
	TChA buf; for (int childNo = 0; childNo < nChildren; ++childNo) buf += TStr::Fmt("  %d:%d", (int) childPosLists[childNo].Len(), (int) childNegLists[childNo].Len());
	NotifyInfo("-> Split (%d children): %s\n", nChildren, buf.CStr());
	// Generate the children.  Some of them may be null (if the attribute is categorical and no instances reaching
	// this node had that value of that attribute).
	bool bkp = attrToIgnore[attrNo]; 
	if (col.type == TAttrType::Categorical) attrToIgnore[attrNo] = true;
	children.Gen(nChildren);
	for (int childNo = 0; childNo < nChildren; ++childNo)
	{
		const TIntV &childPosList = childPosLists[childNo], &childNegList = childNegLists[childNo];
		if (childPosList.Empty() && childNegList.Empty()) continue;
		PDecTreeNode child = new TDecTreeNode();
		child->BuildSubtree(dataset, childPosList, childNegList, attrToIgnore, maxDepth - 1, minEntropyToSplit, minNormInfGainToSplit);
		children[childNo] = child;
	}
	attrToIgnore[attrNo] = bkp;
	// Calculate the statistics.
	stats.entropyAfterSplit = 0; stats.splitCost = 0;
	for (int childNo = 0; childNo < nChildren; ++childNo)
	{
		int nChildPos = childPosLists[childNo].Len(), nChildNeg = childNegLists[childNo].Len();
		if (nChildPos + nChildNeg <= 0) continue;
		double childEntropy = Entropy(nChildPos, nChildNeg);
		double pChild = (nChildPos + nChildNeg) / double(nPos + nNeg);
		stats.entropyAfterSplit += pChild * childEntropy;
		stats.splitCost -= pChild * log(pChild);
	}
	stats.splitCost /= log(2.0);
	stats.infGain = stats.entropyBeforeSplit - stats.entropyAfterSplit;
	stats.normInfGain = stats.infGain / stats.splitCost;
}

template<typename TValueEncoder>
void SuggestTimeSplitLabels(int minVal, int intThresh, int intThresh2, int maxValPlus1, TValueEncoder&& valEnc, TStr& leftStr, TStr& rightStr)
{
	IAssert(minVal <= intThresh); IAssert(intThresh < intThresh2); IAssert(intThresh2 <= maxValPlus1);
	if (intThresh2 - intThresh > 1) leftStr = valEnc(intThresh) + ".." + valEnc(intThresh2 - 1);
	else leftStr = valEnc(intThresh);
	if (intThresh <= minVal) rightStr = (intThresh2 >= maxValPlus1) ? TStr::Fmt("") : (intThresh2 == maxValPlus1 - 1) ? valEnc(intThresh2) : (valEnc(intThresh2) + ".." + valEnc(maxValPlus1 - 1));
	else if (intThresh2 >= maxValPlus1) rightStr = (intThresh <= minVal) ? TStr::Fmt("") : (intThresh == minVal + 1) ? valEnc(minVal) : (valEnc(minVal) + ".." + valEnc(intThresh - 1));
	else rightStr = "not " + leftStr;
}

PJsonVal TDecTreeNode::SaveToJson(const TDataset& dataset) const
{
	PJsonVal nodeVal= TJsonVal::NewObj();
	nodeVal->AddToObj("nPos", nPos);
	nodeVal->AddToObj("nNeg", nNeg);
	const int nChildren = children.Len();
	TJsonValV childrenVals; childrenVals.Gen(nChildren);
	for (int childNo = 0; childNo < nChildren; ++childNo) 
	{
		const PDecTreeNode &child = children[childNo]; if (child.Empty()) continue;
		childrenVals[childNo] = children[childNo]->SaveToJson(dataset);
	}
	TStrV childLabels; childLabels.Gen(nChildren);
	if (attrNo >= 0)
	{
		const TDataColumn &col = dataset.cols[attrNo];
		TStr splitAttr = col.userFriendlyLabel; 
		if (col.type == TAttrType::Time)
		{
			TStr leftStr, rightStr; 
			if (timeUnit == TDecTreeTimeUnit::Hour) {
				splitAttr = "Hour(" + splitAttr + ")";
				SuggestTimeSplitLabels(0, intThresh, intThresh2, 24, [] (int hour) { return TInt::GetStr(hour); }, leftStr, rightStr); }
			else if (timeUnit == TDecTreeTimeUnit::DayOfWeek) 
				SuggestTimeSplitLabels(0, intThresh, intThresh2, 7, [] (int dow) { return TTimeStamp::GetDowName(dow + 1); }, leftStr, rightStr); 
			else if (timeUnit == TDecTreeTimeUnit::Month) 
				SuggestTimeSplitLabels(0, intThresh, intThresh2, 12, [] (int month) { return TTimeStamp::GetMonthName(month + 1); }, leftStr, rightStr); 
			else IAssert(false);
			IAssert(nChildren == 2); childLabels[0] = leftStr; childLabels[1] = rightStr;
		}
		else if (col.type == TAttrType::Numeric)
		{
			TStr splitVal; 
			if (col.subType == TAttrSubtype::Int) splitVal = TStr::Fmt("%d", intThresh);
			else if (col.subType == TAttrSubtype::Flt) splitVal = TStr::Fmt("%g", fltThresh);
			else IAssert(false);
			IAssert(nChildren == 2); childLabels[0] = "< " + splitVal; childLabels[1] = ">= " + splitVal;
		}
		else if (col.type == TAttrType::Categorical)
		{
			if (col.subType == TAttrSubtype::Int) {
				IAssert(nChildren == col.intKeyMap.Len());
				for (int childNo = 0; childNo < nChildren; ++childNo) childLabels[childNo] = TStr::Fmt("%d", col.intKeyMap.GetKey(childNo).Val); }
			else if (col.subType == TAttrSubtype::String) {
				IAssert(nChildren == col.strKeyMap.Len());
				for (int childNo = 0; childNo < nChildren; ++childNo) childLabels[childNo] = col.strKeyMap.GetKey(childNo); }
			else IAssert(false);
		}
		else
			IAssert(false);
		nodeVal->AddToObj("splitAttr", splitAttr);
		for (int childNo = 0; childNo < nChildren; ++childNo) if (! childrenVals[childNo].Empty()) 
			childrenVals[childNo]->AddToObj("splitLabel", childLabels[childNo]);
		nodeVal->AddToObj("entropyAfterSplit", stats.entropyAfterSplit);
		nodeVal->AddToObj("splitCost", stats.splitCost);
		nodeVal->AddToObj("splitInfGain", stats.infGain);
		nodeVal->AddToObj("splitNormInfGain", stats.normInfGain);
	}
	nodeVal->AddToObj("entropyBeforeSplit", stats.entropyBeforeSplit);
	TJsonValV childrenVals2; for (const PJsonVal &childVal : childrenVals) if (! childVal.Empty()) childrenVals2.Add(childVal);
	nodeVal->AddToObj("children", TJsonVal::NewArr(childrenVals2));
	return nodeVal;
}

