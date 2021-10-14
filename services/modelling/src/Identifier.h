#ifndef __IDENTIFIER_H_INCLUDED__
#define __IDENTIFIER_H_INCLUDED__

template<typename T> class TBoxedInt { };
template<> class TBoxedInt<int> { public: typedef int U; typedef TInt B; };
template<> class TBoxedInt<int64> { public: typedef int64 U; typedef TUInt64 B; };
//template<> class TBoxedInt<long long> { public: typedef long long U; typedef TUInt64 B; };


//-----------------------------------------------------------------------------
// Identifier template
//-----------------------------------------------------------------------------
// This template is intended to be used for identifiers that are basically
// integers but we want to make sure we don't inadverently mix identifiers
// of different types.  Thus the template forbids assigning identifiers of
// one type to those of a different type, as well as comparing them or
// mixing them in arithmetical expressions.  On the other hand, an identifier
// can be compared with an integer (or an identifier of the same type),
// increased/decreased by an integer, or constructed from and converted to
// an integer.  This last feature is important because it allows us to
// use identifiers as indices in arrays and vectors, without explicit
// conversions.
//   In addition, the identifiers are streamable and their serialization
// is binary compatible with that of TInt.  They also use TInt's hash
// code functions.
//    Use the DECLARE_IDENTIFIER(TypeName) macro to typedef a new
// instantiation of this template.


// If this is not defined, DECLARE_IDENTIFIER will simply typedef
// TInt under new names instead of using the TIdentifier template.
#define USE_IDENTIFIERS

//#include <typeinfo.h>

// This template is supposed to be instantiable iff T and U are the same type.
template<class T, class U>
class TSameType
{
	/*
private:
	TSameType() { }
	*/
public:
	TSameType() {
		T *t = 0; U *u = 0;
		t->IBetYouDontHaveAnMemberLikeThis();
		u->IBetYouDontHaveAnMemberLikeThis(); }
};

template<class T>
class IsIdentifier { public: enum { value = false }; };

class TUninstantiable
{
private:
	TUninstantiable() {}
};

/*
// Now if VC supported partial specialization, we could do this:
template<class T>
class TSameType<T, T>
{
public:
	TSameType() { }
};

template<class T>
class IsIdentifier<TIdentifier<T> > { public: enum { value = true }; };

// As it doesn't, we'll have to leave the work to the DECLARE_IDENTIFIER macro,
// which will declare full specializations for the types we need.
*/

#if _MSC_VER >= 1400 || defined(GLib_UNIX)
template<class T>
class TSameType<T, T>
{
public:
	TSameType() { }
};
#endif

// Optionally set up a logging macro.
#define TIdentifier_Log(x)
//#define TIdentifier_Log(x) printf x

// The main goal of this identifier template is to allow people
// to declare different types of identifiers that are all really
// just integers but which it won't be able to accidentally mingle
// (i.e. use identifiers of one type for those of another type, etc).
//
// For this reason, the identifier template has a parameter, T,
// which can be used to distinguish different types of identifiers.
// The type T is not used otherwise.
//
// The identifier template allows the following operations:
// - construct from an integer
// - construct from identifier of the same type
// - assign an integer, or an identifier of the same type
// - add/subtract an integer to an identifier
// - prefix/postfix increment/decrement
// - convert to integer.
// Using a combination of private declarations and TUninstantiable
// variables, we make sure that constructing an identifier of
// one type from an identifier of another type, or mixing different
// types of identifiers in assignment or arithmetical expressions,
// will lead to compile errors.

template<typename T, typename VT>
class TIdentifier
{
public:
	// The integer value of our identifier.
	// Perhaps it should be made private.
	VT Val;
public:
	// The type of our identifier.
	typedef T Type;
	typedef VT ValType;
	typedef typename TBoxedInt<VT>::B BoxedValType;

	// Constructor from integer.
	TIdentifier(ValType val = 0) : Val(val) {
		TIdentifier_Log(("TIdentifier<%s>(int %d)\n", typeid(T).name(), val)); }
	// Copy constructor.
	template<typename U, typename VU> TIdentifier(const TIdentifier<U, VU>& o) : Val(o.Val) { TSameType<T, U> s;
		TIdentifier_Log(("TIdentifier<%s>(id<%s> %d)\n", typeid(T).name(), typeid(U).name(), o.Val)); }
	// Assignment operator.
	template<typename U, typename VU> TIdentifier& operator = (const TIdentifier<U, VU>& o) { TSameType<T, U> s;
		TIdentifier_Log(("TIdentifier<%s>::op=(id<%s> %d)\n", typeid(T).name(), typeid(U).name(), o.Val));
		Val = o.Val; return *this; }
	TIdentifier& operator = (ValType i) {
		TIdentifier_Log(("TIdentifier<%s>::op=(int %d)\n", typeid(T).name(), i));
		Val = i; return *this; }
	// Stream I/O.
	explicit TIdentifier(TSIn& SIn) : Val(BoxedValType(SIn)) { }
	void Load(TSIn& SIn) { BoxedValType Val_ = BoxedValType(SIn); Val = Val_; }
	void Save(TSOut& SOut) const { BoxedValType(Val).Save(SOut); }
	// Other glib integration functions.
	int GetMemUsed() const {return sizeof(TIdentifier<T, VT>);}
	int GetPrimHashCd() const {return BoxedValType(Val).GetPrimHashCd();}
	int GetSecHashCd() const {return BoxedValType(Val).GetSecHashCd();}

	// Conversion to an integer.
	operator ValType() const {
		TIdentifier_Log(("TIdentifier<%s>::int() -> %d)\n", typeid(T).name(), Val));
		return Val; }
	ValType operator()() const {
		TIdentifier_Log(("TIdentifier<%s>::op()() -> %d)\n", typeid(T).name(), Val));
		return Val; }
	// Conversion to a string.
	TStr GetStr() const { return BoxedValType(Val).GetStr(); }

	// Various integer operations.

	// - Prefix operators.
	TIdentifier<T, VT>& operator++() { ++Val; return *this; }
	TIdentifier<T, VT>& operator--() { --Val; return *this; }

	// - Postfix operators.
	const TIdentifier<T, VT> operator++(int) { ValType oldVal = Val; Val++; return TIdentifier<T, VT>(oldVal); }
	const TIdentifier<T, VT> operator--(int) { ValType oldVal = Val; Val--; return TIdentifier<T, VT>(oldVal); }

	// - Comparisons.  These allow an identifier to be compared with an integer
	//   or an identifier of the same type, but not with other identifiers.
	//   We define op(TId<T>, TId<T>), op(int, TId<T>) and op(TId<T>, int).
	//   Thus if someone wants to use op(TId<T>, TId<U>), there are various possibilities:
	//                                   First arg.     Second arg.
	//       1. op(int, int)                c              c
	//       2. op(TId<T>, int)             *              c
	//       3. op(int, TId<T>)             c              c'
	//       4. op(TId<T>, TId<T>)          *              c'
	//       5. op(TId<U>, int)             c'             c
	//       6. op(int, TId<U>)             c              *
	//       7. op(TId<U>, TId<U>)          c'             *
	//    c = conversion via TId::operator int().
	//    c' = conversion via TId<T>::TId<T>(const TId<U>&).  This wouldn't compile if
	//         the compiler actually came to use it, but it wouldn't know this until it
	//         tried, so these functions are initially considered in overload resolution
	//         just as well.
	//    * = no conversion necessary.
	//    The overload resolution rules C++ require the compiler to prepare a set
	//    containing the best-matching functions for each argument.  If the intersection
	//    of these sets contains exactly one function, it is used; otherwise, an error
	//    is reported.  In our case, the intersection of {2, 4} and {6, 7} is empty,
	//    therefore the compiler generates an error if someone wants to compare
	//    identifiers of different types.
#define DEFINE_COMPARISON_OPERATOR(op) \
	bool operator op (const TIdentifier<T, VT>& b) const { \
		TIdentifier_Log(("TIdentifier<%s>::op" #op "(id<%s> %d) (this = %d)\n", typeid(T).name(), typeid(T).name(), b.Val, Val)); \
		return Val op b.Val; }
	DEFINE_COMPARISON_OPERATOR(<)
	DEFINE_COMPARISON_OPERATOR(<=)
	DEFINE_COMPARISON_OPERATOR(>)
	DEFINE_COMPARISON_OPERATOR(>=)
	DEFINE_COMPARISON_OPERATOR(==)
	DEFINE_COMPARISON_OPERATOR(!=)
#undef DEFINE_COMPARISON_OPERATOR

	// - Arithmetic operators.
	//   The idea here is that it doesn't make sense to add or subtract two identifiers,
	//   even if they are of the same type.  Consequently, we only allow integers to be
	//   added or subtracted.  If there is ever really a need for more, one can always
	//   manipulate the Val member directly.
#define DEFINE_ARITHASSIGN_OPERATOR(op) \
	TIdentifier<T, VT>& operator op (ValType i) { \
		TIdentifier_Log(("TIdentifier<%s>::op" #op "(int %d) (this = %d)\n", typeid(T).name(), i, Val)); \
		Val op i; return *this; } \
	template<typename U, typename VU> TIdentifier<T, VT>& operator op (const TIdentifier<U, VU>& o) { TUninstantiable u; \
		TIdentifier_Log(("TIdentifier<%s>::op" #op "(id<%s> %d) (this = %d)\n", typeid(T).name(), typeid(U).name(), o.Val, Val)); \
		return *this; }
	DEFINE_ARITHASSIGN_OPERATOR(+=)
	DEFINE_ARITHASSIGN_OPERATOR(-=)
#undef DEFINE_ARITHASSIGN_OPERATOR

#define DEFINE_ARITH_OPERATOR(op) \
	const TIdentifier<T, VT> operator op (ValType i) { \
		TIdentifier_Log(("TIdentifier<%s>::op" #op "(int %d) (this = %d)\n", typeid(T).name(), i, Val)); \
		return TIdentifier<T, VT>(Val op i); } \
	template<typename U, typename VU> const TIdentifier<T, VT> operator op (const TIdentifier<U, VU>& o) { TUninstantiable u; \
		TIdentifier_Log(("TIdentifier<%s>::op" #op "(id<%s> %d) (this = %d)\n", typeid(T).name(), typeid(U).name(), o.Val, Val)); \
		return *this; }
	DEFINE_ARITH_OPERATOR(+)
	DEFINE_ARITH_OPERATOR(-)
#undef DEFINE_ARITH_OPERATOR

};

// Comparisons with integers.
// See above for a detailed explanation.
#define DEFINE_COMPARISON_OPERATOR(op) \
	template<typename T, typename VT> bool operator op(const TIdentifier<T, VT>& a, VT b) { \
		TIdentifier_Log(("operator " #op "(id<%s> %d, int %d)\n", typeid(T).name(), a.Val, b)); \
		return a.Val op b; } \
	template<typename T, typename VT> bool operator op(VT a, const TIdentifier<T, VT>& b) { \
		TIdentifier_Log(("operator " #op "(int %d, id<%s> %d)\n", a, typeid(T).name(), b.Val)); \
		return a op b.Val; }
	DEFINE_COMPARISON_OPERATOR(<)
	DEFINE_COMPARISON_OPERATOR(<=)
	DEFINE_COMPARISON_OPERATOR(>)
	DEFINE_COMPARISON_OPERATOR(>=)
	DEFINE_COMPARISON_OPERATOR(==)
	DEFINE_COMPARISON_OPERATOR(!=)
#undef DEFINE_COMPARISON_OPERATOR

// Also forbid 'integer + identifier'.
// We will only allow 'identifier + integer'.  Nyah nyah nyah.
#define DEFINE_ARITH_OPERATOR(op) \
	template<typename T, typename VT> const TIdentifier<T, VT> operator op (VT i, const TIdentifier<T, VT>& j) { TUninstantiable u; \
		TIdentifier_Log(("op" #op "(int %d, TIdentifier<%s> %d)\n", i, typeid(T).name(), j.Val)); \
		return TIdentifier<T, VT>(i op j.Val); }
	DEFINE_ARITH_OPERATOR(+)
	DEFINE_ARITH_OPERATOR(-)
#undef DEFINE_ARITH_OPERATOR

// Clean up the logging macro.
#if defined(TIdentifier_Log)
#undef TIdentifier_Log
#endif

#if _MSC_VER >= 1400 || defined(GLib_UNIX)
template<typename T, typename VT>
class IsIdentifier<TIdentifier<T, VT> > { public: enum { value = true }; };
#endif

// This macro allows one to declare new identifier types.
// Alternatively, if USE_IDENTIFIERS is not defined, this
// simply typedefs new names for TInt.  This would allow
// us to switch to TInts easily in case the performance
// penalty for debug builds is unacceptable.
//   Note: the '::' before TSameType is necessary if
// somebody wants to define an identifier within a namespace.
// However, gcc refuses to compile it with '::', saying:
// "global qualification of class name is invalid before '{' token.
#ifdef __GNUC__
#define TIdentifier_ColonColon
#else
#define TIdentifier_ColonColon class ::
#endif

#ifdef USE_IDENTIFIERS
#if _MSC_VER >= 1400 || defined(GLib_UNIX)
#define DECLARE_IDENTIFIER(UnderlyingIntType, TypeName) \
	class TIdentifierType_##TypeName { }; \
	typedef TIdentifier<TIdentifierType_##TypeName, UnderlyingIntType> TypeName; \
	typedef TVec<TypeName> TypeName##V; \
	typedef UnderlyingIntType TypeName##U // ; \
	//typedef TRangeIt_<TypeName> TypeName##I
#else
#define DECLARE_IDENTIFIER(TypeName) \
	class TIdentifierType_##TypeName { }; \
	template<> class TIdentifier_ColonColon TSameType<TIdentifierType_##TypeName, TIdentifierType_##TypeName> { public: TSameType() { } }; \
	typedef TIdentifier<TIdentifierType_##TypeName> TypeName; \
	template<> class TIdentifier_ColonColon IsIdentifier<TypeName> { public: enum { value = true }; }; \
	typedef TVec<TypeName> TypeName##V; \
	typedef TRangeIt_<TypeName> TypeName##I
#endif
#else
#define DECLARE_IDENTIFIER(TypeName) \
	typedef TInt TypeName; \
	typedef TVec<TypeName> TypeName##V
#endif

// A function to cast identifiers into another kind of identifiers.
template<typename T, typename U>
T ident_cast(const U& u) { return T(u.Val); }

#endif // __IDENTIFIER_H_INCLUDED__