# The buildModel function

Send a HTTP POST request to the StreamStory2 server with `/buildModel` as the path and a JSON object in the body of the request.  The response returned by the server will likewise be a JSON object.

## Structure of the input JSON object

It should contain the following sub-objects:

- `dataSource` - specifies how and where to get training data.
- `config` - describes the attributes and the transformations to be applied to them.

## The `dataSource` object

The `dataSource` object should contain the following attributes:

- `dataSource.type` - a string value, currently either `"file"` (the training data is to be read from a file) or `"internal"` (the training data is included in the input JSON object).
- `dataSource.format` - a string value, currently either `"json"` or `"csv"`.

If `type == "file"`, the name of the file containing the training data must be provided in the `dataSource.fileName` attribute.  The file must be accessible under this name from the server's point of view.  Its format should be as indicated by the `datasource.format` value.

If `type == "internal"`, the training data must be provided in the reuqest itself, as the value of `dataSource.data`.  If `type == "csv"`, the value of `data` should be a string containing the entire contents of the input CSV data (alternatively, it may be an array of strings, each representing one line of the input CSV data).  If `type == "json"`, the value of `data` must be a JSON array, each element of which must be a JSON object representing one data point.

## The `config` object

The `config` object should contain the following values and attributes:

- `config.numInitialStates` - an integer specifying the number of initial states that the data points are clustered into.
- `config.numHistogramBuckets` - the number of buckets in each of the histograms that are returned in the response object to show the distribution of attribute values in each state.  The default value is 10.
- `config.attributes` - an array of objects describing the attributes of the input data.
- `config.ops` - an array of objects describing the operations that are to be applied to the input data before the clustering into initial states.  Examples of such operations include: applying a linear transformation to an attribute; adding a time-shifted copy of an attribute; adding a categorical attribute representing the day-of-week based on the timestamp of the same instance; etc.

### Attribute specification

Each attribute (a.k.a. field or column) of the input dataset must be described by an object containing the following values:

- `name` - the name of the attribute
- `sourceName` - optional (if missing, the same value as `name` is used).  This is the name under which the attribute appears in the input data.  If the input data is in the CSV format, this name appears in the header of the corresponding column.  If the input data is in the JSON format, this name is used to represent this attribute in the JSON objects that represent individual data points.
- `label` - optional (if missing, the same value as `name` is used).  This is a user-friendly label for this attribute.  This might eventually be used in string descriptions/representations in the model, constructed by the server and intended to be visible to the end-user.  

- `type` - the type of this attribute; may be `"time"`, `"numeric"`, `"categorical"` or `"text"`.
- `subType` - together with `type`, this defines how the values of this attribute are represented in the input data.  Possible values are `"string"`, `"float"`, `"int"`.  If omitted, a default value is used depending on `type` (if `type` is `"numeric"`, the default `subType` is `"float"`, otherwise it's `"string"`).
- `timeType` - only used if `type == "time"`.  This value specifies if the attribute is a true timestamp or merely a scalar value which allows the data points to be ordered but does not actually represent a timestamp (i.e. it does not represent a specific day, month etc.).  Possible values are `"time"` (default), `"float"` and `"int"`.

The following combinations of `type` and `subType` are allowed:

- `type = "numeric"`
  - `subType = "float"`: the values of this attribute are provided as floating-point numbers.
  - `subType = "int"`: the values of this attribute are provided as integers.  The server will report an error if a non-integer value is provided.
- `type = "categorical"`
  - `subType = "string"`: the values of this attribute are provided as strings.  Internally, the server will convert this attribute into several binary attributes, one for each possible value of the categorical attribute that appears in the input data.
  - `subType = "int"`: as above, but the values of this attribute are provided as integers.
- `type = "text"`, `subType = "string"`: the values of this attribute are provided as strings.  Internally, the server converts this attribute into several real-valued attributes by converting the text strings into sparse vectors following the bag-of-words approach.  [Note: the processing of attributes of the `"text"` type is not implemented yet, although internally the rest of the pipeline already supports the sparse vectors they will eventually be converted into.]
- `type = "time"`
  - `subType = "string"`: the values of this attribute are timestamps provided as strings.  The format of these strings can be specified by providing a format string as `format` (default: `"%Y-%m-%d %H:%M:%S"`).  If `timeType == "time"`, the resulting timestamp is used as the attribute value directly; if `timeType == "float"`, it is converted to a floating-point number (seconds since 1 Jan 1970); if `timeType == "int"`, it is converted to an integer (like float but any fractional part of the seconds is discarded).
  - `subType = "float"`: the values of this attribute are provided as floating-point numbers.  If `timeType == "float"`, they are used as the attribute value directly; if `timeType == "int"`, their fracional part is discarded; if `timeType == "time"`, they are converted into timestamps by assuming that the floating-point number in the input data represent the number of seconds from 1 Jan 1970.
  - `subType = "int"`: like `"float"` but the values of the attribute are provided as integers.  If a non-integer number appears in the input data for such an attribute, an error will be reported.

### Post-input operation specification

[Documentation for the `ops` specification will be added as the implementation of these operations progresses.]

# Structure of the response JSON object

The response JSON object contains the following attributes:

- `status`: a string value, either `"ok"` or `"error"`
- `errors`: an array of strings, one per each error encountered.  This includes e.g. any errors in the request JSON objecs or errors encountered in the input data.  Some (non-fatal) errors may be reported even if `status == "ok"`.
- `model`: a JSON object representing the model produced from the input data given the specifications in the request object.

The model object contains the following attributes:

- `scales`: an array of objects, one for each scale in the multi-scale hierarchical model.
- `totalHistograms`: an array of objects, one for each attribute in the input datapoints, representing the distribution of the values of that attribute amongst all the datapoints of the dataset.  

For the sturcture of the objects representing scales and histograms, see the subsequent sections.

### Structure of a scale object

A scale object contains the following attributes:

- `nStates`: the number of the states at this scale.  These states are obtained by aggregating the initial states (whose number was specified by `config.numInitialStates` of the input JSON object).
- `areTheseInitialStates`: a boolean value indicating if this scale consists of the initial states without any aggregation (i.e. if `nStates == config.numInitialStates`).
- `states`: an array of objects representing the states at this scale.  For their structure, see a subsequent section.

### Structure of a state object

A state object contains the following attributes:

- `stateNo`: the zero-based index of this state in the `states` array for this scale.
- `initialStates`: an array of integers listing the initial states that have been aggregated to form the state represented by this object.
- `childStates`: the zero-based indices of the children of this state on the scale immediately below the current one; that is, these are the states whose `initialStates` set is a subset of the `initialStates` set of the current state.  At the lowest scale, which contains the initial states without any aggregation, the objects do not have a `childStates` attribute.
- `centroid`: a vector of objects representing the centroid of this state (i.e. the centroid of all the input datapoints that have been assigned, during clustering, into those initial states out of which the current state has been aggregated).  Each of these objects contains two fields, `attrName` and `value`.  
- `stationaryProbability`: the stationary probability of this state, i.e. the proportion of input datapoints that belong to the initial states (clusters) from which this state has been aggregated.
- `nMembers`: the number of datapoints (from the input dataset) belonging to this state (or, in other words, to the initial states out of which the present state has been aggregated).
- `nextStateProbDistr`: an array of floating-point values containing the probabilities of the next state.  Thus, `states[i].nextStateProbDistr[j]` is the probability that the next datapoint belongs to `states[j]` conditional on the fact that the current datapoint belongs to `states[i]`. 
- `histograms`: an array of objects, one for each attribute in the input datapoints, representing the distribution of the values of that attribute amongst the datapoints that belong to the current state.  For more detauls about the structure of the histogram objects, see a subsequent section.
- `suggestedLabel`: an object containing the following attributes:
  - `label`: a suggested string label for this state, e.g. `"humidity HIGH"`.  
  - `nCoveredInState`, `nNotCoveredInState`: the number of instances that belong to this state and do/don't match the label.
  - `nCoveredOutsideState`, `nNotCoveredOutsideState`: the number of instances that don't belong to this state and do/don't match the label.
  - `logOddsRatio`: the logarithm of the odds-ratio calculated from the above values.  The caller may wish to use this to decide whether to display the suggested label at all; if `logOddsRatio` is low, the suggested label might be considered misleading or useless, and a generic label (e.g. based on `stateNo`) might be preferred instead.

### Structure of a histogram object

A histogram provides information about the distribution of the values of one attribute amongst all the datapoints belonging to one state.  

If the attribute is a numeric one, the range of possible values, from the minimum to the maximum value *on the dataset as a whole* (i.e. not just among the datapoints belonging to the current state) is divided into `numHistogramBuckets` buckets, all equally wide.  (The value of `numHistogramBuckets` can be defined by the user in the `config.numHistogramBuckets` property of the input JSON object.)  For each bucket, the number of datapoints for which the attribute value fell into that bucket is reported.

If the attribute is a categorical one, the histogram consists of one bucket for each possible value of that attribute in the input data.

If the attribute is a timestamp, results are provided for three divisions of the time axis into buckets: one where buckets correspond to days of the week, one where they correspond to months of the year and one where they correspond to hours in the day.

The JSON object representing a histogram contains the following properties:

- `attrName`: the name of the attribute that this histogram refers to.
- `freqs`: an array of integers, where `freqs[i]` is the number of datapoints that belong to this state and whose value of the attribute `attrName` belongs to the `i`th bucket (we assume the buckets to be numbered from 0 to `numHistogramBuckets - 1 `).  This property is present only if the attribute to which this histogram refers is not a timestamp.
- `freqSum`: the sum of the values in `freqs`, and thus also the total number of datapoints belonging to this state.  Thus by dividing the values in `freqs` by `freqSum`, the user can convert them into probabilities.
- `bounds`: an array of numbers, where `bounds[i]` and `bounds[i + 1]` are the lower and upper bounds of the `i`th bucket, respectively (the lower bound is inclusive, the upper is exclusive, except for the last bucket where both are inclusive).  This property is present only if the attribute to which this histogram refers is a numerical one.
- `keys`: an array of values such that `freqs[i]` is the number of datapoints belonging to the current state and having `keys[i]` are the value of the current attribute.  This property is present only if the attribute to which the histogram refers is a numerical one.  The elements of `keys` may be integers or strings, depending on the attribute's `subType`.
- `dayOfWeekFreqs`, `monthFreqs`, `hourFreqs`: present only if the attribute to which this histogram refers is a timestamp.  These properties are arrays of 7, 12 and 24 integers, respectively, giving the number of datapoints belonging to the present state whose timestamp belongs to a particular day of week, month of the year, or hour of the day, respectively.  `dayOfWeekFreqs[0]` refers to Sunday, `monthFreqs[0]` to January, `hourFreqs[0]` to all moments in time from midnight (inclusive) to 1 AM (exclusive), etc.
