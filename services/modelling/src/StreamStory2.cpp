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
	if (! Json_GetObjNum(jsonVal, "distWeight", true, 1, distWeight, whatForErrMsg, errList)) return false;
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
	if (applyPm && isPm) hour += 12;
	secTm = TSecTm(year, month, day, hour, min, sec); return true;
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
	int colNo = 0; TChA buf;
	while (true)
	{
		if (! ReadValue(SIn, buf, rowNo, ++colNo)) return false;
		dest.Add(TStr(buf));
		if (SIn.Eof()) return true;
		char ch = SIn.PeekCh();
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
	bool AddRow(const TStrV& values, int rowNo, TStrV& errors);
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

bool TDatasetCsvFeeder::AddRow(const TStrV& values, int rowNo, TStrV& errors)
{
	const int nCols = dataset.cols.Len();
	for (int colNo = 0; colNo < nCols; ++colNo)
	{
		TDataColumn &col = dataset.cols[colNo];
		int csvColNo = dataColToCsvCol[colNo];
		if (csvColNo < 0 || csvColNo >= values.Len()) { errors.Add(TStr::Fmt("[%s] Error in CSV data (row %d): this row has %d values, attribute \"%s\" should be in column %d based on headers.", fileName.CStr(), rowNo, int(values.Len()), col.name.CStr(), csvColNo + 1)); return false; } 
		const TStr& value = values[csvColNo];
		//
		if (col.type == TAttrType::Numeric && (col.subType == TAttrSubtype::Flt || col.subType == TAttrSubtype::Int))
		{
			if (col.subType == TAttrSubtype::Flt) {
				double x; if (1 != sscanf(value.CStr(), "%lf", &x)) { errors.Add("The value of data[" + TInt::GetStr(rowNo - 1) + "].\"" + col.sourceName + "\" is not a floating-point number."); return false; } 
				col.fltVals.Add(x); }
			else if (col.subType == TAttrSubtype::Int) {
				int x; if (1 != sscanf(value.CStr(), "%d", &x)) { errors.Add("The value of data[" + TInt::GetStr(rowNo - 1) + "].\"" + col.sourceName + "\" is not an integer."); return false; } 
				col.intVals.Add(x); }
			else IAssert(false);
		}
		else if (col.type == TAttrType::Categorical)
		{
			if (col.subType == TAttrSubtype::String) {
				TStr key = value;
				int keyId = col.strKeyMap.GetKeyId(key);
				if (! IsValidId(keyId)) { keyId = col.strKeyMap.AddKey(key); col.strKeyMap[keyId] = 1; }
				else ++col.strKeyMap[keyId].Val;
				col.intVals.Add(keyId); }
			else if (col.subType == TAttrSubtype::Int) {
				int key; if (1 != sscanf(value.CStr(), "%d", &key)) { errors.Add("The value of data[" + TInt::GetStr(rowNo - 1) + "].\"" + col.sourceName + "\" is not an integer."); return false; }
				int keyId = col.intKeyMap.GetKeyId(key);
				if (! IsValidId(keyId)) { keyId = col.intKeyMap.AddKey(key); col.intKeyMap[keyId] = 1; }
				else ++col.intKeyMap[key].Val;
				col.intVals.Add(keyId); }
			else IAssert(false);
		}
		else if (col.type == TAttrType::Time)
		{
			TTimeStamp ts; 
			if (col.subType == TAttrSubtype::String) {
				TSecTm secTm; int ns; if (! StrPTime_HomeGrown(value.CStr(), col.formatStr.CStr(), secTm, ns)) { errors.Add(TStr::Fmt("Error parsing data[%d].\"%s\" = \"%s\" as a datetime value with the format \"%s\".", rowNo - 1, col.sourceName.CStr(), value.CStr(), col.formatStr.CStr())); return false; }
				if (col.timeType == TTimeType::Time) ts.SetTime(secTm.GetAbsSecs(), ns);
				else if (col.timeType == TTimeType::Int) ts.SetInt(secTm.GetAbsSecs()); 
				else if (col.timeType == TTimeType::Flt) ts.SetFlt(secTm.GetAbsSecs() + double(ns) / 1e9);
				else IAssert(false); }
			else if (col.subType == TAttrSubtype::Int) {
				intmax_t intVal; if (1 != sscanf(value.CStr(), "%jd", &intVal))  { errors.Add("The value of data[" + TInt::GetStr(rowNo - 1) + "].\"" + col.sourceName + "\" is not an integer."); return false; }
				if (col.timeType == TTimeType::Time) ts.SetTime(intVal, 0);
				else if (col.timeType == TTimeType::Int) ts.SetInt(intVal); 
				else if (col.timeType == TTimeType::Flt) ts.SetFlt(intVal);
				else IAssert(false); }
			else if (col.subType == TAttrSubtype::Flt) {
				double x; if (1 != sscanf(value.CStr(), "%lf", &x))  { errors.Add("The value of data[" + TInt::GetStr(rowNo - 1) + "].\"" + col.sourceName + "\" is not a floating-point number."); return false; }
				double fx = floor(x);
				int64_t intVal = (int64_t) fx; int ns = int((x - fx) * 1e9);
				if (ns < 0) ns = 0; else if (ns >= 1000000000) { ns -= 1000000000; ++intVal; }
				if (col.timeType == TTimeType::Time) ts.SetTime(intVal, ns);
				else if (col.timeType == TTimeType::Int) ts.SetInt(intVal); 
				else if (col.timeType == TTimeType::Flt) ts.SetFlt(x);
				else IAssert(false); }
			else IAssert(false);
			col.timeVals.Add(ts);
		}
		else if (col.type == TAttrType::Text)
		{
			// ToDo.
			IAssert(false);
		}
		else IAssert(false);
	}
	dataset.nRows += 1;
	return true;
}

//-----------------------------------------------------------------------------
//
// TDataset
//
//-----------------------------------------------------------------------------

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

bool TDataset::ReadDataFromJsonArray(const PJsonVal &jsonData, TStrV& errors)
{
	if (jsonData.Empty()) { errors.Add("Empty JSON data value."); return false; }
	if (! jsonData->IsArr()) { errors.Add("The JSON data value must be an array."); return false; }
	const int nCols = cols.Len(); nRows = jsonData->GetArrVals();
	NotifyInfo("TDataset::ReadDataFromJsonArray: %d rows, %d columns.\n", nRows, nCols);
	for (int colIdx = 0; colIdx < nCols; ++colIdx) cols[colIdx].Gen(nRows);
	for (int rowIdx = 0; rowIdx < nRows; ++rowIdx)
	{
		PJsonVal jsonRow = jsonData->GetArrVal(rowIdx);
		if (jsonRow.Empty()) { errors.Add("The value of data[" + TInt::GetStr(rowIdx) + "] is missing."); return false; }
		if (! jsonRow->IsObj()) { errors.Add("The value of data[" + TInt::GetStr(rowIdx) + "] must be an object."); return false; }
		for (int colIdx = 0; colIdx < nCols; ++colIdx)
		{
			TDataColumn &col = cols[colIdx];
			if (! jsonRow->IsObjKey(col.sourceName)) { errors.Add("The value of data[" + TInt::GetStr(rowIdx) + "].\"" + col.sourceName + "\" is missing."); return false; }
			PJsonVal val = jsonRow->GetObjKey(col.sourceName); if (val.Empty()) { errors.Add("The value of data[" + TInt::GetStr(rowIdx) + "].\"" + col.sourceName + "\" is empty."); return false; }
			if (col.type == TAttrType::Numeric && (col.subType == TAttrSubtype::Flt || col.subType == TAttrSubtype::Int))
			{
				if (! val->IsNum()) { errors.Add("The value of data[" + TInt::GetStr(rowIdx) + "].\"" + col.sourceName + "\" is not a number."); return false; }
				// ToDo: add support for the conversion of strings to ints/floats?
				double x = val->GetNum();
				if (col.subType == TAttrSubtype::Flt) col.fltVals[rowIdx] = x;
				else if (col.subType == TAttrSubtype::Int) {
					int y = (int) floor(x); if (x != y) { errors.Add("The value of data[" + TInt::GetStr(rowIdx) + "].\"" + col.sourceName + "\" is not an integer."); return false; }
					col.intVals[rowIdx] = y; }
				else IAssert(false);
			}
			else if (col.type == TAttrType::Categorical)
			{
				if (col.subType == TAttrSubtype::String) {
					if (! val->IsStr()) { errors.Add("The value of data[" + TInt::GetStr(rowIdx) + "].\"" + col.sourceName + "\" is not a string."); return false; }
					TStr key = val->GetStr();
					int keyId = col.strKeyMap.GetKeyId(key);
					if (! IsValidId(keyId)) { keyId = col.strKeyMap.AddKey(key); col.strKeyMap[keyId] = 1; }
					else ++col.strKeyMap[keyId].Val;
					col.intVals[rowIdx] = keyId; }
				else if (col.subType == TAttrSubtype::Int) {
					if (! val->IsNum()) { errors.Add("The value of data[" + TInt::GetStr(rowIdx) + "].\"" + col.sourceName + "\" is not a number."); return false; }
					double x = val->GetNum(); int key = (int) floor(x); if (key != x) { errors.Add("The value of data[" + TInt::GetStr(rowIdx) + "].\"" + col.sourceName + "\" is a number but not an integer."); return false; }
					// ToDo: add support for the conversion of strings to ints?
					int keyId = col.intKeyMap.GetKeyId(key);
					if (! IsValidId(keyId)) { keyId = col.intKeyMap.AddKey(key); col.intKeyMap[keyId] = 1; }
					else ++col.intKeyMap[key].Val;
					col.intVals[rowIdx] = keyId; }
				else IAssert(false);
			}
			else if (col.type == TAttrType::Time)
			{
				TTimeStamp &ts = col.timeVals[rowIdx];
				if (col.subType == TAttrSubtype::String) {
					if (! val->IsStr()) { errors.Add("The value of data[" + TInt::GetStr(rowIdx) + "].\"" + col.sourceName + "\" is not a string."); return false; }
					TStr s = val->GetStr();
					TSecTm secTm; int ns; if (! StrPTime_HomeGrown(s.CStr(), col.formatStr.CStr(), secTm, ns)) { errors.Add(TStr::Fmt("Error parsing data[%d].\"%s\" = \"%s\" as a datetime value with the format \"%s\".", int(rowIdx), col.sourceName.CStr(), s.CStr(), col.formatStr.CStr())); return false; }
					if (col.timeType == TTimeType::Time) ts.SetTime(secTm.GetAbsSecs(), ns);
					else if (col.timeType == TTimeType::Int) ts.SetInt(secTm.GetAbsSecs()); 
					else if (col.timeType == TTimeType::Flt) ts.SetFlt(secTm.GetAbsSecs() + double(ns) / 1e9);
					else IAssert(false); }
				else if (col.subType == TAttrSubtype::Int) {
					if (! val->IsNum()) { errors.Add("The value of data[" + TInt::GetStr(rowIdx) + "].\"" + col.sourceName + "\" is not a number."); return false; }
					double x = val->GetNum(); int64_t intVal = (int64_t) floor(x); if (intVal != x) { errors.Add("The value of data[" + TInt::GetStr(rowIdx) + "].\"" + col.sourceName + "\" is a number but not an integer."); return false; }
					if (col.timeType == TTimeType::Time) ts.SetTime(intVal, 0);
					else if (col.timeType == TTimeType::Int) ts.SetInt(intVal); 
					else if (col.timeType == TTimeType::Flt) ts.SetFlt(intVal);
					else IAssert(false); }
				else if (col.subType == TAttrSubtype::Flt) {
					if (! val->IsNum()) { errors.Add("The value of data[" + TInt::GetStr(rowIdx) + "].\"" + col.sourceName + "\" is not a number."); return false; }
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
	}
	return true;
}

bool TDataset::ReadDataFromCsv(TSIn& SIn, const TStr& fieldSep, const TStr& fileName, TStrV& errors)
{
	// Clear the data.
	const int nCols = cols.Len(); 
	for (int colIdx = 0; colIdx < nCols; ++colIdx) cols[colIdx].ClrVals();
	// Read the headers;
	if (SIn.Eof()) { errors.Add(TStr::Fmt("[%s] Error in CSV data: the file is empty.", fileName.CStr())); return false; }
	int rowNo = 1; TStrV headers, values;
	TCsvReader reader { fieldSep };
	if (! reader.ReadLine(SIn, headers, rowNo)) { errors.Add(TStr::Fmt("[%s] %s", fileName.CStr(), reader.errMsg.CStr())); return false; }
	TDatasetCsvFeeder feeder { *this, fileName };
	if (! feeder.SetHeaders(headers, rowNo, errors)) return false;
	// Process the rest of the data.
	while (! SIn.Eof())
	{
		++rowNo; if (! reader.ReadLine(SIn, values, rowNo)) { errors.Add(TStr::Fmt("[%s] %s", fileName.CStr(), reader.errMsg.CStr())); return false; }
		if (! feeder.AddRow(values, rowNo, errors)) return false;
	}
	NotifyInfo("TDataset::ReadDataFromCsv: %d rows, %d/%d columns.\n", nRows - 1, int(headers.Len()), nCols);
	return true;
}

bool TDataset::ReadDataFromJsonDataSourceSpec(const PJsonVal &jsonSpec, TStrV& errors)
{
	TStr type; if (! Json_GetObjStr(jsonSpec, "type", false, "", type, "dataSource", errors)) return false; 
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
			return this->ReadDataFromJsonArray(jsonData, errors);
		}
		else if (format == "csv")
		{
			TStr fieldSep; if (! Json_GetObjStr(jsonSpec, "fieldSep", true, ",", fieldSep, "dataSource", errors)) return true;
			PSIn SIn = TFIn::New(fileName);
			if (SIn.Empty()) { errors.Add("Error opening \"" + fileName + "\"."); return false; }
			return this->ReadDataFromCsv(*SIn, fieldSep, fileName, errors);
		}
		else { errors.Add("Unsupported value of dataSource[format]: \"" + format + "\"."); return false; }
	}
	else if (type == "internal")
	{
		TStr format; if (! Json_GetObjStr(jsonSpec, "format", true, "", format, "dataSource", errors)) return false; 
		PJsonVal vData; if (! Json_GetObjKey(jsonSpec, "data", false, false, vData, "dataSource", errors)) return false;
		const TStr fileName = "<internal>";
		if (format == "json") return this->ReadDataFromJsonArray(vData, errors);
		else if (format == "csv")
		{
			TStr fieldSep; if (! Json_GetObjStr(jsonSpec, "fieldSep", true, ",", fieldSep, "dataSource", errors)) return true;
			if (vData->IsStr()) 
			{ 
				PSIn SIn = TStrIn::New(vData->GetStr(), false);
				return this->ReadDataFromCsv(*SIn, fieldSep, fileName, errors); 
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
						else { ++nDataRows; if (! feeder.AddRow(v, rowNo, errors)) return false; }
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
	return true;
}

bool TDataset::ApplyOps(TStrV& errors)
{
	// ToDo. 
	return true;
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

void TState::CalcLabel(const TDataset& dataset, int thisStateNo, const THistogramV& totalHists, double eps)
{
	TStateLabel &bestLabel = this->label; bestLabel = TStateLabel(); bestLabel.label = TInt::GetStr(thisStateNo);
	static const char *dowNames[] = { "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" };
	static const char *bucketNames[] = { "LOWEST", "LOW", "MEDIUM", "HIGH", "HIGHEST", "ERROR" };
	static const char *monthNames[] = { "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" };
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
			for (int bucketNo = 0; bucketNo < 12; ++bucketNo) if (bestLabel.SetIfBetter(hist.monthFreqs[bucketNo], nStateMembers, totalHist.monthFreqs[bucketNo], nAllInstances, eps, hist.monthFreqs.Len())) bestLabel.label = col.userFriendlyLabel + " = " + monthNames[bucketNo]; 
			for (int bucketNo = 0; bucketNo < 7; ++bucketNo) if (bestLabel.SetIfBetter(hist.dowFreqs[bucketNo], nStateMembers, totalHist.dowFreqs[bucketNo], nAllInstances, eps, hist.dowFreqs.Len())) bestLabel.label = col.userFriendlyLabel + " = " + dowNames[bucketNo];
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
	PJsonVal vHistograms = TJsonVal::NewArr(); vState->AddToObj("histograms", vHistograms);
	for (int colNo = 0; colNo < centroid.Len(); ++colNo)
	{
		vCentroid->AddToArr(centroid[colNo].SaveToJson(dataset, colNo));
		vHistograms->AddToArr(histograms[colNo]->SaveToJson(dataset.cols[colNo]));
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
	PJsonVal vHistograms = TJsonVal::NewArr(); vModel->AddToObj("totalHistograms", vHistograms);
	for (int colNo = 0; colNo < totalHistograms.Len(); ++colNo)
		vHistograms->AddToArr(totalHistograms[colNo]->SaveToJson(dataset->cols[colNo]));
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
	// Center its rows.
	TFullMatrix X1(centroidMx, true); TLinAlgTransform::CenterRows(X1.GetMat());
	// Perform a thin SVD decomposition.
	TMatVecMatTr svd = X1.Svd(2);
	// We got X = U S V', where X is nDim * nStates, U is nDim * 2, S is 2 * 2 and diagonal,
	// and V' is 2 * nStates; hence V is nStates * 2.  The columns of S * V' are a good two-dimensional
	// representation of our states.
	IAssert(svd.Val2.Len() == 2);
	double s0 = svd.Val2[0], s1 = svd.Val2[1]; 
	auto V = svd.Val3.GetMat(); IAssert(V.GetRows() == nStates); IAssert(V.GetCols() == 2);
	for (int stateNo = 0; stateNo < nStates; ++stateNo)
	{
		TState &state = *aggStates[stateNo];
		state.xCenter = s0 * V(stateNo, 0);
		state.yCenter = s1 * V(stateNo, 1);
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

