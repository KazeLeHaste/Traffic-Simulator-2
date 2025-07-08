/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/underscore/modules/_baseCreate.js":
/*!********************************************************!*\
  !*** ./node_modules/underscore/modules/_baseCreate.js ***!
  \********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ baseCreate)
/* harmony export */ });
/* harmony import */ var _isObject_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./isObject.js */ "./node_modules/underscore/modules/isObject.js");
/* harmony import */ var _setup_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./_setup.js */ "./node_modules/underscore/modules/_setup.js");



// Create a naked function reference for surrogate-prototype-swapping.
function ctor() {
  return function(){};
}

// An internal function for creating a new object that inherits from another.
function baseCreate(prototype) {
  if (!(0,_isObject_js__WEBPACK_IMPORTED_MODULE_0__["default"])(prototype)) return {};
  if (_setup_js__WEBPACK_IMPORTED_MODULE_1__.nativeCreate) return (0,_setup_js__WEBPACK_IMPORTED_MODULE_1__.nativeCreate)(prototype);
  var Ctor = ctor();
  Ctor.prototype = prototype;
  var result = new Ctor;
  Ctor.prototype = null;
  return result;
}


/***/ }),

/***/ "./node_modules/underscore/modules/_baseIteratee.js":
/*!**********************************************************!*\
  !*** ./node_modules/underscore/modules/_baseIteratee.js ***!
  \**********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ baseIteratee)
/* harmony export */ });
/* harmony import */ var _identity_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./identity.js */ "./node_modules/underscore/modules/identity.js");
/* harmony import */ var _isFunction_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./isFunction.js */ "./node_modules/underscore/modules/isFunction.js");
/* harmony import */ var _isObject_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./isObject.js */ "./node_modules/underscore/modules/isObject.js");
/* harmony import */ var _isArray_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./isArray.js */ "./node_modules/underscore/modules/isArray.js");
/* harmony import */ var _matcher_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./matcher.js */ "./node_modules/underscore/modules/matcher.js");
/* harmony import */ var _property_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./property.js */ "./node_modules/underscore/modules/property.js");
/* harmony import */ var _optimizeCb_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./_optimizeCb.js */ "./node_modules/underscore/modules/_optimizeCb.js");








// An internal function to generate callbacks that can be applied to each
// element in a collection, returning the desired result — either `_.identity`,
// an arbitrary callback, a property matcher, or a property accessor.
function baseIteratee(value, context, argCount) {
  if (value == null) return _identity_js__WEBPACK_IMPORTED_MODULE_0__["default"];
  if ((0,_isFunction_js__WEBPACK_IMPORTED_MODULE_1__["default"])(value)) return (0,_optimizeCb_js__WEBPACK_IMPORTED_MODULE_6__["default"])(value, context, argCount);
  if ((0,_isObject_js__WEBPACK_IMPORTED_MODULE_2__["default"])(value) && !(0,_isArray_js__WEBPACK_IMPORTED_MODULE_3__["default"])(value)) return (0,_matcher_js__WEBPACK_IMPORTED_MODULE_4__["default"])(value);
  return (0,_property_js__WEBPACK_IMPORTED_MODULE_5__["default"])(value);
}


/***/ }),

/***/ "./node_modules/underscore/modules/_cb.js":
/*!************************************************!*\
  !*** ./node_modules/underscore/modules/_cb.js ***!
  \************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ cb)
/* harmony export */ });
/* harmony import */ var _underscore_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./underscore.js */ "./node_modules/underscore/modules/underscore.js");
/* harmony import */ var _baseIteratee_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./_baseIteratee.js */ "./node_modules/underscore/modules/_baseIteratee.js");
/* harmony import */ var _iteratee_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./iteratee.js */ "./node_modules/underscore/modules/iteratee.js");




// The function we call internally to generate a callback. It invokes
// `_.iteratee` if overridden, otherwise `baseIteratee`.
function cb(value, context, argCount) {
  if (_underscore_js__WEBPACK_IMPORTED_MODULE_0__["default"].iteratee !== _iteratee_js__WEBPACK_IMPORTED_MODULE_2__["default"]) return _underscore_js__WEBPACK_IMPORTED_MODULE_0__["default"].iteratee(value, context);
  return (0,_baseIteratee_js__WEBPACK_IMPORTED_MODULE_1__["default"])(value, context, argCount);
}


/***/ }),

/***/ "./node_modules/underscore/modules/_chainResult.js":
/*!*********************************************************!*\
  !*** ./node_modules/underscore/modules/_chainResult.js ***!
  \*********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ chainResult)
/* harmony export */ });
/* harmony import */ var _underscore_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./underscore.js */ "./node_modules/underscore/modules/underscore.js");


// Helper function to continue chaining intermediate results.
function chainResult(instance, obj) {
  return instance._chain ? (0,_underscore_js__WEBPACK_IMPORTED_MODULE_0__["default"])(obj).chain() : obj;
}


/***/ }),

/***/ "./node_modules/underscore/modules/_collectNonEnumProps.js":
/*!*****************************************************************!*\
  !*** ./node_modules/underscore/modules/_collectNonEnumProps.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ collectNonEnumProps)
/* harmony export */ });
/* harmony import */ var _setup_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_setup.js */ "./node_modules/underscore/modules/_setup.js");
/* harmony import */ var _isFunction_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./isFunction.js */ "./node_modules/underscore/modules/isFunction.js");
/* harmony import */ var _has_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./_has.js */ "./node_modules/underscore/modules/_has.js");




// Internal helper to create a simple lookup structure.
// `collectNonEnumProps` used to depend on `_.contains`, but this led to
// circular imports. `emulatedSet` is a one-off solution that only works for
// arrays of strings.
function emulatedSet(keys) {
  var hash = {};
  for (var l = keys.length, i = 0; i < l; ++i) hash[keys[i]] = true;
  return {
    contains: function(key) { return hash[key] === true; },
    push: function(key) {
      hash[key] = true;
      return keys.push(key);
    }
  };
}

// Internal helper. Checks `keys` for the presence of keys in IE < 9 that won't
// be iterated by `for key in ...` and thus missed. Extends `keys` in place if
// needed.
function collectNonEnumProps(obj, keys) {
  keys = emulatedSet(keys);
  var nonEnumIdx = _setup_js__WEBPACK_IMPORTED_MODULE_0__.nonEnumerableProps.length;
  var constructor = obj.constructor;
  var proto = ((0,_isFunction_js__WEBPACK_IMPORTED_MODULE_1__["default"])(constructor) && constructor.prototype) || _setup_js__WEBPACK_IMPORTED_MODULE_0__.ObjProto;

  // Constructor is a special case.
  var prop = 'constructor';
  if ((0,_has_js__WEBPACK_IMPORTED_MODULE_2__["default"])(obj, prop) && !keys.contains(prop)) keys.push(prop);

  while (nonEnumIdx--) {
    prop = _setup_js__WEBPACK_IMPORTED_MODULE_0__.nonEnumerableProps[nonEnumIdx];
    if (prop in obj && obj[prop] !== proto[prop] && !keys.contains(prop)) {
      keys.push(prop);
    }
  }
}


/***/ }),

/***/ "./node_modules/underscore/modules/_createAssigner.js":
/*!************************************************************!*\
  !*** ./node_modules/underscore/modules/_createAssigner.js ***!
  \************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ createAssigner)
/* harmony export */ });
// An internal function for creating assigner functions.
function createAssigner(keysFunc, defaults) {
  return function(obj) {
    var length = arguments.length;
    if (defaults) obj = Object(obj);
    if (length < 2 || obj == null) return obj;
    for (var index = 1; index < length; index++) {
      var source = arguments[index],
          keys = keysFunc(source),
          l = keys.length;
      for (var i = 0; i < l; i++) {
        var key = keys[i];
        if (!defaults || obj[key] === void 0) obj[key] = source[key];
      }
    }
    return obj;
  };
}


/***/ }),

/***/ "./node_modules/underscore/modules/_createEscaper.js":
/*!***********************************************************!*\
  !*** ./node_modules/underscore/modules/_createEscaper.js ***!
  \***********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ createEscaper)
/* harmony export */ });
/* harmony import */ var _keys_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./keys.js */ "./node_modules/underscore/modules/keys.js");


// Internal helper to generate functions for escaping and unescaping strings
// to/from HTML interpolation.
function createEscaper(map) {
  var escaper = function(match) {
    return map[match];
  };
  // Regexes for identifying a key that needs to be escaped.
  var source = '(?:' + (0,_keys_js__WEBPACK_IMPORTED_MODULE_0__["default"])(map).join('|') + ')';
  var testRegexp = RegExp(source);
  var replaceRegexp = RegExp(source, 'g');
  return function(string) {
    string = string == null ? '' : '' + string;
    return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
  };
}


/***/ }),

/***/ "./node_modules/underscore/modules/_createIndexFinder.js":
/*!***************************************************************!*\
  !*** ./node_modules/underscore/modules/_createIndexFinder.js ***!
  \***************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ createIndexFinder)
/* harmony export */ });
/* harmony import */ var _getLength_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_getLength.js */ "./node_modules/underscore/modules/_getLength.js");
/* harmony import */ var _setup_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./_setup.js */ "./node_modules/underscore/modules/_setup.js");
/* harmony import */ var _isNaN_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./isNaN.js */ "./node_modules/underscore/modules/isNaN.js");




// Internal function to generate the `_.indexOf` and `_.lastIndexOf` functions.
function createIndexFinder(dir, predicateFind, sortedIndex) {
  return function(array, item, idx) {
    var i = 0, length = (0,_getLength_js__WEBPACK_IMPORTED_MODULE_0__["default"])(array);
    if (typeof idx == 'number') {
      if (dir > 0) {
        i = idx >= 0 ? idx : Math.max(idx + length, i);
      } else {
        length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
      }
    } else if (sortedIndex && idx && length) {
      idx = sortedIndex(array, item);
      return array[idx] === item ? idx : -1;
    }
    if (item !== item) {
      idx = predicateFind(_setup_js__WEBPACK_IMPORTED_MODULE_1__.slice.call(array, i, length), _isNaN_js__WEBPACK_IMPORTED_MODULE_2__["default"]);
      return idx >= 0 ? idx + i : -1;
    }
    for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
      if (array[idx] === item) return idx;
    }
    return -1;
  };
}


/***/ }),

/***/ "./node_modules/underscore/modules/_createPredicateIndexFinder.js":
/*!************************************************************************!*\
  !*** ./node_modules/underscore/modules/_createPredicateIndexFinder.js ***!
  \************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ createPredicateIndexFinder)
/* harmony export */ });
/* harmony import */ var _cb_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_cb.js */ "./node_modules/underscore/modules/_cb.js");
/* harmony import */ var _getLength_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./_getLength.js */ "./node_modules/underscore/modules/_getLength.js");



// Internal function to generate `_.findIndex` and `_.findLastIndex`.
function createPredicateIndexFinder(dir) {
  return function(array, predicate, context) {
    predicate = (0,_cb_js__WEBPACK_IMPORTED_MODULE_0__["default"])(predicate, context);
    var length = (0,_getLength_js__WEBPACK_IMPORTED_MODULE_1__["default"])(array);
    var index = dir > 0 ? 0 : length - 1;
    for (; index >= 0 && index < length; index += dir) {
      if (predicate(array[index], index, array)) return index;
    }
    return -1;
  };
}


/***/ }),

/***/ "./node_modules/underscore/modules/_createReduce.js":
/*!**********************************************************!*\
  !*** ./node_modules/underscore/modules/_createReduce.js ***!
  \**********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ createReduce)
/* harmony export */ });
/* harmony import */ var _isArrayLike_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_isArrayLike.js */ "./node_modules/underscore/modules/_isArrayLike.js");
/* harmony import */ var _keys_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./keys.js */ "./node_modules/underscore/modules/keys.js");
/* harmony import */ var _optimizeCb_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./_optimizeCb.js */ "./node_modules/underscore/modules/_optimizeCb.js");




// Internal helper to create a reducing function, iterating left or right.
function createReduce(dir) {
  // Wrap code that reassigns argument variables in a separate function than
  // the one that accesses `arguments.length` to avoid a perf hit. (#1991)
  var reducer = function(obj, iteratee, memo, initial) {
    var _keys = !(0,_isArrayLike_js__WEBPACK_IMPORTED_MODULE_0__["default"])(obj) && (0,_keys_js__WEBPACK_IMPORTED_MODULE_1__["default"])(obj),
        length = (_keys || obj).length,
        index = dir > 0 ? 0 : length - 1;
    if (!initial) {
      memo = obj[_keys ? _keys[index] : index];
      index += dir;
    }
    for (; index >= 0 && index < length; index += dir) {
      var currentKey = _keys ? _keys[index] : index;
      memo = iteratee(memo, obj[currentKey], currentKey, obj);
    }
    return memo;
  };

  return function(obj, iteratee, memo, context) {
    var initial = arguments.length >= 3;
    return reducer(obj, (0,_optimizeCb_js__WEBPACK_IMPORTED_MODULE_2__["default"])(iteratee, context, 4), memo, initial);
  };
}


/***/ }),

/***/ "./node_modules/underscore/modules/_createSizePropertyCheck.js":
/*!*********************************************************************!*\
  !*** ./node_modules/underscore/modules/_createSizePropertyCheck.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ createSizePropertyCheck)
/* harmony export */ });
/* harmony import */ var _setup_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_setup.js */ "./node_modules/underscore/modules/_setup.js");


// Common internal logic for `isArrayLike` and `isBufferLike`.
function createSizePropertyCheck(getSizeProperty) {
  return function(collection) {
    var sizeProperty = getSizeProperty(collection);
    return typeof sizeProperty == 'number' && sizeProperty >= 0 && sizeProperty <= _setup_js__WEBPACK_IMPORTED_MODULE_0__.MAX_ARRAY_INDEX;
  }
}


/***/ }),

/***/ "./node_modules/underscore/modules/_deepGet.js":
/*!*****************************************************!*\
  !*** ./node_modules/underscore/modules/_deepGet.js ***!
  \*****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ deepGet)
/* harmony export */ });
// Internal function to obtain a nested property in `obj` along `path`.
function deepGet(obj, path) {
  var length = path.length;
  for (var i = 0; i < length; i++) {
    if (obj == null) return void 0;
    obj = obj[path[i]];
  }
  return length ? obj : void 0;
}


/***/ }),

/***/ "./node_modules/underscore/modules/_escapeMap.js":
/*!*******************************************************!*\
  !*** ./node_modules/underscore/modules/_escapeMap.js ***!
  \*******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
// Internal list of HTML entities for escaping.
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '`': '&#x60;'
});


/***/ }),

/***/ "./node_modules/underscore/modules/_executeBound.js":
/*!**********************************************************!*\
  !*** ./node_modules/underscore/modules/_executeBound.js ***!
  \**********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ executeBound)
/* harmony export */ });
/* harmony import */ var _baseCreate_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_baseCreate.js */ "./node_modules/underscore/modules/_baseCreate.js");
/* harmony import */ var _isObject_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./isObject.js */ "./node_modules/underscore/modules/isObject.js");



// Internal function to execute `sourceFunc` bound to `context` with optional
// `args`. Determines whether to execute a function as a constructor or as a
// normal function.
function executeBound(sourceFunc, boundFunc, context, callingContext, args) {
  if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
  var self = (0,_baseCreate_js__WEBPACK_IMPORTED_MODULE_0__["default"])(sourceFunc.prototype);
  var result = sourceFunc.apply(self, args);
  if ((0,_isObject_js__WEBPACK_IMPORTED_MODULE_1__["default"])(result)) return result;
  return self;
}


/***/ }),

/***/ "./node_modules/underscore/modules/_flatten.js":
/*!*****************************************************!*\
  !*** ./node_modules/underscore/modules/_flatten.js ***!
  \*****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ flatten)
/* harmony export */ });
/* harmony import */ var _getLength_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_getLength.js */ "./node_modules/underscore/modules/_getLength.js");
/* harmony import */ var _isArrayLike_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./_isArrayLike.js */ "./node_modules/underscore/modules/_isArrayLike.js");
/* harmony import */ var _isArray_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./isArray.js */ "./node_modules/underscore/modules/isArray.js");
/* harmony import */ var _isArguments_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./isArguments.js */ "./node_modules/underscore/modules/isArguments.js");





// Internal implementation of a recursive `flatten` function.
function flatten(input, depth, strict, output) {
  output = output || [];
  if (!depth && depth !== 0) {
    depth = Infinity;
  } else if (depth <= 0) {
    return output.concat(input);
  }
  var idx = output.length;
  for (var i = 0, length = (0,_getLength_js__WEBPACK_IMPORTED_MODULE_0__["default"])(input); i < length; i++) {
    var value = input[i];
    if ((0,_isArrayLike_js__WEBPACK_IMPORTED_MODULE_1__["default"])(value) && ((0,_isArray_js__WEBPACK_IMPORTED_MODULE_2__["default"])(value) || (0,_isArguments_js__WEBPACK_IMPORTED_MODULE_3__["default"])(value))) {
      // Flatten current level of array or arguments object.
      if (depth > 1) {
        flatten(value, depth - 1, strict, output);
        idx = output.length;
      } else {
        var j = 0, len = value.length;
        while (j < len) output[idx++] = value[j++];
      }
    } else if (!strict) {
      output[idx++] = value;
    }
  }
  return output;
}


/***/ }),

/***/ "./node_modules/underscore/modules/_getByteLength.js":
/*!***********************************************************!*\
  !*** ./node_modules/underscore/modules/_getByteLength.js ***!
  \***********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _shallowProperty_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_shallowProperty.js */ "./node_modules/underscore/modules/_shallowProperty.js");


// Internal helper to obtain the `byteLength` property of an object.
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((0,_shallowProperty_js__WEBPACK_IMPORTED_MODULE_0__["default"])('byteLength'));


/***/ }),

/***/ "./node_modules/underscore/modules/_getLength.js":
/*!*******************************************************!*\
  !*** ./node_modules/underscore/modules/_getLength.js ***!
  \*******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _shallowProperty_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_shallowProperty.js */ "./node_modules/underscore/modules/_shallowProperty.js");


// Internal helper to obtain the `length` property of an object.
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((0,_shallowProperty_js__WEBPACK_IMPORTED_MODULE_0__["default"])('length'));


/***/ }),

/***/ "./node_modules/underscore/modules/_group.js":
/*!***************************************************!*\
  !*** ./node_modules/underscore/modules/_group.js ***!
  \***************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ group)
/* harmony export */ });
/* harmony import */ var _cb_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_cb.js */ "./node_modules/underscore/modules/_cb.js");
/* harmony import */ var _each_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./each.js */ "./node_modules/underscore/modules/each.js");



// An internal function used for aggregate "group by" operations.
function group(behavior, partition) {
  return function(obj, iteratee, context) {
    var result = partition ? [[], []] : {};
    iteratee = (0,_cb_js__WEBPACK_IMPORTED_MODULE_0__["default"])(iteratee, context);
    (0,_each_js__WEBPACK_IMPORTED_MODULE_1__["default"])(obj, function(value, index) {
      var key = iteratee(value, index, obj);
      behavior(result, value, key);
    });
    return result;
  };
}


/***/ }),

/***/ "./node_modules/underscore/modules/_has.js":
/*!*************************************************!*\
  !*** ./node_modules/underscore/modules/_has.js ***!
  \*************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ has)
/* harmony export */ });
/* harmony import */ var _setup_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_setup.js */ "./node_modules/underscore/modules/_setup.js");


// Internal function to check whether `key` is an own property name of `obj`.
function has(obj, key) {
  return obj != null && _setup_js__WEBPACK_IMPORTED_MODULE_0__.hasOwnProperty.call(obj, key);
}


/***/ }),

/***/ "./node_modules/underscore/modules/_hasObjectTag.js":
/*!**********************************************************!*\
  !*** ./node_modules/underscore/modules/_hasObjectTag.js ***!
  \**********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _tagTester_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_tagTester.js */ "./node_modules/underscore/modules/_tagTester.js");


/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((0,_tagTester_js__WEBPACK_IMPORTED_MODULE_0__["default"])('Object'));


/***/ }),

/***/ "./node_modules/underscore/modules/_isArrayLike.js":
/*!*********************************************************!*\
  !*** ./node_modules/underscore/modules/_isArrayLike.js ***!
  \*********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _createSizePropertyCheck_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_createSizePropertyCheck.js */ "./node_modules/underscore/modules/_createSizePropertyCheck.js");
/* harmony import */ var _getLength_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./_getLength.js */ "./node_modules/underscore/modules/_getLength.js");



// Internal helper for collection methods to determine whether a collection
// should be iterated as an array or as an object.
// Related: https://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
// Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((0,_createSizePropertyCheck_js__WEBPACK_IMPORTED_MODULE_0__["default"])(_getLength_js__WEBPACK_IMPORTED_MODULE_1__["default"]));


/***/ }),

/***/ "./node_modules/underscore/modules/_isBufferLike.js":
/*!**********************************************************!*\
  !*** ./node_modules/underscore/modules/_isBufferLike.js ***!
  \**********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _createSizePropertyCheck_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_createSizePropertyCheck.js */ "./node_modules/underscore/modules/_createSizePropertyCheck.js");
/* harmony import */ var _getByteLength_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./_getByteLength.js */ "./node_modules/underscore/modules/_getByteLength.js");



// Internal helper to determine whether we should spend extensive checks against
// `ArrayBuffer` et al.
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((0,_createSizePropertyCheck_js__WEBPACK_IMPORTED_MODULE_0__["default"])(_getByteLength_js__WEBPACK_IMPORTED_MODULE_1__["default"]));


/***/ }),

/***/ "./node_modules/underscore/modules/_keyInObj.js":
/*!******************************************************!*\
  !*** ./node_modules/underscore/modules/_keyInObj.js ***!
  \******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ keyInObj)
/* harmony export */ });
// Internal `_.pick` helper function to determine whether `key` is an enumerable
// property name of `obj`.
function keyInObj(value, key, obj) {
  return key in obj;
}


/***/ }),

/***/ "./node_modules/underscore/modules/_methodFingerprint.js":
/*!***************************************************************!*\
  !*** ./node_modules/underscore/modules/_methodFingerprint.js ***!
  \***************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ie11fingerprint: () => (/* binding */ ie11fingerprint),
/* harmony export */   mapMethods: () => (/* binding */ mapMethods),
/* harmony export */   setMethods: () => (/* binding */ setMethods),
/* harmony export */   weakMapMethods: () => (/* binding */ weakMapMethods)
/* harmony export */ });
/* harmony import */ var _getLength_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_getLength.js */ "./node_modules/underscore/modules/_getLength.js");
/* harmony import */ var _isFunction_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./isFunction.js */ "./node_modules/underscore/modules/isFunction.js");
/* harmony import */ var _allKeys_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./allKeys.js */ "./node_modules/underscore/modules/allKeys.js");




// Since the regular `Object.prototype.toString` type tests don't work for
// some types in IE 11, we use a fingerprinting heuristic instead, based
// on the methods. It's not great, but it's the best we got.
// The fingerprint method lists are defined below.
function ie11fingerprint(methods) {
  var length = (0,_getLength_js__WEBPACK_IMPORTED_MODULE_0__["default"])(methods);
  return function(obj) {
    if (obj == null) return false;
    // `Map`, `WeakMap` and `Set` have no enumerable keys.
    var keys = (0,_allKeys_js__WEBPACK_IMPORTED_MODULE_2__["default"])(obj);
    if ((0,_getLength_js__WEBPACK_IMPORTED_MODULE_0__["default"])(keys)) return false;
    for (var i = 0; i < length; i++) {
      if (!(0,_isFunction_js__WEBPACK_IMPORTED_MODULE_1__["default"])(obj[methods[i]])) return false;
    }
    // If we are testing against `WeakMap`, we need to ensure that
    // `obj` doesn't have a `forEach` method in order to distinguish
    // it from a regular `Map`.
    return methods !== weakMapMethods || !(0,_isFunction_js__WEBPACK_IMPORTED_MODULE_1__["default"])(obj[forEachName]);
  };
}

// In the interest of compact minification, we write
// each string in the fingerprints only once.
var forEachName = 'forEach',
    hasName = 'has',
    commonInit = ['clear', 'delete'],
    mapTail = ['get', hasName, 'set'];

// `Map`, `WeakMap` and `Set` each have slightly different
// combinations of the above sublists.
var mapMethods = commonInit.concat(forEachName, mapTail),
    weakMapMethods = commonInit.concat(mapTail),
    setMethods = ['add'].concat(commonInit, forEachName, hasName);


/***/ }),

/***/ "./node_modules/underscore/modules/_optimizeCb.js":
/*!********************************************************!*\
  !*** ./node_modules/underscore/modules/_optimizeCb.js ***!
  \********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ optimizeCb)
/* harmony export */ });
// Internal function that returns an efficient (for current engines) version
// of the passed-in callback, to be repeatedly applied in other Underscore
// functions.
function optimizeCb(func, context, argCount) {
  if (context === void 0) return func;
  switch (argCount == null ? 3 : argCount) {
    case 1: return function(value) {
      return func.call(context, value);
    };
    // The 2-argument case is omitted because we’re not using it.
    case 3: return function(value, index, collection) {
      return func.call(context, value, index, collection);
    };
    case 4: return function(accumulator, value, index, collection) {
      return func.call(context, accumulator, value, index, collection);
    };
  }
  return function() {
    return func.apply(context, arguments);
  };
}


/***/ }),

/***/ "./node_modules/underscore/modules/_setup.js":
/*!***************************************************!*\
  !*** ./node_modules/underscore/modules/_setup.js ***!
  \***************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ArrayProto: () => (/* binding */ ArrayProto),
/* harmony export */   MAX_ARRAY_INDEX: () => (/* binding */ MAX_ARRAY_INDEX),
/* harmony export */   ObjProto: () => (/* binding */ ObjProto),
/* harmony export */   SymbolProto: () => (/* binding */ SymbolProto),
/* harmony export */   VERSION: () => (/* binding */ VERSION),
/* harmony export */   _isFinite: () => (/* binding */ _isFinite),
/* harmony export */   _isNaN: () => (/* binding */ _isNaN),
/* harmony export */   hasEnumBug: () => (/* binding */ hasEnumBug),
/* harmony export */   hasOwnProperty: () => (/* binding */ hasOwnProperty),
/* harmony export */   nativeCreate: () => (/* binding */ nativeCreate),
/* harmony export */   nativeIsArray: () => (/* binding */ nativeIsArray),
/* harmony export */   nativeIsView: () => (/* binding */ nativeIsView),
/* harmony export */   nativeKeys: () => (/* binding */ nativeKeys),
/* harmony export */   nonEnumerableProps: () => (/* binding */ nonEnumerableProps),
/* harmony export */   push: () => (/* binding */ push),
/* harmony export */   root: () => (/* binding */ root),
/* harmony export */   slice: () => (/* binding */ slice),
/* harmony export */   supportsArrayBuffer: () => (/* binding */ supportsArrayBuffer),
/* harmony export */   supportsDataView: () => (/* binding */ supportsDataView),
/* harmony export */   toString: () => (/* binding */ toString)
/* harmony export */ });
// Current version.
var VERSION = '1.13.7';

// Establish the root object, `window` (`self`) in the browser, `global`
// on the server, or `this` in some virtual machines. We use `self`
// instead of `window` for `WebWorker` support.
var root = (typeof self == 'object' && self.self === self && self) ||
          (typeof global == 'object' && global.global === global && global) ||
          Function('return this')() ||
          {};

// Save bytes in the minified (but not gzipped) version:
var ArrayProto = Array.prototype, ObjProto = Object.prototype;
var SymbolProto = typeof Symbol !== 'undefined' ? Symbol.prototype : null;

// Create quick reference variables for speed access to core prototypes.
var push = ArrayProto.push,
    slice = ArrayProto.slice,
    toString = ObjProto.toString,
    hasOwnProperty = ObjProto.hasOwnProperty;

// Modern feature detection.
var supportsArrayBuffer = typeof ArrayBuffer !== 'undefined',
    supportsDataView = typeof DataView !== 'undefined';

// All **ECMAScript 5+** native function implementations that we hope to use
// are declared here.
var nativeIsArray = Array.isArray,
    nativeKeys = Object.keys,
    nativeCreate = Object.create,
    nativeIsView = supportsArrayBuffer && ArrayBuffer.isView;

// Create references to these builtin functions because we override them.
var _isNaN = isNaN,
    _isFinite = isFinite;

// Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
  'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

// The largest integer that can be represented exactly.
var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;


/***/ }),

/***/ "./node_modules/underscore/modules/_shallowProperty.js":
/*!*************************************************************!*\
  !*** ./node_modules/underscore/modules/_shallowProperty.js ***!
  \*************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ shallowProperty)
/* harmony export */ });
// Internal helper to generate a function to obtain property `key` from `obj`.
function shallowProperty(key) {
  return function(obj) {
    return obj == null ? void 0 : obj[key];
  };
}


/***/ }),

/***/ "./node_modules/underscore/modules/_stringTagBug.js":
/*!**********************************************************!*\
  !*** ./node_modules/underscore/modules/_stringTagBug.js ***!
  \**********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   hasDataViewBug: () => (/* binding */ hasDataViewBug),
/* harmony export */   isIE11: () => (/* binding */ isIE11)
/* harmony export */ });
/* harmony import */ var _setup_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_setup.js */ "./node_modules/underscore/modules/_setup.js");
/* harmony import */ var _hasObjectTag_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./_hasObjectTag.js */ "./node_modules/underscore/modules/_hasObjectTag.js");



// In IE 10 - Edge 13, `DataView` has string tag `'[object Object]'`.
// In IE 11, the most common among them, this problem also applies to
// `Map`, `WeakMap` and `Set`.
// Also, there are cases where an application can override the native
// `DataView` object, in cases like that we can't use the constructor
// safely and should just rely on alternate `DataView` checks
var hasDataViewBug = (
      _setup_js__WEBPACK_IMPORTED_MODULE_0__.supportsDataView && (!/\[native code\]/.test(String(DataView)) || (0,_hasObjectTag_js__WEBPACK_IMPORTED_MODULE_1__["default"])(new DataView(new ArrayBuffer(8))))
    ),
    isIE11 = (typeof Map !== 'undefined' && (0,_hasObjectTag_js__WEBPACK_IMPORTED_MODULE_1__["default"])(new Map));


/***/ }),

/***/ "./node_modules/underscore/modules/_tagTester.js":
/*!*******************************************************!*\
  !*** ./node_modules/underscore/modules/_tagTester.js ***!
  \*******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ tagTester)
/* harmony export */ });
/* harmony import */ var _setup_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_setup.js */ "./node_modules/underscore/modules/_setup.js");


// Internal function for creating a `toString`-based type tester.
function tagTester(name) {
  var tag = '[object ' + name + ']';
  return function(obj) {
    return _setup_js__WEBPACK_IMPORTED_MODULE_0__.toString.call(obj) === tag;
  };
}


/***/ }),

/***/ "./node_modules/underscore/modules/_toBufferView.js":
/*!**********************************************************!*\
  !*** ./node_modules/underscore/modules/_toBufferView.js ***!
  \**********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ toBufferView)
/* harmony export */ });
/* harmony import */ var _getByteLength_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_getByteLength.js */ "./node_modules/underscore/modules/_getByteLength.js");


// Internal function to wrap or shallow-copy an ArrayBuffer,
// typed array or DataView to a new view, reusing the buffer.
function toBufferView(bufferSource) {
  return new Uint8Array(
    bufferSource.buffer || bufferSource,
    bufferSource.byteOffset || 0,
    (0,_getByteLength_js__WEBPACK_IMPORTED_MODULE_0__["default"])(bufferSource)
  );
}


/***/ }),

/***/ "./node_modules/underscore/modules/_toPath.js":
/*!****************************************************!*\
  !*** ./node_modules/underscore/modules/_toPath.js ***!
  \****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ toPath)
/* harmony export */ });
/* harmony import */ var _underscore_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./underscore.js */ "./node_modules/underscore/modules/underscore.js");
/* harmony import */ var _toPath_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./toPath.js */ "./node_modules/underscore/modules/toPath.js");



// Internal wrapper for `_.toPath` to enable minification.
// Similar to `cb` for `_.iteratee`.
function toPath(path) {
  return _underscore_js__WEBPACK_IMPORTED_MODULE_0__["default"].toPath(path);
}


/***/ }),

/***/ "./node_modules/underscore/modules/_unescapeMap.js":
/*!*********************************************************!*\
  !*** ./node_modules/underscore/modules/_unescapeMap.js ***!
  \*********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _invert_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./invert.js */ "./node_modules/underscore/modules/invert.js");
/* harmony import */ var _escapeMap_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./_escapeMap.js */ "./node_modules/underscore/modules/_escapeMap.js");



// Internal list of HTML entities for unescaping.
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((0,_invert_js__WEBPACK_IMPORTED_MODULE_0__["default"])(_escapeMap_js__WEBPACK_IMPORTED_MODULE_1__["default"]));


/***/ }),

/***/ "./node_modules/underscore/modules/after.js":
/*!**************************************************!*\
  !*** ./node_modules/underscore/modules/after.js ***!
  \**************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ after)
/* harmony export */ });
// Returns a function that will only be executed on and after the Nth call.
function after(times, func) {
  return function() {
    if (--times < 1) {
      return func.apply(this, arguments);
    }
  };
}


/***/ }),

/***/ "./node_modules/underscore/modules/allKeys.js":
/*!****************************************************!*\
  !*** ./node_modules/underscore/modules/allKeys.js ***!
  \****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ allKeys)
/* harmony export */ });
/* harmony import */ var _isObject_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./isObject.js */ "./node_modules/underscore/modules/isObject.js");
/* harmony import */ var _setup_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./_setup.js */ "./node_modules/underscore/modules/_setup.js");
/* harmony import */ var _collectNonEnumProps_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./_collectNonEnumProps.js */ "./node_modules/underscore/modules/_collectNonEnumProps.js");




// Retrieve all the enumerable property names of an object.
function allKeys(obj) {
  if (!(0,_isObject_js__WEBPACK_IMPORTED_MODULE_0__["default"])(obj)) return [];
  var keys = [];
  for (var key in obj) keys.push(key);
  // Ahem, IE < 9.
  if (_setup_js__WEBPACK_IMPORTED_MODULE_1__.hasEnumBug) (0,_collectNonEnumProps_js__WEBPACK_IMPORTED_MODULE_2__["default"])(obj, keys);
  return keys;
}


/***/ }),

/***/ "./node_modules/underscore/modules/before.js":
/*!***************************************************!*\
  !*** ./node_modules/underscore/modules/before.js ***!
  \***************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ before)
/* harmony export */ });
// Returns a function that will only be executed up to (but not including) the
// Nth call.
function before(times, func) {
  var memo;
  return function() {
    if (--times > 0) {
      memo = func.apply(this, arguments);
    }
    if (times <= 1) func = null;
    return memo;
  };
}


/***/ }),

/***/ "./node_modules/underscore/modules/bind.js":
/*!*************************************************!*\
  !*** ./node_modules/underscore/modules/bind.js ***!
  \*************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _restArguments_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./restArguments.js */ "./node_modules/underscore/modules/restArguments.js");
/* harmony import */ var _isFunction_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./isFunction.js */ "./node_modules/underscore/modules/isFunction.js");
/* harmony import */ var _executeBound_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./_executeBound.js */ "./node_modules/underscore/modules/_executeBound.js");




// Create a function bound to a given object (assigning `this`, and arguments,
// optionally).
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((0,_restArguments_js__WEBPACK_IMPORTED_MODULE_0__["default"])(function(func, context, args) {
  if (!(0,_isFunction_js__WEBPACK_IMPORTED_MODULE_1__["default"])(func)) throw new TypeError('Bind must be called on a function');
  var bound = (0,_restArguments_js__WEBPACK_IMPORTED_MODULE_0__["default"])(function(callArgs) {
    return (0,_executeBound_js__WEBPACK_IMPORTED_MODULE_2__["default"])(func, bound, context, this, args.concat(callArgs));
  });
  return bound;
}));


/***/ }),

/***/ "./node_modules/underscore/modules/bindAll.js":
/*!****************************************************!*\
  !*** ./node_modules/underscore/modules/bindAll.js ***!
  \****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _restArguments_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./restArguments.js */ "./node_modules/underscore/modules/restArguments.js");
/* harmony import */ var _flatten_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./_flatten.js */ "./node_modules/underscore/modules/_flatten.js");
/* harmony import */ var _bind_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./bind.js */ "./node_modules/underscore/modules/bind.js");




// Bind a number of an object's methods to that object. Remaining arguments
// are the method names to be bound. Useful for ensuring that all callbacks
// defined on an object belong to it.
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((0,_restArguments_js__WEBPACK_IMPORTED_MODULE_0__["default"])(function(obj, keys) {
  keys = (0,_flatten_js__WEBPACK_IMPORTED_MODULE_1__["default"])(keys, false, false);
  var index = keys.length;
  if (index < 1) throw new Error('bindAll must be passed function names');
  while (index--) {
    var key = keys[index];
    obj[key] = (0,_bind_js__WEBPACK_IMPORTED_MODULE_2__["default"])(obj[key], obj);
  }
  return obj;
}));


/***/ }),

/***/ "./node_modules/underscore/modules/chain.js":
/*!**************************************************!*\
  !*** ./node_modules/underscore/modules/chain.js ***!
  \**************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ chain)
/* harmony export */ });
/* harmony import */ var _underscore_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./underscore.js */ "./node_modules/underscore/modules/underscore.js");


// Start chaining a wrapped Underscore object.
function chain(obj) {
  var instance = (0,_underscore_js__WEBPACK_IMPORTED_MODULE_0__["default"])(obj);
  instance._chain = true;
  return instance;
}


/***/ }),

/***/ "./node_modules/underscore/modules/chunk.js":
/*!**************************************************!*\
  !*** ./node_modules/underscore/modules/chunk.js ***!
  \**************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ chunk)
/* harmony export */ });
/* harmony import */ var _setup_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_setup.js */ "./node_modules/underscore/modules/_setup.js");


// Chunk a single array into multiple arrays, each containing `count` or fewer
// items.
function chunk(array, count) {
  if (count == null || count < 1) return [];
  var result = [];
  var i = 0, length = array.length;
  while (i < length) {
    result.push(_setup_js__WEBPACK_IMPORTED_MODULE_0__.slice.call(array, i, i += count));
  }
  return result;
}


/***/ }),

/***/ "./node_modules/underscore/modules/clone.js":
/*!**************************************************!*\
  !*** ./node_modules/underscore/modules/clone.js ***!
  \**************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ clone)
/* harmony export */ });
/* harmony import */ var _isObject_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./isObject.js */ "./node_modules/underscore/modules/isObject.js");
/* harmony import */ var _isArray_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./isArray.js */ "./node_modules/underscore/modules/isArray.js");
/* harmony import */ var _extend_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./extend.js */ "./node_modules/underscore/modules/extend.js");




// Create a (shallow-cloned) duplicate of an object.
function clone(obj) {
  if (!(0,_isObject_js__WEBPACK_IMPORTED_MODULE_0__["default"])(obj)) return obj;
  return (0,_isArray_js__WEBPACK_IMPORTED_MODULE_1__["default"])(obj) ? obj.slice() : (0,_extend_js__WEBPACK_IMPORTED_MODULE_2__["default"])({}, obj);
}


/***/ }),

/***/ "./node_modules/underscore/modules/compact.js":
/*!****************************************************!*\
  !*** ./node_modules/underscore/modules/compact.js ***!
  \****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ compact)
/* harmony export */ });
/* harmony import */ var _filter_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./filter.js */ "./node_modules/underscore/modules/filter.js");


// Trim out all falsy values from an array.
function compact(array) {
  return (0,_filter_js__WEBPACK_IMPORTED_MODULE_0__["default"])(array, Boolean);
}


/***/ }),

/***/ "./node_modules/underscore/modules/compose.js":
/*!****************************************************!*\
  !*** ./node_modules/underscore/modules/compose.js ***!
  \****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ compose)
/* harmony export */ });
// Returns a function that is the composition of a list of functions, each
// consuming the return value of the function that follows.
function compose() {
  var args = arguments;
  var start = args.length - 1;
  return function() {
    var i = start;
    var result = args[start].apply(this, arguments);
    while (i--) result = args[i].call(this, result);
    return result;
  };
}


/***/ }),

/***/ "./node_modules/underscore/modules/constant.js":
/*!*****************************************************!*\
  !*** ./node_modules/underscore/modules/constant.js ***!
  \*****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ constant)
/* harmony export */ });
// Predicate-generating function. Often useful outside of Underscore.
function constant(value) {
  return function() {
    return value;
  };
}


/***/ }),

/***/ "./node_modules/underscore/modules/contains.js":
/*!*****************************************************!*\
  !*** ./node_modules/underscore/modules/contains.js ***!
  \*****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ contains)
/* harmony export */ });
/* harmony import */ var _isArrayLike_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_isArrayLike.js */ "./node_modules/underscore/modules/_isArrayLike.js");
/* harmony import */ var _values_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./values.js */ "./node_modules/underscore/modules/values.js");
/* harmony import */ var _indexOf_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./indexOf.js */ "./node_modules/underscore/modules/indexOf.js");




// Determine if the array or object contains a given item (using `===`).
function contains(obj, item, fromIndex, guard) {
  if (!(0,_isArrayLike_js__WEBPACK_IMPORTED_MODULE_0__["default"])(obj)) obj = (0,_values_js__WEBPACK_IMPORTED_MODULE_1__["default"])(obj);
  if (typeof fromIndex != 'number' || guard) fromIndex = 0;
  return (0,_indexOf_js__WEBPACK_IMPORTED_MODULE_2__["default"])(obj, item, fromIndex) >= 0;
}


/***/ }),

/***/ "./node_modules/underscore/modules/countBy.js":
/*!****************************************************!*\
  !*** ./node_modules/underscore/modules/countBy.js ***!
  \****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _group_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_group.js */ "./node_modules/underscore/modules/_group.js");
/* harmony import */ var _has_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./_has.js */ "./node_modules/underscore/modules/_has.js");



// Counts instances of an object that group by a certain criterion. Pass
// either a string attribute to count by, or a function that returns the
// criterion.
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((0,_group_js__WEBPACK_IMPORTED_MODULE_0__["default"])(function(result, value, key) {
  if ((0,_has_js__WEBPACK_IMPORTED_MODULE_1__["default"])(result, key)) result[key]++; else result[key] = 1;
}));


/***/ }),

/***/ "./node_modules/underscore/modules/create.js":
/*!***************************************************!*\
  !*** ./node_modules/underscore/modules/create.js ***!
  \***************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ create)
/* harmony export */ });
/* harmony import */ var _baseCreate_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_baseCreate.js */ "./node_modules/underscore/modules/_baseCreate.js");
/* harmony import */ var _extendOwn_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./extendOwn.js */ "./node_modules/underscore/modules/extendOwn.js");



// Creates an object that inherits from the given prototype object.
// If additional properties are provided then they will be added to the
// created object.
function create(prototype, props) {
  var result = (0,_baseCreate_js__WEBPACK_IMPORTED_MODULE_0__["default"])(prototype);
  if (props) (0,_extendOwn_js__WEBPACK_IMPORTED_MODULE_1__["default"])(result, props);
  return result;
}


/***/ }),

/***/ "./node_modules/underscore/modules/debounce.js":
/*!*****************************************************!*\
  !*** ./node_modules/underscore/modules/debounce.js ***!
  \*****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ debounce)
/* harmony export */ });
/* harmony import */ var _restArguments_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./restArguments.js */ "./node_modules/underscore/modules/restArguments.js");
/* harmony import */ var _now_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./now.js */ "./node_modules/underscore/modules/now.js");



// When a sequence of calls of the returned function ends, the argument
// function is triggered. The end of a sequence is defined by the `wait`
// parameter. If `immediate` is passed, the argument function will be
// triggered at the beginning of the sequence instead of at the end.
function debounce(func, wait, immediate) {
  var timeout, previous, args, result, context;

  var later = function() {
    var passed = (0,_now_js__WEBPACK_IMPORTED_MODULE_1__["default"])() - previous;
    if (wait > passed) {
      timeout = setTimeout(later, wait - passed);
    } else {
      timeout = null;
      if (!immediate) result = func.apply(context, args);
      // This check is needed because `func` can recursively invoke `debounced`.
      if (!timeout) args = context = null;
    }
  };

  var debounced = (0,_restArguments_js__WEBPACK_IMPORTED_MODULE_0__["default"])(function(_args) {
    context = this;
    args = _args;
    previous = (0,_now_js__WEBPACK_IMPORTED_MODULE_1__["default"])();
    if (!timeout) {
      timeout = setTimeout(later, wait);
      if (immediate) result = func.apply(context, args);
    }
    return result;
  });

  debounced.cancel = function() {
    clearTimeout(timeout);
    timeout = args = context = null;
  };

  return debounced;
}


/***/ }),

/***/ "./node_modules/underscore/modules/defaults.js":
/*!*****************************************************!*\
  !*** ./node_modules/underscore/modules/defaults.js ***!
  \*****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _createAssigner_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_createAssigner.js */ "./node_modules/underscore/modules/_createAssigner.js");
/* harmony import */ var _allKeys_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./allKeys.js */ "./node_modules/underscore/modules/allKeys.js");



// Fill in a given object with default properties.
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((0,_createAssigner_js__WEBPACK_IMPORTED_MODULE_0__["default"])(_allKeys_js__WEBPACK_IMPORTED_MODULE_1__["default"], true));


/***/ }),

/***/ "./node_modules/underscore/modules/defer.js":
/*!**************************************************!*\
  !*** ./node_modules/underscore/modules/defer.js ***!
  \**************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _partial_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./partial.js */ "./node_modules/underscore/modules/partial.js");
/* harmony import */ var _delay_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./delay.js */ "./node_modules/underscore/modules/delay.js");
/* harmony import */ var _underscore_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./underscore.js */ "./node_modules/underscore/modules/underscore.js");




// Defers a function, scheduling it to run after the current call stack has
// cleared.
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((0,_partial_js__WEBPACK_IMPORTED_MODULE_0__["default"])(_delay_js__WEBPACK_IMPORTED_MODULE_1__["default"], _underscore_js__WEBPACK_IMPORTED_MODULE_2__["default"], 1));


/***/ }),

/***/ "./node_modules/underscore/modules/delay.js":
/*!**************************************************!*\
  !*** ./node_modules/underscore/modules/delay.js ***!
  \**************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _restArguments_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./restArguments.js */ "./node_modules/underscore/modules/restArguments.js");


// Delays a function for the given number of milliseconds, and then calls
// it with the arguments supplied.
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((0,_restArguments_js__WEBPACK_IMPORTED_MODULE_0__["default"])(function(func, wait, args) {
  return setTimeout(function() {
    return func.apply(null, args);
  }, wait);
}));


/***/ }),

/***/ "./node_modules/underscore/modules/difference.js":
/*!*******************************************************!*\
  !*** ./node_modules/underscore/modules/difference.js ***!
  \*******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _restArguments_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./restArguments.js */ "./node_modules/underscore/modules/restArguments.js");
/* harmony import */ var _flatten_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./_flatten.js */ "./node_modules/underscore/modules/_flatten.js");
/* harmony import */ var _filter_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./filter.js */ "./node_modules/underscore/modules/filter.js");
/* harmony import */ var _contains_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./contains.js */ "./node_modules/underscore/modules/contains.js");





// Take the difference between one array and a number of other arrays.
// Only the elements present in just the first array will remain.
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((0,_restArguments_js__WEBPACK_IMPORTED_MODULE_0__["default"])(function(array, rest) {
  rest = (0,_flatten_js__WEBPACK_IMPORTED_MODULE_1__["default"])(rest, true, true);
  return (0,_filter_js__WEBPACK_IMPORTED_MODULE_2__["default"])(array, function(value){
    return !(0,_contains_js__WEBPACK_IMPORTED_MODULE_3__["default"])(rest, value);
  });
}));


/***/ }),

/***/ "./node_modules/underscore/modules/each.js":
/*!*************************************************!*\
  !*** ./node_modules/underscore/modules/each.js ***!
  \*************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ each)
/* harmony export */ });
/* harmony import */ var _optimizeCb_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_optimizeCb.js */ "./node_modules/underscore/modules/_optimizeCb.js");
/* harmony import */ var _isArrayLike_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./_isArrayLike.js */ "./node_modules/underscore/modules/_isArrayLike.js");
/* harmony import */ var _keys_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./keys.js */ "./node_modules/underscore/modules/keys.js");




// The cornerstone for collection functions, an `each`
// implementation, aka `forEach`.
// Handles raw objects in addition to array-likes. Treats all
// sparse array-likes as if they were dense.
function each(obj, iteratee, context) {
  iteratee = (0,_optimizeCb_js__WEBPACK_IMPORTED_MODULE_0__["default"])(iteratee, context);
  var i, length;
  if ((0,_isArrayLike_js__WEBPACK_IMPORTED_MODULE_1__["default"])(obj)) {
    for (i = 0, length = obj.length; i < length; i++) {
      iteratee(obj[i], i, obj);
    }
  } else {
    var _keys = (0,_keys_js__WEBPACK_IMPORTED_MODULE_2__["default"])(obj);
    for (i = 0, length = _keys.length; i < length; i++) {
      iteratee(obj[_keys[i]], _keys[i], obj);
    }
  }
  return obj;
}


/***/ }),

/***/ "./node_modules/underscore/modules/escape.js":
/*!***************************************************!*\
  !*** ./node_modules/underscore/modules/escape.js ***!
  \***************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _createEscaper_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_createEscaper.js */ "./node_modules/underscore/modules/_createEscaper.js");
/* harmony import */ var _escapeMap_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./_escapeMap.js */ "./node_modules/underscore/modules/_escapeMap.js");



// Function for escaping strings to HTML interpolation.
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((0,_createEscaper_js__WEBPACK_IMPORTED_MODULE_0__["default"])(_escapeMap_js__WEBPACK_IMPORTED_MODULE_1__["default"]));


/***/ }),

/***/ "./node_modules/underscore/modules/every.js":
/*!**************************************************!*\
  !*** ./node_modules/underscore/modules/every.js ***!
  \**************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ every)
/* harmony export */ });
/* harmony import */ var _cb_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_cb.js */ "./node_modules/underscore/modules/_cb.js");
/* harmony import */ var _isArrayLike_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./_isArrayLike.js */ "./node_modules/underscore/modules/_isArrayLike.js");
/* harmony import */ var _keys_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./keys.js */ "./node_modules/underscore/modules/keys.js");




// Determine whether all of the elements pass a truth test.
function every(obj, predicate, context) {
  predicate = (0,_cb_js__WEBPACK_IMPORTED_MODULE_0__["default"])(predicate, context);
  var _keys = !(0,_isArrayLike_js__WEBPACK_IMPORTED_MODULE_1__["default"])(obj) && (0,_keys_js__WEBPACK_IMPORTED_MODULE_2__["default"])(obj),
      length = (_keys || obj).length;
  for (var index = 0; index < length; index++) {
    var currentKey = _keys ? _keys[index] : index;
    if (!predicate(obj[currentKey], currentKey, obj)) return false;
  }
  return true;
}


/***/ }),

/***/ "./node_modules/underscore/modules/extend.js":
/*!***************************************************!*\
  !*** ./node_modules/underscore/modules/extend.js ***!
  \***************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _createAssigner_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_createAssigner.js */ "./node_modules/underscore/modules/_createAssigner.js");
/* harmony import */ var _allKeys_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./allKeys.js */ "./node_modules/underscore/modules/allKeys.js");



// Extend a given object with all the properties in passed-in object(s).
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((0,_createAssigner_js__WEBPACK_IMPORTED_MODULE_0__["default"])(_allKeys_js__WEBPACK_IMPORTED_MODULE_1__["default"]));


/***/ }),

/***/ "./node_modules/underscore/modules/extendOwn.js":
/*!******************************************************!*\
  !*** ./node_modules/underscore/modules/extendOwn.js ***!
  \******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _createAssigner_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_createAssigner.js */ "./node_modules/underscore/modules/_createAssigner.js");
/* harmony import */ var _keys_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./keys.js */ "./node_modules/underscore/modules/keys.js");



// Assigns a given object with all the own properties in the passed-in
// object(s).
// (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((0,_createAssigner_js__WEBPACK_IMPORTED_MODULE_0__["default"])(_keys_js__WEBPACK_IMPORTED_MODULE_1__["default"]));


/***/ }),

/***/ "./node_modules/underscore/modules/filter.js":
/*!***************************************************!*\
  !*** ./node_modules/underscore/modules/filter.js ***!
  \***************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ filter)
/* harmony export */ });
/* harmony import */ var _cb_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_cb.js */ "./node_modules/underscore/modules/_cb.js");
/* harmony import */ var _each_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./each.js */ "./node_modules/underscore/modules/each.js");



// Return all the elements that pass a truth test.
function filter(obj, predicate, context) {
  var results = [];
  predicate = (0,_cb_js__WEBPACK_IMPORTED_MODULE_0__["default"])(predicate, context);
  (0,_each_js__WEBPACK_IMPORTED_MODULE_1__["default"])(obj, function(value, index, list) {
    if (predicate(value, index, list)) results.push(value);
  });
  return results;
}


/***/ }),

/***/ "./node_modules/underscore/modules/find.js":
/*!*************************************************!*\
  !*** ./node_modules/underscore/modules/find.js ***!
  \*************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ find)
/* harmony export */ });
/* harmony import */ var _isArrayLike_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_isArrayLike.js */ "./node_modules/underscore/modules/_isArrayLike.js");
/* harmony import */ var _findIndex_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./findIndex.js */ "./node_modules/underscore/modules/findIndex.js");
/* harmony import */ var _findKey_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./findKey.js */ "./node_modules/underscore/modules/findKey.js");




// Return the first value which passes a truth test.
function find(obj, predicate, context) {
  var keyFinder = (0,_isArrayLike_js__WEBPACK_IMPORTED_MODULE_0__["default"])(obj) ? _findIndex_js__WEBPACK_IMPORTED_MODULE_1__["default"] : _findKey_js__WEBPACK_IMPORTED_MODULE_2__["default"];
  var key = keyFinder(obj, predicate, context);
  if (key !== void 0 && key !== -1) return obj[key];
}


/***/ }),

/***/ "./node_modules/underscore/modules/findIndex.js":
/*!******************************************************!*\
  !*** ./node_modules/underscore/modules/findIndex.js ***!
  \******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _createPredicateIndexFinder_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_createPredicateIndexFinder.js */ "./node_modules/underscore/modules/_createPredicateIndexFinder.js");


// Returns the first index on an array-like that passes a truth test.
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((0,_createPredicateIndexFinder_js__WEBPACK_IMPORTED_MODULE_0__["default"])(1));


/***/ }),

/***/ "./node_modules/underscore/modules/findKey.js":
/*!****************************************************!*\
  !*** ./node_modules/underscore/modules/findKey.js ***!
  \****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ findKey)
/* harmony export */ });
/* harmony import */ var _cb_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_cb.js */ "./node_modules/underscore/modules/_cb.js");
/* harmony import */ var _keys_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./keys.js */ "./node_modules/underscore/modules/keys.js");



// Returns the first key on an object that passes a truth test.
function findKey(obj, predicate, context) {
  predicate = (0,_cb_js__WEBPACK_IMPORTED_MODULE_0__["default"])(predicate, context);
  var _keys = (0,_keys_js__WEBPACK_IMPORTED_MODULE_1__["default"])(obj), key;
  for (var i = 0, length = _keys.length; i < length; i++) {
    key = _keys[i];
    if (predicate(obj[key], key, obj)) return key;
  }
}


/***/ }),

/***/ "./node_modules/underscore/modules/findLastIndex.js":
/*!**********************************************************!*\
  !*** ./node_modules/underscore/modules/findLastIndex.js ***!
  \**********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _createPredicateIndexFinder_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_createPredicateIndexFinder.js */ "./node_modules/underscore/modules/_createPredicateIndexFinder.js");


// Returns the last index on an array-like that passes a truth test.
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((0,_createPredicateIndexFinder_js__WEBPACK_IMPORTED_MODULE_0__["default"])(-1));


/***/ }),

/***/ "./node_modules/underscore/modules/findWhere.js":
/*!******************************************************!*\
  !*** ./node_modules/underscore/modules/findWhere.js ***!
  \******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ findWhere)
/* harmony export */ });
/* harmony import */ var _find_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./find.js */ "./node_modules/underscore/modules/find.js");
/* harmony import */ var _matcher_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./matcher.js */ "./node_modules/underscore/modules/matcher.js");



// Convenience version of a common use case of `_.find`: getting the first
// object containing specific `key:value` pairs.
function findWhere(obj, attrs) {
  return (0,_find_js__WEBPACK_IMPORTED_MODULE_0__["default"])(obj, (0,_matcher_js__WEBPACK_IMPORTED_MODULE_1__["default"])(attrs));
}


/***/ }),

/***/ "./node_modules/underscore/modules/first.js":
/*!**************************************************!*\
  !*** ./node_modules/underscore/modules/first.js ***!
  \**************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ first)
/* harmony export */ });
/* harmony import */ var _initial_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./initial.js */ "./node_modules/underscore/modules/initial.js");


// Get the first element of an array. Passing **n** will return the first N
// values in the array. The **guard** check allows it to work with `_.map`.
function first(array, n, guard) {
  if (array == null || array.length < 1) return n == null || guard ? void 0 : [];
  if (n == null || guard) return array[0];
  return (0,_initial_js__WEBPACK_IMPORTED_MODULE_0__["default"])(array, array.length - n);
}


/***/ }),

/***/ "./node_modules/underscore/modules/flatten.js":
/*!****************************************************!*\
  !*** ./node_modules/underscore/modules/flatten.js ***!
  \****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ flatten)
/* harmony export */ });
/* harmony import */ var _flatten_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_flatten.js */ "./node_modules/underscore/modules/_flatten.js");


// Flatten out an array, either recursively (by default), or up to `depth`.
// Passing `true` or `false` as `depth` means `1` or `Infinity`, respectively.
function flatten(array, depth) {
  return (0,_flatten_js__WEBPACK_IMPORTED_MODULE_0__["default"])(array, depth, false);
}


/***/ }),

/***/ "./node_modules/underscore/modules/functions.js":
/*!******************************************************!*\
  !*** ./node_modules/underscore/modules/functions.js ***!
  \******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ functions)
/* harmony export */ });
/* harmony import */ var _isFunction_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./isFunction.js */ "./node_modules/underscore/modules/isFunction.js");


// Return a sorted list of the function names available on the object.
function functions(obj) {
  var names = [];
  for (var key in obj) {
    if ((0,_isFunction_js__WEBPACK_IMPORTED_MODULE_0__["default"])(obj[key])) names.push(key);
  }
  return names.sort();
}


/***/ }),

/***/ "./node_modules/underscore/modules/get.js":
/*!************************************************!*\
  !*** ./node_modules/underscore/modules/get.js ***!
  \************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ get)
/* harmony export */ });
/* harmony import */ var _toPath_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_toPath.js */ "./node_modules/underscore/modules/_toPath.js");
/* harmony import */ var _deepGet_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./_deepGet.js */ "./node_modules/underscore/modules/_deepGet.js");
/* harmony import */ var _isUndefined_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./isUndefined.js */ "./node_modules/underscore/modules/isUndefined.js");




// Get the value of the (deep) property on `path` from `object`.
// If any property in `path` does not exist or if the value is
// `undefined`, return `defaultValue` instead.
// The `path` is normalized through `_.toPath`.
function get(object, path, defaultValue) {
  var value = (0,_deepGet_js__WEBPACK_IMPORTED_MODULE_1__["default"])(object, (0,_toPath_js__WEBPACK_IMPORTED_MODULE_0__["default"])(path));
  return (0,_isUndefined_js__WEBPACK_IMPORTED_MODULE_2__["default"])(value) ? defaultValue : value;
}


/***/ }),

/***/ "./node_modules/underscore/modules/groupBy.js":
/*!****************************************************!*\
  !*** ./node_modules/underscore/modules/groupBy.js ***!
  \****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _group_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_group.js */ "./node_modules/underscore/modules/_group.js");
/* harmony import */ var _has_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./_has.js */ "./node_modules/underscore/modules/_has.js");



// Groups the object's values by a criterion. Pass either a string attribute
// to group by, or a function that returns the criterion.
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((0,_group_js__WEBPACK_IMPORTED_MODULE_0__["default"])(function(result, value, key) {
  if ((0,_has_js__WEBPACK_IMPORTED_MODULE_1__["default"])(result, key)) result[key].push(value); else result[key] = [value];
}));


/***/ }),

/***/ "./node_modules/underscore/modules/has.js":
/*!************************************************!*\
  !*** ./node_modules/underscore/modules/has.js ***!
  \************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ has)
/* harmony export */ });
/* harmony import */ var _has_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_has.js */ "./node_modules/underscore/modules/_has.js");
/* harmony import */ var _toPath_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./_toPath.js */ "./node_modules/underscore/modules/_toPath.js");



// Shortcut function for checking if an object has a given property directly on
// itself (in other words, not on a prototype). Unlike the internal `has`
// function, this public version can also traverse nested properties.
function has(obj, path) {
  path = (0,_toPath_js__WEBPACK_IMPORTED_MODULE_1__["default"])(path);
  var length = path.length;
  for (var i = 0; i < length; i++) {
    var key = path[i];
    if (!(0,_has_js__WEBPACK_IMPORTED_MODULE_0__["default"])(obj, key)) return false;
    obj = obj[key];
  }
  return !!length;
}


/***/ }),

/***/ "./node_modules/underscore/modules/identity.js":
/*!*****************************************************!*\
  !*** ./node_modules/underscore/modules/identity.js ***!
  \*****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ identity)
/* harmony export */ });
// Keep the identity function around for default iteratees.
function identity(value) {
  return value;
}


/***/ }),

/***/ "./node_modules/underscore/modules/index-all.js":
/*!******************************************************!*\
  !*** ./node_modules/underscore/modules/index-all.js ***!
  \******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   VERSION: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.VERSION),
/* harmony export */   after: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.after),
/* harmony export */   all: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.all),
/* harmony export */   allKeys: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.allKeys),
/* harmony export */   any: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.any),
/* harmony export */   assign: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.assign),
/* harmony export */   before: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.before),
/* harmony export */   bind: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.bind),
/* harmony export */   bindAll: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.bindAll),
/* harmony export */   chain: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.chain),
/* harmony export */   chunk: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.chunk),
/* harmony export */   clone: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.clone),
/* harmony export */   collect: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.collect),
/* harmony export */   compact: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.compact),
/* harmony export */   compose: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.compose),
/* harmony export */   constant: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.constant),
/* harmony export */   contains: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.contains),
/* harmony export */   countBy: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.countBy),
/* harmony export */   create: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.create),
/* harmony export */   debounce: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.debounce),
/* harmony export */   "default": () => (/* reexport safe */ _index_default_js__WEBPACK_IMPORTED_MODULE_0__["default"]),
/* harmony export */   defaults: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.defaults),
/* harmony export */   defer: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.defer),
/* harmony export */   delay: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.delay),
/* harmony export */   detect: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.detect),
/* harmony export */   difference: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.difference),
/* harmony export */   drop: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.drop),
/* harmony export */   each: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.each),
/* harmony export */   escape: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.escape),
/* harmony export */   every: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.every),
/* harmony export */   extend: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.extend),
/* harmony export */   extendOwn: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.extendOwn),
/* harmony export */   filter: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.filter),
/* harmony export */   find: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.find),
/* harmony export */   findIndex: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.findIndex),
/* harmony export */   findKey: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.findKey),
/* harmony export */   findLastIndex: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.findLastIndex),
/* harmony export */   findWhere: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.findWhere),
/* harmony export */   first: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.first),
/* harmony export */   flatten: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.flatten),
/* harmony export */   foldl: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.foldl),
/* harmony export */   foldr: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.foldr),
/* harmony export */   forEach: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.forEach),
/* harmony export */   functions: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.functions),
/* harmony export */   get: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.get),
/* harmony export */   groupBy: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.groupBy),
/* harmony export */   has: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.has),
/* harmony export */   head: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.head),
/* harmony export */   identity: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.identity),
/* harmony export */   include: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.include),
/* harmony export */   includes: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.includes),
/* harmony export */   indexBy: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.indexBy),
/* harmony export */   indexOf: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.indexOf),
/* harmony export */   initial: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.initial),
/* harmony export */   inject: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.inject),
/* harmony export */   intersection: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.intersection),
/* harmony export */   invert: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.invert),
/* harmony export */   invoke: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.invoke),
/* harmony export */   isArguments: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.isArguments),
/* harmony export */   isArray: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.isArray),
/* harmony export */   isArrayBuffer: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.isArrayBuffer),
/* harmony export */   isBoolean: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.isBoolean),
/* harmony export */   isDataView: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.isDataView),
/* harmony export */   isDate: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.isDate),
/* harmony export */   isElement: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.isElement),
/* harmony export */   isEmpty: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.isEmpty),
/* harmony export */   isEqual: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.isEqual),
/* harmony export */   isError: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.isError),
/* harmony export */   isFinite: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.isFinite),
/* harmony export */   isFunction: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.isFunction),
/* harmony export */   isMap: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.isMap),
/* harmony export */   isMatch: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.isMatch),
/* harmony export */   isNaN: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.isNaN),
/* harmony export */   isNull: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.isNull),
/* harmony export */   isNumber: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.isNumber),
/* harmony export */   isObject: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.isObject),
/* harmony export */   isRegExp: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.isRegExp),
/* harmony export */   isSet: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.isSet),
/* harmony export */   isString: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.isString),
/* harmony export */   isSymbol: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.isSymbol),
/* harmony export */   isTypedArray: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.isTypedArray),
/* harmony export */   isUndefined: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.isUndefined),
/* harmony export */   isWeakMap: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.isWeakMap),
/* harmony export */   isWeakSet: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.isWeakSet),
/* harmony export */   iteratee: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.iteratee),
/* harmony export */   keys: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.keys),
/* harmony export */   last: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.last),
/* harmony export */   lastIndexOf: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.lastIndexOf),
/* harmony export */   map: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.map),
/* harmony export */   mapObject: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.mapObject),
/* harmony export */   matcher: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.matcher),
/* harmony export */   matches: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.matches),
/* harmony export */   max: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.max),
/* harmony export */   memoize: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.memoize),
/* harmony export */   methods: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.methods),
/* harmony export */   min: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.min),
/* harmony export */   mixin: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.mixin),
/* harmony export */   negate: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.negate),
/* harmony export */   noop: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.noop),
/* harmony export */   now: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.now),
/* harmony export */   object: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.object),
/* harmony export */   omit: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.omit),
/* harmony export */   once: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.once),
/* harmony export */   pairs: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.pairs),
/* harmony export */   partial: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.partial),
/* harmony export */   partition: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.partition),
/* harmony export */   pick: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.pick),
/* harmony export */   pluck: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.pluck),
/* harmony export */   property: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.property),
/* harmony export */   propertyOf: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.propertyOf),
/* harmony export */   random: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.random),
/* harmony export */   range: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.range),
/* harmony export */   reduce: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.reduce),
/* harmony export */   reduceRight: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.reduceRight),
/* harmony export */   reject: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.reject),
/* harmony export */   rest: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.rest),
/* harmony export */   restArguments: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.restArguments),
/* harmony export */   result: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.result),
/* harmony export */   sample: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.sample),
/* harmony export */   select: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.select),
/* harmony export */   shuffle: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.shuffle),
/* harmony export */   size: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.size),
/* harmony export */   some: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.some),
/* harmony export */   sortBy: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.sortBy),
/* harmony export */   sortedIndex: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.sortedIndex),
/* harmony export */   tail: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.tail),
/* harmony export */   take: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.take),
/* harmony export */   tap: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.tap),
/* harmony export */   template: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.template),
/* harmony export */   templateSettings: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.templateSettings),
/* harmony export */   throttle: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.throttle),
/* harmony export */   times: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.times),
/* harmony export */   toArray: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.toArray),
/* harmony export */   toPath: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.toPath),
/* harmony export */   transpose: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.transpose),
/* harmony export */   unescape: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.unescape),
/* harmony export */   union: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.union),
/* harmony export */   uniq: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.uniq),
/* harmony export */   unique: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.unique),
/* harmony export */   uniqueId: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.uniqueId),
/* harmony export */   unzip: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.unzip),
/* harmony export */   values: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.values),
/* harmony export */   where: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.where),
/* harmony export */   without: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.without),
/* harmony export */   wrap: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.wrap),
/* harmony export */   zip: () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_1__.zip)
/* harmony export */ });
/* harmony import */ var _index_default_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./index-default.js */ "./node_modules/underscore/modules/index-default.js");
/* harmony import */ var _index_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./index.js */ "./node_modules/underscore/modules/index.js");
// ESM Exports
// ===========
// This module is the package entry point for ES module users. In other words,
// it is the module they are interfacing with when they import from the whole
// package instead of from a submodule, like this:
//
// ```js
// import { map } from 'underscore';
// ```
//
// The difference with `./index-default`, which is the package entry point for
// CommonJS, AMD and UMD users, is purely technical. In ES modules, named and
// default exports are considered to be siblings, so when you have a default
// export, its properties are not automatically available as named exports. For
// this reason, we re-export the named exports in addition to providing the same
// default export as in `./index-default`.




/***/ }),

/***/ "./node_modules/underscore/modules/index-default.js":
/*!**********************************************************!*\
  !*** ./node_modules/underscore/modules/index-default.js ***!
  \**********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./index.js */ "./node_modules/underscore/modules/index.js");
// Default Export
// ==============
// In this module, we mix our bundled exports into the `_` object and export
// the result. This is analogous to setting `module.exports = _` in CommonJS.
// Hence, this module is also the entry point of our UMD bundle and the package
// entry point for CommonJS and AMD users. In other words, this is (the source
// of) the module you are interfacing with when you do any of the following:
//
// ```js
// // CommonJS
// var _ = require('underscore');
//
// // AMD
// define(['underscore'], function(_) {...});
//
// // UMD in the browser
// // _ is available as a global variable
// ```



// Add all of the Underscore functions to the wrapper object.
var _ = (0,_index_js__WEBPACK_IMPORTED_MODULE_0__.mixin)(_index_js__WEBPACK_IMPORTED_MODULE_0__);
// Legacy Node.js API.
_._ = _;
// Export the Underscore API.
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_);


/***/ }),

/***/ "./node_modules/underscore/modules/index.js":
/*!**************************************************!*\
  !*** ./node_modules/underscore/modules/index.js ***!
  \**************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   VERSION: () => (/* reexport safe */ _setup_js__WEBPACK_IMPORTED_MODULE_0__.VERSION),
/* harmony export */   after: () => (/* reexport safe */ _after_js__WEBPACK_IMPORTED_MODULE_72__["default"]),
/* harmony export */   all: () => (/* reexport safe */ _every_js__WEBPACK_IMPORTED_MODULE_89__["default"]),
/* harmony export */   allKeys: () => (/* reexport safe */ _allKeys_js__WEBPACK_IMPORTED_MODULE_29__["default"]),
/* harmony export */   any: () => (/* reexport safe */ _some_js__WEBPACK_IMPORTED_MODULE_90__["default"]),
/* harmony export */   assign: () => (/* reexport safe */ _extendOwn_js__WEBPACK_IMPORTED_MODULE_35__["default"]),
/* harmony export */   before: () => (/* reexport safe */ _before_js__WEBPACK_IMPORTED_MODULE_73__["default"]),
/* harmony export */   bind: () => (/* reexport safe */ _bind_js__WEBPACK_IMPORTED_MODULE_62__["default"]),
/* harmony export */   bindAll: () => (/* reexport safe */ _bindAll_js__WEBPACK_IMPORTED_MODULE_63__["default"]),
/* harmony export */   chain: () => (/* reexport safe */ _chain_js__WEBPACK_IMPORTED_MODULE_59__["default"]),
/* harmony export */   chunk: () => (/* reexport safe */ _chunk_js__WEBPACK_IMPORTED_MODULE_123__["default"]),
/* harmony export */   clone: () => (/* reexport safe */ _clone_js__WEBPACK_IMPORTED_MODULE_38__["default"]),
/* harmony export */   collect: () => (/* reexport safe */ _map_js__WEBPACK_IMPORTED_MODULE_84__["default"]),
/* harmony export */   compact: () => (/* reexport safe */ _compact_js__WEBPACK_IMPORTED_MODULE_112__["default"]),
/* harmony export */   compose: () => (/* reexport safe */ _compose_js__WEBPACK_IMPORTED_MODULE_71__["default"]),
/* harmony export */   constant: () => (/* reexport safe */ _constant_js__WEBPACK_IMPORTED_MODULE_44__["default"]),
/* harmony export */   contains: () => (/* reexport safe */ _contains_js__WEBPACK_IMPORTED_MODULE_91__["default"]),
/* harmony export */   countBy: () => (/* reexport safe */ _countBy_js__WEBPACK_IMPORTED_MODULE_102__["default"]),
/* harmony export */   create: () => (/* reexport safe */ _create_js__WEBPACK_IMPORTED_MODULE_37__["default"]),
/* harmony export */   debounce: () => (/* reexport safe */ _debounce_js__WEBPACK_IMPORTED_MODULE_68__["default"]),
/* harmony export */   "default": () => (/* reexport safe */ _underscore_array_methods_js__WEBPACK_IMPORTED_MODULE_125__["default"]),
/* harmony export */   defaults: () => (/* reexport safe */ _defaults_js__WEBPACK_IMPORTED_MODULE_36__["default"]),
/* harmony export */   defer: () => (/* reexport safe */ _defer_js__WEBPACK_IMPORTED_MODULE_66__["default"]),
/* harmony export */   delay: () => (/* reexport safe */ _delay_js__WEBPACK_IMPORTED_MODULE_65__["default"]),
/* harmony export */   detect: () => (/* reexport safe */ _find_js__WEBPACK_IMPORTED_MODULE_81__["default"]),
/* harmony export */   difference: () => (/* reexport safe */ _difference_js__WEBPACK_IMPORTED_MODULE_118__["default"]),
/* harmony export */   drop: () => (/* reexport safe */ _rest_js__WEBPACK_IMPORTED_MODULE_111__["default"]),
/* harmony export */   each: () => (/* reexport safe */ _each_js__WEBPACK_IMPORTED_MODULE_83__["default"]),
/* harmony export */   escape: () => (/* reexport safe */ _escape_js__WEBPACK_IMPORTED_MODULE_53__["default"]),
/* harmony export */   every: () => (/* reexport safe */ _every_js__WEBPACK_IMPORTED_MODULE_89__["default"]),
/* harmony export */   extend: () => (/* reexport safe */ _extend_js__WEBPACK_IMPORTED_MODULE_34__["default"]),
/* harmony export */   extendOwn: () => (/* reexport safe */ _extendOwn_js__WEBPACK_IMPORTED_MODULE_35__["default"]),
/* harmony export */   filter: () => (/* reexport safe */ _filter_js__WEBPACK_IMPORTED_MODULE_87__["default"]),
/* harmony export */   find: () => (/* reexport safe */ _find_js__WEBPACK_IMPORTED_MODULE_81__["default"]),
/* harmony export */   findIndex: () => (/* reexport safe */ _findIndex_js__WEBPACK_IMPORTED_MODULE_76__["default"]),
/* harmony export */   findKey: () => (/* reexport safe */ _findKey_js__WEBPACK_IMPORTED_MODULE_75__["default"]),
/* harmony export */   findLastIndex: () => (/* reexport safe */ _findLastIndex_js__WEBPACK_IMPORTED_MODULE_77__["default"]),
/* harmony export */   findWhere: () => (/* reexport safe */ _findWhere_js__WEBPACK_IMPORTED_MODULE_82__["default"]),
/* harmony export */   first: () => (/* reexport safe */ _first_js__WEBPACK_IMPORTED_MODULE_108__["default"]),
/* harmony export */   flatten: () => (/* reexport safe */ _flatten_js__WEBPACK_IMPORTED_MODULE_113__["default"]),
/* harmony export */   foldl: () => (/* reexport safe */ _reduce_js__WEBPACK_IMPORTED_MODULE_85__["default"]),
/* harmony export */   foldr: () => (/* reexport safe */ _reduceRight_js__WEBPACK_IMPORTED_MODULE_86__["default"]),
/* harmony export */   forEach: () => (/* reexport safe */ _each_js__WEBPACK_IMPORTED_MODULE_83__["default"]),
/* harmony export */   functions: () => (/* reexport safe */ _functions_js__WEBPACK_IMPORTED_MODULE_33__["default"]),
/* harmony export */   get: () => (/* reexport safe */ _get_js__WEBPACK_IMPORTED_MODULE_40__["default"]),
/* harmony export */   groupBy: () => (/* reexport safe */ _groupBy_js__WEBPACK_IMPORTED_MODULE_100__["default"]),
/* harmony export */   has: () => (/* reexport safe */ _has_js__WEBPACK_IMPORTED_MODULE_41__["default"]),
/* harmony export */   head: () => (/* reexport safe */ _first_js__WEBPACK_IMPORTED_MODULE_108__["default"]),
/* harmony export */   identity: () => (/* reexport safe */ _identity_js__WEBPACK_IMPORTED_MODULE_43__["default"]),
/* harmony export */   include: () => (/* reexport safe */ _contains_js__WEBPACK_IMPORTED_MODULE_91__["default"]),
/* harmony export */   includes: () => (/* reexport safe */ _contains_js__WEBPACK_IMPORTED_MODULE_91__["default"]),
/* harmony export */   indexBy: () => (/* reexport safe */ _indexBy_js__WEBPACK_IMPORTED_MODULE_101__["default"]),
/* harmony export */   indexOf: () => (/* reexport safe */ _indexOf_js__WEBPACK_IMPORTED_MODULE_79__["default"]),
/* harmony export */   initial: () => (/* reexport safe */ _initial_js__WEBPACK_IMPORTED_MODULE_109__["default"]),
/* harmony export */   inject: () => (/* reexport safe */ _reduce_js__WEBPACK_IMPORTED_MODULE_85__["default"]),
/* harmony export */   intersection: () => (/* reexport safe */ _intersection_js__WEBPACK_IMPORTED_MODULE_117__["default"]),
/* harmony export */   invert: () => (/* reexport safe */ _invert_js__WEBPACK_IMPORTED_MODULE_32__["default"]),
/* harmony export */   invoke: () => (/* reexport safe */ _invoke_js__WEBPACK_IMPORTED_MODULE_92__["default"]),
/* harmony export */   isArguments: () => (/* reexport safe */ _isArguments_js__WEBPACK_IMPORTED_MODULE_17__["default"]),
/* harmony export */   isArray: () => (/* reexport safe */ _isArray_js__WEBPACK_IMPORTED_MODULE_15__["default"]),
/* harmony export */   isArrayBuffer: () => (/* reexport safe */ _isArrayBuffer_js__WEBPACK_IMPORTED_MODULE_13__["default"]),
/* harmony export */   isBoolean: () => (/* reexport safe */ _isBoolean_js__WEBPACK_IMPORTED_MODULE_5__["default"]),
/* harmony export */   isDataView: () => (/* reexport safe */ _isDataView_js__WEBPACK_IMPORTED_MODULE_14__["default"]),
/* harmony export */   isDate: () => (/* reexport safe */ _isDate_js__WEBPACK_IMPORTED_MODULE_9__["default"]),
/* harmony export */   isElement: () => (/* reexport safe */ _isElement_js__WEBPACK_IMPORTED_MODULE_6__["default"]),
/* harmony export */   isEmpty: () => (/* reexport safe */ _isEmpty_js__WEBPACK_IMPORTED_MODULE_21__["default"]),
/* harmony export */   isEqual: () => (/* reexport safe */ _isEqual_js__WEBPACK_IMPORTED_MODULE_23__["default"]),
/* harmony export */   isError: () => (/* reexport safe */ _isError_js__WEBPACK_IMPORTED_MODULE_11__["default"]),
/* harmony export */   isFinite: () => (/* reexport safe */ _isFinite_js__WEBPACK_IMPORTED_MODULE_18__["default"]),
/* harmony export */   isFunction: () => (/* reexport safe */ _isFunction_js__WEBPACK_IMPORTED_MODULE_16__["default"]),
/* harmony export */   isMap: () => (/* reexport safe */ _isMap_js__WEBPACK_IMPORTED_MODULE_24__["default"]),
/* harmony export */   isMatch: () => (/* reexport safe */ _isMatch_js__WEBPACK_IMPORTED_MODULE_22__["default"]),
/* harmony export */   isNaN: () => (/* reexport safe */ _isNaN_js__WEBPACK_IMPORTED_MODULE_19__["default"]),
/* harmony export */   isNull: () => (/* reexport safe */ _isNull_js__WEBPACK_IMPORTED_MODULE_3__["default"]),
/* harmony export */   isNumber: () => (/* reexport safe */ _isNumber_js__WEBPACK_IMPORTED_MODULE_8__["default"]),
/* harmony export */   isObject: () => (/* reexport safe */ _isObject_js__WEBPACK_IMPORTED_MODULE_2__["default"]),
/* harmony export */   isRegExp: () => (/* reexport safe */ _isRegExp_js__WEBPACK_IMPORTED_MODULE_10__["default"]),
/* harmony export */   isSet: () => (/* reexport safe */ _isSet_js__WEBPACK_IMPORTED_MODULE_26__["default"]),
/* harmony export */   isString: () => (/* reexport safe */ _isString_js__WEBPACK_IMPORTED_MODULE_7__["default"]),
/* harmony export */   isSymbol: () => (/* reexport safe */ _isSymbol_js__WEBPACK_IMPORTED_MODULE_12__["default"]),
/* harmony export */   isTypedArray: () => (/* reexport safe */ _isTypedArray_js__WEBPACK_IMPORTED_MODULE_20__["default"]),
/* harmony export */   isUndefined: () => (/* reexport safe */ _isUndefined_js__WEBPACK_IMPORTED_MODULE_4__["default"]),
/* harmony export */   isWeakMap: () => (/* reexport safe */ _isWeakMap_js__WEBPACK_IMPORTED_MODULE_25__["default"]),
/* harmony export */   isWeakSet: () => (/* reexport safe */ _isWeakSet_js__WEBPACK_IMPORTED_MODULE_27__["default"]),
/* harmony export */   iteratee: () => (/* reexport safe */ _iteratee_js__WEBPACK_IMPORTED_MODULE_60__["default"]),
/* harmony export */   keys: () => (/* reexport safe */ _keys_js__WEBPACK_IMPORTED_MODULE_28__["default"]),
/* harmony export */   last: () => (/* reexport safe */ _last_js__WEBPACK_IMPORTED_MODULE_110__["default"]),
/* harmony export */   lastIndexOf: () => (/* reexport safe */ _lastIndexOf_js__WEBPACK_IMPORTED_MODULE_80__["default"]),
/* harmony export */   map: () => (/* reexport safe */ _map_js__WEBPACK_IMPORTED_MODULE_84__["default"]),
/* harmony export */   mapObject: () => (/* reexport safe */ _mapObject_js__WEBPACK_IMPORTED_MODULE_42__["default"]),
/* harmony export */   matcher: () => (/* reexport safe */ _matcher_js__WEBPACK_IMPORTED_MODULE_49__["default"]),
/* harmony export */   matches: () => (/* reexport safe */ _matcher_js__WEBPACK_IMPORTED_MODULE_49__["default"]),
/* harmony export */   max: () => (/* reexport safe */ _max_js__WEBPACK_IMPORTED_MODULE_95__["default"]),
/* harmony export */   memoize: () => (/* reexport safe */ _memoize_js__WEBPACK_IMPORTED_MODULE_64__["default"]),
/* harmony export */   methods: () => (/* reexport safe */ _functions_js__WEBPACK_IMPORTED_MODULE_33__["default"]),
/* harmony export */   min: () => (/* reexport safe */ _min_js__WEBPACK_IMPORTED_MODULE_96__["default"]),
/* harmony export */   mixin: () => (/* reexport safe */ _mixin_js__WEBPACK_IMPORTED_MODULE_124__["default"]),
/* harmony export */   negate: () => (/* reexport safe */ _negate_js__WEBPACK_IMPORTED_MODULE_70__["default"]),
/* harmony export */   noop: () => (/* reexport safe */ _noop_js__WEBPACK_IMPORTED_MODULE_45__["default"]),
/* harmony export */   now: () => (/* reexport safe */ _now_js__WEBPACK_IMPORTED_MODULE_52__["default"]),
/* harmony export */   object: () => (/* reexport safe */ _object_js__WEBPACK_IMPORTED_MODULE_121__["default"]),
/* harmony export */   omit: () => (/* reexport safe */ _omit_js__WEBPACK_IMPORTED_MODULE_107__["default"]),
/* harmony export */   once: () => (/* reexport safe */ _once_js__WEBPACK_IMPORTED_MODULE_74__["default"]),
/* harmony export */   pairs: () => (/* reexport safe */ _pairs_js__WEBPACK_IMPORTED_MODULE_31__["default"]),
/* harmony export */   partial: () => (/* reexport safe */ _partial_js__WEBPACK_IMPORTED_MODULE_61__["default"]),
/* harmony export */   partition: () => (/* reexport safe */ _partition_js__WEBPACK_IMPORTED_MODULE_103__["default"]),
/* harmony export */   pick: () => (/* reexport safe */ _pick_js__WEBPACK_IMPORTED_MODULE_106__["default"]),
/* harmony export */   pluck: () => (/* reexport safe */ _pluck_js__WEBPACK_IMPORTED_MODULE_93__["default"]),
/* harmony export */   property: () => (/* reexport safe */ _property_js__WEBPACK_IMPORTED_MODULE_47__["default"]),
/* harmony export */   propertyOf: () => (/* reexport safe */ _propertyOf_js__WEBPACK_IMPORTED_MODULE_48__["default"]),
/* harmony export */   random: () => (/* reexport safe */ _random_js__WEBPACK_IMPORTED_MODULE_51__["default"]),
/* harmony export */   range: () => (/* reexport safe */ _range_js__WEBPACK_IMPORTED_MODULE_122__["default"]),
/* harmony export */   reduce: () => (/* reexport safe */ _reduce_js__WEBPACK_IMPORTED_MODULE_85__["default"]),
/* harmony export */   reduceRight: () => (/* reexport safe */ _reduceRight_js__WEBPACK_IMPORTED_MODULE_86__["default"]),
/* harmony export */   reject: () => (/* reexport safe */ _reject_js__WEBPACK_IMPORTED_MODULE_88__["default"]),
/* harmony export */   rest: () => (/* reexport safe */ _rest_js__WEBPACK_IMPORTED_MODULE_111__["default"]),
/* harmony export */   restArguments: () => (/* reexport safe */ _restArguments_js__WEBPACK_IMPORTED_MODULE_1__["default"]),
/* harmony export */   result: () => (/* reexport safe */ _result_js__WEBPACK_IMPORTED_MODULE_57__["default"]),
/* harmony export */   sample: () => (/* reexport safe */ _sample_js__WEBPACK_IMPORTED_MODULE_98__["default"]),
/* harmony export */   select: () => (/* reexport safe */ _filter_js__WEBPACK_IMPORTED_MODULE_87__["default"]),
/* harmony export */   shuffle: () => (/* reexport safe */ _shuffle_js__WEBPACK_IMPORTED_MODULE_97__["default"]),
/* harmony export */   size: () => (/* reexport safe */ _size_js__WEBPACK_IMPORTED_MODULE_105__["default"]),
/* harmony export */   some: () => (/* reexport safe */ _some_js__WEBPACK_IMPORTED_MODULE_90__["default"]),
/* harmony export */   sortBy: () => (/* reexport safe */ _sortBy_js__WEBPACK_IMPORTED_MODULE_99__["default"]),
/* harmony export */   sortedIndex: () => (/* reexport safe */ _sortedIndex_js__WEBPACK_IMPORTED_MODULE_78__["default"]),
/* harmony export */   tail: () => (/* reexport safe */ _rest_js__WEBPACK_IMPORTED_MODULE_111__["default"]),
/* harmony export */   take: () => (/* reexport safe */ _first_js__WEBPACK_IMPORTED_MODULE_108__["default"]),
/* harmony export */   tap: () => (/* reexport safe */ _tap_js__WEBPACK_IMPORTED_MODULE_39__["default"]),
/* harmony export */   template: () => (/* reexport safe */ _template_js__WEBPACK_IMPORTED_MODULE_56__["default"]),
/* harmony export */   templateSettings: () => (/* reexport safe */ _templateSettings_js__WEBPACK_IMPORTED_MODULE_55__["default"]),
/* harmony export */   throttle: () => (/* reexport safe */ _throttle_js__WEBPACK_IMPORTED_MODULE_67__["default"]),
/* harmony export */   times: () => (/* reexport safe */ _times_js__WEBPACK_IMPORTED_MODULE_50__["default"]),
/* harmony export */   toArray: () => (/* reexport safe */ _toArray_js__WEBPACK_IMPORTED_MODULE_104__["default"]),
/* harmony export */   toPath: () => (/* reexport safe */ _toPath_js__WEBPACK_IMPORTED_MODULE_46__["default"]),
/* harmony export */   transpose: () => (/* reexport safe */ _unzip_js__WEBPACK_IMPORTED_MODULE_119__["default"]),
/* harmony export */   unescape: () => (/* reexport safe */ _unescape_js__WEBPACK_IMPORTED_MODULE_54__["default"]),
/* harmony export */   union: () => (/* reexport safe */ _union_js__WEBPACK_IMPORTED_MODULE_116__["default"]),
/* harmony export */   uniq: () => (/* reexport safe */ _uniq_js__WEBPACK_IMPORTED_MODULE_115__["default"]),
/* harmony export */   unique: () => (/* reexport safe */ _uniq_js__WEBPACK_IMPORTED_MODULE_115__["default"]),
/* harmony export */   uniqueId: () => (/* reexport safe */ _uniqueId_js__WEBPACK_IMPORTED_MODULE_58__["default"]),
/* harmony export */   unzip: () => (/* reexport safe */ _unzip_js__WEBPACK_IMPORTED_MODULE_119__["default"]),
/* harmony export */   values: () => (/* reexport safe */ _values_js__WEBPACK_IMPORTED_MODULE_30__["default"]),
/* harmony export */   where: () => (/* reexport safe */ _where_js__WEBPACK_IMPORTED_MODULE_94__["default"]),
/* harmony export */   without: () => (/* reexport safe */ _without_js__WEBPACK_IMPORTED_MODULE_114__["default"]),
/* harmony export */   wrap: () => (/* reexport safe */ _wrap_js__WEBPACK_IMPORTED_MODULE_69__["default"]),
/* harmony export */   zip: () => (/* reexport safe */ _zip_js__WEBPACK_IMPORTED_MODULE_120__["default"])
/* harmony export */ });
/* harmony import */ var _setup_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_setup.js */ "./node_modules/underscore/modules/_setup.js");
/* harmony import */ var _restArguments_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./restArguments.js */ "./node_modules/underscore/modules/restArguments.js");
/* harmony import */ var _isObject_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./isObject.js */ "./node_modules/underscore/modules/isObject.js");
/* harmony import */ var _isNull_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./isNull.js */ "./node_modules/underscore/modules/isNull.js");
/* harmony import */ var _isUndefined_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./isUndefined.js */ "./node_modules/underscore/modules/isUndefined.js");
/* harmony import */ var _isBoolean_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./isBoolean.js */ "./node_modules/underscore/modules/isBoolean.js");
/* harmony import */ var _isElement_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./isElement.js */ "./node_modules/underscore/modules/isElement.js");
/* harmony import */ var _isString_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./isString.js */ "./node_modules/underscore/modules/isString.js");
/* harmony import */ var _isNumber_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./isNumber.js */ "./node_modules/underscore/modules/isNumber.js");
/* harmony import */ var _isDate_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./isDate.js */ "./node_modules/underscore/modules/isDate.js");
/* harmony import */ var _isRegExp_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./isRegExp.js */ "./node_modules/underscore/modules/isRegExp.js");
/* harmony import */ var _isError_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./isError.js */ "./node_modules/underscore/modules/isError.js");
/* harmony import */ var _isSymbol_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./isSymbol.js */ "./node_modules/underscore/modules/isSymbol.js");
/* harmony import */ var _isArrayBuffer_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./isArrayBuffer.js */ "./node_modules/underscore/modules/isArrayBuffer.js");
/* harmony import */ var _isDataView_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./isDataView.js */ "./node_modules/underscore/modules/isDataView.js");
/* harmony import */ var _isArray_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./isArray.js */ "./node_modules/underscore/modules/isArray.js");
/* harmony import */ var _isFunction_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./isFunction.js */ "./node_modules/underscore/modules/isFunction.js");
/* harmony import */ var _isArguments_js__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ./isArguments.js */ "./node_modules/underscore/modules/isArguments.js");
/* harmony import */ var _isFinite_js__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ./isFinite.js */ "./node_modules/underscore/modules/isFinite.js");
/* harmony import */ var _isNaN_js__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ./isNaN.js */ "./node_modules/underscore/modules/isNaN.js");
/* harmony import */ var _isTypedArray_js__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! ./isTypedArray.js */ "./node_modules/underscore/modules/isTypedArray.js");
/* harmony import */ var _isEmpty_js__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! ./isEmpty.js */ "./node_modules/underscore/modules/isEmpty.js");
/* harmony import */ var _isMatch_js__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! ./isMatch.js */ "./node_modules/underscore/modules/isMatch.js");
/* harmony import */ var _isEqual_js__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! ./isEqual.js */ "./node_modules/underscore/modules/isEqual.js");
/* harmony import */ var _isMap_js__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! ./isMap.js */ "./node_modules/underscore/modules/isMap.js");
/* harmony import */ var _isWeakMap_js__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! ./isWeakMap.js */ "./node_modules/underscore/modules/isWeakMap.js");
/* harmony import */ var _isSet_js__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(/*! ./isSet.js */ "./node_modules/underscore/modules/isSet.js");
/* harmony import */ var _isWeakSet_js__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(/*! ./isWeakSet.js */ "./node_modules/underscore/modules/isWeakSet.js");
/* harmony import */ var _keys_js__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(/*! ./keys.js */ "./node_modules/underscore/modules/keys.js");
/* harmony import */ var _allKeys_js__WEBPACK_IMPORTED_MODULE_29__ = __webpack_require__(/*! ./allKeys.js */ "./node_modules/underscore/modules/allKeys.js");
/* harmony import */ var _values_js__WEBPACK_IMPORTED_MODULE_30__ = __webpack_require__(/*! ./values.js */ "./node_modules/underscore/modules/values.js");
/* harmony import */ var _pairs_js__WEBPACK_IMPORTED_MODULE_31__ = __webpack_require__(/*! ./pairs.js */ "./node_modules/underscore/modules/pairs.js");
/* harmony import */ var _invert_js__WEBPACK_IMPORTED_MODULE_32__ = __webpack_require__(/*! ./invert.js */ "./node_modules/underscore/modules/invert.js");
/* harmony import */ var _functions_js__WEBPACK_IMPORTED_MODULE_33__ = __webpack_require__(/*! ./functions.js */ "./node_modules/underscore/modules/functions.js");
/* harmony import */ var _extend_js__WEBPACK_IMPORTED_MODULE_34__ = __webpack_require__(/*! ./extend.js */ "./node_modules/underscore/modules/extend.js");
/* harmony import */ var _extendOwn_js__WEBPACK_IMPORTED_MODULE_35__ = __webpack_require__(/*! ./extendOwn.js */ "./node_modules/underscore/modules/extendOwn.js");
/* harmony import */ var _defaults_js__WEBPACK_IMPORTED_MODULE_36__ = __webpack_require__(/*! ./defaults.js */ "./node_modules/underscore/modules/defaults.js");
/* harmony import */ var _create_js__WEBPACK_IMPORTED_MODULE_37__ = __webpack_require__(/*! ./create.js */ "./node_modules/underscore/modules/create.js");
/* harmony import */ var _clone_js__WEBPACK_IMPORTED_MODULE_38__ = __webpack_require__(/*! ./clone.js */ "./node_modules/underscore/modules/clone.js");
/* harmony import */ var _tap_js__WEBPACK_IMPORTED_MODULE_39__ = __webpack_require__(/*! ./tap.js */ "./node_modules/underscore/modules/tap.js");
/* harmony import */ var _get_js__WEBPACK_IMPORTED_MODULE_40__ = __webpack_require__(/*! ./get.js */ "./node_modules/underscore/modules/get.js");
/* harmony import */ var _has_js__WEBPACK_IMPORTED_MODULE_41__ = __webpack_require__(/*! ./has.js */ "./node_modules/underscore/modules/has.js");
/* harmony import */ var _mapObject_js__WEBPACK_IMPORTED_MODULE_42__ = __webpack_require__(/*! ./mapObject.js */ "./node_modules/underscore/modules/mapObject.js");
/* harmony import */ var _identity_js__WEBPACK_IMPORTED_MODULE_43__ = __webpack_require__(/*! ./identity.js */ "./node_modules/underscore/modules/identity.js");
/* harmony import */ var _constant_js__WEBPACK_IMPORTED_MODULE_44__ = __webpack_require__(/*! ./constant.js */ "./node_modules/underscore/modules/constant.js");
/* harmony import */ var _noop_js__WEBPACK_IMPORTED_MODULE_45__ = __webpack_require__(/*! ./noop.js */ "./node_modules/underscore/modules/noop.js");
/* harmony import */ var _toPath_js__WEBPACK_IMPORTED_MODULE_46__ = __webpack_require__(/*! ./toPath.js */ "./node_modules/underscore/modules/toPath.js");
/* harmony import */ var _property_js__WEBPACK_IMPORTED_MODULE_47__ = __webpack_require__(/*! ./property.js */ "./node_modules/underscore/modules/property.js");
/* harmony import */ var _propertyOf_js__WEBPACK_IMPORTED_MODULE_48__ = __webpack_require__(/*! ./propertyOf.js */ "./node_modules/underscore/modules/propertyOf.js");
/* harmony import */ var _matcher_js__WEBPACK_IMPORTED_MODULE_49__ = __webpack_require__(/*! ./matcher.js */ "./node_modules/underscore/modules/matcher.js");
/* harmony import */ var _times_js__WEBPACK_IMPORTED_MODULE_50__ = __webpack_require__(/*! ./times.js */ "./node_modules/underscore/modules/times.js");
/* harmony import */ var _random_js__WEBPACK_IMPORTED_MODULE_51__ = __webpack_require__(/*! ./random.js */ "./node_modules/underscore/modules/random.js");
/* harmony import */ var _now_js__WEBPACK_IMPORTED_MODULE_52__ = __webpack_require__(/*! ./now.js */ "./node_modules/underscore/modules/now.js");
/* harmony import */ var _escape_js__WEBPACK_IMPORTED_MODULE_53__ = __webpack_require__(/*! ./escape.js */ "./node_modules/underscore/modules/escape.js");
/* harmony import */ var _unescape_js__WEBPACK_IMPORTED_MODULE_54__ = __webpack_require__(/*! ./unescape.js */ "./node_modules/underscore/modules/unescape.js");
/* harmony import */ var _templateSettings_js__WEBPACK_IMPORTED_MODULE_55__ = __webpack_require__(/*! ./templateSettings.js */ "./node_modules/underscore/modules/templateSettings.js");
/* harmony import */ var _template_js__WEBPACK_IMPORTED_MODULE_56__ = __webpack_require__(/*! ./template.js */ "./node_modules/underscore/modules/template.js");
/* harmony import */ var _result_js__WEBPACK_IMPORTED_MODULE_57__ = __webpack_require__(/*! ./result.js */ "./node_modules/underscore/modules/result.js");
/* harmony import */ var _uniqueId_js__WEBPACK_IMPORTED_MODULE_58__ = __webpack_require__(/*! ./uniqueId.js */ "./node_modules/underscore/modules/uniqueId.js");
/* harmony import */ var _chain_js__WEBPACK_IMPORTED_MODULE_59__ = __webpack_require__(/*! ./chain.js */ "./node_modules/underscore/modules/chain.js");
/* harmony import */ var _iteratee_js__WEBPACK_IMPORTED_MODULE_60__ = __webpack_require__(/*! ./iteratee.js */ "./node_modules/underscore/modules/iteratee.js");
/* harmony import */ var _partial_js__WEBPACK_IMPORTED_MODULE_61__ = __webpack_require__(/*! ./partial.js */ "./node_modules/underscore/modules/partial.js");
/* harmony import */ var _bind_js__WEBPACK_IMPORTED_MODULE_62__ = __webpack_require__(/*! ./bind.js */ "./node_modules/underscore/modules/bind.js");
/* harmony import */ var _bindAll_js__WEBPACK_IMPORTED_MODULE_63__ = __webpack_require__(/*! ./bindAll.js */ "./node_modules/underscore/modules/bindAll.js");
/* harmony import */ var _memoize_js__WEBPACK_IMPORTED_MODULE_64__ = __webpack_require__(/*! ./memoize.js */ "./node_modules/underscore/modules/memoize.js");
/* harmony import */ var _delay_js__WEBPACK_IMPORTED_MODULE_65__ = __webpack_require__(/*! ./delay.js */ "./node_modules/underscore/modules/delay.js");
/* harmony import */ var _defer_js__WEBPACK_IMPORTED_MODULE_66__ = __webpack_require__(/*! ./defer.js */ "./node_modules/underscore/modules/defer.js");
/* harmony import */ var _throttle_js__WEBPACK_IMPORTED_MODULE_67__ = __webpack_require__(/*! ./throttle.js */ "./node_modules/underscore/modules/throttle.js");
/* harmony import */ var _debounce_js__WEBPACK_IMPORTED_MODULE_68__ = __webpack_require__(/*! ./debounce.js */ "./node_modules/underscore/modules/debounce.js");
/* harmony import */ var _wrap_js__WEBPACK_IMPORTED_MODULE_69__ = __webpack_require__(/*! ./wrap.js */ "./node_modules/underscore/modules/wrap.js");
/* harmony import */ var _negate_js__WEBPACK_IMPORTED_MODULE_70__ = __webpack_require__(/*! ./negate.js */ "./node_modules/underscore/modules/negate.js");
/* harmony import */ var _compose_js__WEBPACK_IMPORTED_MODULE_71__ = __webpack_require__(/*! ./compose.js */ "./node_modules/underscore/modules/compose.js");
/* harmony import */ var _after_js__WEBPACK_IMPORTED_MODULE_72__ = __webpack_require__(/*! ./after.js */ "./node_modules/underscore/modules/after.js");
/* harmony import */ var _before_js__WEBPACK_IMPORTED_MODULE_73__ = __webpack_require__(/*! ./before.js */ "./node_modules/underscore/modules/before.js");
/* harmony import */ var _once_js__WEBPACK_IMPORTED_MODULE_74__ = __webpack_require__(/*! ./once.js */ "./node_modules/underscore/modules/once.js");
/* harmony import */ var _findKey_js__WEBPACK_IMPORTED_MODULE_75__ = __webpack_require__(/*! ./findKey.js */ "./node_modules/underscore/modules/findKey.js");
/* harmony import */ var _findIndex_js__WEBPACK_IMPORTED_MODULE_76__ = __webpack_require__(/*! ./findIndex.js */ "./node_modules/underscore/modules/findIndex.js");
/* harmony import */ var _findLastIndex_js__WEBPACK_IMPORTED_MODULE_77__ = __webpack_require__(/*! ./findLastIndex.js */ "./node_modules/underscore/modules/findLastIndex.js");
/* harmony import */ var _sortedIndex_js__WEBPACK_IMPORTED_MODULE_78__ = __webpack_require__(/*! ./sortedIndex.js */ "./node_modules/underscore/modules/sortedIndex.js");
/* harmony import */ var _indexOf_js__WEBPACK_IMPORTED_MODULE_79__ = __webpack_require__(/*! ./indexOf.js */ "./node_modules/underscore/modules/indexOf.js");
/* harmony import */ var _lastIndexOf_js__WEBPACK_IMPORTED_MODULE_80__ = __webpack_require__(/*! ./lastIndexOf.js */ "./node_modules/underscore/modules/lastIndexOf.js");
/* harmony import */ var _find_js__WEBPACK_IMPORTED_MODULE_81__ = __webpack_require__(/*! ./find.js */ "./node_modules/underscore/modules/find.js");
/* harmony import */ var _findWhere_js__WEBPACK_IMPORTED_MODULE_82__ = __webpack_require__(/*! ./findWhere.js */ "./node_modules/underscore/modules/findWhere.js");
/* harmony import */ var _each_js__WEBPACK_IMPORTED_MODULE_83__ = __webpack_require__(/*! ./each.js */ "./node_modules/underscore/modules/each.js");
/* harmony import */ var _map_js__WEBPACK_IMPORTED_MODULE_84__ = __webpack_require__(/*! ./map.js */ "./node_modules/underscore/modules/map.js");
/* harmony import */ var _reduce_js__WEBPACK_IMPORTED_MODULE_85__ = __webpack_require__(/*! ./reduce.js */ "./node_modules/underscore/modules/reduce.js");
/* harmony import */ var _reduceRight_js__WEBPACK_IMPORTED_MODULE_86__ = __webpack_require__(/*! ./reduceRight.js */ "./node_modules/underscore/modules/reduceRight.js");
/* harmony import */ var _filter_js__WEBPACK_IMPORTED_MODULE_87__ = __webpack_require__(/*! ./filter.js */ "./node_modules/underscore/modules/filter.js");
/* harmony import */ var _reject_js__WEBPACK_IMPORTED_MODULE_88__ = __webpack_require__(/*! ./reject.js */ "./node_modules/underscore/modules/reject.js");
/* harmony import */ var _every_js__WEBPACK_IMPORTED_MODULE_89__ = __webpack_require__(/*! ./every.js */ "./node_modules/underscore/modules/every.js");
/* harmony import */ var _some_js__WEBPACK_IMPORTED_MODULE_90__ = __webpack_require__(/*! ./some.js */ "./node_modules/underscore/modules/some.js");
/* harmony import */ var _contains_js__WEBPACK_IMPORTED_MODULE_91__ = __webpack_require__(/*! ./contains.js */ "./node_modules/underscore/modules/contains.js");
/* harmony import */ var _invoke_js__WEBPACK_IMPORTED_MODULE_92__ = __webpack_require__(/*! ./invoke.js */ "./node_modules/underscore/modules/invoke.js");
/* harmony import */ var _pluck_js__WEBPACK_IMPORTED_MODULE_93__ = __webpack_require__(/*! ./pluck.js */ "./node_modules/underscore/modules/pluck.js");
/* harmony import */ var _where_js__WEBPACK_IMPORTED_MODULE_94__ = __webpack_require__(/*! ./where.js */ "./node_modules/underscore/modules/where.js");
/* harmony import */ var _max_js__WEBPACK_IMPORTED_MODULE_95__ = __webpack_require__(/*! ./max.js */ "./node_modules/underscore/modules/max.js");
/* harmony import */ var _min_js__WEBPACK_IMPORTED_MODULE_96__ = __webpack_require__(/*! ./min.js */ "./node_modules/underscore/modules/min.js");
/* harmony import */ var _shuffle_js__WEBPACK_IMPORTED_MODULE_97__ = __webpack_require__(/*! ./shuffle.js */ "./node_modules/underscore/modules/shuffle.js");
/* harmony import */ var _sample_js__WEBPACK_IMPORTED_MODULE_98__ = __webpack_require__(/*! ./sample.js */ "./node_modules/underscore/modules/sample.js");
/* harmony import */ var _sortBy_js__WEBPACK_IMPORTED_MODULE_99__ = __webpack_require__(/*! ./sortBy.js */ "./node_modules/underscore/modules/sortBy.js");
/* harmony import */ var _groupBy_js__WEBPACK_IMPORTED_MODULE_100__ = __webpack_require__(/*! ./groupBy.js */ "./node_modules/underscore/modules/groupBy.js");
/* harmony import */ var _indexBy_js__WEBPACK_IMPORTED_MODULE_101__ = __webpack_require__(/*! ./indexBy.js */ "./node_modules/underscore/modules/indexBy.js");
/* harmony import */ var _countBy_js__WEBPACK_IMPORTED_MODULE_102__ = __webpack_require__(/*! ./countBy.js */ "./node_modules/underscore/modules/countBy.js");
/* harmony import */ var _partition_js__WEBPACK_IMPORTED_MODULE_103__ = __webpack_require__(/*! ./partition.js */ "./node_modules/underscore/modules/partition.js");
/* harmony import */ var _toArray_js__WEBPACK_IMPORTED_MODULE_104__ = __webpack_require__(/*! ./toArray.js */ "./node_modules/underscore/modules/toArray.js");
/* harmony import */ var _size_js__WEBPACK_IMPORTED_MODULE_105__ = __webpack_require__(/*! ./size.js */ "./node_modules/underscore/modules/size.js");
/* harmony import */ var _pick_js__WEBPACK_IMPORTED_MODULE_106__ = __webpack_require__(/*! ./pick.js */ "./node_modules/underscore/modules/pick.js");
/* harmony import */ var _omit_js__WEBPACK_IMPORTED_MODULE_107__ = __webpack_require__(/*! ./omit.js */ "./node_modules/underscore/modules/omit.js");
/* harmony import */ var _first_js__WEBPACK_IMPORTED_MODULE_108__ = __webpack_require__(/*! ./first.js */ "./node_modules/underscore/modules/first.js");
/* harmony import */ var _initial_js__WEBPACK_IMPORTED_MODULE_109__ = __webpack_require__(/*! ./initial.js */ "./node_modules/underscore/modules/initial.js");
/* harmony import */ var _last_js__WEBPACK_IMPORTED_MODULE_110__ = __webpack_require__(/*! ./last.js */ "./node_modules/underscore/modules/last.js");
/* harmony import */ var _rest_js__WEBPACK_IMPORTED_MODULE_111__ = __webpack_require__(/*! ./rest.js */ "./node_modules/underscore/modules/rest.js");
/* harmony import */ var _compact_js__WEBPACK_IMPORTED_MODULE_112__ = __webpack_require__(/*! ./compact.js */ "./node_modules/underscore/modules/compact.js");
/* harmony import */ var _flatten_js__WEBPACK_IMPORTED_MODULE_113__ = __webpack_require__(/*! ./flatten.js */ "./node_modules/underscore/modules/flatten.js");
/* harmony import */ var _without_js__WEBPACK_IMPORTED_MODULE_114__ = __webpack_require__(/*! ./without.js */ "./node_modules/underscore/modules/without.js");
/* harmony import */ var _uniq_js__WEBPACK_IMPORTED_MODULE_115__ = __webpack_require__(/*! ./uniq.js */ "./node_modules/underscore/modules/uniq.js");
/* harmony import */ var _union_js__WEBPACK_IMPORTED_MODULE_116__ = __webpack_require__(/*! ./union.js */ "./node_modules/underscore/modules/union.js");
/* harmony import */ var _intersection_js__WEBPACK_IMPORTED_MODULE_117__ = __webpack_require__(/*! ./intersection.js */ "./node_modules/underscore/modules/intersection.js");
/* harmony import */ var _difference_js__WEBPACK_IMPORTED_MODULE_118__ = __webpack_require__(/*! ./difference.js */ "./node_modules/underscore/modules/difference.js");
/* harmony import */ var _unzip_js__WEBPACK_IMPORTED_MODULE_119__ = __webpack_require__(/*! ./unzip.js */ "./node_modules/underscore/modules/unzip.js");
/* harmony import */ var _zip_js__WEBPACK_IMPORTED_MODULE_120__ = __webpack_require__(/*! ./zip.js */ "./node_modules/underscore/modules/zip.js");
/* harmony import */ var _object_js__WEBPACK_IMPORTED_MODULE_121__ = __webpack_require__(/*! ./object.js */ "./node_modules/underscore/modules/object.js");
/* harmony import */ var _range_js__WEBPACK_IMPORTED_MODULE_122__ = __webpack_require__(/*! ./range.js */ "./node_modules/underscore/modules/range.js");
/* harmony import */ var _chunk_js__WEBPACK_IMPORTED_MODULE_123__ = __webpack_require__(/*! ./chunk.js */ "./node_modules/underscore/modules/chunk.js");
/* harmony import */ var _mixin_js__WEBPACK_IMPORTED_MODULE_124__ = __webpack_require__(/*! ./mixin.js */ "./node_modules/underscore/modules/mixin.js");
/* harmony import */ var _underscore_array_methods_js__WEBPACK_IMPORTED_MODULE_125__ = __webpack_require__(/*! ./underscore-array-methods.js */ "./node_modules/underscore/modules/underscore-array-methods.js");
// Named Exports
// =============

//     Underscore.js 1.13.7
//     https://underscorejs.org
//     (c) 2009-2024 Jeremy Ashkenas, Julian Gonggrijp, and DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

// Baseline setup.



// Object Functions
// ----------------
// Our most fundamental functions operate on any JavaScript object.
// Most functions in Underscore depend on at least one function in this section.

// A group of functions that check the types of core JavaScript values.
// These are often informally referred to as the "isType" functions.



























// Functions that treat an object as a dictionary of key-value pairs.
















// Utility Functions
// -----------------
// A bit of a grab bag: Predicate-generating functions for use with filters and
// loops, string escaping and templating, create random numbers and unique ids,
// and functions that facilitate Underscore's chaining and iteration conventions.



















// Function (ahem) Functions
// -------------------------
// These functions take a function as an argument and return a new function
// as the result. Also known as higher-order functions.















// Finders
// -------
// Functions that extract (the position of) a single element from an object
// or array based on some criterion.









// Collection Functions
// --------------------
// Functions that work on any collection of elements: either an array, or
// an object of key-value pairs.
























// `_.pick` and `_.omit` are actually object functions, but we put
// them here in order to create a more natural reading order in the
// monolithic build as they depend on `_.contains`.



// Array Functions
// ---------------
// Functions that operate on arrays (and array-likes) only, because they’re
// expressed in terms of operations on an ordered list of values.

















// OOP
// ---
// These modules support the "object-oriented" calling style. See also
// `underscore.js` and `index-default.js`.




/***/ }),

/***/ "./node_modules/underscore/modules/indexBy.js":
/*!****************************************************!*\
  !*** ./node_modules/underscore/modules/indexBy.js ***!
  \****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _group_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_group.js */ "./node_modules/underscore/modules/_group.js");


// Indexes the object's values by a criterion, similar to `_.groupBy`, but for
// when you know that your index values will be unique.
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((0,_group_js__WEBPACK_IMPORTED_MODULE_0__["default"])(function(result, value, key) {
  result[key] = value;
}));


/***/ }),

/***/ "./node_modules/underscore/modules/indexOf.js":
/*!****************************************************!*\
  !*** ./node_modules/underscore/modules/indexOf.js ***!
  \****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _sortedIndex_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./sortedIndex.js */ "./node_modules/underscore/modules/sortedIndex.js");
/* harmony import */ var _findIndex_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./findIndex.js */ "./node_modules/underscore/modules/findIndex.js");
/* harmony import */ var _createIndexFinder_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./_createIndexFinder.js */ "./node_modules/underscore/modules/_createIndexFinder.js");




// Return the position of the first occurrence of an item in an array,
// or -1 if the item is not included in the array.
// If the array is large and already in sort order, pass `true`
// for **isSorted** to use binary search.
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((0,_createIndexFinder_js__WEBPACK_IMPORTED_MODULE_2__["default"])(1, _findIndex_js__WEBPACK_IMPORTED_MODULE_1__["default"], _sortedIndex_js__WEBPACK_IMPORTED_MODULE_0__["default"]));


/***/ }),

/***/ "./node_modules/underscore/modules/initial.js":
/*!****************************************************!*\
  !*** ./node_modules/underscore/modules/initial.js ***!
  \****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ initial)
/* harmony export */ });
/* harmony import */ var _setup_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_setup.js */ "./node_modules/underscore/modules/_setup.js");


// Returns everything but the last entry of the array. Especially useful on
// the arguments object. Passing **n** will return all the values in
// the array, excluding the last N.
function initial(array, n, guard) {
  return _setup_js__WEBPACK_IMPORTED_MODULE_0__.slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
}


/***/ }),

/***/ "./node_modules/underscore/modules/intersection.js":
/*!*********************************************************!*\
  !*** ./node_modules/underscore/modules/intersection.js ***!
  \*********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ intersection)
/* harmony export */ });
/* harmony import */ var _getLength_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_getLength.js */ "./node_modules/underscore/modules/_getLength.js");
/* harmony import */ var _contains_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./contains.js */ "./node_modules/underscore/modules/contains.js");



// Produce an array that contains every item shared between all the
// passed-in arrays.
function intersection(array) {
  var result = [];
  var argsLength = arguments.length;
  for (var i = 0, length = (0,_getLength_js__WEBPACK_IMPORTED_MODULE_0__["default"])(array); i < length; i++) {
    var item = array[i];
    if ((0,_contains_js__WEBPACK_IMPORTED_MODULE_1__["default"])(result, item)) continue;
    var j;
    for (j = 1; j < argsLength; j++) {
      if (!(0,_contains_js__WEBPACK_IMPORTED_MODULE_1__["default"])(arguments[j], item)) break;
    }
    if (j === argsLength) result.push(item);
  }
  return result;
}


/***/ }),

/***/ "./node_modules/underscore/modules/invert.js":
/*!***************************************************!*\
  !*** ./node_modules/underscore/modules/invert.js ***!
  \***************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ invert)
/* harmony export */ });
/* harmony import */ var _keys_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./keys.js */ "./node_modules/underscore/modules/keys.js");


// Invert the keys and values of an object. The values must be serializable.
function invert(obj) {
  var result = {};
  var _keys = (0,_keys_js__WEBPACK_IMPORTED_MODULE_0__["default"])(obj);
  for (var i = 0, length = _keys.length; i < length; i++) {
    result[obj[_keys[i]]] = _keys[i];
  }
  return result;
}


/***/ }),

/***/ "./node_modules/underscore/modules/invoke.js":
/*!***************************************************!*\
  !*** ./node_modules/underscore/modules/invoke.js ***!
  \***************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _restArguments_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./restArguments.js */ "./node_modules/underscore/modules/restArguments.js");
/* harmony import */ var _isFunction_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./isFunction.js */ "./node_modules/underscore/modules/isFunction.js");
/* harmony import */ var _map_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./map.js */ "./node_modules/underscore/modules/map.js");
/* harmony import */ var _deepGet_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./_deepGet.js */ "./node_modules/underscore/modules/_deepGet.js");
/* harmony import */ var _toPath_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./_toPath.js */ "./node_modules/underscore/modules/_toPath.js");






// Invoke a method (with arguments) on every item in a collection.
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((0,_restArguments_js__WEBPACK_IMPORTED_MODULE_0__["default"])(function(obj, path, args) {
  var contextPath, func;
  if ((0,_isFunction_js__WEBPACK_IMPORTED_MODULE_1__["default"])(path)) {
    func = path;
  } else {
    path = (0,_toPath_js__WEBPACK_IMPORTED_MODULE_4__["default"])(path);
    contextPath = path.slice(0, -1);
    path = path[path.length - 1];
  }
  return (0,_map_js__WEBPACK_IMPORTED_MODULE_2__["default"])(obj, function(context) {
    var method = func;
    if (!method) {
      if (contextPath && contextPath.length) {
        context = (0,_deepGet_js__WEBPACK_IMPORTED_MODULE_3__["default"])(context, contextPath);
      }
      if (context == null) return void 0;
      method = context[path];
    }
    return method == null ? method : method.apply(context, args);
  });
}));


/***/ }),

/***/ "./node_modules/underscore/modules/isArguments.js":
/*!********************************************************!*\
  !*** ./node_modules/underscore/modules/isArguments.js ***!
  \********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _tagTester_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_tagTester.js */ "./node_modules/underscore/modules/_tagTester.js");
/* harmony import */ var _has_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./_has.js */ "./node_modules/underscore/modules/_has.js");



var isArguments = (0,_tagTester_js__WEBPACK_IMPORTED_MODULE_0__["default"])('Arguments');

// Define a fallback version of the method in browsers (ahem, IE < 9), where
// there isn't any inspectable "Arguments" type.
(function() {
  if (!isArguments(arguments)) {
    isArguments = function(obj) {
      return (0,_has_js__WEBPACK_IMPORTED_MODULE_1__["default"])(obj, 'callee');
    };
  }
}());

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (isArguments);


/***/ }),

/***/ "./node_modules/underscore/modules/isArray.js":
/*!****************************************************!*\
  !*** ./node_modules/underscore/modules/isArray.js ***!
  \****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _setup_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_setup.js */ "./node_modules/underscore/modules/_setup.js");
/* harmony import */ var _tagTester_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./_tagTester.js */ "./node_modules/underscore/modules/_tagTester.js");



// Is a given value an array?
// Delegates to ECMA5's native `Array.isArray`.
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_setup_js__WEBPACK_IMPORTED_MODULE_0__.nativeIsArray || (0,_tagTester_js__WEBPACK_IMPORTED_MODULE_1__["default"])('Array'));


/***/ }),

/***/ "./node_modules/underscore/modules/isArrayBuffer.js":
/*!**********************************************************!*\
  !*** ./node_modules/underscore/modules/isArrayBuffer.js ***!
  \**********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _tagTester_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_tagTester.js */ "./node_modules/underscore/modules/_tagTester.js");


/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((0,_tagTester_js__WEBPACK_IMPORTED_MODULE_0__["default"])('ArrayBuffer'));


/***/ }),

/***/ "./node_modules/underscore/modules/isBoolean.js":
/*!******************************************************!*\
  !*** ./node_modules/underscore/modules/isBoolean.js ***!
  \******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ isBoolean)
/* harmony export */ });
/* harmony import */ var _setup_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_setup.js */ "./node_modules/underscore/modules/_setup.js");


// Is a given value a boolean?
function isBoolean(obj) {
  return obj === true || obj === false || _setup_js__WEBPACK_IMPORTED_MODULE_0__.toString.call(obj) === '[object Boolean]';
}


/***/ }),

/***/ "./node_modules/underscore/modules/isDataView.js":
/*!*******************************************************!*\
  !*** ./node_modules/underscore/modules/isDataView.js ***!
  \*******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _tagTester_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_tagTester.js */ "./node_modules/underscore/modules/_tagTester.js");
/* harmony import */ var _isFunction_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./isFunction.js */ "./node_modules/underscore/modules/isFunction.js");
/* harmony import */ var _isArrayBuffer_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./isArrayBuffer.js */ "./node_modules/underscore/modules/isArrayBuffer.js");
/* harmony import */ var _stringTagBug_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./_stringTagBug.js */ "./node_modules/underscore/modules/_stringTagBug.js");





var isDataView = (0,_tagTester_js__WEBPACK_IMPORTED_MODULE_0__["default"])('DataView');

// In IE 10 - Edge 13, we need a different heuristic
// to determine whether an object is a `DataView`.
// Also, in cases where the native `DataView` is
// overridden we can't rely on the tag itself.
function alternateIsDataView(obj) {
  return obj != null && (0,_isFunction_js__WEBPACK_IMPORTED_MODULE_1__["default"])(obj.getInt8) && (0,_isArrayBuffer_js__WEBPACK_IMPORTED_MODULE_2__["default"])(obj.buffer);
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_stringTagBug_js__WEBPACK_IMPORTED_MODULE_3__.hasDataViewBug ? alternateIsDataView : isDataView);


/***/ }),

/***/ "./node_modules/underscore/modules/isDate.js":
/*!***************************************************!*\
  !*** ./node_modules/underscore/modules/isDate.js ***!
  \***************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _tagTester_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_tagTester.js */ "./node_modules/underscore/modules/_tagTester.js");


/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((0,_tagTester_js__WEBPACK_IMPORTED_MODULE_0__["default"])('Date'));


/***/ }),

/***/ "./node_modules/underscore/modules/isElement.js":
/*!******************************************************!*\
  !*** ./node_modules/underscore/modules/isElement.js ***!
  \******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ isElement)
/* harmony export */ });
// Is a given value a DOM element?
function isElement(obj) {
  return !!(obj && obj.nodeType === 1);
}


/***/ }),

/***/ "./node_modules/underscore/modules/isEmpty.js":
/*!****************************************************!*\
  !*** ./node_modules/underscore/modules/isEmpty.js ***!
  \****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ isEmpty)
/* harmony export */ });
/* harmony import */ var _getLength_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_getLength.js */ "./node_modules/underscore/modules/_getLength.js");
/* harmony import */ var _isArray_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./isArray.js */ "./node_modules/underscore/modules/isArray.js");
/* harmony import */ var _isString_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./isString.js */ "./node_modules/underscore/modules/isString.js");
/* harmony import */ var _isArguments_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./isArguments.js */ "./node_modules/underscore/modules/isArguments.js");
/* harmony import */ var _keys_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./keys.js */ "./node_modules/underscore/modules/keys.js");






// Is a given array, string, or object empty?
// An "empty" object has no enumerable own-properties.
function isEmpty(obj) {
  if (obj == null) return true;
  // Skip the more expensive `toString`-based type checks if `obj` has no
  // `.length`.
  var length = (0,_getLength_js__WEBPACK_IMPORTED_MODULE_0__["default"])(obj);
  if (typeof length == 'number' && (
    (0,_isArray_js__WEBPACK_IMPORTED_MODULE_1__["default"])(obj) || (0,_isString_js__WEBPACK_IMPORTED_MODULE_2__["default"])(obj) || (0,_isArguments_js__WEBPACK_IMPORTED_MODULE_3__["default"])(obj)
  )) return length === 0;
  return (0,_getLength_js__WEBPACK_IMPORTED_MODULE_0__["default"])((0,_keys_js__WEBPACK_IMPORTED_MODULE_4__["default"])(obj)) === 0;
}


/***/ }),

/***/ "./node_modules/underscore/modules/isEqual.js":
/*!****************************************************!*\
  !*** ./node_modules/underscore/modules/isEqual.js ***!
  \****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ isEqual)
/* harmony export */ });
/* harmony import */ var _underscore_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./underscore.js */ "./node_modules/underscore/modules/underscore.js");
/* harmony import */ var _setup_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./_setup.js */ "./node_modules/underscore/modules/_setup.js");
/* harmony import */ var _getByteLength_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./_getByteLength.js */ "./node_modules/underscore/modules/_getByteLength.js");
/* harmony import */ var _isTypedArray_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./isTypedArray.js */ "./node_modules/underscore/modules/isTypedArray.js");
/* harmony import */ var _isFunction_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./isFunction.js */ "./node_modules/underscore/modules/isFunction.js");
/* harmony import */ var _stringTagBug_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./_stringTagBug.js */ "./node_modules/underscore/modules/_stringTagBug.js");
/* harmony import */ var _isDataView_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./isDataView.js */ "./node_modules/underscore/modules/isDataView.js");
/* harmony import */ var _keys_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./keys.js */ "./node_modules/underscore/modules/keys.js");
/* harmony import */ var _has_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./_has.js */ "./node_modules/underscore/modules/_has.js");
/* harmony import */ var _toBufferView_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./_toBufferView.js */ "./node_modules/underscore/modules/_toBufferView.js");











// We use this string twice, so give it a name for minification.
var tagDataView = '[object DataView]';

// Internal recursive comparison function for `_.isEqual`.
function eq(a, b, aStack, bStack) {
  // Identical objects are equal. `0 === -0`, but they aren't identical.
  // See the [Harmony `egal` proposal](https://wiki.ecmascript.org/doku.php?id=harmony:egal).
  if (a === b) return a !== 0 || 1 / a === 1 / b;
  // `null` or `undefined` only equal to itself (strict comparison).
  if (a == null || b == null) return false;
  // `NaN`s are equivalent, but non-reflexive.
  if (a !== a) return b !== b;
  // Exhaust primitive checks
  var type = typeof a;
  if (type !== 'function' && type !== 'object' && typeof b != 'object') return false;
  return deepEq(a, b, aStack, bStack);
}

// Internal recursive comparison function for `_.isEqual`.
function deepEq(a, b, aStack, bStack) {
  // Unwrap any wrapped objects.
  if (a instanceof _underscore_js__WEBPACK_IMPORTED_MODULE_0__["default"]) a = a._wrapped;
  if (b instanceof _underscore_js__WEBPACK_IMPORTED_MODULE_0__["default"]) b = b._wrapped;
  // Compare `[[Class]]` names.
  var className = _setup_js__WEBPACK_IMPORTED_MODULE_1__.toString.call(a);
  if (className !== _setup_js__WEBPACK_IMPORTED_MODULE_1__.toString.call(b)) return false;
  // Work around a bug in IE 10 - Edge 13.
  if (_stringTagBug_js__WEBPACK_IMPORTED_MODULE_5__.hasDataViewBug && className == '[object Object]' && (0,_isDataView_js__WEBPACK_IMPORTED_MODULE_6__["default"])(a)) {
    if (!(0,_isDataView_js__WEBPACK_IMPORTED_MODULE_6__["default"])(b)) return false;
    className = tagDataView;
  }
  switch (className) {
    // These types are compared by value.
    case '[object RegExp]':
      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
    case '[object String]':
      // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
      // equivalent to `new String("5")`.
      return '' + a === '' + b;
    case '[object Number]':
      // `NaN`s are equivalent, but non-reflexive.
      // Object(NaN) is equivalent to NaN.
      if (+a !== +a) return +b !== +b;
      // An `egal` comparison is performed for other numeric values.
      return +a === 0 ? 1 / +a === 1 / b : +a === +b;
    case '[object Date]':
    case '[object Boolean]':
      // Coerce dates and booleans to numeric primitive values. Dates are compared by their
      // millisecond representations. Note that invalid dates with millisecond representations
      // of `NaN` are not equivalent.
      return +a === +b;
    case '[object Symbol]':
      return _setup_js__WEBPACK_IMPORTED_MODULE_1__.SymbolProto.valueOf.call(a) === _setup_js__WEBPACK_IMPORTED_MODULE_1__.SymbolProto.valueOf.call(b);
    case '[object ArrayBuffer]':
    case tagDataView:
      // Coerce to typed array so we can fall through.
      return deepEq((0,_toBufferView_js__WEBPACK_IMPORTED_MODULE_9__["default"])(a), (0,_toBufferView_js__WEBPACK_IMPORTED_MODULE_9__["default"])(b), aStack, bStack);
  }

  var areArrays = className === '[object Array]';
  if (!areArrays && (0,_isTypedArray_js__WEBPACK_IMPORTED_MODULE_3__["default"])(a)) {
      var byteLength = (0,_getByteLength_js__WEBPACK_IMPORTED_MODULE_2__["default"])(a);
      if (byteLength !== (0,_getByteLength_js__WEBPACK_IMPORTED_MODULE_2__["default"])(b)) return false;
      if (a.buffer === b.buffer && a.byteOffset === b.byteOffset) return true;
      areArrays = true;
  }
  if (!areArrays) {
    if (typeof a != 'object' || typeof b != 'object') return false;

    // Objects with different constructors are not equivalent, but `Object`s or `Array`s
    // from different frames are.
    var aCtor = a.constructor, bCtor = b.constructor;
    if (aCtor !== bCtor && !((0,_isFunction_js__WEBPACK_IMPORTED_MODULE_4__["default"])(aCtor) && aCtor instanceof aCtor &&
                             (0,_isFunction_js__WEBPACK_IMPORTED_MODULE_4__["default"])(bCtor) && bCtor instanceof bCtor)
                        && ('constructor' in a && 'constructor' in b)) {
      return false;
    }
  }
  // Assume equality for cyclic structures. The algorithm for detecting cyclic
  // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

  // Initializing stack of traversed objects.
  // It's done here since we only need them for objects and arrays comparison.
  aStack = aStack || [];
  bStack = bStack || [];
  var length = aStack.length;
  while (length--) {
    // Linear search. Performance is inversely proportional to the number of
    // unique nested structures.
    if (aStack[length] === a) return bStack[length] === b;
  }

  // Add the first object to the stack of traversed objects.
  aStack.push(a);
  bStack.push(b);

  // Recursively compare objects and arrays.
  if (areArrays) {
    // Compare array lengths to determine if a deep comparison is necessary.
    length = a.length;
    if (length !== b.length) return false;
    // Deep compare the contents, ignoring non-numeric properties.
    while (length--) {
      if (!eq(a[length], b[length], aStack, bStack)) return false;
    }
  } else {
    // Deep compare objects.
    var _keys = (0,_keys_js__WEBPACK_IMPORTED_MODULE_7__["default"])(a), key;
    length = _keys.length;
    // Ensure that both objects contain the same number of properties before comparing deep equality.
    if ((0,_keys_js__WEBPACK_IMPORTED_MODULE_7__["default"])(b).length !== length) return false;
    while (length--) {
      // Deep compare each member
      key = _keys[length];
      if (!((0,_has_js__WEBPACK_IMPORTED_MODULE_8__["default"])(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
    }
  }
  // Remove the first object from the stack of traversed objects.
  aStack.pop();
  bStack.pop();
  return true;
}

// Perform a deep comparison to check if two objects are equal.
function isEqual(a, b) {
  return eq(a, b);
}


/***/ }),

/***/ "./node_modules/underscore/modules/isError.js":
/*!****************************************************!*\
  !*** ./node_modules/underscore/modules/isError.js ***!
  \****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _tagTester_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_tagTester.js */ "./node_modules/underscore/modules/_tagTester.js");


/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((0,_tagTester_js__WEBPACK_IMPORTED_MODULE_0__["default"])('Error'));


/***/ }),

/***/ "./node_modules/underscore/modules/isFinite.js":
/*!*****************************************************!*\
  !*** ./node_modules/underscore/modules/isFinite.js ***!
  \*****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ isFinite)
/* harmony export */ });
/* harmony import */ var _setup_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_setup.js */ "./node_modules/underscore/modules/_setup.js");
/* harmony import */ var _isSymbol_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./isSymbol.js */ "./node_modules/underscore/modules/isSymbol.js");



// Is a given object a finite number?
function isFinite(obj) {
  return !(0,_isSymbol_js__WEBPACK_IMPORTED_MODULE_1__["default"])(obj) && (0,_setup_js__WEBPACK_IMPORTED_MODULE_0__._isFinite)(obj) && !isNaN(parseFloat(obj));
}


/***/ }),

/***/ "./node_modules/underscore/modules/isFunction.js":
/*!*******************************************************!*\
  !*** ./node_modules/underscore/modules/isFunction.js ***!
  \*******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _tagTester_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_tagTester.js */ "./node_modules/underscore/modules/_tagTester.js");
/* harmony import */ var _setup_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./_setup.js */ "./node_modules/underscore/modules/_setup.js");



var isFunction = (0,_tagTester_js__WEBPACK_IMPORTED_MODULE_0__["default"])('Function');

// Optimize `isFunction` if appropriate. Work around some `typeof` bugs in old
// v8, IE 11 (#1621), Safari 8 (#1929), and PhantomJS (#2236).
var nodelist = _setup_js__WEBPACK_IMPORTED_MODULE_1__.root.document && _setup_js__WEBPACK_IMPORTED_MODULE_1__.root.document.childNodes;
if ( true && typeof Int8Array != 'object' && typeof nodelist != 'function') {
  isFunction = function(obj) {
    return typeof obj == 'function' || false;
  };
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (isFunction);


/***/ }),

/***/ "./node_modules/underscore/modules/isMap.js":
/*!**************************************************!*\
  !*** ./node_modules/underscore/modules/isMap.js ***!
  \**************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _tagTester_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_tagTester.js */ "./node_modules/underscore/modules/_tagTester.js");
/* harmony import */ var _stringTagBug_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./_stringTagBug.js */ "./node_modules/underscore/modules/_stringTagBug.js");
/* harmony import */ var _methodFingerprint_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./_methodFingerprint.js */ "./node_modules/underscore/modules/_methodFingerprint.js");




/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_stringTagBug_js__WEBPACK_IMPORTED_MODULE_1__.isIE11 ? (0,_methodFingerprint_js__WEBPACK_IMPORTED_MODULE_2__.ie11fingerprint)(_methodFingerprint_js__WEBPACK_IMPORTED_MODULE_2__.mapMethods) : (0,_tagTester_js__WEBPACK_IMPORTED_MODULE_0__["default"])('Map'));


/***/ }),

/***/ "./node_modules/underscore/modules/isMatch.js":
/*!****************************************************!*\
  !*** ./node_modules/underscore/modules/isMatch.js ***!
  \****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ isMatch)
/* harmony export */ });
/* harmony import */ var _keys_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./keys.js */ "./node_modules/underscore/modules/keys.js");


// Returns whether an object has a given set of `key:value` pairs.
function isMatch(object, attrs) {
  var _keys = (0,_keys_js__WEBPACK_IMPORTED_MODULE_0__["default"])(attrs), length = _keys.length;
  if (object == null) return !length;
  var obj = Object(object);
  for (var i = 0; i < length; i++) {
    var key = _keys[i];
    if (attrs[key] !== obj[key] || !(key in obj)) return false;
  }
  return true;
}


/***/ }),

/***/ "./node_modules/underscore/modules/isNaN.js":
/*!**************************************************!*\
  !*** ./node_modules/underscore/modules/isNaN.js ***!
  \**************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ isNaN)
/* harmony export */ });
/* harmony import */ var _setup_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_setup.js */ "./node_modules/underscore/modules/_setup.js");
/* harmony import */ var _isNumber_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./isNumber.js */ "./node_modules/underscore/modules/isNumber.js");



// Is the given value `NaN`?
function isNaN(obj) {
  return (0,_isNumber_js__WEBPACK_IMPORTED_MODULE_1__["default"])(obj) && (0,_setup_js__WEBPACK_IMPORTED_MODULE_0__._isNaN)(obj);
}


/***/ }),

/***/ "./node_modules/underscore/modules/isNull.js":
/*!***************************************************!*\
  !*** ./node_modules/underscore/modules/isNull.js ***!
  \***************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ isNull)
/* harmony export */ });
// Is a given value equal to null?
function isNull(obj) {
  return obj === null;
}


/***/ }),

/***/ "./node_modules/underscore/modules/isNumber.js":
/*!*****************************************************!*\
  !*** ./node_modules/underscore/modules/isNumber.js ***!
  \*****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _tagTester_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_tagTester.js */ "./node_modules/underscore/modules/_tagTester.js");


/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((0,_tagTester_js__WEBPACK_IMPORTED_MODULE_0__["default"])('Number'));


/***/ }),

/***/ "./node_modules/underscore/modules/isObject.js":
/*!*****************************************************!*\
  !*** ./node_modules/underscore/modules/isObject.js ***!
  \*****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ isObject)
/* harmony export */ });
// Is a given variable an object?
function isObject(obj) {
  var type = typeof obj;
  return type === 'function' || (type === 'object' && !!obj);
}


/***/ }),

/***/ "./node_modules/underscore/modules/isRegExp.js":
/*!*****************************************************!*\
  !*** ./node_modules/underscore/modules/isRegExp.js ***!
  \*****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _tagTester_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_tagTester.js */ "./node_modules/underscore/modules/_tagTester.js");


/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((0,_tagTester_js__WEBPACK_IMPORTED_MODULE_0__["default"])('RegExp'));


/***/ }),

/***/ "./node_modules/underscore/modules/isSet.js":
/*!**************************************************!*\
  !*** ./node_modules/underscore/modules/isSet.js ***!
  \**************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _tagTester_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_tagTester.js */ "./node_modules/underscore/modules/_tagTester.js");
/* harmony import */ var _stringTagBug_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./_stringTagBug.js */ "./node_modules/underscore/modules/_stringTagBug.js");
/* harmony import */ var _methodFingerprint_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./_methodFingerprint.js */ "./node_modules/underscore/modules/_methodFingerprint.js");




/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_stringTagBug_js__WEBPACK_IMPORTED_MODULE_1__.isIE11 ? (0,_methodFingerprint_js__WEBPACK_IMPORTED_MODULE_2__.ie11fingerprint)(_methodFingerprint_js__WEBPACK_IMPORTED_MODULE_2__.setMethods) : (0,_tagTester_js__WEBPACK_IMPORTED_MODULE_0__["default"])('Set'));


/***/ }),

/***/ "./node_modules/underscore/modules/isString.js":
/*!*****************************************************!*\
  !*** ./node_modules/underscore/modules/isString.js ***!
  \*****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _tagTester_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_tagTester.js */ "./node_modules/underscore/modules/_tagTester.js");


/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((0,_tagTester_js__WEBPACK_IMPORTED_MODULE_0__["default"])('String'));


/***/ }),

/***/ "./node_modules/underscore/modules/isSymbol.js":
/*!*****************************************************!*\
  !*** ./node_modules/underscore/modules/isSymbol.js ***!
  \*****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _tagTester_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_tagTester.js */ "./node_modules/underscore/modules/_tagTester.js");


/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((0,_tagTester_js__WEBPACK_IMPORTED_MODULE_0__["default"])('Symbol'));


/***/ }),

/***/ "./node_modules/underscore/modules/isTypedArray.js":
/*!*********************************************************!*\
  !*** ./node_modules/underscore/modules/isTypedArray.js ***!
  \*********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _setup_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_setup.js */ "./node_modules/underscore/modules/_setup.js");
/* harmony import */ var _isDataView_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./isDataView.js */ "./node_modules/underscore/modules/isDataView.js");
/* harmony import */ var _constant_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./constant.js */ "./node_modules/underscore/modules/constant.js");
/* harmony import */ var _isBufferLike_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./_isBufferLike.js */ "./node_modules/underscore/modules/_isBufferLike.js");





// Is a given value a typed array?
var typedArrayPattern = /\[object ((I|Ui)nt(8|16|32)|Float(32|64)|Uint8Clamped|Big(I|Ui)nt64)Array\]/;
function isTypedArray(obj) {
  // `ArrayBuffer.isView` is the most future-proof, so use it when available.
  // Otherwise, fall back on the above regular expression.
  return _setup_js__WEBPACK_IMPORTED_MODULE_0__.nativeIsView ? ((0,_setup_js__WEBPACK_IMPORTED_MODULE_0__.nativeIsView)(obj) && !(0,_isDataView_js__WEBPACK_IMPORTED_MODULE_1__["default"])(obj)) :
                (0,_isBufferLike_js__WEBPACK_IMPORTED_MODULE_3__["default"])(obj) && typedArrayPattern.test(_setup_js__WEBPACK_IMPORTED_MODULE_0__.toString.call(obj));
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_setup_js__WEBPACK_IMPORTED_MODULE_0__.supportsArrayBuffer ? isTypedArray : (0,_constant_js__WEBPACK_IMPORTED_MODULE_2__["default"])(false));


/***/ }),

/***/ "./node_modules/underscore/modules/isUndefined.js":
/*!********************************************************!*\
  !*** ./node_modules/underscore/modules/isUndefined.js ***!
  \********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ isUndefined)
/* harmony export */ });
// Is a given variable undefined?
function isUndefined(obj) {
  return obj === void 0;
}


/***/ }),

/***/ "./node_modules/underscore/modules/isWeakMap.js":
/*!******************************************************!*\
  !*** ./node_modules/underscore/modules/isWeakMap.js ***!
  \******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _tagTester_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_tagTester.js */ "./node_modules/underscore/modules/_tagTester.js");
/* harmony import */ var _stringTagBug_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./_stringTagBug.js */ "./node_modules/underscore/modules/_stringTagBug.js");
/* harmony import */ var _methodFingerprint_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./_methodFingerprint.js */ "./node_modules/underscore/modules/_methodFingerprint.js");




/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_stringTagBug_js__WEBPACK_IMPORTED_MODULE_1__.isIE11 ? (0,_methodFingerprint_js__WEBPACK_IMPORTED_MODULE_2__.ie11fingerprint)(_methodFingerprint_js__WEBPACK_IMPORTED_MODULE_2__.weakMapMethods) : (0,_tagTester_js__WEBPACK_IMPORTED_MODULE_0__["default"])('WeakMap'));


/***/ }),

/***/ "./node_modules/underscore/modules/isWeakSet.js":
/*!******************************************************!*\
  !*** ./node_modules/underscore/modules/isWeakSet.js ***!
  \******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _tagTester_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_tagTester.js */ "./node_modules/underscore/modules/_tagTester.js");


/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((0,_tagTester_js__WEBPACK_IMPORTED_MODULE_0__["default"])('WeakSet'));


/***/ }),

/***/ "./node_modules/underscore/modules/iteratee.js":
/*!*****************************************************!*\
  !*** ./node_modules/underscore/modules/iteratee.js ***!
  \*****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ iteratee)
/* harmony export */ });
/* harmony import */ var _underscore_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./underscore.js */ "./node_modules/underscore/modules/underscore.js");
/* harmony import */ var _baseIteratee_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./_baseIteratee.js */ "./node_modules/underscore/modules/_baseIteratee.js");



// External wrapper for our callback generator. Users may customize
// `_.iteratee` if they want additional predicate/iteratee shorthand styles.
// This abstraction hides the internal-only `argCount` argument.
function iteratee(value, context) {
  return (0,_baseIteratee_js__WEBPACK_IMPORTED_MODULE_1__["default"])(value, context, Infinity);
}
_underscore_js__WEBPACK_IMPORTED_MODULE_0__["default"].iteratee = iteratee;


/***/ }),

/***/ "./node_modules/underscore/modules/keys.js":
/*!*************************************************!*\
  !*** ./node_modules/underscore/modules/keys.js ***!
  \*************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ keys)
/* harmony export */ });
/* harmony import */ var _isObject_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./isObject.js */ "./node_modules/underscore/modules/isObject.js");
/* harmony import */ var _setup_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./_setup.js */ "./node_modules/underscore/modules/_setup.js");
/* harmony import */ var _has_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./_has.js */ "./node_modules/underscore/modules/_has.js");
/* harmony import */ var _collectNonEnumProps_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./_collectNonEnumProps.js */ "./node_modules/underscore/modules/_collectNonEnumProps.js");





// Retrieve the names of an object's own properties.
// Delegates to **ECMAScript 5**'s native `Object.keys`.
function keys(obj) {
  if (!(0,_isObject_js__WEBPACK_IMPORTED_MODULE_0__["default"])(obj)) return [];
  if (_setup_js__WEBPACK_IMPORTED_MODULE_1__.nativeKeys) return (0,_setup_js__WEBPACK_IMPORTED_MODULE_1__.nativeKeys)(obj);
  var keys = [];
  for (var key in obj) if ((0,_has_js__WEBPACK_IMPORTED_MODULE_2__["default"])(obj, key)) keys.push(key);
  // Ahem, IE < 9.
  if (_setup_js__WEBPACK_IMPORTED_MODULE_1__.hasEnumBug) (0,_collectNonEnumProps_js__WEBPACK_IMPORTED_MODULE_3__["default"])(obj, keys);
  return keys;
}


/***/ }),

/***/ "./node_modules/underscore/modules/last.js":
/*!*************************************************!*\
  !*** ./node_modules/underscore/modules/last.js ***!
  \*************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ last)
/* harmony export */ });
/* harmony import */ var _rest_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./rest.js */ "./node_modules/underscore/modules/rest.js");


// Get the last element of an array. Passing **n** will return the last N
// values in the array.
function last(array, n, guard) {
  if (array == null || array.length < 1) return n == null || guard ? void 0 : [];
  if (n == null || guard) return array[array.length - 1];
  return (0,_rest_js__WEBPACK_IMPORTED_MODULE_0__["default"])(array, Math.max(0, array.length - n));
}


/***/ }),

/***/ "./node_modules/underscore/modules/lastIndexOf.js":
/*!********************************************************!*\
  !*** ./node_modules/underscore/modules/lastIndexOf.js ***!
  \********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _findLastIndex_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./findLastIndex.js */ "./node_modules/underscore/modules/findLastIndex.js");
/* harmony import */ var _createIndexFinder_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./_createIndexFinder.js */ "./node_modules/underscore/modules/_createIndexFinder.js");



// Return the position of the last occurrence of an item in an array,
// or -1 if the item is not included in the array.
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((0,_createIndexFinder_js__WEBPACK_IMPORTED_MODULE_1__["default"])(-1, _findLastIndex_js__WEBPACK_IMPORTED_MODULE_0__["default"]));


/***/ }),

/***/ "./node_modules/underscore/modules/map.js":
/*!************************************************!*\
  !*** ./node_modules/underscore/modules/map.js ***!
  \************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ map)
/* harmony export */ });
/* harmony import */ var _cb_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_cb.js */ "./node_modules/underscore/modules/_cb.js");
/* harmony import */ var _isArrayLike_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./_isArrayLike.js */ "./node_modules/underscore/modules/_isArrayLike.js");
/* harmony import */ var _keys_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./keys.js */ "./node_modules/underscore/modules/keys.js");




// Return the results of applying the iteratee to each element.
function map(obj, iteratee, context) {
  iteratee = (0,_cb_js__WEBPACK_IMPORTED_MODULE_0__["default"])(iteratee, context);
  var _keys = !(0,_isArrayLike_js__WEBPACK_IMPORTED_MODULE_1__["default"])(obj) && (0,_keys_js__WEBPACK_IMPORTED_MODULE_2__["default"])(obj),
      length = (_keys || obj).length,
      results = Array(length);
  for (var index = 0; index < length; index++) {
    var currentKey = _keys ? _keys[index] : index;
    results[index] = iteratee(obj[currentKey], currentKey, obj);
  }
  return results;
}


/***/ }),

/***/ "./node_modules/underscore/modules/mapObject.js":
/*!******************************************************!*\
  !*** ./node_modules/underscore/modules/mapObject.js ***!
  \******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ mapObject)
/* harmony export */ });
/* harmony import */ var _cb_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_cb.js */ "./node_modules/underscore/modules/_cb.js");
/* harmony import */ var _keys_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./keys.js */ "./node_modules/underscore/modules/keys.js");



// Returns the results of applying the `iteratee` to each element of `obj`.
// In contrast to `_.map` it returns an object.
function mapObject(obj, iteratee, context) {
  iteratee = (0,_cb_js__WEBPACK_IMPORTED_MODULE_0__["default"])(iteratee, context);
  var _keys = (0,_keys_js__WEBPACK_IMPORTED_MODULE_1__["default"])(obj),
      length = _keys.length,
      results = {};
  for (var index = 0; index < length; index++) {
    var currentKey = _keys[index];
    results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
  }
  return results;
}


/***/ }),

/***/ "./node_modules/underscore/modules/matcher.js":
/*!****************************************************!*\
  !*** ./node_modules/underscore/modules/matcher.js ***!
  \****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ matcher)
/* harmony export */ });
/* harmony import */ var _extendOwn_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./extendOwn.js */ "./node_modules/underscore/modules/extendOwn.js");
/* harmony import */ var _isMatch_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./isMatch.js */ "./node_modules/underscore/modules/isMatch.js");



// Returns a predicate for checking whether an object has a given set of
// `key:value` pairs.
function matcher(attrs) {
  attrs = (0,_extendOwn_js__WEBPACK_IMPORTED_MODULE_0__["default"])({}, attrs);
  return function(obj) {
    return (0,_isMatch_js__WEBPACK_IMPORTED_MODULE_1__["default"])(obj, attrs);
  };
}


/***/ }),

/***/ "./node_modules/underscore/modules/max.js":
/*!************************************************!*\
  !*** ./node_modules/underscore/modules/max.js ***!
  \************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ max)
/* harmony export */ });
/* harmony import */ var _isArrayLike_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_isArrayLike.js */ "./node_modules/underscore/modules/_isArrayLike.js");
/* harmony import */ var _values_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./values.js */ "./node_modules/underscore/modules/values.js");
/* harmony import */ var _cb_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./_cb.js */ "./node_modules/underscore/modules/_cb.js");
/* harmony import */ var _each_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./each.js */ "./node_modules/underscore/modules/each.js");





// Return the maximum element (or element-based computation).
function max(obj, iteratee, context) {
  var result = -Infinity, lastComputed = -Infinity,
      value, computed;
  if (iteratee == null || (typeof iteratee == 'number' && typeof obj[0] != 'object' && obj != null)) {
    obj = (0,_isArrayLike_js__WEBPACK_IMPORTED_MODULE_0__["default"])(obj) ? obj : (0,_values_js__WEBPACK_IMPORTED_MODULE_1__["default"])(obj);
    for (var i = 0, length = obj.length; i < length; i++) {
      value = obj[i];
      if (value != null && value > result) {
        result = value;
      }
    }
  } else {
    iteratee = (0,_cb_js__WEBPACK_IMPORTED_MODULE_2__["default"])(iteratee, context);
    (0,_each_js__WEBPACK_IMPORTED_MODULE_3__["default"])(obj, function(v, index, list) {
      computed = iteratee(v, index, list);
      if (computed > lastComputed || (computed === -Infinity && result === -Infinity)) {
        result = v;
        lastComputed = computed;
      }
    });
  }
  return result;
}


/***/ }),

/***/ "./node_modules/underscore/modules/memoize.js":
/*!****************************************************!*\
  !*** ./node_modules/underscore/modules/memoize.js ***!
  \****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ memoize)
/* harmony export */ });
/* harmony import */ var _has_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_has.js */ "./node_modules/underscore/modules/_has.js");


// Memoize an expensive function by storing its results.
function memoize(func, hasher) {
  var memoize = function(key) {
    var cache = memoize.cache;
    var address = '' + (hasher ? hasher.apply(this, arguments) : key);
    if (!(0,_has_js__WEBPACK_IMPORTED_MODULE_0__["default"])(cache, address)) cache[address] = func.apply(this, arguments);
    return cache[address];
  };
  memoize.cache = {};
  return memoize;
}


/***/ }),

/***/ "./node_modules/underscore/modules/min.js":
/*!************************************************!*\
  !*** ./node_modules/underscore/modules/min.js ***!
  \************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ min)
/* harmony export */ });
/* harmony import */ var _isArrayLike_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_isArrayLike.js */ "./node_modules/underscore/modules/_isArrayLike.js");
/* harmony import */ var _values_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./values.js */ "./node_modules/underscore/modules/values.js");
/* harmony import */ var _cb_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./_cb.js */ "./node_modules/underscore/modules/_cb.js");
/* harmony import */ var _each_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./each.js */ "./node_modules/underscore/modules/each.js");





// Return the minimum element (or element-based computation).
function min(obj, iteratee, context) {
  var result = Infinity, lastComputed = Infinity,
      value, computed;
  if (iteratee == null || (typeof iteratee == 'number' && typeof obj[0] != 'object' && obj != null)) {
    obj = (0,_isArrayLike_js__WEBPACK_IMPORTED_MODULE_0__["default"])(obj) ? obj : (0,_values_js__WEBPACK_IMPORTED_MODULE_1__["default"])(obj);
    for (var i = 0, length = obj.length; i < length; i++) {
      value = obj[i];
      if (value != null && value < result) {
        result = value;
      }
    }
  } else {
    iteratee = (0,_cb_js__WEBPACK_IMPORTED_MODULE_2__["default"])(iteratee, context);
    (0,_each_js__WEBPACK_IMPORTED_MODULE_3__["default"])(obj, function(v, index, list) {
      computed = iteratee(v, index, list);
      if (computed < lastComputed || (computed === Infinity && result === Infinity)) {
        result = v;
        lastComputed = computed;
      }
    });
  }
  return result;
}


/***/ }),

/***/ "./node_modules/underscore/modules/mixin.js":
/*!**************************************************!*\
  !*** ./node_modules/underscore/modules/mixin.js ***!
  \**************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ mixin)
/* harmony export */ });
/* harmony import */ var _underscore_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./underscore.js */ "./node_modules/underscore/modules/underscore.js");
/* harmony import */ var _each_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./each.js */ "./node_modules/underscore/modules/each.js");
/* harmony import */ var _functions_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./functions.js */ "./node_modules/underscore/modules/functions.js");
/* harmony import */ var _setup_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./_setup.js */ "./node_modules/underscore/modules/_setup.js");
/* harmony import */ var _chainResult_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./_chainResult.js */ "./node_modules/underscore/modules/_chainResult.js");






// Add your own custom functions to the Underscore object.
function mixin(obj) {
  (0,_each_js__WEBPACK_IMPORTED_MODULE_1__["default"])((0,_functions_js__WEBPACK_IMPORTED_MODULE_2__["default"])(obj), function(name) {
    var func = _underscore_js__WEBPACK_IMPORTED_MODULE_0__["default"][name] = obj[name];
    _underscore_js__WEBPACK_IMPORTED_MODULE_0__["default"].prototype[name] = function() {
      var args = [this._wrapped];
      _setup_js__WEBPACK_IMPORTED_MODULE_3__.push.apply(args, arguments);
      return (0,_chainResult_js__WEBPACK_IMPORTED_MODULE_4__["default"])(this, func.apply(_underscore_js__WEBPACK_IMPORTED_MODULE_0__["default"], args));
    };
  });
  return _underscore_js__WEBPACK_IMPORTED_MODULE_0__["default"];
}


/***/ }),

/***/ "./node_modules/underscore/modules/negate.js":
/*!***************************************************!*\
  !*** ./node_modules/underscore/modules/negate.js ***!
  \***************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ negate)
/* harmony export */ });
// Returns a negated version of the passed-in predicate.
function negate(predicate) {
  return function() {
    return !predicate.apply(this, arguments);
  };
}


/***/ }),

/***/ "./node_modules/underscore/modules/noop.js":
/*!*************************************************!*\
  !*** ./node_modules/underscore/modules/noop.js ***!
  \*************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ noop)
/* harmony export */ });
// Predicate-generating function. Often useful outside of Underscore.
function noop(){}


/***/ }),

/***/ "./node_modules/underscore/modules/now.js":
/*!************************************************!*\
  !*** ./node_modules/underscore/modules/now.js ***!
  \************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
// A (possibly faster) way to get the current timestamp as an integer.
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Date.now || function() {
  return new Date().getTime();
});


/***/ }),

/***/ "./node_modules/underscore/modules/object.js":
/*!***************************************************!*\
  !*** ./node_modules/underscore/modules/object.js ***!
  \***************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ object)
/* harmony export */ });
/* harmony import */ var _getLength_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_getLength.js */ "./node_modules/underscore/modules/_getLength.js");


// Converts lists into objects. Pass either a single array of `[key, value]`
// pairs, or two parallel arrays of the same length -- one of keys, and one of
// the corresponding values. Passing by pairs is the reverse of `_.pairs`.
function object(list, values) {
  var result = {};
  for (var i = 0, length = (0,_getLength_js__WEBPACK_IMPORTED_MODULE_0__["default"])(list); i < length; i++) {
    if (values) {
      result[list[i]] = values[i];
    } else {
      result[list[i][0]] = list[i][1];
    }
  }
  return result;
}


/***/ }),

/***/ "./node_modules/underscore/modules/omit.js":
/*!*************************************************!*\
  !*** ./node_modules/underscore/modules/omit.js ***!
  \*************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _restArguments_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./restArguments.js */ "./node_modules/underscore/modules/restArguments.js");
/* harmony import */ var _isFunction_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./isFunction.js */ "./node_modules/underscore/modules/isFunction.js");
/* harmony import */ var _negate_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./negate.js */ "./node_modules/underscore/modules/negate.js");
/* harmony import */ var _map_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./map.js */ "./node_modules/underscore/modules/map.js");
/* harmony import */ var _flatten_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./_flatten.js */ "./node_modules/underscore/modules/_flatten.js");
/* harmony import */ var _contains_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./contains.js */ "./node_modules/underscore/modules/contains.js");
/* harmony import */ var _pick_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./pick.js */ "./node_modules/underscore/modules/pick.js");








// Return a copy of the object without the disallowed properties.
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((0,_restArguments_js__WEBPACK_IMPORTED_MODULE_0__["default"])(function(obj, keys) {
  var iteratee = keys[0], context;
  if ((0,_isFunction_js__WEBPACK_IMPORTED_MODULE_1__["default"])(iteratee)) {
    iteratee = (0,_negate_js__WEBPACK_IMPORTED_MODULE_2__["default"])(iteratee);
    if (keys.length > 1) context = keys[1];
  } else {
    keys = (0,_map_js__WEBPACK_IMPORTED_MODULE_3__["default"])((0,_flatten_js__WEBPACK_IMPORTED_MODULE_4__["default"])(keys, false, false), String);
    iteratee = function(value, key) {
      return !(0,_contains_js__WEBPACK_IMPORTED_MODULE_5__["default"])(keys, key);
    };
  }
  return (0,_pick_js__WEBPACK_IMPORTED_MODULE_6__["default"])(obj, iteratee, context);
}));


/***/ }),

/***/ "./node_modules/underscore/modules/once.js":
/*!*************************************************!*\
  !*** ./node_modules/underscore/modules/once.js ***!
  \*************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _partial_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./partial.js */ "./node_modules/underscore/modules/partial.js");
/* harmony import */ var _before_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./before.js */ "./node_modules/underscore/modules/before.js");



// Returns a function that will be executed at most one time, no matter how
// often you call it. Useful for lazy initialization.
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((0,_partial_js__WEBPACK_IMPORTED_MODULE_0__["default"])(_before_js__WEBPACK_IMPORTED_MODULE_1__["default"], 2));


/***/ }),

/***/ "./node_modules/underscore/modules/pairs.js":
/*!**************************************************!*\
  !*** ./node_modules/underscore/modules/pairs.js ***!
  \**************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ pairs)
/* harmony export */ });
/* harmony import */ var _keys_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./keys.js */ "./node_modules/underscore/modules/keys.js");


// Convert an object into a list of `[key, value]` pairs.
// The opposite of `_.object` with one argument.
function pairs(obj) {
  var _keys = (0,_keys_js__WEBPACK_IMPORTED_MODULE_0__["default"])(obj);
  var length = _keys.length;
  var pairs = Array(length);
  for (var i = 0; i < length; i++) {
    pairs[i] = [_keys[i], obj[_keys[i]]];
  }
  return pairs;
}


/***/ }),

/***/ "./node_modules/underscore/modules/partial.js":
/*!****************************************************!*\
  !*** ./node_modules/underscore/modules/partial.js ***!
  \****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _restArguments_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./restArguments.js */ "./node_modules/underscore/modules/restArguments.js");
/* harmony import */ var _executeBound_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./_executeBound.js */ "./node_modules/underscore/modules/_executeBound.js");
/* harmony import */ var _underscore_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./underscore.js */ "./node_modules/underscore/modules/underscore.js");




// Partially apply a function by creating a version that has had some of its
// arguments pre-filled, without changing its dynamic `this` context. `_` acts
// as a placeholder by default, allowing any combination of arguments to be
// pre-filled. Set `_.partial.placeholder` for a custom placeholder argument.
var partial = (0,_restArguments_js__WEBPACK_IMPORTED_MODULE_0__["default"])(function(func, boundArgs) {
  var placeholder = partial.placeholder;
  var bound = function() {
    var position = 0, length = boundArgs.length;
    var args = Array(length);
    for (var i = 0; i < length; i++) {
      args[i] = boundArgs[i] === placeholder ? arguments[position++] : boundArgs[i];
    }
    while (position < arguments.length) args.push(arguments[position++]);
    return (0,_executeBound_js__WEBPACK_IMPORTED_MODULE_1__["default"])(func, bound, this, this, args);
  };
  return bound;
});

partial.placeholder = _underscore_js__WEBPACK_IMPORTED_MODULE_2__["default"];
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (partial);


/***/ }),

/***/ "./node_modules/underscore/modules/partition.js":
/*!******************************************************!*\
  !*** ./node_modules/underscore/modules/partition.js ***!
  \******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _group_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_group.js */ "./node_modules/underscore/modules/_group.js");


// Split a collection into two arrays: one whose elements all pass the given
// truth test, and one whose elements all do not pass the truth test.
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((0,_group_js__WEBPACK_IMPORTED_MODULE_0__["default"])(function(result, value, pass) {
  result[pass ? 0 : 1].push(value);
}, true));


/***/ }),

/***/ "./node_modules/underscore/modules/pick.js":
/*!*************************************************!*\
  !*** ./node_modules/underscore/modules/pick.js ***!
  \*************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _restArguments_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./restArguments.js */ "./node_modules/underscore/modules/restArguments.js");
/* harmony import */ var _isFunction_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./isFunction.js */ "./node_modules/underscore/modules/isFunction.js");
/* harmony import */ var _optimizeCb_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./_optimizeCb.js */ "./node_modules/underscore/modules/_optimizeCb.js");
/* harmony import */ var _allKeys_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./allKeys.js */ "./node_modules/underscore/modules/allKeys.js");
/* harmony import */ var _keyInObj_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./_keyInObj.js */ "./node_modules/underscore/modules/_keyInObj.js");
/* harmony import */ var _flatten_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./_flatten.js */ "./node_modules/underscore/modules/_flatten.js");







// Return a copy of the object only containing the allowed properties.
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((0,_restArguments_js__WEBPACK_IMPORTED_MODULE_0__["default"])(function(obj, keys) {
  var result = {}, iteratee = keys[0];
  if (obj == null) return result;
  if ((0,_isFunction_js__WEBPACK_IMPORTED_MODULE_1__["default"])(iteratee)) {
    if (keys.length > 1) iteratee = (0,_optimizeCb_js__WEBPACK_IMPORTED_MODULE_2__["default"])(iteratee, keys[1]);
    keys = (0,_allKeys_js__WEBPACK_IMPORTED_MODULE_3__["default"])(obj);
  } else {
    iteratee = _keyInObj_js__WEBPACK_IMPORTED_MODULE_4__["default"];
    keys = (0,_flatten_js__WEBPACK_IMPORTED_MODULE_5__["default"])(keys, false, false);
    obj = Object(obj);
  }
  for (var i = 0, length = keys.length; i < length; i++) {
    var key = keys[i];
    var value = obj[key];
    if (iteratee(value, key, obj)) result[key] = value;
  }
  return result;
}));


/***/ }),

/***/ "./node_modules/underscore/modules/pluck.js":
/*!**************************************************!*\
  !*** ./node_modules/underscore/modules/pluck.js ***!
  \**************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ pluck)
/* harmony export */ });
/* harmony import */ var _map_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./map.js */ "./node_modules/underscore/modules/map.js");
/* harmony import */ var _property_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./property.js */ "./node_modules/underscore/modules/property.js");



// Convenience version of a common use case of `_.map`: fetching a property.
function pluck(obj, key) {
  return (0,_map_js__WEBPACK_IMPORTED_MODULE_0__["default"])(obj, (0,_property_js__WEBPACK_IMPORTED_MODULE_1__["default"])(key));
}


/***/ }),

/***/ "./node_modules/underscore/modules/property.js":
/*!*****************************************************!*\
  !*** ./node_modules/underscore/modules/property.js ***!
  \*****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ property)
/* harmony export */ });
/* harmony import */ var _deepGet_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_deepGet.js */ "./node_modules/underscore/modules/_deepGet.js");
/* harmony import */ var _toPath_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./_toPath.js */ "./node_modules/underscore/modules/_toPath.js");



// Creates a function that, when passed an object, will traverse that object’s
// properties down the given `path`, specified as an array of keys or indices.
function property(path) {
  path = (0,_toPath_js__WEBPACK_IMPORTED_MODULE_1__["default"])(path);
  return function(obj) {
    return (0,_deepGet_js__WEBPACK_IMPORTED_MODULE_0__["default"])(obj, path);
  };
}


/***/ }),

/***/ "./node_modules/underscore/modules/propertyOf.js":
/*!*******************************************************!*\
  !*** ./node_modules/underscore/modules/propertyOf.js ***!
  \*******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ propertyOf)
/* harmony export */ });
/* harmony import */ var _noop_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./noop.js */ "./node_modules/underscore/modules/noop.js");
/* harmony import */ var _get_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./get.js */ "./node_modules/underscore/modules/get.js");



// Generates a function for a given object that returns a given property.
function propertyOf(obj) {
  if (obj == null) return _noop_js__WEBPACK_IMPORTED_MODULE_0__["default"];
  return function(path) {
    return (0,_get_js__WEBPACK_IMPORTED_MODULE_1__["default"])(obj, path);
  };
}


/***/ }),

/***/ "./node_modules/underscore/modules/random.js":
/*!***************************************************!*\
  !*** ./node_modules/underscore/modules/random.js ***!
  \***************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ random)
/* harmony export */ });
// Return a random integer between `min` and `max` (inclusive).
function random(min, max) {
  if (max == null) {
    max = min;
    min = 0;
  }
  return min + Math.floor(Math.random() * (max - min + 1));
}


/***/ }),

/***/ "./node_modules/underscore/modules/range.js":
/*!**************************************************!*\
  !*** ./node_modules/underscore/modules/range.js ***!
  \**************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ range)
/* harmony export */ });
// Generate an integer Array containing an arithmetic progression. A port of
// the native Python `range()` function. See
// [the Python documentation](https://docs.python.org/library/functions.html#range).
function range(start, stop, step) {
  if (stop == null) {
    stop = start || 0;
    start = 0;
  }
  if (!step) {
    step = stop < start ? -1 : 1;
  }

  var length = Math.max(Math.ceil((stop - start) / step), 0);
  var range = Array(length);

  for (var idx = 0; idx < length; idx++, start += step) {
    range[idx] = start;
  }

  return range;
}


/***/ }),

/***/ "./node_modules/underscore/modules/reduce.js":
/*!***************************************************!*\
  !*** ./node_modules/underscore/modules/reduce.js ***!
  \***************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _createReduce_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_createReduce.js */ "./node_modules/underscore/modules/_createReduce.js");


// **Reduce** builds up a single result from a list of values, aka `inject`,
// or `foldl`.
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((0,_createReduce_js__WEBPACK_IMPORTED_MODULE_0__["default"])(1));


/***/ }),

/***/ "./node_modules/underscore/modules/reduceRight.js":
/*!********************************************************!*\
  !*** ./node_modules/underscore/modules/reduceRight.js ***!
  \********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _createReduce_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_createReduce.js */ "./node_modules/underscore/modules/_createReduce.js");


// The right-associative version of reduce, also known as `foldr`.
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((0,_createReduce_js__WEBPACK_IMPORTED_MODULE_0__["default"])(-1));


/***/ }),

/***/ "./node_modules/underscore/modules/reject.js":
/*!***************************************************!*\
  !*** ./node_modules/underscore/modules/reject.js ***!
  \***************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ reject)
/* harmony export */ });
/* harmony import */ var _filter_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./filter.js */ "./node_modules/underscore/modules/filter.js");
/* harmony import */ var _negate_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./negate.js */ "./node_modules/underscore/modules/negate.js");
/* harmony import */ var _cb_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./_cb.js */ "./node_modules/underscore/modules/_cb.js");




// Return all the elements for which a truth test fails.
function reject(obj, predicate, context) {
  return (0,_filter_js__WEBPACK_IMPORTED_MODULE_0__["default"])(obj, (0,_negate_js__WEBPACK_IMPORTED_MODULE_1__["default"])((0,_cb_js__WEBPACK_IMPORTED_MODULE_2__["default"])(predicate)), context);
}


/***/ }),

/***/ "./node_modules/underscore/modules/rest.js":
/*!*************************************************!*\
  !*** ./node_modules/underscore/modules/rest.js ***!
  \*************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ rest)
/* harmony export */ });
/* harmony import */ var _setup_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_setup.js */ "./node_modules/underscore/modules/_setup.js");


// Returns everything but the first entry of the `array`. Especially useful on
// the `arguments` object. Passing an **n** will return the rest N values in the
// `array`.
function rest(array, n, guard) {
  return _setup_js__WEBPACK_IMPORTED_MODULE_0__.slice.call(array, n == null || guard ? 1 : n);
}


/***/ }),

/***/ "./node_modules/underscore/modules/restArguments.js":
/*!**********************************************************!*\
  !*** ./node_modules/underscore/modules/restArguments.js ***!
  \**********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ restArguments)
/* harmony export */ });
// Some functions take a variable number of arguments, or a few expected
// arguments at the beginning and then a variable number of values to operate
// on. This helper accumulates all remaining arguments past the function’s
// argument length (or an explicit `startIndex`), into an array that becomes
// the last argument. Similar to ES6’s "rest parameter".
function restArguments(func, startIndex) {
  startIndex = startIndex == null ? func.length - 1 : +startIndex;
  return function() {
    var length = Math.max(arguments.length - startIndex, 0),
        rest = Array(length),
        index = 0;
    for (; index < length; index++) {
      rest[index] = arguments[index + startIndex];
    }
    switch (startIndex) {
      case 0: return func.call(this, rest);
      case 1: return func.call(this, arguments[0], rest);
      case 2: return func.call(this, arguments[0], arguments[1], rest);
    }
    var args = Array(startIndex + 1);
    for (index = 0; index < startIndex; index++) {
      args[index] = arguments[index];
    }
    args[startIndex] = rest;
    return func.apply(this, args);
  };
}


/***/ }),

/***/ "./node_modules/underscore/modules/result.js":
/*!***************************************************!*\
  !*** ./node_modules/underscore/modules/result.js ***!
  \***************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ result)
/* harmony export */ });
/* harmony import */ var _isFunction_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./isFunction.js */ "./node_modules/underscore/modules/isFunction.js");
/* harmony import */ var _toPath_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./_toPath.js */ "./node_modules/underscore/modules/_toPath.js");



// Traverses the children of `obj` along `path`. If a child is a function, it
// is invoked with its parent as context. Returns the value of the final
// child, or `fallback` if any child is undefined.
function result(obj, path, fallback) {
  path = (0,_toPath_js__WEBPACK_IMPORTED_MODULE_1__["default"])(path);
  var length = path.length;
  if (!length) {
    return (0,_isFunction_js__WEBPACK_IMPORTED_MODULE_0__["default"])(fallback) ? fallback.call(obj) : fallback;
  }
  for (var i = 0; i < length; i++) {
    var prop = obj == null ? void 0 : obj[path[i]];
    if (prop === void 0) {
      prop = fallback;
      i = length; // Ensure we don't continue iterating.
    }
    obj = (0,_isFunction_js__WEBPACK_IMPORTED_MODULE_0__["default"])(prop) ? prop.call(obj) : prop;
  }
  return obj;
}


/***/ }),

/***/ "./node_modules/underscore/modules/sample.js":
/*!***************************************************!*\
  !*** ./node_modules/underscore/modules/sample.js ***!
  \***************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ sample)
/* harmony export */ });
/* harmony import */ var _isArrayLike_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_isArrayLike.js */ "./node_modules/underscore/modules/_isArrayLike.js");
/* harmony import */ var _values_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./values.js */ "./node_modules/underscore/modules/values.js");
/* harmony import */ var _getLength_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./_getLength.js */ "./node_modules/underscore/modules/_getLength.js");
/* harmony import */ var _random_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./random.js */ "./node_modules/underscore/modules/random.js");
/* harmony import */ var _toArray_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./toArray.js */ "./node_modules/underscore/modules/toArray.js");






// Sample **n** random values from a collection using the modern version of the
// [Fisher-Yates shuffle](https://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
// If **n** is not specified, returns a single random element.
// The internal `guard` argument allows it to work with `_.map`.
function sample(obj, n, guard) {
  if (n == null || guard) {
    if (!(0,_isArrayLike_js__WEBPACK_IMPORTED_MODULE_0__["default"])(obj)) obj = (0,_values_js__WEBPACK_IMPORTED_MODULE_1__["default"])(obj);
    return obj[(0,_random_js__WEBPACK_IMPORTED_MODULE_3__["default"])(obj.length - 1)];
  }
  var sample = (0,_toArray_js__WEBPACK_IMPORTED_MODULE_4__["default"])(obj);
  var length = (0,_getLength_js__WEBPACK_IMPORTED_MODULE_2__["default"])(sample);
  n = Math.max(Math.min(n, length), 0);
  var last = length - 1;
  for (var index = 0; index < n; index++) {
    var rand = (0,_random_js__WEBPACK_IMPORTED_MODULE_3__["default"])(index, last);
    var temp = sample[index];
    sample[index] = sample[rand];
    sample[rand] = temp;
  }
  return sample.slice(0, n);
}


/***/ }),

/***/ "./node_modules/underscore/modules/shuffle.js":
/*!****************************************************!*\
  !*** ./node_modules/underscore/modules/shuffle.js ***!
  \****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ shuffle)
/* harmony export */ });
/* harmony import */ var _sample_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./sample.js */ "./node_modules/underscore/modules/sample.js");


// Shuffle a collection.
function shuffle(obj) {
  return (0,_sample_js__WEBPACK_IMPORTED_MODULE_0__["default"])(obj, Infinity);
}


/***/ }),

/***/ "./node_modules/underscore/modules/size.js":
/*!*************************************************!*\
  !*** ./node_modules/underscore/modules/size.js ***!
  \*************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ size)
/* harmony export */ });
/* harmony import */ var _isArrayLike_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_isArrayLike.js */ "./node_modules/underscore/modules/_isArrayLike.js");
/* harmony import */ var _keys_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./keys.js */ "./node_modules/underscore/modules/keys.js");



// Return the number of elements in a collection.
function size(obj) {
  if (obj == null) return 0;
  return (0,_isArrayLike_js__WEBPACK_IMPORTED_MODULE_0__["default"])(obj) ? obj.length : (0,_keys_js__WEBPACK_IMPORTED_MODULE_1__["default"])(obj).length;
}


/***/ }),

/***/ "./node_modules/underscore/modules/some.js":
/*!*************************************************!*\
  !*** ./node_modules/underscore/modules/some.js ***!
  \*************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ some)
/* harmony export */ });
/* harmony import */ var _cb_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_cb.js */ "./node_modules/underscore/modules/_cb.js");
/* harmony import */ var _isArrayLike_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./_isArrayLike.js */ "./node_modules/underscore/modules/_isArrayLike.js");
/* harmony import */ var _keys_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./keys.js */ "./node_modules/underscore/modules/keys.js");




// Determine if at least one element in the object passes a truth test.
function some(obj, predicate, context) {
  predicate = (0,_cb_js__WEBPACK_IMPORTED_MODULE_0__["default"])(predicate, context);
  var _keys = !(0,_isArrayLike_js__WEBPACK_IMPORTED_MODULE_1__["default"])(obj) && (0,_keys_js__WEBPACK_IMPORTED_MODULE_2__["default"])(obj),
      length = (_keys || obj).length;
  for (var index = 0; index < length; index++) {
    var currentKey = _keys ? _keys[index] : index;
    if (predicate(obj[currentKey], currentKey, obj)) return true;
  }
  return false;
}


/***/ }),

/***/ "./node_modules/underscore/modules/sortBy.js":
/*!***************************************************!*\
  !*** ./node_modules/underscore/modules/sortBy.js ***!
  \***************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ sortBy)
/* harmony export */ });
/* harmony import */ var _cb_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_cb.js */ "./node_modules/underscore/modules/_cb.js");
/* harmony import */ var _pluck_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./pluck.js */ "./node_modules/underscore/modules/pluck.js");
/* harmony import */ var _map_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./map.js */ "./node_modules/underscore/modules/map.js");




// Sort the object's values by a criterion produced by an iteratee.
function sortBy(obj, iteratee, context) {
  var index = 0;
  iteratee = (0,_cb_js__WEBPACK_IMPORTED_MODULE_0__["default"])(iteratee, context);
  return (0,_pluck_js__WEBPACK_IMPORTED_MODULE_1__["default"])((0,_map_js__WEBPACK_IMPORTED_MODULE_2__["default"])(obj, function(value, key, list) {
    return {
      value: value,
      index: index++,
      criteria: iteratee(value, key, list)
    };
  }).sort(function(left, right) {
    var a = left.criteria;
    var b = right.criteria;
    if (a !== b) {
      if (a > b || a === void 0) return 1;
      if (a < b || b === void 0) return -1;
    }
    return left.index - right.index;
  }), 'value');
}


/***/ }),

/***/ "./node_modules/underscore/modules/sortedIndex.js":
/*!********************************************************!*\
  !*** ./node_modules/underscore/modules/sortedIndex.js ***!
  \********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ sortedIndex)
/* harmony export */ });
/* harmony import */ var _cb_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_cb.js */ "./node_modules/underscore/modules/_cb.js");
/* harmony import */ var _getLength_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./_getLength.js */ "./node_modules/underscore/modules/_getLength.js");



// Use a comparator function to figure out the smallest index at which
// an object should be inserted so as to maintain order. Uses binary search.
function sortedIndex(array, obj, iteratee, context) {
  iteratee = (0,_cb_js__WEBPACK_IMPORTED_MODULE_0__["default"])(iteratee, context, 1);
  var value = iteratee(obj);
  var low = 0, high = (0,_getLength_js__WEBPACK_IMPORTED_MODULE_1__["default"])(array);
  while (low < high) {
    var mid = Math.floor((low + high) / 2);
    if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
  }
  return low;
}


/***/ }),

/***/ "./node_modules/underscore/modules/tap.js":
/*!************************************************!*\
  !*** ./node_modules/underscore/modules/tap.js ***!
  \************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ tap)
/* harmony export */ });
// Invokes `interceptor` with the `obj` and then returns `obj`.
// The primary purpose of this method is to "tap into" a method chain, in
// order to perform operations on intermediate results within the chain.
function tap(obj, interceptor) {
  interceptor(obj);
  return obj;
}


/***/ }),

/***/ "./node_modules/underscore/modules/template.js":
/*!*****************************************************!*\
  !*** ./node_modules/underscore/modules/template.js ***!
  \*****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ template)
/* harmony export */ });
/* harmony import */ var _defaults_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./defaults.js */ "./node_modules/underscore/modules/defaults.js");
/* harmony import */ var _underscore_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./underscore.js */ "./node_modules/underscore/modules/underscore.js");
/* harmony import */ var _templateSettings_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./templateSettings.js */ "./node_modules/underscore/modules/templateSettings.js");




// When customizing `_.templateSettings`, if you don't want to define an
// interpolation, evaluation or escaping regex, we need one that is
// guaranteed not to match.
var noMatch = /(.)^/;

// Certain characters need to be escaped so that they can be put into a
// string literal.
var escapes = {
  "'": "'",
  '\\': '\\',
  '\r': 'r',
  '\n': 'n',
  '\u2028': 'u2028',
  '\u2029': 'u2029'
};

var escapeRegExp = /\\|'|\r|\n|\u2028|\u2029/g;

function escapeChar(match) {
  return '\\' + escapes[match];
}

// In order to prevent third-party code injection through
// `_.templateSettings.variable`, we test it against the following regular
// expression. It is intentionally a bit more liberal than just matching valid
// identifiers, but still prevents possible loopholes through defaults or
// destructuring assignment.
var bareIdentifier = /^\s*(\w|\$)+\s*$/;

// JavaScript micro-templating, similar to John Resig's implementation.
// Underscore templating handles arbitrary delimiters, preserves whitespace,
// and correctly escapes quotes within interpolated code.
// NB: `oldSettings` only exists for backwards compatibility.
function template(text, settings, oldSettings) {
  if (!settings && oldSettings) settings = oldSettings;
  settings = (0,_defaults_js__WEBPACK_IMPORTED_MODULE_0__["default"])({}, settings, _underscore_js__WEBPACK_IMPORTED_MODULE_1__["default"].templateSettings);

  // Combine delimiters into one regular expression via alternation.
  var matcher = RegExp([
    (settings.escape || noMatch).source,
    (settings.interpolate || noMatch).source,
    (settings.evaluate || noMatch).source
  ].join('|') + '|$', 'g');

  // Compile the template source, escaping string literals appropriately.
  var index = 0;
  var source = "__p+='";
  text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
    source += text.slice(index, offset).replace(escapeRegExp, escapeChar);
    index = offset + match.length;

    if (escape) {
      source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
    } else if (interpolate) {
      source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
    } else if (evaluate) {
      source += "';\n" + evaluate + "\n__p+='";
    }

    // Adobe VMs need the match returned to produce the correct offset.
    return match;
  });
  source += "';\n";

  var argument = settings.variable;
  if (argument) {
    // Insure against third-party code injection. (CVE-2021-23358)
    if (!bareIdentifier.test(argument)) throw new Error(
      'variable is not a bare identifier: ' + argument
    );
  } else {
    // If a variable is not specified, place data values in local scope.
    source = 'with(obj||{}){\n' + source + '}\n';
    argument = 'obj';
  }

  source = "var __t,__p='',__j=Array.prototype.join," +
    "print=function(){__p+=__j.call(arguments,'');};\n" +
    source + 'return __p;\n';

  var render;
  try {
    render = new Function(argument, '_', source);
  } catch (e) {
    e.source = source;
    throw e;
  }

  var template = function(data) {
    return render.call(this, data, _underscore_js__WEBPACK_IMPORTED_MODULE_1__["default"]);
  };

  // Provide the compiled source as a convenience for precompilation.
  template.source = 'function(' + argument + '){\n' + source + '}';

  return template;
}


/***/ }),

/***/ "./node_modules/underscore/modules/templateSettings.js":
/*!*************************************************************!*\
  !*** ./node_modules/underscore/modules/templateSettings.js ***!
  \*************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _underscore_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./underscore.js */ "./node_modules/underscore/modules/underscore.js");


// By default, Underscore uses ERB-style template delimiters. Change the
// following template settings to use alternative delimiters.
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_underscore_js__WEBPACK_IMPORTED_MODULE_0__["default"].templateSettings = {
  evaluate: /<%([\s\S]+?)%>/g,
  interpolate: /<%=([\s\S]+?)%>/g,
  escape: /<%-([\s\S]+?)%>/g
});


/***/ }),

/***/ "./node_modules/underscore/modules/throttle.js":
/*!*****************************************************!*\
  !*** ./node_modules/underscore/modules/throttle.js ***!
  \*****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ throttle)
/* harmony export */ });
/* harmony import */ var _now_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./now.js */ "./node_modules/underscore/modules/now.js");


// Returns a function, that, when invoked, will only be triggered at most once
// during a given window of time. Normally, the throttled function will run
// as much as it can, without ever going more than once per `wait` duration;
// but if you'd like to disable the execution on the leading edge, pass
// `{leading: false}`. To disable execution on the trailing edge, ditto.
function throttle(func, wait, options) {
  var timeout, context, args, result;
  var previous = 0;
  if (!options) options = {};

  var later = function() {
    previous = options.leading === false ? 0 : (0,_now_js__WEBPACK_IMPORTED_MODULE_0__["default"])();
    timeout = null;
    result = func.apply(context, args);
    if (!timeout) context = args = null;
  };

  var throttled = function() {
    var _now = (0,_now_js__WEBPACK_IMPORTED_MODULE_0__["default"])();
    if (!previous && options.leading === false) previous = _now;
    var remaining = wait - (_now - previous);
    context = this;
    args = arguments;
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = _now;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining);
    }
    return result;
  };

  throttled.cancel = function() {
    clearTimeout(timeout);
    previous = 0;
    timeout = context = args = null;
  };

  return throttled;
}


/***/ }),

/***/ "./node_modules/underscore/modules/times.js":
/*!**************************************************!*\
  !*** ./node_modules/underscore/modules/times.js ***!
  \**************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ times)
/* harmony export */ });
/* harmony import */ var _optimizeCb_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_optimizeCb.js */ "./node_modules/underscore/modules/_optimizeCb.js");


// Run a function **n** times.
function times(n, iteratee, context) {
  var accum = Array(Math.max(0, n));
  iteratee = (0,_optimizeCb_js__WEBPACK_IMPORTED_MODULE_0__["default"])(iteratee, context, 1);
  for (var i = 0; i < n; i++) accum[i] = iteratee(i);
  return accum;
}


/***/ }),

/***/ "./node_modules/underscore/modules/toArray.js":
/*!****************************************************!*\
  !*** ./node_modules/underscore/modules/toArray.js ***!
  \****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ toArray)
/* harmony export */ });
/* harmony import */ var _isArray_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./isArray.js */ "./node_modules/underscore/modules/isArray.js");
/* harmony import */ var _setup_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./_setup.js */ "./node_modules/underscore/modules/_setup.js");
/* harmony import */ var _isString_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./isString.js */ "./node_modules/underscore/modules/isString.js");
/* harmony import */ var _isArrayLike_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./_isArrayLike.js */ "./node_modules/underscore/modules/_isArrayLike.js");
/* harmony import */ var _map_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./map.js */ "./node_modules/underscore/modules/map.js");
/* harmony import */ var _identity_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./identity.js */ "./node_modules/underscore/modules/identity.js");
/* harmony import */ var _values_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./values.js */ "./node_modules/underscore/modules/values.js");








// Safely create a real, live array from anything iterable.
var reStrSymbol = /[^\ud800-\udfff]|[\ud800-\udbff][\udc00-\udfff]|[\ud800-\udfff]/g;
function toArray(obj) {
  if (!obj) return [];
  if ((0,_isArray_js__WEBPACK_IMPORTED_MODULE_0__["default"])(obj)) return _setup_js__WEBPACK_IMPORTED_MODULE_1__.slice.call(obj);
  if ((0,_isString_js__WEBPACK_IMPORTED_MODULE_2__["default"])(obj)) {
    // Keep surrogate pair characters together.
    return obj.match(reStrSymbol);
  }
  if ((0,_isArrayLike_js__WEBPACK_IMPORTED_MODULE_3__["default"])(obj)) return (0,_map_js__WEBPACK_IMPORTED_MODULE_4__["default"])(obj, _identity_js__WEBPACK_IMPORTED_MODULE_5__["default"]);
  return (0,_values_js__WEBPACK_IMPORTED_MODULE_6__["default"])(obj);
}


/***/ }),

/***/ "./node_modules/underscore/modules/toPath.js":
/*!***************************************************!*\
  !*** ./node_modules/underscore/modules/toPath.js ***!
  \***************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ toPath)
/* harmony export */ });
/* harmony import */ var _underscore_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./underscore.js */ "./node_modules/underscore/modules/underscore.js");
/* harmony import */ var _isArray_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./isArray.js */ "./node_modules/underscore/modules/isArray.js");



// Normalize a (deep) property `path` to array.
// Like `_.iteratee`, this function can be customized.
function toPath(path) {
  return (0,_isArray_js__WEBPACK_IMPORTED_MODULE_1__["default"])(path) ? path : [path];
}
_underscore_js__WEBPACK_IMPORTED_MODULE_0__["default"].toPath = toPath;


/***/ }),

/***/ "./node_modules/underscore/modules/underscore-array-methods.js":
/*!*********************************************************************!*\
  !*** ./node_modules/underscore/modules/underscore-array-methods.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _underscore_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./underscore.js */ "./node_modules/underscore/modules/underscore.js");
/* harmony import */ var _each_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./each.js */ "./node_modules/underscore/modules/each.js");
/* harmony import */ var _setup_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./_setup.js */ "./node_modules/underscore/modules/_setup.js");
/* harmony import */ var _chainResult_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./_chainResult.js */ "./node_modules/underscore/modules/_chainResult.js");





// Add all mutator `Array` functions to the wrapper.
(0,_each_js__WEBPACK_IMPORTED_MODULE_1__["default"])(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
  var method = _setup_js__WEBPACK_IMPORTED_MODULE_2__.ArrayProto[name];
  _underscore_js__WEBPACK_IMPORTED_MODULE_0__["default"].prototype[name] = function() {
    var obj = this._wrapped;
    if (obj != null) {
      method.apply(obj, arguments);
      if ((name === 'shift' || name === 'splice') && obj.length === 0) {
        delete obj[0];
      }
    }
    return (0,_chainResult_js__WEBPACK_IMPORTED_MODULE_3__["default"])(this, obj);
  };
});

// Add all accessor `Array` functions to the wrapper.
(0,_each_js__WEBPACK_IMPORTED_MODULE_1__["default"])(['concat', 'join', 'slice'], function(name) {
  var method = _setup_js__WEBPACK_IMPORTED_MODULE_2__.ArrayProto[name];
  _underscore_js__WEBPACK_IMPORTED_MODULE_0__["default"].prototype[name] = function() {
    var obj = this._wrapped;
    if (obj != null) obj = method.apply(obj, arguments);
    return (0,_chainResult_js__WEBPACK_IMPORTED_MODULE_3__["default"])(this, obj);
  };
});

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_underscore_js__WEBPACK_IMPORTED_MODULE_0__["default"]);


/***/ }),

/***/ "./node_modules/underscore/modules/underscore.js":
/*!*******************************************************!*\
  !*** ./node_modules/underscore/modules/underscore.js ***!
  \*******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _)
/* harmony export */ });
/* harmony import */ var _setup_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_setup.js */ "./node_modules/underscore/modules/_setup.js");


// If Underscore is called as a function, it returns a wrapped object that can
// be used OO-style. This wrapper holds altered versions of all functions added
// through `_.mixin`. Wrapped objects may be chained.
function _(obj) {
  if (obj instanceof _) return obj;
  if (!(this instanceof _)) return new _(obj);
  this._wrapped = obj;
}

_.VERSION = _setup_js__WEBPACK_IMPORTED_MODULE_0__.VERSION;

// Extracts the result from a wrapped and chained object.
_.prototype.value = function() {
  return this._wrapped;
};

// Provide unwrapping proxies for some methods used in engine operations
// such as arithmetic and JSON stringification.
_.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

_.prototype.toString = function() {
  return String(this._wrapped);
};


/***/ }),

/***/ "./node_modules/underscore/modules/unescape.js":
/*!*****************************************************!*\
  !*** ./node_modules/underscore/modules/unescape.js ***!
  \*****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _createEscaper_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_createEscaper.js */ "./node_modules/underscore/modules/_createEscaper.js");
/* harmony import */ var _unescapeMap_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./_unescapeMap.js */ "./node_modules/underscore/modules/_unescapeMap.js");



// Function for unescaping strings from HTML interpolation.
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((0,_createEscaper_js__WEBPACK_IMPORTED_MODULE_0__["default"])(_unescapeMap_js__WEBPACK_IMPORTED_MODULE_1__["default"]));


/***/ }),

/***/ "./node_modules/underscore/modules/union.js":
/*!**************************************************!*\
  !*** ./node_modules/underscore/modules/union.js ***!
  \**************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _restArguments_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./restArguments.js */ "./node_modules/underscore/modules/restArguments.js");
/* harmony import */ var _uniq_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./uniq.js */ "./node_modules/underscore/modules/uniq.js");
/* harmony import */ var _flatten_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./_flatten.js */ "./node_modules/underscore/modules/_flatten.js");




// Produce an array that contains the union: each distinct element from all of
// the passed-in arrays.
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((0,_restArguments_js__WEBPACK_IMPORTED_MODULE_0__["default"])(function(arrays) {
  return (0,_uniq_js__WEBPACK_IMPORTED_MODULE_1__["default"])((0,_flatten_js__WEBPACK_IMPORTED_MODULE_2__["default"])(arrays, true, true));
}));


/***/ }),

/***/ "./node_modules/underscore/modules/uniq.js":
/*!*************************************************!*\
  !*** ./node_modules/underscore/modules/uniq.js ***!
  \*************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ uniq)
/* harmony export */ });
/* harmony import */ var _isBoolean_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./isBoolean.js */ "./node_modules/underscore/modules/isBoolean.js");
/* harmony import */ var _cb_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./_cb.js */ "./node_modules/underscore/modules/_cb.js");
/* harmony import */ var _getLength_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./_getLength.js */ "./node_modules/underscore/modules/_getLength.js");
/* harmony import */ var _contains_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./contains.js */ "./node_modules/underscore/modules/contains.js");





// Produce a duplicate-free version of the array. If the array has already
// been sorted, you have the option of using a faster algorithm.
// The faster algorithm will not work with an iteratee if the iteratee
// is not a one-to-one function, so providing an iteratee will disable
// the faster algorithm.
function uniq(array, isSorted, iteratee, context) {
  if (!(0,_isBoolean_js__WEBPACK_IMPORTED_MODULE_0__["default"])(isSorted)) {
    context = iteratee;
    iteratee = isSorted;
    isSorted = false;
  }
  if (iteratee != null) iteratee = (0,_cb_js__WEBPACK_IMPORTED_MODULE_1__["default"])(iteratee, context);
  var result = [];
  var seen = [];
  for (var i = 0, length = (0,_getLength_js__WEBPACK_IMPORTED_MODULE_2__["default"])(array); i < length; i++) {
    var value = array[i],
        computed = iteratee ? iteratee(value, i, array) : value;
    if (isSorted && !iteratee) {
      if (!i || seen !== computed) result.push(value);
      seen = computed;
    } else if (iteratee) {
      if (!(0,_contains_js__WEBPACK_IMPORTED_MODULE_3__["default"])(seen, computed)) {
        seen.push(computed);
        result.push(value);
      }
    } else if (!(0,_contains_js__WEBPACK_IMPORTED_MODULE_3__["default"])(result, value)) {
      result.push(value);
    }
  }
  return result;
}


/***/ }),

/***/ "./node_modules/underscore/modules/uniqueId.js":
/*!*****************************************************!*\
  !*** ./node_modules/underscore/modules/uniqueId.js ***!
  \*****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ uniqueId)
/* harmony export */ });
// Generate a unique integer id (unique within the entire client session).
// Useful for temporary DOM ids.
var idCounter = 0;
function uniqueId(prefix) {
  var id = ++idCounter + '';
  return prefix ? prefix + id : id;
}


/***/ }),

/***/ "./node_modules/underscore/modules/unzip.js":
/*!**************************************************!*\
  !*** ./node_modules/underscore/modules/unzip.js ***!
  \**************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ unzip)
/* harmony export */ });
/* harmony import */ var _max_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./max.js */ "./node_modules/underscore/modules/max.js");
/* harmony import */ var _getLength_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./_getLength.js */ "./node_modules/underscore/modules/_getLength.js");
/* harmony import */ var _pluck_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./pluck.js */ "./node_modules/underscore/modules/pluck.js");




// Complement of zip. Unzip accepts an array of arrays and groups
// each array's elements on shared indices.
function unzip(array) {
  var length = (array && (0,_max_js__WEBPACK_IMPORTED_MODULE_0__["default"])(array, _getLength_js__WEBPACK_IMPORTED_MODULE_1__["default"]).length) || 0;
  var result = Array(length);

  for (var index = 0; index < length; index++) {
    result[index] = (0,_pluck_js__WEBPACK_IMPORTED_MODULE_2__["default"])(array, index);
  }
  return result;
}


/***/ }),

/***/ "./node_modules/underscore/modules/values.js":
/*!***************************************************!*\
  !*** ./node_modules/underscore/modules/values.js ***!
  \***************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ values)
/* harmony export */ });
/* harmony import */ var _keys_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./keys.js */ "./node_modules/underscore/modules/keys.js");


// Retrieve the values of an object's properties.
function values(obj) {
  var _keys = (0,_keys_js__WEBPACK_IMPORTED_MODULE_0__["default"])(obj);
  var length = _keys.length;
  var values = Array(length);
  for (var i = 0; i < length; i++) {
    values[i] = obj[_keys[i]];
  }
  return values;
}


/***/ }),

/***/ "./node_modules/underscore/modules/where.js":
/*!**************************************************!*\
  !*** ./node_modules/underscore/modules/where.js ***!
  \**************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ where)
/* harmony export */ });
/* harmony import */ var _filter_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./filter.js */ "./node_modules/underscore/modules/filter.js");
/* harmony import */ var _matcher_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./matcher.js */ "./node_modules/underscore/modules/matcher.js");



// Convenience version of a common use case of `_.filter`: selecting only
// objects containing specific `key:value` pairs.
function where(obj, attrs) {
  return (0,_filter_js__WEBPACK_IMPORTED_MODULE_0__["default"])(obj, (0,_matcher_js__WEBPACK_IMPORTED_MODULE_1__["default"])(attrs));
}


/***/ }),

/***/ "./node_modules/underscore/modules/without.js":
/*!****************************************************!*\
  !*** ./node_modules/underscore/modules/without.js ***!
  \****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _restArguments_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./restArguments.js */ "./node_modules/underscore/modules/restArguments.js");
/* harmony import */ var _difference_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./difference.js */ "./node_modules/underscore/modules/difference.js");



// Return a version of the array that does not contain the specified value(s).
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((0,_restArguments_js__WEBPACK_IMPORTED_MODULE_0__["default"])(function(array, otherArrays) {
  return (0,_difference_js__WEBPACK_IMPORTED_MODULE_1__["default"])(array, otherArrays);
}));


/***/ }),

/***/ "./node_modules/underscore/modules/wrap.js":
/*!*************************************************!*\
  !*** ./node_modules/underscore/modules/wrap.js ***!
  \*************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ wrap)
/* harmony export */ });
/* harmony import */ var _partial_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./partial.js */ "./node_modules/underscore/modules/partial.js");


// Returns the first function passed as an argument to the second,
// allowing you to adjust arguments, run code before and after, and
// conditionally execute the original function.
function wrap(func, wrapper) {
  return (0,_partial_js__WEBPACK_IMPORTED_MODULE_0__["default"])(wrapper, func);
}


/***/ }),

/***/ "./node_modules/underscore/modules/zip.js":
/*!************************************************!*\
  !*** ./node_modules/underscore/modules/zip.js ***!
  \************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _restArguments_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./restArguments.js */ "./node_modules/underscore/modules/restArguments.js");
/* harmony import */ var _unzip_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./unzip.js */ "./node_modules/underscore/modules/unzip.js");



// Zip together multiple lists into a single array -- elements that share
// an index go together.
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((0,_restArguments_js__WEBPACK_IMPORTED_MODULE_0__["default"])(_unzip_js__WEBPACK_IMPORTED_MODULE_1__["default"]));


/***/ }),

/***/ "./src/geom/point.ts":
/*!***************************!*\
  !*** ./src/geom/point.ts ***!
  \***************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


__webpack_require__(/*! ../helpers */ "./src/helpers.ts");
const { sqrt, atan2 } = Math;
class Point {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    get length() {
        return sqrt(this.x * this.x + this.y * this.y);
    }
    get direction() {
        return atan2(this.y, this.x);
    }
    get normalized() {
        return new Point(this.x / this.length, this.y / this.length);
    }
    add(o) {
        return new Point(this.x + o.x, this.y + o.y);
    }
    subtract(o) {
        return new Point(this.x - o.x, this.y - o.y);
    }
    mult(k) {
        return new Point(this.x * k, this.y * k);
    }
    divide(k) {
        return new Point(this.x / k, this.y / k);
    }
}
Point.property = Function.prototype.property;
// Set up properties using the CoffeeScript-style property decorator
Point.property('length', {
    get: function () {
        return sqrt(this.x * this.x + this.y * this.y);
    }
});
Point.property('direction', {
    get: function () {
        return atan2(this.y, this.x);
    }
});
Point.property('normalized', {
    get: function () {
        return new Point(this.x / this.length, this.y / this.length);
    }
});
module.exports = Point;


/***/ }),

/***/ "./src/geom/rect.ts":
/*!**************************!*\
  !*** ./src/geom/rect.ts ***!
  \**************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


__webpack_require__(/*! ../helpers */ "./src/helpers.ts");
const _ = __webpack_require__(/*! underscore */ "./node_modules/underscore/modules/index-all.js");
const Point = __webpack_require__(/*! ./point */ "./src/geom/point.ts");
const Segment = __webpack_require__(/*! ./segment */ "./src/geom/segment.ts");
const { abs } = Math;
class Rect {
    constructor(x, y, _width = 0, _height = 0) {
        this.x = x;
        this.y = y;
        this._width = _width;
        this._height = _height;
    }
    static copy(rect) {
        return new Rect(rect.x, rect.y, rect._width, rect._height);
    }
    toJSON() {
        return _.extend({}, this);
    }
    area() {
        return this.width() * this.height();
    }
    left(left) {
        if (left !== undefined) {
            this.x = left;
        }
        return this.x;
    }
    right(right) {
        if (right !== undefined) {
            this.x = right - this.width();
        }
        return this.x + this.width();
    }
    width(width) {
        if (width !== undefined) {
            this._width = width;
        }
        return this._width;
    }
    top(top) {
        if (top !== undefined) {
            this.y = top;
        }
        return this.y;
    }
    bottom(bottom) {
        if (bottom !== undefined) {
            this.y = bottom - this.height();
        }
        return this.y + this.height();
    }
    height(height) {
        if (height !== undefined) {
            this._height = height;
        }
        return this._height;
    }
    center(center) {
        if (center) {
            this.x = center.x - this.width() / 2;
            this.y = center.y - this.height() / 2;
        }
        return new Point(this.x + this.width() / 2, this.y + this.height() / 2);
    }
    containsPoint(point) {
        return this.left() <= point.x && point.x <= this.right() &&
            this.top() <= point.y && point.y <= this.bottom();
    }
    containsRect(rect) {
        return this.left() <= rect.left() && rect.right() <= this.right() &&
            this.top() <= rect.top() && rect.bottom() <= this.bottom();
    }
    getVertices() {
        return [
            new Point(this.left(), this.top()),
            new Point(this.right(), this.top()),
            new Point(this.right(), this.bottom()),
            new Point(this.left(), this.bottom()),
        ];
    }
    getSide(i) {
        const vertices = this.getVertices();
        return new Segment(vertices[i], vertices[(i + 1) % 4]);
    }
    getSectorId(point) {
        const offset = point.subtract(this.center());
        if (offset.y <= 0 && abs(offset.x) <= abs(offset.y)) {
            return 0;
        }
        if (offset.x >= 0 && abs(offset.x) >= abs(offset.y)) {
            return 1;
        }
        if (offset.y >= 0 && abs(offset.x) <= abs(offset.y)) {
            return 2;
        }
        if (offset.x <= 0 && abs(offset.x) >= abs(offset.y)) {
            return 3;
        }
        throw new Error('algorithm error');
    }
    getSector(point) {
        return this.getSide(this.getSectorId(point));
    }
}
module.exports = Rect;


/***/ }),

/***/ "./src/geom/segment.ts":
/*!*****************************!*\
  !*** ./src/geom/segment.ts ***!
  \*****************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


__webpack_require__(/*! ../helpers */ "./src/helpers.ts");
class Segment {
    constructor(source, target) {
        this.source = source;
        this.target = target;
    }
    get vector() {
        return this.target.subtract(this.source);
    }
    get length() {
        return this.vector.length;
    }
    get direction() {
        return this.vector.direction;
    }
    get center() {
        return this.getPoint(0.5);
    }
    split(n, reverse) {
        const order = reverse ?
            Array.from({ length: n }, (_, i) => n - 1 - i) :
            Array.from({ length: n }, (_, i) => i);
        return order.map(k => this.subsegment(k / n, (k + 1) / n));
    }
    getPoint(a) {
        return this.source.add(this.vector.mult(a));
    }
    subsegment(a, b) {
        const offset = this.vector;
        const start = this.source.add(offset.mult(a));
        const end = this.source.add(offset.mult(b));
        return new Segment(start, end);
    }
}
// Set up properties using the CoffeeScript-style property decorator
Segment.property('vector', {
    get: function () {
        return this.target.subtract(this.source);
    }
});
Segment.property('length', {
    get: function () {
        return this.vector.length;
    }
});
Segment.property('direction', {
    get: function () {
        return this.vector.direction;
    }
});
Segment.property('center', {
    get: function () {
        return this.getPoint(0.5);
    }
});
module.exports = Segment;


/***/ }),

/***/ "./src/helpers.ts":
/*!************************!*\
  !*** ./src/helpers.ts ***!
  \************************/
/***/ ((__unused_webpack_module, exports) => {


// TypeScript equivalent of CoffeeScript property decorator functionality
Object.defineProperty(exports, "__esModule", ({ value: true }));
Function.prototype.property = function (prop, desc) {
    Object.defineProperty(this.prototype, prop, desc);
};


/***/ }),

/***/ "./src/model/control-signals.ts":
/*!**************************************!*\
  !*** ./src/model/control-signals.ts ***!
  \**************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


__webpack_require__(/*! ../helpers */ "./src/helpers.ts");
const settings = __webpack_require__(/*! ../settings */ "./src/settings.ts");
const { random } = Math;
class ControlSignals {
    constructor(intersection) {
        // Traffic signal patterns for intersections
        // 'L' = Left turn, 'F' = Forward, 'R' = Right turn
        // Each array represents a phase of the traffic light cycle
        // Each element in the array represents a direction (N, E, S, W)
        this.states = [
            ['L', '', 'L', ''],
            ['FR', '', 'FR', ''],
            ['', 'L', '', 'L'],
            ['', 'FR', '', 'FR'] // Phase 4: East & West forward and right
        ];
        // Update the traffic light state based on elapsed time
        this.onTick = (delta) => {
            // Update timer
            this.time += delta;
            // When the interval is reached, change the light
            if (this.time > this.lastFlipTime + this.flipInterval) {
                this.flip();
            }
        };
        this.intersection = intersection;
        this.flipMultiplier = random(); // Randomize cycle timing for variety
        this.phaseOffset = 100 * random(); // Randomize starting phase
        this.time = this.phaseOffset;
        this.stateNum = 0;
        this.lastFlipTime = 0;
    }
    static copy(controlSignals, intersection) {
        if (!controlSignals) {
            return new ControlSignals(intersection);
        }
        // Create a proper instance with the correct prototype
        const result = new ControlSignals(intersection);
        // Copy over the data properties
        result.flipMultiplier = controlSignals.flipMultiplier || Math.random();
        result.phaseOffset = controlSignals.phaseOffset || 100 * Math.random();
        result.time = result.phaseOffset;
        result.stateNum = controlSignals.stateNum || 0;
        result.lastFlipTime = 0;
        // Ensure we have the proper states array if it was serialized
        result.states = controlSignals.states || [
            ['L', '', 'L', ''],
            ['FR', '', 'FR', ''],
            ['', 'L', '', 'L'],
            ['', 'FR', '', 'FR']
        ];
        return result;
    }
    toJSON() {
        return {
            flipMultiplier: this.flipMultiplier,
            phaseOffset: this.phaseOffset,
            stateNum: this.stateNum,
            states: this.states
        };
    }
    // Calculate the interval between light changes based on the flipMultiplier
    get flipInterval() {
        // This formula matches the reference implementation
        return (0.1 + 0.05 * this.flipMultiplier) * settings.lightsFlipInterval;
    }
    // Convert string representation to numeric state array
    // e.g., "LFR" -> [1,1,1] (left, forward, right allowed)
    _decode(str) {
        const state = [0, 0, 0];
        if (str.includes('L'))
            state[0] = 1;
        if (str.includes('F'))
            state[1] = 1;
        if (str.includes('R'))
            state[2] = 1;
        return state;
    }
    // Get the current state of all traffic lights
    get state() {
        let stringState = this.states[this.stateNum % this.states.length];
        // For 2-way or T-intersections, always allow all movements
        if (this.intersection.roads && this.intersection.roads.length <= 2) {
            stringState = ['LFR', 'LFR', 'LFR', 'LFR'];
        }
        // Convert string patterns to numeric state arrays
        return stringState.map(x => this._decode(x));
    }
    // Advance to the next traffic light phase
    flip() {
        this.stateNum += 1;
        this.lastFlipTime = this.time;
    }
}
// Traffic light states
ControlSignals.STATE = { RED: 0, GREEN: 1 };
// Set up properties using the CoffeeScript-style property decorator
ControlSignals.property('flipInterval', {
    get: function () {
        return (0.1 + 0.05 * this.flipMultiplier) * settings.lightsFlipInterval;
    }
});
ControlSignals.property('state', {
    get: function () {
        let stringState = this.states[this.stateNum % this.states.length];
        // For 2-way or T-intersections, always allow all movements
        if (this.intersection.roads && this.intersection.roads.length <= 2) {
            stringState = ['LFR', 'LFR', 'LFR', 'LFR'];
        }
        // Convert string patterns to numeric state arrays
        return stringState.map(x => this._decode(x));
    }
});
module.exports = ControlSignals;


/***/ }),

/***/ "./src/model/intersection.ts":
/*!***********************************!*\
  !*** ./src/model/intersection.ts ***!
  \***********************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


__webpack_require__(/*! ../helpers */ "./src/helpers.ts");
const _ = __webpack_require__(/*! underscore */ "./node_modules/underscore/modules/index-all.js");
const Rect = __webpack_require__(/*! ../geom/rect */ "./src/geom/rect.ts");
const TrafficLightController = __webpack_require__(/*! ./traffic-control/TrafficLightController */ "./src/model/traffic-control/TrafficLightController.ts");
const ControlSignals = __webpack_require__(/*! ./control-signals */ "./src/model/control-signals.ts"); // Keep for backward compatibility
class Intersection {
    // For backward compatibility
    get controlSignals() {
        console.warn('Deprecated: controlSignals is deprecated. Use trafficLightController instead.');
        return this._legacyControlSignals;
    }
    set controlSignals(value) {
        console.warn('Deprecated: Setting controlSignals is deprecated. Use trafficLightController instead.');
        this._legacyControlSignals = value;
    }
    constructor(rect) {
        this.rect = rect;
        this.id = _.uniqueId('intersection');
        this.roads = [];
        this.inRoads = [];
        // Initialize the traffic light controller
        this.trafficLightController = new TrafficLightController(this);
        // Initialize legacy control signals for backward compatibility
        this._legacyControlSignals = new ControlSignals(this);
    }
    static copy(intersection) {
        intersection.rect = Rect.copy(intersection.rect);
        const result = Object.create(Intersection.prototype);
        _.extend(result, intersection);
        result.roads = [];
        result.inRoads = [];
        // Initialize the traffic light controller with the intersection
        if (intersection.trafficLightController) {
            result.trafficLightController = TrafficLightController.copy(intersection.trafficLightController, result);
        }
        else {
            result.trafficLightController = new TrafficLightController(result);
        }
        // For backward compatibility
        if (intersection.controlSignals) {
            result._legacyControlSignals = ControlSignals.copy(intersection.controlSignals, result);
        }
        else {
            result._legacyControlSignals = new ControlSignals(result);
        }
        return result;
    }
    toJSON() {
        return {
            id: this.id,
            rect: this.rect,
            trafficLightController: this.trafficLightController,
            // Include controlSignals for backward compatibility
            controlSignals: this._legacyControlSignals
        };
    }
    update() {
        // Update connected roads
        for (const road of this.roads) {
            road.update();
        }
        for (const road of this.inRoads) {
            road.update();
        }
    }
    /**
     * Process a simulation tick
     * @param delta Time elapsed since last tick in seconds
     */
    onTick(delta) {
        // Delegate to the traffic light controller
        if (this.trafficLightController) {
            this.trafficLightController.onTick(delta);
        }
        // For backward compatibility
        if (this._legacyControlSignals && this._legacyControlSignals.onTick) {
            this._legacyControlSignals.onTick(delta);
        }
    }
    /**
     * Get the current traffic signal state
     * @returns A 2D array where [approach][movement] represents the signal state
     *          (0 = RED, 1 = GREEN) for each approach (N,E,S,W) and movement (L,F,R)
     */
    getSignalState() {
        // Get state from the traffic light controller
        if (this.trafficLightController) {
            return this.trafficLightController.state;
        }
        // Fallback to legacy control signals for backward compatibility
        if (this._legacyControlSignals) {
            return this._legacyControlSignals.state;
        }
        // Default to all red if no controller is available
        return [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]];
    }
    /**
     * Set the traffic control strategy
     * @param strategyType The type of strategy to use
     * @returns True if the strategy was successfully applied, false otherwise
     */
    setTrafficControlStrategy(strategyType) {
        if (this.trafficLightController) {
            return this.trafficLightController.setStrategy(strategyType);
        }
        return false;
    }
}
module.exports = Intersection;


/***/ }),

/***/ "./src/model/kpi-collector.ts":
/*!************************************!*\
  !*** ./src/model/kpi-collector.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, exports) => {


/**
 * KPICollector - Collects and aggregates Key Performance Indicators for the traffic simulation
 *
 * This class is responsible for:
 * - Recording events from vehicles, lanes, and intersections
 * - Calculating metrics based on these events
 * - Providing an API for the UI to display these metrics
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.kpiCollector = exports.KPICollector = exports.VehicleEvent = void 0;
var VehicleEvent;
(function (VehicleEvent) {
    VehicleEvent["ENTER_SIMULATION"] = "enter_simulation";
    VehicleEvent["EXIT_SIMULATION"] = "exit_simulation";
    VehicleEvent["ENTER_INTERSECTION"] = "enter_intersection";
    VehicleEvent["EXIT_INTERSECTION"] = "exit_intersection";
    VehicleEvent["START_MOVING"] = "start_moving";
    VehicleEvent["STOP_MOVING"] = "stop_moving";
    VehicleEvent["CHANGE_LANE"] = "change_lane";
    VehicleEvent["SPEED_CHANGE"] = "speed_change";
    VehicleEvent["ENTER_LANE"] = "enter_lane";
    VehicleEvent["EXIT_LANE"] = "exit_lane";
})(VehicleEvent = exports.VehicleEvent || (exports.VehicleEvent = {}));
class KPICollector {
    constructor() {
        // Store metrics
        this.vehicleMetrics = [];
        this.intersectionMetrics = [];
        this.laneMetrics = [];
        this.activeVehicles = new Set();
        this.stoppedVehicles = new Set();
        this.stoppedTimestamps = {};
        this.completedTrips = 0;
        this.simulationStartTime = 0;
        // Summary metrics (calculated on demand)
        this.totalSpeed = 0;
        this.speedMeasurements = 0;
        this.waitTimes = [];
        // Lane tracking
        this.vehiclesInLane = {}; // laneId -> Set of vehicleIds
        this.laneEntryTimes = {}; // vehicleId -> {laneId -> entryTime}
        this.laneThroughput = {}; // laneId -> count
        this.laneWaitTimes = {}; // laneId -> waitTimes array
        this.laneTotalSpeeds = {}; // laneId -> {total, count}
        // Intersection tracking
        this.intersectionEntryTimes = {}; // vehicleId -> {intersectionId -> entryTime}
        this.intersectionThroughput = {}; // intersectionId -> count
        this.intersectionWaitTimes = {}; // intersectionId -> waitTimes array
        this.intersectionQueueHistory = {}; // intersectionId -> queueLengths array
        // Settings
        this.sampleInterval = 0.5; // How often to sample speed (in simulation seconds)
        this.lastSampleTime = 0;
        this.isRecording = false;
        this.cleanupTimeout = null;
        this.reset();
    }
    /**
     * Start collecting metrics
     */
    startRecording(initialTime = 0) {
        this.isRecording = true;
        this.simulationStartTime = initialTime;
        this.lastSampleTime = initialTime;
        console.log('🔄 KPI Collector: Started recording metrics');
    }
    /**
     * Stop collecting metrics
     */
    stopRecording() {
        this.isRecording = false;
        console.log('🛑 KPI Collector: Stopped recording metrics');
    }
    /**
     * Reset all collected metrics
     */
    reset() {
        this.vehicleMetrics = [];
        this.intersectionMetrics = [];
        this.laneMetrics = [];
        this.activeVehicles = new Set();
        this.stoppedVehicles = new Set();
        this.stoppedTimestamps = {};
        this.completedTrips = 0;
        this.simulationStartTime = 0;
        this.totalSpeed = 0;
        this.speedMeasurements = 0;
        this.waitTimes = [];
        this.isRecording = false;
        // Reset lane tracking
        this.vehiclesInLane = {};
        this.laneEntryTimes = {};
        this.laneThroughput = {};
        this.laneWaitTimes = {};
        this.laneTotalSpeeds = {};
        // Reset intersection tracking
        this.intersectionEntryTimes = {};
        this.intersectionThroughput = {};
        this.intersectionWaitTimes = {};
        this.intersectionQueueHistory = {};
        if (this.cleanupTimeout !== null) {
            clearTimeout(this.cleanupTimeout);
            this.cleanupTimeout = null;
        }
        console.log('🗑️ KPI Collector: Metrics reset');
    }
    /**
     * Record vehicle entering the simulation
     */
    recordVehicleEnter(vehicle, time) {
        if (!this.isRecording)
            return;
        this.activeVehicles.add(vehicle.id);
        this.vehicleMetrics.push({
            vehicleId: vehicle.id,
            timestamp: time,
            speed: vehicle.speed,
            event: VehicleEvent.ENTER_SIMULATION
        });
    }
    /**
     * Record vehicle exiting the simulation
     */
    recordVehicleExit(vehicle, time) {
        if (!this.isRecording)
            return;
        this.activeVehicles.delete(vehicle.id);
        this.completedTrips++;
        // If vehicle was stopped, clear that state
        if (this.stoppedVehicles.has(vehicle.id)) {
            this.stoppedVehicles.delete(vehicle.id);
            delete this.stoppedTimestamps[vehicle.id];
        }
        this.vehicleMetrics.push({
            vehicleId: vehicle.id,
            timestamp: time,
            speed: vehicle.speed,
            event: VehicleEvent.EXIT_SIMULATION
        });
    }
    /**
     * Record vehicle stopping (speed ~= 0)
     */
    recordVehicleStop(vehicle, time) {
        if (!this.isRecording)
            return;
        // Only record if vehicle wasn't already stopped
        if (!this.stoppedVehicles.has(vehicle.id)) {
            this.stoppedVehicles.add(vehicle.id);
            this.stoppedTimestamps[vehicle.id] = time;
            this.vehicleMetrics.push({
                vehicleId: vehicle.id,
                timestamp: time,
                speed: vehicle.speed,
                position: vehicle.coords,
                event: VehicleEvent.STOP_MOVING
            });
        }
    }
    /**
     * Record vehicle starting to move again
     */
    recordVehicleStart(vehicle, time) {
        if (!this.isRecording)
            return;
        // Only record if vehicle was stopped
        if (this.stoppedVehicles.has(vehicle.id)) {
            const stoppedTime = time - this.stoppedTimestamps[vehicle.id];
            this.stoppedVehicles.delete(vehicle.id);
            delete this.stoppedTimestamps[vehicle.id];
            // Record wait time for analytics
            this.waitTimes.push(stoppedTime);
            this.vehicleMetrics.push({
                vehicleId: vehicle.id,
                timestamp: time,
                speed: vehicle.speed,
                duration: stoppedTime,
                event: VehicleEvent.START_MOVING
            });
        }
    }
    /**
     * Record vehicle changing lanes
     */
    recordLaneChange(vehicle, time) {
        if (!this.isRecording)
            return;
        this.vehicleMetrics.push({
            vehicleId: vehicle.id,
            timestamp: time,
            speed: vehicle.speed,
            event: VehicleEvent.CHANGE_LANE
        });
    }
    /**
     * Record vehicle entering an intersection
     */
    recordIntersectionEnter(vehicle, intersection, time) {
        if (!this.isRecording)
            return;
        const intersectionId = intersection.id;
        // Initialize intersection tracking structures if needed
        if (!this.intersectionEntryTimes[vehicle.id]) {
            this.intersectionEntryTimes[vehicle.id] = {};
        }
        if (!this.intersectionQueueHistory[intersectionId]) {
            this.intersectionQueueHistory[intersectionId] = [];
        }
        // Record entry time for calculating wait time later
        this.intersectionEntryTimes[vehicle.id][intersectionId] = time;
        // Record the vehicle event
        this.vehicleMetrics.push({
            vehicleId: vehicle.id,
            timestamp: time,
            speed: vehicle.speed,
            intersectionId: intersectionId,
            event: VehicleEvent.ENTER_INTERSECTION
        });
        // Update intersection metrics
        const queueLength = this.getVehiclesAtIntersection(intersectionId).length;
        // Store queue length history
        this.intersectionQueueHistory[intersectionId].push(queueLength);
        // Record updated intersection metrics
        this.intersectionMetrics.push({
            intersectionId: intersectionId,
            timestamp: time,
            queueLength: queueLength
        });
    }
    /**
     * Record vehicle exiting an intersection
     */
    recordIntersectionExit(vehicle, intersection, time) {
        if (!this.isRecording)
            return;
        const intersectionId = intersection.id;
        // Initialize tracking if needed
        if (!this.intersectionEntryTimes[vehicle.id]) {
            this.intersectionEntryTimes[vehicle.id] = {};
        }
        if (!this.intersectionThroughput[intersectionId]) {
            this.intersectionThroughput[intersectionId] = 0;
        }
        if (!this.intersectionWaitTimes[intersectionId]) {
            this.intersectionWaitTimes[intersectionId] = [];
        }
        // Calculate wait time for the vehicle at this intersection
        if (this.intersectionEntryTimes[vehicle.id][intersectionId]) {
            const waitTime = time - this.intersectionEntryTimes[vehicle.id][intersectionId];
            this.intersectionWaitTimes[intersectionId].push(waitTime);
            delete this.intersectionEntryTimes[vehicle.id][intersectionId];
        }
        // Increment throughput counter
        this.intersectionThroughput[intersectionId]++;
        // Record the vehicle event
        this.vehicleMetrics.push({
            vehicleId: vehicle.id,
            timestamp: time,
            speed: vehicle.speed,
            intersectionId: intersectionId,
            event: VehicleEvent.EXIT_INTERSECTION
        });
        // Update intersection metrics
        const queueLength = this.getVehiclesAtIntersection(intersectionId).length;
        // Update queue length history
        if (!this.intersectionQueueHistory[intersectionId]) {
            this.intersectionQueueHistory[intersectionId] = [];
        }
        this.intersectionQueueHistory[intersectionId].push(queueLength);
        // Record updated intersection metrics
        this.intersectionMetrics.push({
            intersectionId: intersectionId,
            timestamp: time,
            queueLength: queueLength,
            // Calculate throughput as vehicles per minute (based on simulation time)
            throughput: this.calculateIntersectionThroughput(intersectionId, time)
        });
    }
    /**
     * Calculate vehicles per minute throughput for an intersection
     */
    calculateIntersectionThroughput(intersectionId, currentTime) {
        const throughput = this.intersectionThroughput[intersectionId] || 0;
        const elapsedMinutes = Math.max(0.001, (currentTime - this.simulationStartTime) / 60);
        return throughput / elapsedMinutes; // Vehicles per minute
    }
    /**
     * Record a vehicle entering a lane
     */
    recordLaneEnter(vehicle, lane, time) {
        if (!this.isRecording)
            return;
        const laneId = lane.id;
        // Initialize lane tracking structures if needed
        if (!this.vehiclesInLane[laneId]) {
            this.vehiclesInLane[laneId] = new Set();
        }
        if (!this.laneEntryTimes[vehicle.id]) {
            this.laneEntryTimes[vehicle.id] = {};
        }
        if (!this.laneWaitTimes[laneId]) {
            this.laneWaitTimes[laneId] = [];
        }
        if (!this.laneTotalSpeeds[laneId]) {
            this.laneTotalSpeeds[laneId] = { total: 0, count: 0 };
        }
        // Record entry time for calculating wait time later
        this.laneEntryTimes[vehicle.id][laneId] = time;
        // Add vehicle to the lane
        this.vehiclesInLane[laneId].add(vehicle.id);
        // Update lane metrics
        this.laneMetrics.push({
            laneId: laneId,
            timestamp: time,
            vehicleCount: this.vehiclesInLane[laneId].size,
            averageSpeed: this.calculateLaneAverageSpeed(laneId),
            congestionRate: this.calculateLaneCongestion(lane, this.vehiclesInLane[laneId].size)
        });
        // Record the event
        this.vehicleMetrics.push({
            vehicleId: vehicle.id,
            timestamp: time,
            speed: vehicle.speed,
            laneId: laneId,
            event: VehicleEvent.ENTER_LANE
        });
    }
    /**
     * Record a vehicle exiting a lane
     */
    recordLaneExit(vehicle, lane, time) {
        var _a, _b;
        if (!this.isRecording)
            return;
        const laneId = lane.id;
        // Make sure we have tracking data structures
        if (!this.vehiclesInLane[laneId]) {
            this.vehiclesInLane[laneId] = new Set();
        }
        if (!this.laneEntryTimes[vehicle.id]) {
            this.laneEntryTimes[vehicle.id] = {};
        }
        if (!this.laneThroughput[laneId]) {
            this.laneThroughput[laneId] = 0;
        }
        if (!this.laneWaitTimes[laneId]) {
            this.laneWaitTimes[laneId] = [];
        }
        // Calculate time spent in lane
        if (this.laneEntryTimes[vehicle.id][laneId]) {
            const timeInLane = time - this.laneEntryTimes[vehicle.id][laneId];
            this.laneWaitTimes[laneId].push(timeInLane);
            delete this.laneEntryTimes[vehicle.id][laneId];
        }
        // Remove vehicle from lane
        if (this.vehiclesInLane[laneId]) {
            this.vehiclesInLane[laneId].delete(vehicle.id);
        }
        // Increment throughput count
        this.laneThroughput[laneId] = (this.laneThroughput[laneId] || 0) + 1;
        // Update lane metrics
        this.laneMetrics.push({
            laneId: laneId,
            timestamp: time,
            vehicleCount: ((_a = this.vehiclesInLane[laneId]) === null || _a === void 0 ? void 0 : _a.size) || 0,
            averageSpeed: this.calculateLaneAverageSpeed(laneId),
            congestionRate: this.calculateLaneCongestion(lane, ((_b = this.vehiclesInLane[laneId]) === null || _b === void 0 ? void 0 : _b.size) || 0)
        });
        // Record the event
        this.vehicleMetrics.push({
            vehicleId: vehicle.id,
            timestamp: time,
            speed: vehicle.speed,
            laneId: laneId,
            event: VehicleEvent.EXIT_LANE
        });
    }
    /**
     * Calculate average speed for a specific lane
     */
    calculateLaneAverageSpeed(laneId) {
        const laneSpeedData = this.laneTotalSpeeds[laneId];
        if (!laneSpeedData || laneSpeedData.count === 0) {
            return 0;
        }
        return laneSpeedData.total / laneSpeedData.count;
    }
    /**
     * Calculate congestion rate for a lane (0-1)
     * Uses vehicle count compared to lane capacity
     */
    calculateLaneCongestion(lane, vehicleCount) {
        // Lane capacity is a reasonable estimate based on lane length and minimum safe distance
        // This is an approximation - actual capacity would depend on lane properties
        const approximateCapacity = lane.length / 10; // Assuming average vehicle + safe distance is ~10 units
        return Math.min(1, vehicleCount / approximateCapacity);
    }
    /**
     * Sample the current state of a specific lane
     */
    sampleLaneState(lane, time) {
        if (!this.isRecording)
            return;
        const laneId = lane.id;
        if (!this.vehiclesInLane[laneId]) {
            this.vehiclesInLane[laneId] = new Set();
        }
        // Count vehicles in the lane
        const vehicleCount = this.vehiclesInLane[laneId].size;
        // Calculate congestion rate
        const congestionRate = this.calculateLaneCongestion(lane, vehicleCount);
        // Collect speeds of vehicles in the lane to calculate average speed
        let totalSpeed = 0;
        let count = 0;
        // This would require a mapping of which vehicles are in which lane
        // We'll update this in the recordLaneEnter/Exit methods
        // Add this to our lane metrics
        this.laneMetrics.push({
            laneId: laneId,
            timestamp: time,
            vehicleCount: vehicleCount,
            averageSpeed: this.calculateLaneAverageSpeed(laneId),
            congestionRate: congestionRate,
            queueLength: this.calculateLaneQueueLength(laneId)
        });
    }
    /**
     * Calculate queue length in a lane based on stopped vehicles
     */
    calculateLaneQueueLength(laneId) {
        // Count stopped vehicles in the lane
        let queueCount = 0;
        if (this.vehiclesInLane[laneId]) {
            this.vehiclesInLane[laneId].forEach(vehicleId => {
                if (this.stoppedVehicles.has(vehicleId)) {
                    queueCount++;
                }
            });
        }
        return queueCount;
    }
    /**
     * Update lane speed metrics when a vehicle's speed changes
     */
    updateLaneSpeedMetrics(vehicle, laneId, speed) {
        if (!this.isRecording || !laneId)
            return;
        // Initialize if needed
        if (!this.laneTotalSpeeds[laneId]) {
            this.laneTotalSpeeds[laneId] = { total: 0, count: 0 };
        }
        // Update speed metrics for the lane
        this.laneTotalSpeeds[laneId].total += speed;
        this.laneTotalSpeeds[laneId].count++;
    }
    /**
     * Sample the current speeds of all vehicles
     * Called periodically to track overall speed metrics
     */
    sampleSpeeds(vehicles, time) {
        if (!this.isRecording)
            return;
        // Only sample at specific intervals to avoid too much data
        if (time - this.lastSampleTime < this.sampleInterval) {
            return;
        }
        this.lastSampleTime = time;
        // Calculate average speed from all vehicles
        let totalSpeed = 0;
        let count = 0;
        for (const id in vehicles) {
            const vehicle = vehicles[id];
            totalSpeed += vehicle.speed;
            count++;
            // Record significant speed changes individually
            // We could implement this based on threshold if needed
        }
        if (count > 0) {
            this.totalSpeed += totalSpeed;
            this.speedMeasurements += count;
        }
    }
    /**
     * Get currently active vehicles at a specific intersection
     */
    getVehiclesAtIntersection(intersectionId) {
        // This is a simple implementation - in a real system we'd track this more efficiently
        return this.vehicleMetrics.filter(m => m.event === VehicleEvent.ENTER_INTERSECTION &&
            // Check if there's no corresponding exit event yet
            !this.vehicleMetrics.some(exit => exit.vehicleId === m.vehicleId &&
                exit.event === VehicleEvent.EXIT_INTERSECTION &&
                exit.timestamp > m.timestamp));
    }
    /**
     * Get the aggregated metrics for display or export
     */
    getMetrics(currentTime = 0) {
        // Calculate average speed - give more importance to recent measurements
        const avgSpeed = this.speedMeasurements > 0
            ? this.totalSpeed / this.speedMeasurements
            : 0;
        // Calculate wait times
        const avgWaitTime = this.waitTimes.length > 0
            ? this.waitTimes.reduce((a, b) => a + b, 0) / this.waitTimes.length
            : 0;
        const maxWaitTime = this.waitTimes.length > 0
            ? Math.max(...this.waitTimes)
            : 0;
        // Count total stops (unique stop events)
        const totalStops = this.vehicleMetrics.filter(m => m.event === VehicleEvent.STOP_MOVING).length;
        // Calculate intersection utilization
        // Group metrics by intersection ID manually
        const intersectionMetricsByID = {};
        // Group metrics by intersection ID
        this.intersectionMetrics.forEach(metric => {
            const id = metric.intersectionId;
            if (!intersectionMetricsByID[id]) {
                intersectionMetricsByID[id] = [];
            }
            intersectionMetricsByID[id].push(metric);
        });
        const intersectionUtilization = {};
        // Calculate average queue length for each intersection
        Object.entries(intersectionMetricsByID).forEach(([id, metrics]) => {
            let totalQueueLength = 0;
            metrics.forEach(metric => {
                totalQueueLength += metric.queueLength;
            });
            const avgQueueLength = metrics.length > 0 ? totalQueueLength / metrics.length : 0;
            intersectionUtilization[id] = avgQueueLength;
        });
        // Calculate road utilization based on vehicle positions
        // This is an approximation based on event frequency on roads
        const roadUtilization = {};
        // Get true total vehicle count (all unique vehicles that entered)
        const totalVehicleIDs = new Set(this.vehicleMetrics
            .filter(m => m.event === VehicleEvent.ENTER_SIMULATION)
            .map(m => m.vehicleId));
        return {
            totalVehicles: totalVehicleIDs.size,
            activeVehicles: this.activeVehicles.size,
            completedTrips: this.completedTrips,
            averageSpeed: avgSpeed,
            averageWaitTime: avgWaitTime,
            maxWaitTime: maxWaitTime,
            totalStops: totalStops,
            stoppedVehicles: this.stoppedVehicles.size,
            intersectionUtilization,
            roadUtilization,
            simulationTime: currentTime - this.simulationStartTime,
            // New expanded metrics
            laneMetrics: this.calculateLaneMetrics(),
            intersectionMetrics: this.calculateIntersectionMetrics(),
            globalThroughput: this.calculateGlobalThroughput(),
            congestionIndex: this.calculateCongestionIndex()
        };
    }
    /**
     * Calculate detailed lane metrics
     */
    calculateLaneMetrics() {
        const laneMetrics = {};
        // Calculate metrics for each vehicle
        this.vehicleMetrics.forEach(metric => {
            if (metric.event === VehicleEvent.ENTER_LANE || metric.event === VehicleEvent.EXIT_LANE) {
                const laneId = metric.laneId || '';
                if (!laneMetrics[laneId]) {
                    laneMetrics[laneId] = {
                        laneId: laneId,
                        averageSpeed: 0,
                        vehicleCount: 0,
                        maxVehicleCount: 0,
                        averageVehicleCount: 0,
                        congestionRate: 0,
                        throughput: 0,
                        totalVehiclesPassed: 0,
                        averageWaitTime: 0,
                        queueLength: 0
                    };
                }
                const laneMetric = laneMetrics[laneId];
                // Update counts
                laneMetric.vehicleCount++;
                laneMetric.totalVehiclesPassed++;
                // Update speeds
                laneMetric.averageSpeed += metric.speed;
                // Update queue length (simple approximation)
                if (metric.event === VehicleEvent.ENTER_LANE) {
                    laneMetric.queueLength++;
                }
                else if (metric.event === VehicleEvent.EXIT_LANE) {
                    laneMetric.queueLength = Math.max(0, laneMetric.queueLength - 1);
                }
            }
        });
        // Finalize metrics calculation
        for (const laneId in laneMetrics) {
            const metric = laneMetrics[laneId];
            metric.averageSpeed /= metric.vehicleCount || 1;
            metric.congestionRate = Math.min(1, metric.queueLength / 10); // Assume max 10 vehicles before congestion
            metric.throughput = metric.totalVehiclesPassed / (this.simulationStartTime + 1); // Per minute
        }
        return laneMetrics;
    }
    /**
     * Calculate detailed intersection metrics
     */
    calculateIntersectionMetrics() {
        const intersectionMetrics = {};
        // Calculate metrics for each vehicle
        this.vehicleMetrics.forEach(metric => {
            if (metric.event === VehicleEvent.ENTER_INTERSECTION || metric.event === VehicleEvent.EXIT_INTERSECTION) {
                const intersectionId = metric.intersectionId || '';
                if (!intersectionMetrics[intersectionId]) {
                    intersectionMetrics[intersectionId] = {
                        intersectionId: intersectionId,
                        throughput: 0,
                        averageWaitTime: 0,
                        maxWaitTime: 0,
                        averageQueueLength: 0,
                        maxQueueLength: 0,
                        totalVehiclesPassed: 0,
                        congestionRate: 0
                    };
                }
                const intersectionMetric = intersectionMetrics[intersectionId];
                // Update counts
                intersectionMetric.totalVehiclesPassed++;
                // Update queue length (simple approximation)
                if (metric.event === VehicleEvent.ENTER_INTERSECTION) {
                    intersectionMetric.averageQueueLength++;
                }
                else if (metric.event === VehicleEvent.EXIT_INTERSECTION) {
                    intersectionMetric.averageQueueLength = Math.max(0, intersectionMetric.averageQueueLength - 1);
                }
            }
        });
        // Finalize metrics calculation
        for (const intersectionId in intersectionMetrics) {
            const metric = intersectionMetrics[intersectionId];
            metric.throughput = metric.totalVehiclesPassed / (this.simulationStartTime + 1); // Per minute
            metric.congestionRate = Math.min(1, metric.averageQueueLength / 10); // Assume max 10 vehicles before congestion
        }
        return intersectionMetrics;
    }
    /**
     * Calculate global throughput (vehicles per minute)
     */
    calculateGlobalThroughput() {
        return this.vehicleMetrics.length / (this.simulationStartTime + 1);
    }
    /**
     * Calculate congestion index (0-1)
     */
    calculateCongestionIndex() {
        // Simple index based on average queue length across all intersections and lanes
        const totalQueueLength = Object.values(this.calculateLaneMetrics()).reduce((sum, metric) => sum + metric.queueLength, 0) +
            Object.values(this.calculateIntersectionMetrics()).reduce((sum, metric) => sum + metric.averageQueueLength, 0);
        const maxPossibleQueueLength = (Object.keys(this.calculateLaneMetrics()).length + Object.keys(this.calculateIntersectionMetrics()).length) * 10; // Assume max 10 vehicles before congestion per lane/intersection
        return Math.min(1, totalQueueLength / maxPossibleQueueLength);
    }
    /**
     * Export metrics as CSV format
     */
    exportMetricsCSV() {
        const metrics = this.getMetrics();
        let csv = 'Metric,Value\n';
        // Global metrics
        csv += '# Global Simulation Metrics\n';
        csv += `Total Vehicles,${metrics.totalVehicles}\n`;
        csv += `Active Vehicles,${metrics.activeVehicles}\n`;
        csv += `Completed Trips,${metrics.completedTrips}\n`;
        csv += `Average Speed (m/s),${metrics.averageSpeed.toFixed(2)}\n`;
        csv += `Average Wait Time (s),${metrics.averageWaitTime.toFixed(2)}\n`;
        csv += `Max Wait Time (s),${metrics.maxWaitTime.toFixed(2)}\n`;
        csv += `Total Stops,${metrics.totalStops}\n`;
        csv += `Stopped Vehicles,${metrics.stoppedVehicles}\n`;
        csv += `Global Throughput (vehicles/min),${metrics.globalThroughput.toFixed(2)}\n`;
        csv += `Global Congestion Index,${metrics.congestionIndex.toFixed(2)}\n`;
        csv += `Simulation Time (s),${metrics.simulationTime.toFixed(2)}\n\n`;
        // Lane metrics
        csv += '# Lane Metrics\n';
        csv += 'Lane ID,Average Speed,Vehicle Count,Max Vehicle Count,Average Vehicle Count,Congestion Rate,Throughput,Total Vehicles Passed,Average Wait Time,Queue Length\n';
        Object.values(metrics.laneMetrics).forEach(lane => {
            csv += `${lane.laneId},${lane.averageSpeed.toFixed(2)},${lane.vehicleCount},${lane.maxVehicleCount},`;
            csv += `${lane.averageVehicleCount.toFixed(2)},${lane.congestionRate.toFixed(2)},${lane.throughput.toFixed(2)},`;
            csv += `${lane.totalVehiclesPassed},${lane.averageWaitTime.toFixed(2)},${lane.queueLength}\n`;
        });
        csv += '\n# Intersection Metrics\n';
        csv += 'Intersection ID,Throughput,Average Wait Time,Max Wait Time,Average Queue Length,Max Queue Length,Total Vehicles Passed,Congestion Rate\n';
        Object.values(metrics.intersectionMetrics).forEach(intersection => {
            csv += `${intersection.intersectionId},${intersection.throughput.toFixed(2)},${intersection.averageWaitTime.toFixed(2)},`;
            csv += `${intersection.maxWaitTime.toFixed(2)},${intersection.averageQueueLength.toFixed(2)},${intersection.maxQueueLength},`;
            csv += `${intersection.totalVehiclesPassed},${intersection.congestionRate.toFixed(2)}\n`;
        });
        return csv;
    }
    /**
     * Helper to download metrics as a CSV file
     */
    downloadMetricsCSV() {
        const csv = this.exportMetricsCSV();
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `traffic-metrics-${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    /**
     * Record a significant speed change
     */
    recordSpeedChange(vehicle, time, oldSpeed, newSpeed) {
        if (!this.isRecording)
            return;
        this.vehicleMetrics.push({
            vehicleId: vehicle.id,
            timestamp: time,
            speed: newSpeed,
            oldSpeed: oldSpeed,
            event: VehicleEvent.SPEED_CHANGE
        });
    }
    /**
     * Test function to validate KPI collection accuracy
     * Logs detailed event counts and metrics to validate collection is working properly
     * Returns HTML formatted validation report for UI display
     */
    validateMetrics() {
        // Count events by type
        const eventCounts = {};
        for (const metric of this.vehicleMetrics) {
            eventCounts[metric.event] = (eventCounts[metric.event] || 0) + 1;
        }
        // Get all unique vehicle IDs
        const uniqueVehicleIds = new Set(this.vehicleMetrics.map(m => m.vehicleId));
        // Calculate metrics
        const metrics = this.getMetrics();
        // Print validation report to console
        console.log('=== KPI Collection Validation Report ===');
        console.log('Event counts:', eventCounts);
        console.log('Unique vehicles tracked:', uniqueVehicleIds.size);
        console.log('Active vehicles:', this.activeVehicles.size);
        console.log('Completed trips:', this.completedTrips);
        console.log('Total vehicles processed:', metrics.totalVehicles);
        // Verify data integrity
        const vehiclesWithEntry = new Set(this.vehicleMetrics
            .filter(m => m.event === VehicleEvent.ENTER_SIMULATION)
            .map(m => m.vehicleId));
        const vehiclesWithExit = new Set(this.vehicleMetrics
            .filter(m => m.event === VehicleEvent.EXIT_SIMULATION)
            .map(m => m.vehicleId));
        // Check for vehicles that have exit events but no entry events
        const vehiclesWithExitButNoEntry = [...vehiclesWithExit].filter(id => !vehiclesWithEntry.has(id));
        // Check for vehicles that have speed changes but no entry events
        const vehiclesWithSpeedChangeButNoEntry = new Set(this.vehicleMetrics
            .filter(m => m.event === VehicleEvent.SPEED_CHANGE && !vehiclesWithEntry.has(m.vehicleId))
            .map(m => m.vehicleId));
        // Check for intersection entries without exits
        const vehiclesInIntersectionWithoutExit = new Set();
        this.vehicleMetrics.forEach(m => {
            if (m.event === VehicleEvent.ENTER_INTERSECTION) {
                // Check if there's a matching exit event after this
                const hasExit = this.vehicleMetrics.some(exit => exit.vehicleId === m.vehicleId &&
                    exit.event === VehicleEvent.EXIT_INTERSECTION &&
                    exit.timestamp > m.timestamp);
                if (!hasExit && this.activeVehicles.has(m.vehicleId)) {
                    vehiclesInIntersectionWithoutExit.add(m.vehicleId);
                }
            }
        });
        // Check for lane entries without exits
        const vehiclesInLaneWithoutExit = new Set();
        this.vehicleMetrics.forEach(m => {
            if (m.event === VehicleEvent.ENTER_LANE) {
                // Check if there's a matching exit event after this
                const hasExit = this.vehicleMetrics.some(exit => exit.vehicleId === m.vehicleId &&
                    exit.event === VehicleEvent.EXIT_LANE &&
                    exit.laneId === m.laneId &&
                    exit.timestamp > m.timestamp);
                if (!hasExit && this.activeVehicles.has(m.vehicleId)) {
                    vehiclesInLaneWithoutExit.add(m.vehicleId);
                }
            }
        });
        // Check for stop events without subsequent start events
        const stoppedWithoutStart = new Set();
        this.vehicleMetrics.forEach(m => {
            if (m.event === VehicleEvent.STOP_MOVING) {
                // Check if there's a matching start event after this
                const hasStart = this.vehicleMetrics.some(start => start.vehicleId === m.vehicleId &&
                    start.event === VehicleEvent.START_MOVING &&
                    start.timestamp > m.timestamp);
                if (!hasStart && this.activeVehicles.has(m.vehicleId)) {
                    stoppedWithoutStart.add(m.vehicleId);
                }
            }
        });
        // Check for average speed calculation accuracy
        const calculatedAvgSpeed = this.speedMeasurements > 0
            ? this.totalSpeed / this.speedMeasurements
            : 0;
        // Recalculate by direct measurement to validate
        const allSpeeds = this.vehicleMetrics.map(m => m.speed);
        const directAvgSpeed = allSpeeds.length > 0
            ? allSpeeds.reduce((a, b) => a + b, 0) / allSpeeds.length
            : 0;
        // Validate lane metrics consistency
        const laneEntryEvents = this.vehicleMetrics.filter(m => m.event === VehicleEvent.ENTER_LANE);
        const laneExitEvents = this.vehicleMetrics.filter(m => m.event === VehicleEvent.EXIT_LANE);
        const lanesToValidate = Object.keys(metrics.laneMetrics);
        const laneMetricsValidation = {};
        lanesToValidate.forEach(laneId => {
            const entries = laneEntryEvents.filter(m => m.laneId === laneId).length;
            const exits = laneExitEvents.filter(m => m.laneId === laneId).length;
            laneMetricsValidation[laneId] = {
                entries,
                exits,
                balance: entries - exits
            };
        });
        // Validate intersection metrics consistency
        const intersectionEntryEvents = this.vehicleMetrics.filter(m => m.event === VehicleEvent.ENTER_INTERSECTION);
        const intersectionExitEvents = this.vehicleMetrics.filter(m => m.event === VehicleEvent.EXIT_INTERSECTION);
        const intersectionsToValidate = Object.keys(metrics.intersectionMetrics);
        const intersectionMetricsValidation = {};
        intersectionsToValidate.forEach(intersectionId => {
            const entries = intersectionEntryEvents.filter(m => m.intersectionId === intersectionId).length;
            const exits = intersectionExitEvents.filter(m => m.intersectionId === intersectionId).length;
            intersectionMetricsValidation[intersectionId] = {
                entries,
                exits,
                balance: entries - exits
            };
        });
        // Log integrity issues
        console.log('=== Data Integrity Checks ===');
        console.log('Vehicles with exit but no entry:', vehiclesWithExitButNoEntry.length);
        console.log('Vehicles with speed changes but no entry:', vehiclesWithSpeedChangeButNoEntry.size);
        console.log('Vehicles currently in intersection:', vehiclesInIntersectionWithoutExit.size);
        console.log('Vehicles in lane without exit:', vehiclesInLaneWithoutExit.size);
        console.log('Vehicles stopped without restart:', stoppedWithoutStart.size);
        console.log('Calculated avg speed:', calculatedAvgSpeed);
        console.log('Direct measurement avg speed:', directAvgSpeed);
        console.log('Speed measurement count:', this.speedMeasurements);
        console.log('Lane metrics validation:', laneMetricsValidation);
        console.log('Intersection metrics validation:', intersectionMetricsValidation);
        console.log('Total event records:', this.vehicleMetrics.length);
        console.log('==============================');
        // Create HTML report for UI display
        let html = '<div class="kpi-validation">';
        html += '<h3>KPI Collection Validation Report</h3>';
        html += '<table class="validation-table">';
        html += '<tr><th colspan="2">Event Counts</th></tr>';
        for (const [event, count] of Object.entries(eventCounts)) {
            html += `<tr><td>${event}</td><td>${count}</td></tr>`;
        }
        html += '<tr><th colspan="2">Vehicle Statistics</th></tr>';
        html += `<tr><td>Unique vehicles tracked</td><td>${uniqueVehicleIds.size}</td></tr>`;
        html += `<tr><td>Total vehicles (entry events)</td><td>${vehiclesWithEntry.size}</td></tr>`;
        html += `<tr><td>Vehicles with exit events</td><td>${vehiclesWithExit.size}</td></tr>`;
        html += `<tr><td>Currently active vehicles</td><td>${this.activeVehicles.size}</td></tr>`;
        html += `<tr><td>Completed trips</td><td>${this.completedTrips}</td></tr>`;
        html += '<tr><th colspan="2">Speed Statistics</th></tr>';
        html += `<tr><td>Average speed (calculated)</td><td>${calculatedAvgSpeed.toFixed(2)} m/s</td></tr>`;
        html += `<tr><td>Average speed (direct)</td><td>${directAvgSpeed.toFixed(2)} m/s</td></tr>`;
        html += `<tr><td>Speed measurements</td><td>${this.speedMeasurements}</td></tr>`;
        // Lane and intersection validation
        html += '<tr><th colspan="3">Lane Metrics Validation</th></tr>';
        html += '<tr><td>Lane ID</td><td>Entries</td><td>Exits</td></tr>';
        for (const [laneId, validation] of Object.entries(laneMetricsValidation)) {
            const isBalanced = validation.balance === 0 ||
                (validation.entries > 0 && (validation.balance / validation.entries) < 0.05);
            const rowClass = isBalanced ? '' : 'validation-error';
            html += `<tr class="${rowClass}"><td>${laneId}</td><td>${validation.entries}</td><td>${validation.exits}</td></tr>`;
        }
        html += '<tr><th colspan="3">Intersection Metrics Validation</th></tr>';
        html += '<tr><td>Intersection ID</td><td>Entries</td><td>Exits</td></tr>';
        for (const [intersectionId, validation] of Object.entries(intersectionMetricsValidation)) {
            const isBalanced = validation.balance === 0 ||
                (validation.entries > 0 && (validation.balance / validation.entries) < 0.05);
            const rowClass = isBalanced ? '' : 'validation-error';
            html += `<tr class="${rowClass}"><td>${intersectionId}</td><td>${validation.entries}</td><td>${validation.exits}</td></tr>`;
        }
        html += '<tr><th colspan="2">Data Integrity Issues</th></tr>';
        // Add validation warnings in red if issues found
        const hasIssues = vehiclesWithExitButNoEntry.length > 0 ||
            vehiclesWithSpeedChangeButNoEntry.size > 0 ||
            Math.abs(calculatedAvgSpeed - directAvgSpeed) > 1.0 ||
            vehiclesInLaneWithoutExit.size > 0;
        if (hasIssues) {
            if (vehiclesWithExitButNoEntry.length > 0) {
                html += `<tr class="validation-error"><td>Vehicles with exit but no entry</td><td>${vehiclesWithExitButNoEntry.length}</td></tr>`;
            }
            if (vehiclesWithSpeedChangeButNoEntry.size > 0) {
                html += `<tr class="validation-error"><td>Vehicles with speed changes but no entry</td><td>${vehiclesWithSpeedChangeButNoEntry.size}</td></tr>`;
            }
            if (vehiclesInLaneWithoutExit.size > 0) {
                html += `<tr class="validation-error"><td>Vehicles in lane without exit</td><td>${vehiclesInLaneWithoutExit.size}</td></tr>`;
            }
            if (Math.abs(calculatedAvgSpeed - directAvgSpeed) > 1.0) {
                html += `<tr class="validation-error"><td>Speed calculation discrepancy</td><td>${Math.abs(calculatedAvgSpeed - directAvgSpeed).toFixed(2)}</td></tr>`;
            }
        }
        else {
            html += `<tr class="validation-success"><td colspan="2">All validation checks passed!</td></tr>`;
        }
        // Global metrics summary
        html += '<tr><th colspan="2">Global Metrics</th></tr>';
        html += `<tr><td>Global Throughput (vehicles/min)</td><td>${metrics.globalThroughput.toFixed(2)}</td></tr>`;
        html += `<tr><td>Congestion Index (0-1)</td><td>${metrics.congestionIndex.toFixed(2)}</td></tr>`;
        html += `<tr><td>Total event records</td><td>${this.vehicleMetrics.length}</td></tr>`;
        html += '</table></div>';
        return html;
    }
}
exports.KPICollector = KPICollector;
// Export a singleton instance for application-wide use
exports.kpiCollector = new KPICollector();


/***/ }),

/***/ "./src/model/traffic-control/AbstractTrafficControlStrategy.ts":
/*!*********************************************************************!*\
  !*** ./src/model/traffic-control/AbstractTrafficControlStrategy.ts ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, exports) => {


/**
 * AbstractTrafficControlStrategy
 *
 * Base class for implementing traffic control strategies.
 * Provides common functionality and default implementations.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AbstractTrafficControlStrategy = void 0;
/**
 * Abstract base class for traffic control strategies
 */
class AbstractTrafficControlStrategy {
    constructor() {
        /** Reference to the intersection being controlled */
        this.intersection = null;
        /** Current phase number */
        this.currentPhase = 0;
        /** Total phases in cycle */
        this.totalPhases = 4;
        /** Time elapsed in current phase */
        this.timeInPhase = 0;
        /** Time when current phase should end */
        this.nextPhaseChangeTime = 0;
        /** Base duration for each phase (can be overridden by concrete implementations) */
        this.phaseDuration = 30; // seconds
        /** Configuration options specific to this strategy */
        this.configOptions = {};
    }
    /**
     * Initialize the traffic control strategy for a specific intersection
     */
    initialize(intersection) {
        this.intersection = intersection;
        this.reset();
    }
    /**
     * Update the traffic signals based on current traffic conditions
     */
    update(delta, trafficStates) {
        // Increment time in current phase
        this.timeInPhase += delta;
        // Check if it's time to change phases
        if (this.shouldSwitchPhase(trafficStates)) {
            this.advanceToNextPhase();
        }
        // Return current signal states
        return this.getCurrentSignalStates();
    }
    /**
     * Reset the strategy to its initial state
     */
    reset() {
        this.currentPhase = 0;
        this.timeInPhase = 0;
        this.nextPhaseChangeTime = this.getPhaseDuration();
    }
    /**
     * Get the current phase number
     */
    getCurrentPhase() {
        return this.currentPhase;
    }
    /**
     * Get the total number of phases
     */
    getTotalPhases() {
        return this.totalPhases;
    }
    /**
     * Get configuration options
     */
    getConfigOptions() {
        return { ...this.configOptions };
    }
    /**
     * Get the current signal states without updating
     * This method exposes the protected method to satisfy the interface
     */
    getCurrentSignalStates() {
        return this.getSignalStates();
    }
    /**
     * Update configuration options
     */
    updateConfig(options) {
        this.configOptions = { ...this.configOptions, ...options };
    }
    /**
     * Convert to JSON
     */
    toJSON() {
        return {
            strategyType: this.strategyType,
            currentPhase: this.currentPhase,
            timeInPhase: this.timeInPhase,
            totalPhases: this.totalPhases,
            phaseDuration: this.phaseDuration,
            configOptions: this.configOptions
        };
    }
    /**
     * Create from JSON
     */
    fromJSON(data, intersection) {
        throw new Error('Method must be implemented by concrete strategy class');
    }
    /**
     * Check if the signal phase should be changed
     * Can be overridden by concrete implementations for more sophisticated logic
     */
    shouldSwitchPhase(trafficStates) {
        return this.timeInPhase >= this.nextPhaseChangeTime;
    }
    /**
     * Advance to the next phase
     */
    advanceToNextPhase() {
        this.currentPhase = (this.currentPhase + 1) % this.totalPhases;
        this.timeInPhase = 0;
        this.nextPhaseChangeTime = this.getPhaseDuration();
    }
    /**
     * Get the duration for the current phase
     * Can be overridden by concrete implementations for variable phase durations
     */
    getPhaseDuration() {
        return this.phaseDuration;
    }
}
exports.AbstractTrafficControlStrategy = AbstractTrafficControlStrategy;


/***/ }),

/***/ "./src/model/traffic-control/AdaptiveTimingStrategy.ts":
/*!*************************************************************!*\
  !*** ./src/model/traffic-control/AdaptiveTimingStrategy.ts ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


/**
 * AdaptiveTimingStrategy
 *
 * A more advanced traffic control strategy that adapts to traffic conditions.
 * This strategy adjusts phase durations based on queue lengths and waiting times.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AdaptiveTimingStrategy = void 0;
const AbstractTrafficControlStrategy_1 = __webpack_require__(/*! ./AbstractTrafficControlStrategy */ "./src/model/traffic-control/AbstractTrafficControlStrategy.ts");
const settings = __webpack_require__(/*! ../../settings */ "./src/settings.ts");
/**
 * Adaptive timing traffic control strategy
 * Adjusts signal timing based on traffic conditions
 */
class AdaptiveTimingStrategy extends AbstractTrafficControlStrategy_1.AbstractTrafficControlStrategy {
    constructor() {
        super();
        this.strategyType = 'adaptive-timing';
        this.displayName = 'Adaptive Timing';
        this.description = 'Adapts traffic signal timings based on real-time traffic conditions';
        // Traffic signal patterns (same as fixed timing)
        this.states = [
            ['L', '', 'L', ''],
            ['FR', '', 'FR', ''],
            ['', 'L', '', 'L'],
            ['', 'FR', '', 'FR'] // Phase 4: East & West forward and right
        ];
        // Track traffic metrics for each approach
        this.queueLengths = [0, 0, 0, 0]; // N, E, S, W
        this.waitTimes = [0, 0, 0, 0]; // N, E, S, W
        this.flowRates = [0, 0, 0, 0]; // N, E, S, W
        this.congestionScores = [0, 0, 0, 0]; // N, E, S, W
        this.throughputRates = [0, 0, 0, 0]; // Vehicles passing through per minute
        this.saturationRates = [0, 0, 0, 0]; // How saturated the approach is (0-1)
        // Traffic history for trend analysis
        this.queueHistory = [];
        this.waitTimeHistory = [];
        this.flowRateHistory = []; // Track flow rate history for better trend analysis
        this.historyMaxLength = 10;
        // Minimum and maximum phase durations
        this.minPhaseDuration = 10; // seconds
        this.maxPhaseDuration = 60; // seconds
        this.basePhaseDuration = 30; // seconds
        // Algorithm parameters
        this.trafficSensitivity = 0.5; // How reactive to traffic (0-1)
        this.queueWeight = 1.0; // Weight for queue length in scoring
        this.waitTimeWeight = 1.0; // Weight for wait time in scoring
        this.flowRateWeight = 0.5; // Weight for flow rate in scoring
        this.trendWeight = 0.3; // Weight for trend analysis (0-1)
        this.prioritizeLeftTurns = true; // Give extra weight to left turn phases when congested
        this.enableLogging = false; // Enable detailed logging
        this.emergencyMode = false; // Enable emergency mode for extreme congestion
        this.fairnessWeight = 0.5; // Weight for fairness across approaches (0-1)
        // Timing statistics for analysis
        this.phaseDurationHistory = [];
        this.trafficScoreHistory = [];
        this.phaseChanges = 0;
        this.emergencyActivations = 0; // Track emergency mode activations
        this.fairnessMetric = 1.0; // Track fairness across approaches (0-1)
        this.totalPhases = this.states.length;
        this.configOptions = {
            minPhaseDuration: this.minPhaseDuration,
            maxPhaseDuration: this.maxPhaseDuration,
            baseDuration: settings.lightsFlipInterval / 30,
            trafficSensitivity: this.trafficSensitivity,
            queueWeight: this.queueWeight,
            waitTimeWeight: this.waitTimeWeight,
            flowRateWeight: this.flowRateWeight,
            trendWeight: this.trendWeight,
            prioritizeLeftTurns: this.prioritizeLeftTurns,
            enableLogging: this.enableLogging,
            emergencyMode: this.emergencyMode,
            fairnessWeight: this.fairnessWeight
        };
        this.basePhaseDuration = this.configOptions.baseDuration;
        // Initialize history arrays
        this.resetHistory();
    }
    /**
     * Reset traffic history arrays
     */
    resetHistory() {
        this.queueHistory = [];
        this.waitTimeHistory = [];
        this.flowRateHistory = [];
        this.phaseDurationHistory = [];
        this.trafficScoreHistory = [];
        this.phaseChanges = 0;
    }
    /**
     * Initialize the strategy with an intersection
     */
    initialize(intersection) {
        super.initialize(intersection);
        // If it's a 2-way or T-intersection, use a simplified state cycle
        if (intersection.roads && intersection.roads.length <= 2) {
            this.states = [
                ['LFR', 'LFR', 'LFR', 'LFR'] // Single phase allowing all movements
            ];
            this.totalPhases = 1;
        }
        // Initialize metric tracking
        this.queueLengths = [0, 0, 0, 0];
        this.waitTimes = [0, 0, 0, 0];
        this.flowRates = [0, 0, 0, 0];
        this.congestionScores = [0, 0, 0, 0];
        // Reset history arrays
        this.resetHistory();
        // Apply configuration
        this.minPhaseDuration = this.configOptions.minPhaseDuration || 10;
        this.maxPhaseDuration = this.configOptions.maxPhaseDuration || 60;
        this.basePhaseDuration = this.configOptions.baseDuration || 30;
        this.trafficSensitivity = this.configOptions.trafficSensitivity || 0.5;
        this.queueWeight = this.configOptions.queueWeight || 1.0;
        this.waitTimeWeight = this.configOptions.waitTimeWeight || 1.0;
        this.flowRateWeight = this.configOptions.flowRateWeight || 0.5;
        this.trendWeight = this.configOptions.trendWeight || 0.3;
        this.prioritizeLeftTurns = this.configOptions.prioritizeLeftTurns !== undefined ?
            this.configOptions.prioritizeLeftTurns : true;
        this.enableLogging = this.configOptions.enableLogging || false;
        this.emergencyMode = this.configOptions.emergencyMode || false;
        this.fairnessWeight = this.configOptions.fairnessWeight || 0.5;
        if (this.enableLogging) {
            console.log(`[AdaptiveStrategy] Initialized for intersection ${intersection.id}`);
            console.log(`[AdaptiveStrategy] Config: minDur=${this.minPhaseDuration}s, maxDur=${this.maxPhaseDuration}s, sensitivity=${this.trafficSensitivity}`);
        }
    }
    /**
     * Update the strategy based on elapsed time and traffic conditions
     */
    update(delta, trafficStates) {
        // Add to time in current phase
        this.timeInPhase += delta;
        // Process traffic states if available
        if (trafficStates && trafficStates.length > 0) {
            // This will update internal traffic metrics
            const shouldSwitch = this.shouldSwitchPhase(trafficStates);
            // If it's time to switch, advance to next phase
            if (shouldSwitch) {
                this.advanceToNextPhase();
            }
        }
        else {
            // Default behavior without traffic data
            if (this.timeInPhase >= this.nextPhaseChangeTime) {
                this.advanceToNextPhase();
            }
        }
        // Return current signal states
        return this.getSignalStates();
    }
    /**
     * Update configuration options
     */
    updateConfig(options) {
        super.updateConfig(options);
        // Update internal parameters based on config
        if (options.minPhaseDuration !== undefined)
            this.minPhaseDuration = options.minPhaseDuration;
        if (options.maxPhaseDuration !== undefined)
            this.maxPhaseDuration = options.maxPhaseDuration;
        if (options.baseDuration !== undefined)
            this.basePhaseDuration = options.baseDuration;
        if (options.trafficSensitivity !== undefined)
            this.trafficSensitivity = options.trafficSensitivity;
        if (options.queueWeight !== undefined)
            this.queueWeight = options.queueWeight;
        if (options.waitTimeWeight !== undefined)
            this.waitTimeWeight = options.waitTimeWeight;
        if (options.flowRateWeight !== undefined)
            this.flowRateWeight = options.flowRateWeight;
        if (options.trendWeight !== undefined)
            this.trendWeight = options.trendWeight;
        if (options.prioritizeLeftTurns !== undefined)
            this.prioritizeLeftTurns = options.prioritizeLeftTurns;
        if (options.enableLogging !== undefined)
            this.enableLogging = options.enableLogging;
        if (options.emergencyMode !== undefined)
            this.emergencyMode = options.emergencyMode;
        if (options.fairnessWeight !== undefined)
            this.fairnessWeight = options.fairnessWeight;
        if (this.enableLogging) {
            console.log(`[AdaptiveStrategy] Configuration updated`);
        }
    }
    /**
     * Reset the strategy to initial state
     */
    reset() {
        super.reset();
        // Reset traffic metrics
        this.queueLengths = [0, 0, 0, 0];
        this.waitTimes = [0, 0, 0, 0];
        this.flowRates = [0, 0, 0, 0];
        this.congestionScores = [0, 0, 0, 0];
        // Reset history
        this.resetHistory();
        if (this.enableLogging) {
            console.log(`[AdaptiveStrategy] Reset to initial state`);
        }
    }
    /**
     * Check if the signal phase should be changed based on traffic conditions
     * Overrides the base implementation to add adaptive logic
     */
    shouldSwitchPhase(trafficStates) {
        // Standard time-based check
        const timeBasedSwitch = this.timeInPhase >= this.nextPhaseChangeTime;
        // If we have traffic state data, we can do more sophisticated checks
        if (trafficStates && trafficStates.length > 0) {
            // Has minimum time elapsed?
            if (this.timeInPhase < this.minPhaseDuration) {
                return false; // Don't switch before minimum time
            }
            // Update traffic metrics with latest data
            this.updateTrafficMetrics(trafficStates);
            // Get traffic demand for current phase and all other phases
            const currentDirections = this.getActiveDirectionsForPhase(this.currentPhase);
            const currentTraffic = this.getTrafficDemandForDirections(currentDirections);
            // Find the phase with the highest demand
            let maxTraffic = 0;
            let maxTrafficPhase = this.currentPhase;
            for (let i = 0; i < this.totalPhases; i++) {
                if (i !== this.currentPhase) {
                    const phaseDirections = this.getActiveDirectionsForPhase(i);
                    const phaseTraffic = this.getTrafficDemandForDirections(phaseDirections);
                    if (phaseTraffic > maxTraffic) {
                        maxTraffic = phaseTraffic;
                        maxTrafficPhase = i;
                    }
                }
            }
            // Early switch conditions
            const nextPhase = (this.currentPhase + 1) % this.totalPhases;
            const nextTraffic = this.getTrafficDemandForDirections(this.getActiveDirectionsForPhase(nextPhase));
            // Switch early under specific conditions
            if (this.timeInPhase >= this.nextPhaseChangeTime * 0.75) {
                // If the next phase has substantially more demand, switch early
                if (nextTraffic > currentTraffic * 2) {
                    if (this.enableLogging) {
                        console.log(`[AdaptiveStrategy] Early switch: next phase has ${nextTraffic.toFixed(1)} demand vs current ${currentTraffic.toFixed(1)}`);
                    }
                    return true;
                }
                // If another phase has extremely high demand, consider switching directly to it
                if (maxTraffic > currentTraffic * 3 && maxTraffic > nextTraffic * 2) {
                    if (this.enableLogging) {
                        console.log(`[AdaptiveStrategy] Emergency switch: phase ${maxTrafficPhase + 1} has critical demand ${maxTraffic.toFixed(1)}`);
                    }
                    // Set the next phase to the one with highest demand
                    this.currentPhase = maxTrafficPhase - 1;
                    if (this.currentPhase < 0)
                        this.currentPhase = this.totalPhases - 1;
                    return true;
                }
            }
            // Extend phase if it has significant traffic and hasn't reached max duration
            if (currentTraffic > 0 && this.timeInPhase < this.maxPhaseDuration) {
                // If current phase has more traffic than the next AND we're still processing vehicles
                if (currentTraffic > nextTraffic * 0.8 && timeBasedSwitch) {
                    const remainingPercent = Math.min(1, (currentTraffic - nextTraffic) / currentTraffic);
                    // Extend up to 50% of base duration based on remaining traffic
                    const extensionTime = this.basePhaseDuration * 0.5 * remainingPercent;
                    if (this.timeInPhase < this.nextPhaseChangeTime + extensionTime &&
                        this.timeInPhase < this.maxPhaseDuration) {
                        if (this.enableLogging && this.timeInPhase >= this.nextPhaseChangeTime) {
                            console.log(`[AdaptiveStrategy] Extending phase ${this.currentPhase + 1} by ${extensionTime.toFixed(1)}s due to continuing traffic`);
                        }
                        return false;
                    }
                }
            }
            // If current phase has no traffic but next phase does, switch immediately
            // after minimum time has passed
            if (currentTraffic === 0 && nextTraffic > 0 && this.timeInPhase >= this.minPhaseDuration) {
                if (this.enableLogging) {
                    console.log(`[AdaptiveStrategy] Early switch: current phase empty, next phase has traffic`);
                }
                return true;
            }
        }
        // If we're past the scheduled time, make the switch
        if (timeBasedSwitch) {
            return true;
        }
        return false;
    }
    /**
     * Update internal traffic metrics based on traffic state
     */
    updateTrafficMetrics(trafficStates) {
        // Store previous metrics for trend analysis
        const previousQueues = [...this.queueLengths];
        const previousWaits = [...this.waitTimes];
        const previousFlows = [...this.flowRates];
        // Update current metrics
        for (let i = 0; i < trafficStates.length; i++) {
            if (i < this.queueLengths.length) {
                this.queueLengths[i] = trafficStates[i].queueLength;
                this.waitTimes[i] = trafficStates[i].averageWaitTime;
                this.flowRates[i] = trafficStates[i].flowRate;
                // Calculate throughput rates - if data is available in the traffic state
                this.throughputRates[i] = trafficStates[i].flowRate || 0;
                // Calculate saturation rates - queue length compared to an estimated capacity
                // Higher values indicate more saturation
                const estimatedCapacity = 10; // Estimated capacity per lane
                this.saturationRates[i] = Math.min(1.0, this.queueLengths[i] / estimatedCapacity);
            }
        }
        // Update congestion scores based on metrics
        this.updateCongestionScores();
        // Add to history for trend analysis
        this.queueHistory.push([...this.queueLengths]);
        this.waitTimeHistory.push([...this.waitTimes]);
        this.flowRateHistory.push([...this.flowRates]);
        // Limit history length
        if (this.queueHistory.length > this.historyMaxLength) {
            this.queueHistory.shift();
            this.waitTimeHistory.shift();
            this.flowRateHistory.shift();
        }
        // Check for emergency conditions
        this.checkEmergencyConditions();
        // Calculate fairness across approaches
        this.calculateFairness();
        // Log metrics if logging is enabled
        if (this.enableLogging) {
            console.log(`[AdaptiveStrategy] Traffic metrics updated: Q=${this.queueLengths.join(',')}, W=${this.waitTimes.join(',')}, F=${this.flowRates.join(',')}`);
            console.log(`[AdaptiveStrategy] Saturation rates: ${this.saturationRates.map(r => r.toFixed(2)).join(', ')}`);
        }
    }
    /**
     * Calculate congestion scores for each direction
     * Higher score = more congested
     */
    updateCongestionScores() {
        for (let i = 0; i < 4; i++) {
            // Normalize each metric to a 0-10 scale
            const queueScore = Math.min(10, this.queueLengths[i] / 2);
            const waitScore = Math.min(10, this.waitTimes[i] / 30);
            const flowScore = this.flowRates[i] > 0 ? 10 / Math.max(1, this.flowRates[i]) : 10;
            const saturationScore = this.saturationRates[i] * 10; // Convert 0-1 to 0-10
            // Combine scores with weights
            this.congestionScores[i] = (queueScore * this.queueWeight +
                waitScore * this.waitTimeWeight +
                flowScore * this.flowRateWeight +
                saturationScore * this.flowRateWeight // Use same weight as flow rate for now
            ) / (this.queueWeight + this.waitTimeWeight + this.flowRateWeight * 2);
            // Apply trend analysis if we have history
            if (this.queueHistory.length >= 3) {
                const queueTrend = this.calculateTrend(i, this.queueHistory);
                const waitTrend = this.calculateTrend(i, this.waitTimeHistory);
                const flowTrend = this.calculateTrend(i, this.flowRateHistory);
                // If trends are increasing (positive), increase congestion score
                // Weight queue trend highest, then wait time, then flow
                const trendFactor = (queueTrend * 0.5 + waitTrend * 0.3 + flowTrend * 0.2);
                if (trendFactor > 0) {
                    this.congestionScores[i] += trendFactor * this.trendWeight;
                }
            }
            // Apply fairness adjustment if fairness weight is > 0 
            if (this.fairnessWeight > 0 && this.fairnessMetric < 1.0) {
                // If this direction has been underserved (higher wait times),
                // boost its congestion score to give it higher priority
                const avgWait = this.waitTimes[i];
                const maxWait = Math.max(...this.waitTimes);
                if (avgWait > 0 && avgWait >= maxWait * 0.8) {
                    const fairnessBoost = (avgWait / maxWait) * this.fairnessWeight * 2;
                    this.congestionScores[i] += fairnessBoost;
                }
            }
        }
    }
    /**
     * Calculate trend for a specific direction and metric
     * Returns a value between -1 and 1 (negative = decreasing, positive = increasing)
     */
    calculateTrend(direction, history) {
        if (history.length < 3)
            return 0;
        // Get last 3 values
        const recent = history.slice(-3).map(h => h[direction]);
        // Simple trend calculation
        if (recent[2] > recent[1] && recent[1] > recent[0]) {
            // Consistently increasing
            return 1.0;
        }
        else if (recent[2] < recent[1] && recent[1] < recent[0]) {
            // Consistently decreasing
            return -1.0;
        }
        else if (recent[2] > recent[0]) {
            // Net increase
            return 0.5;
        }
        else if (recent[2] < recent[0]) {
            // Net decrease
            return -0.5;
        }
        // No clear trend
        return 0;
    }
    /**
     * Get the active directions for a specific phase
     * Returns array of direction indices (0=N, 1=E, 2=S, 3=W)
     */
    getActiveDirectionsForPhase(phase) {
        const phaseState = this.states[phase % this.states.length];
        const directions = [];
        for (let i = 0; i < phaseState.length; i++) {
            if (phaseState[i].length > 0) {
                directions.push(i);
            }
        }
        return directions;
    }
    /**
     * Calculate traffic demand for given directions
     * Returns a score based on congestion scores
     */
    getTrafficDemandForDirections(directions) {
        let demand = 0;
        for (const dir of directions) {
            // Use comprehensive congestion score
            demand += this.congestionScores[dir];
            // Add bonus for left turn phases if configured
            if (this.prioritizeLeftTurns) {
                const phaseIdx = this.currentPhase % this.states.length;
                const phaseState = this.states[phaseIdx][dir];
                if (phaseState.includes('L')) {
                    demand *= 1.2; // 20% bonus for left turn phases when congested
                }
            }
        }
        return demand;
    }
    /**
     * Get the duration for the current phase based on traffic conditions
     */
    getPhaseDuration() {
        const baseDuration = this.configOptions.baseDuration || 30; // seconds
        const sensitivity = this.configOptions.trafficSensitivity || 0.5;
        // If we don't have traffic data, use base duration
        if (this.queueLengths.every(q => q === 0) && this.waitTimes.every(w => w === 0)) {
            if (this.enableLogging) {
                console.log(`[AdaptiveStrategy] No traffic data, using base duration: ${baseDuration}s`);
            }
            return baseDuration;
        }
        // Get directions active in current phase
        const currentDirections = this.getActiveDirectionsForPhase(this.currentPhase);
        const currentTraffic = this.getTrafficDemandForDirections(currentDirections);
        // Check other phases' demand to determine relative importance
        let totalDemand = currentTraffic;
        let maxOtherDemand = 0;
        for (let i = 0; i < this.totalPhases; i++) {
            if (i !== this.currentPhase) {
                const phaseDemand = this.getTrafficDemandForDirections(this.getActiveDirectionsForPhase(i));
                totalDemand += phaseDemand;
                maxOtherDemand = Math.max(maxOtherDemand, phaseDemand);
            }
        }
        // Calculate phase importance as ratio of its demand to total demand
        const phaseImportance = totalDemand > 0 ? currentTraffic / totalDemand : 0;
        // Calculate adjusted duration
        let adjustedDuration;
        if (maxOtherDemand > currentTraffic * 2) {
            // If another phase has much more demand, shorten this phase
            adjustedDuration = this.minPhaseDuration;
        }
        else {
            // Normal adjustment based on demand
            const trafficFactor = Math.min(1.0, currentTraffic / 20); // Cap at 20 units of demand
            const importanceFactor = Math.max(0.2, phaseImportance * 2); // Min 0.2, max 2.0
            const durationAdjustment = sensitivity * trafficFactor * importanceFactor * (this.maxPhaseDuration - baseDuration);
            adjustedDuration = Math.min(this.maxPhaseDuration, Math.max(this.minPhaseDuration, baseDuration + durationAdjustment));
        }
        // Store for analysis
        this.phaseDurationHistory.push(adjustedDuration);
        this.trafficScoreHistory.push(currentTraffic);
        if (this.enableLogging) {
            console.log(`[AdaptiveStrategy] Phase ${this.currentPhase + 1}: traffic=${currentTraffic.toFixed(1)}, ` +
                `importance=${phaseImportance.toFixed(2)}, duration=${adjustedDuration.toFixed(1)}s`);
        }
        return adjustedDuration;
    }
    /**
     * Get the current signal states
     */
    getSignalStates() {
        const stringState = this.states[this.currentPhase % this.states.length];
        // For 2-way or T-intersections, always allow all movements
        if (this.intersection && this.intersection.roads && this.intersection.roads.length <= 2) {
            return [
                this._decode('LFR'),
                this._decode('LFR'),
                this._decode('LFR'),
                this._decode('LFR')
            ];
        }
        // Convert string patterns to numeric state arrays
        return stringState.map(x => this._decode(x));
    }
    /**
     * Convert string representation to numeric state array
     * e.g., "LFR" -> [1,1,1] (left, forward, right allowed)
     */
    _decode(str) {
        const state = [0, 0, 0];
        if (str.includes('L'))
            state[0] = 1;
        if (str.includes('F'))
            state[1] = 1;
        if (str.includes('R'))
            state[2] = 1;
        return state;
    }
    /**
     * Add a custom phase advancement method that tracks changes
     */
    advanceToNextPhase() {
        const oldPhase = this.currentPhase;
        // Call parent implementation
        super.advanceToNextPhase();
        // Track phase changes
        this.phaseChanges++;
        if (this.enableLogging) {
            console.log(`[AdaptiveStrategy] Phase changed: ${oldPhase + 1} → ${this.currentPhase + 1}`);
        }
    }
    /**
     * Check for emergency traffic conditions that require immediate intervention
     */
    checkEmergencyConditions() {
        // Check if any direction has extreme congestion
        let emergencyDetected = false;
        let emergencyDirection = -1;
        for (let i = 0; i < 4; i++) {
            // Define emergency conditions:
            // 1. Very high queue length (> 15)
            // 2. Very high wait time (> 60 seconds)
            // 3. Very low flow rate combined with high queue
            const criticalQueue = this.queueLengths[i] > 15;
            const criticalWait = this.waitTimes[i] > 60;
            const criticalFlow = this.flowRates[i] < 1 && this.queueLengths[i] > 10;
            // Consistent growth trend is another emergency indicator
            let growingTrend = false;
            if (this.queueHistory.length >= 5) {
                const trendFactor = this.calculateTrend(i, this.queueHistory);
                growingTrend = trendFactor > 0.8; // Strong upward trend
            }
            if ((criticalQueue || criticalWait || criticalFlow) && growingTrend) {
                emergencyDetected = true;
                emergencyDirection = i;
                break;
            }
        }
        // If emergency detected and emergency mode is enabled in config
        if (emergencyDetected && this.configOptions.emergencyMode) {
            // Check if we're not already servicing this direction
            const currentDirections = this.getActiveDirectionsForPhase(this.currentPhase);
            if (!currentDirections.includes(emergencyDirection)) {
                if (this.enableLogging) {
                    console.log(`[AdaptiveStrategy] 🚨 EMERGENCY condition detected in direction ${emergencyDirection}`);
                }
                // Find the phase that serves this direction
                let targetPhase = -1;
                for (let i = 0; i < this.totalPhases; i++) {
                    const phaseDirections = this.getActiveDirectionsForPhase(i);
                    if (phaseDirections.includes(emergencyDirection)) {
                        targetPhase = i;
                        break;
                    }
                }
                if (targetPhase >= 0 && this.timeInPhase > this.minPhaseDuration) {
                    // Force switch to this phase on next update
                    this.currentPhase = targetPhase - 1;
                    if (this.currentPhase < 0)
                        this.currentPhase = this.totalPhases - 1;
                    this.timeInPhase = this.nextPhaseChangeTime; // Force a phase change
                    this.emergencyActivations++;
                    if (this.enableLogging) {
                        console.log(`[AdaptiveStrategy] Emergency action: Switching to phase ${targetPhase} to address congestion`);
                    }
                }
            }
        }
    }
    /**
     * Calculate fairness metric across approaches
     * A value of 1.0 means perfectly balanced service
     * Lower values indicate some directions are underserved
     */
    calculateFairness() {
        // Calculate service time ratio between most and least served directions
        if (this.phaseDurationHistory.length < this.totalPhases) {
            this.fairnessMetric = 1.0; // Not enough data yet
            return;
        }
        // Get average wait times by direction
        const avgWaitByDirection = [...this.waitTimes];
        // If any wait times are zero, set a minimum value
        for (let i = 0; i < avgWaitByDirection.length; i++) {
            if (avgWaitByDirection[i] === 0)
                avgWaitByDirection[i] = 0.1;
        }
        // Calculate max/min ratio
        const maxWait = Math.max(...avgWaitByDirection);
        const minWait = Math.min(...avgWaitByDirection);
        // Invert and normalize to 0-1 range (1 = perfectly fair, 0 = completely unfair)
        this.fairnessMetric = minWait / maxWait;
        if (this.enableLogging && this.fairnessMetric < 0.5) {
            console.log(`[AdaptiveStrategy] Fairness alert: Low fairness metric ${this.fairnessMetric.toFixed(2)}`);
        }
    }
    /**
     * Get performance analytics for this strategy
     */
    getPerformanceAnalytics() {
        // Calculate statistics
        const durations = this.phaseDurationHistory;
        const trafficScores = this.trafficScoreHistory;
        const phaseDurationAvg = durations.length > 0 ?
            durations.reduce((sum, val) => sum + val, 0) / durations.length : 0;
        const phaseDurationMin = durations.length > 0 ? Math.min(...durations) : 0;
        const phaseDurationMax = durations.length > 0 ? Math.max(...durations) : 0;
        const trafficScoreAvg = trafficScores.length > 0 ?
            trafficScores.reduce((sum, val) => sum + val, 0) / trafficScores.length : 0;
        // Calculate adaptation rate (how much timing varies from base duration)
        let totalVariation = 0;
        const baseDuration = this.basePhaseDuration;
        for (const duration of durations) {
            totalVariation += Math.abs(duration - baseDuration) / baseDuration;
        }
        const adaptationRate = durations.length > 0 ? totalVariation / durations.length : 0;
        return {
            phaseDurationAvg,
            phaseDurationMin,
            phaseDurationMax,
            phaseChanges: this.phaseChanges,
            trafficScoreAvg,
            congestionScores: [...this.congestionScores],
            saturationRates: [...this.saturationRates],
            adaptationRate,
            fairnessMetric: this.fairnessMetric,
            emergencyActivations: this.emergencyActivations,
            throughputRates: [...this.throughputRates]
        };
    }
    /**
     * Create from JSON
     */
    static fromJSON(data, intersection) {
        const strategy = new AdaptiveTimingStrategy();
        // Restore state from saved data
        strategy.currentPhase = data.currentPhase || 0;
        strategy.timeInPhase = data.timeInPhase || 0;
        strategy.totalPhases = data.totalPhases || 4;
        strategy.phaseDuration = data.phaseDuration || 30;
        strategy.configOptions = data.configOptions || {};
        // Restore adaptive-specific properties
        strategy.minPhaseDuration = data.minPhaseDuration || strategy.configOptions.minPhaseDuration || 10;
        strategy.maxPhaseDuration = data.maxPhaseDuration || strategy.configOptions.maxPhaseDuration || 60;
        strategy.basePhaseDuration = data.basePhaseDuration || strategy.configOptions.baseDuration || 30;
        strategy.trafficSensitivity = data.trafficSensitivity || strategy.configOptions.trafficSensitivity || 0.5;
        strategy.queueWeight = data.queueWeight || strategy.configOptions.queueWeight || 1.0;
        strategy.waitTimeWeight = data.waitTimeWeight || strategy.configOptions.waitTimeWeight || 1.0;
        strategy.flowRateWeight = data.flowRateWeight || strategy.configOptions.flowRateWeight || 0.5;
        strategy.trendWeight = data.trendWeight || strategy.configOptions.trendWeight || 0.3;
        strategy.prioritizeLeftTurns = data.prioritizeLeftTurns !== undefined ?
            data.prioritizeLeftTurns : strategy.configOptions.prioritizeLeftTurns !== undefined ?
            strategy.configOptions.prioritizeLeftTurns : true;
        strategy.enableLogging = data.enableLogging || strategy.configOptions.enableLogging || false;
        strategy.emergencyMode = data.emergencyMode || strategy.configOptions.emergencyMode || false;
        strategy.fairnessWeight = data.fairnessWeight || strategy.configOptions.fairnessWeight || 0.5;
        // If states array was saved, restore it
        if (data.states) {
            strategy.states = data.states;
        }
        // Restore metrics if available
        if (data.queueLengths)
            strategy.queueLengths = data.queueLengths;
        if (data.waitTimes)
            strategy.waitTimes = data.waitTimes;
        if (data.flowRates)
            strategy.flowRates = data.flowRates;
        if (data.congestionScores)
            strategy.congestionScores = data.congestionScores;
        if (data.throughputRates)
            strategy.throughputRates = data.throughputRates;
        if (data.saturationRates)
            strategy.saturationRates = data.saturationRates;
        if (data.fairnessMetric !== undefined)
            strategy.fairnessMetric = data.fairnessMetric;
        if (data.emergencyActivations !== undefined)
            strategy.emergencyActivations = data.emergencyActivations;
        // Restore history arrays
        if (data.queueHistory)
            strategy.queueHistory = data.queueHistory;
        if (data.waitTimeHistory)
            strategy.waitTimeHistory = data.waitTimeHistory;
        if (data.flowRateHistory)
            strategy.flowRateHistory = data.flowRateHistory;
        if (data.phaseDurationHistory)
            strategy.phaseDurationHistory = data.phaseDurationHistory;
        if (data.trafficScoreHistory)
            strategy.trafficScoreHistory = data.trafficScoreHistory;
        if (data.phaseChanges !== undefined)
            strategy.phaseChanges = data.phaseChanges;
        strategy.initialize(intersection);
        return strategy;
    }
    /**
     * Convert to JSON
     */
    toJSON() {
        return {
            ...super.toJSON(),
            minPhaseDuration: this.minPhaseDuration,
            maxPhaseDuration: this.maxPhaseDuration,
            basePhaseDuration: this.basePhaseDuration,
            trafficSensitivity: this.trafficSensitivity,
            queueWeight: this.queueWeight,
            waitTimeWeight: this.waitTimeWeight,
            flowRateWeight: this.flowRateWeight,
            trendWeight: this.trendWeight,
            prioritizeLeftTurns: this.prioritizeLeftTurns,
            enableLogging: this.enableLogging,
            emergencyMode: this.emergencyMode,
            fairnessWeight: this.fairnessWeight,
            // Current metrics
            states: this.states,
            queueLengths: this.queueLengths,
            waitTimes: this.waitTimes,
            flowRates: this.flowRates,
            congestionScores: this.congestionScores,
            throughputRates: this.throughputRates,
            saturationRates: this.saturationRates,
            fairnessMetric: this.fairnessMetric,
            emergencyActivations: this.emergencyActivations,
            // History data (limited for size)
            queueHistory: this.queueHistory.slice(-5),
            waitTimeHistory: this.waitTimeHistory.slice(-5),
            flowRateHistory: this.flowRateHistory.slice(-5),
            phaseDurationHistory: this.phaseDurationHistory.slice(-10),
            trafficScoreHistory: this.trafficScoreHistory.slice(-10),
            phaseChanges: this.phaseChanges,
            // Analysis
            analytics: this.getPerformanceAnalytics()
        };
    }
}
exports.AdaptiveTimingStrategy = AdaptiveTimingStrategy;


/***/ }),

/***/ "./src/model/traffic-control/AllRedFlashingStrategy.ts":
/*!*************************************************************!*\
  !*** ./src/model/traffic-control/AllRedFlashingStrategy.ts ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


/**
 * AllRedFlashingStrategy
 *
 * A special traffic control strategy that simulates an emergency mode where all
 * signals flash red, requiring vehicles to treat the intersection as an all-way stop.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AllRedFlashingStrategy = void 0;
const AbstractTrafficControlStrategy_1 = __webpack_require__(/*! ./AbstractTrafficControlStrategy */ "./src/model/traffic-control/AbstractTrafficControlStrategy.ts");
/**
 * All-Red Flashing Strategy
 * Simulates emergency conditions or power outage at intersection
 */
class AllRedFlashingStrategy extends AbstractTrafficControlStrategy_1.AbstractTrafficControlStrategy {
    constructor() {
        super();
        this.strategyType = 'all-red-flashing';
        this.displayName = 'All-Red Flashing';
        this.description = 'All approaches flash red - simulates emergency conditions';
        // Track whether signals are currently visible or not (for flashing effect)
        this.signalsVisible = true;
        // Flashing interval in seconds
        this.flashInterval = 1.0; // 1 second on, 1 second off
        this.timeInFlashState = 0;
        this.totalPhases = 1; // Only one phase (all red)
        this.configOptions = {
            flashInterval: this.flashInterval
        };
    }
    /**
     * Update the traffic signals with flashing behavior
     */
    update(delta, trafficStates) {
        // Update flash timing
        this.timeInFlashState += delta;
        if (this.timeInFlashState >= this.flashInterval) {
            this.timeInFlashState = 0;
            this.signalsVisible = !this.signalsVisible;
        }
        // Return the signal state
        return this.getSignalStates();
    }
    /**
     * Update configuration options
     */
    updateConfig(options) {
        super.updateConfig(options);
        if (options.flashInterval !== undefined) {
            this.flashInterval = options.flashInterval;
        }
    }
    /**
     * Get the current signal states - all red or all off depending on flash state
     */
    getSignalStates() {
        // If not visible in current flash state, return all off
        if (!this.signalsVisible) {
            return [
                [0, 0, 0],
                [0, 0, 0],
                [0, 0, 0],
                [0, 0, 0]
            ];
        }
        // Otherwise, all approaches are red (no movements allowed)
        return [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0]
        ];
    }
    /**
     * Create from JSON
     */
    static fromJSON(data, intersection) {
        const strategy = new AllRedFlashingStrategy();
        // Restore state from saved data
        strategy.flashInterval = data.flashInterval || strategy.flashInterval;
        strategy.signalsVisible = data.signalsVisible !== undefined ? data.signalsVisible : true;
        strategy.timeInFlashState = data.timeInFlashState || 0;
        // Apply configuration options
        if (data.configOptions) {
            strategy.updateConfig(data.configOptions);
        }
        strategy.initialize(intersection);
        return strategy;
    }
    /**
     * Convert to JSON
     */
    toJSON() {
        return {
            ...super.toJSON(),
            flashInterval: this.flashInterval,
            signalsVisible: this.signalsVisible,
            timeInFlashState: this.timeInFlashState
        };
    }
}
exports.AllRedFlashingStrategy = AllRedFlashingStrategy;


/***/ }),

/***/ "./src/model/traffic-control/FixedTimingStrategy.ts":
/*!**********************************************************!*\
  !*** ./src/model/traffic-control/FixedTimingStrategy.ts ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


/**
 * FixedTimingStrategy
 *
 * A simple fixed-timing traffic control strategy that follows a predefined cycle.
 * This is equivalent to the original behavior in the simulation.
 *
 * Features:
 * - Fixed duration cycles for predictable traffic signal timing
 * - Configurable phase durations and variations
 * - Automatic adaptation to intersection type (4-way, 3-way, etc.)
 * - Detailed logging for timing verification and debugging
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FixedTimingStrategy = void 0;
const AbstractTrafficControlStrategy_1 = __webpack_require__(/*! ./AbstractTrafficControlStrategy */ "./src/model/traffic-control/AbstractTrafficControlStrategy.ts");
const settings = __webpack_require__(/*! ../../settings */ "./src/settings.ts");
/**
 * Fixed timing traffic control strategy
 * Cycles through predefined phases with fixed durations
 */
class FixedTimingStrategy extends AbstractTrafficControlStrategy_1.AbstractTrafficControlStrategy {
    constructor() {
        super();
        this.strategyType = 'fixed-timing';
        this.displayName = 'Fixed Timing';
        this.description = 'Cycles through traffic signal phases with fixed durations';
        // Traffic signal patterns for intersections
        // 'L' = Left turn, 'F' = Forward, 'R' = Right turn
        // Each array represents a phase of the traffic light cycle
        // Each element in the array represents a direction (N, E, S, W)
        this.states = [
            ['L', '', 'L', ''],
            ['FR', '', 'FR', ''],
            ['', 'L', '', 'L'],
            ['', 'FR', '', 'FR'] // Phase 4: East & West forward and right
        ];
        // Additional properties for timing verification
        this.phaseStartTimes = [];
        this.phaseDurations = [];
        this.phaseTargetDurations = [];
        this.enableLogging = false;
        this.flipMultiplier = Math.random();
        this.totalPhases = this.states.length;
        this.configOptions = {
            baseDuration: settings.lightsFlipInterval / 30,
            variationPercentage: 5,
            enableLogging: false,
            logToConsole: true // Output logs to console
        };
        // Initialize timing arrays
        this.resetTimingStats();
    }
    /**
     * Reset timing statistics
     */
    resetTimingStats() {
        this.phaseStartTimes = new Array(this.totalPhases).fill(0);
        this.phaseDurations = new Array(this.totalPhases).fill(0);
        this.phaseTargetDurations = new Array(this.totalPhases).fill(0);
    }
    /**
     * Initialize the strategy with an intersection
     */
    initialize(intersection) {
        super.initialize(intersection);
        // If it's a 2-way or T-intersection, use a simplified state cycle
        if (intersection.roads && intersection.roads.length <= 2) {
            this.states = [
                ['LFR', 'LFR', 'LFR', 'LFR'] // Single phase allowing all movements
            ];
            this.totalPhases = 1;
        }
        // Reset timing stats with the correct number of phases
        this.resetTimingStats();
        // Apply configuration
        this.enableLogging = this.configOptions.enableLogging || false;
        if (this.enableLogging) {
            this.log(`Initialized FixedTimingStrategy for intersection ${intersection.id}`);
            this.log(`Number of phases: ${this.totalPhases}`);
            this.log(`Base duration: ${this.configOptions.baseDuration} seconds`);
            this.log(`Variation: ${this.configOptions.variationPercentage}%`);
        }
    }
    /**
     * Get the duration for the current phase
     */
    getPhaseDuration() {
        // Apply random variation to create offsets between intersections
        const baseDuration = this.configOptions.baseDuration || 5; // seconds
        const variation = this.configOptions.variationPercentage || 5; // percentage
        // Calculate duration with variation
        return baseDuration * (1 + (this.flipMultiplier * variation / 100));
    }
    /**
     * Get the current signal states
     */
    getSignalStates() {
        const stringState = this.states[this.currentPhase % this.states.length];
        // For 2-way or T-intersections, always allow all movements
        if (this.intersection && this.intersection.roads && this.intersection.roads.length <= 2) {
            return [
                this._decode('LFR'),
                this._decode('LFR'),
                this._decode('LFR'),
                this._decode('LFR')
            ];
        }
        // Convert string patterns to numeric state arrays
        return stringState.map(x => this._decode(x));
    }
    /**
     * Convert string representation to numeric state array
     * e.g., "LFR" -> [1,1,1] (left, forward, right allowed)
     */
    _decode(str) {
        const state = [0, 0, 0];
        if (str.includes('L'))
            state[0] = 1;
        if (str.includes('F'))
            state[1] = 1;
        if (str.includes('R'))
            state[2] = 1;
        return state;
    }
    /**
     * Create from JSON
     */
    static fromJSON(data, intersection) {
        const strategy = new FixedTimingStrategy();
        // Restore state from saved data
        strategy.currentPhase = data.currentPhase || 0;
        strategy.timeInPhase = data.timeInPhase || 0;
        strategy.totalPhases = data.totalPhases || 4;
        strategy.phaseDuration = data.phaseDuration || 5;
        strategy.configOptions = data.configOptions || {};
        strategy.flipMultiplier = data.flipMultiplier || Math.random();
        strategy.enableLogging = data.enableLogging || false;
        // If states array was saved, restore it
        if (data.states) {
            strategy.states = data.states;
        }
        strategy.initialize(intersection);
        return strategy;
    }
    /**
     * Convert to JSON
     */
    toJSON() {
        return {
            ...super.toJSON(),
            flipMultiplier: this.flipMultiplier,
            states: this.states,
            enableLogging: this.enableLogging,
            timingStats: this.getTimingStatistics()
        };
    }
    /**
     * Log message if logging is enabled
     */
    log(message) {
        var _a;
        if (this.enableLogging && this.configOptions.logToConsole) {
            const intersectionId = ((_a = this.intersection) === null || _a === void 0 ? void 0 : _a.id) || 'unknown';
            console.log(`[FixedTimingStrategy:${intersectionId}] ${message}`);
        }
    }
    /**
     * Update the traffic signals based on elapsed time
     * Overrides the base implementation to add timing tracking
     */
    update(delta, trafficStates) {
        // Record start time for new phase
        if (this.timeInPhase === 0) {
            const now = new Date().getTime() / 1000; // Current time in seconds
            this.phaseStartTimes[this.currentPhase] = now;
            this.phaseTargetDurations[this.currentPhase] = this.getPhaseDuration();
            if (this.enableLogging) {
                this.log(`Starting phase ${this.currentPhase + 1}/${this.totalPhases} with target duration: ${this.phaseTargetDurations[this.currentPhase].toFixed(2)}s`);
            }
        }
        // Let the parent class handle the standard update logic
        const result = super.update(delta, trafficStates);
        // If a phase change just occurred (timeInPhase was reset to 0)
        if (this.timeInPhase < delta) {
            const previousPhase = (this.currentPhase + this.totalPhases - 1) % this.totalPhases;
            const now = new Date().getTime() / 1000;
            const actualDuration = now - this.phaseStartTimes[previousPhase];
            this.phaseDurations[previousPhase] = actualDuration;
            const targetDuration = this.phaseTargetDurations[previousPhase];
            const deviation = Math.abs(actualDuration - targetDuration);
            const deviationPercent = (deviation / targetDuration) * 100;
            if (this.enableLogging) {
                this.log(`Phase ${previousPhase + 1} completed: actual=${actualDuration.toFixed(2)}s, target=${targetDuration.toFixed(2)}s, deviation=${deviationPercent.toFixed(1)}%`);
            }
        }
        return result;
    }
    /**
     * Check if it's time to switch to the next phase
     * This implementation uses the fixed timing approach
     */
    shouldSwitchPhase(trafficStates) {
        const shouldSwitch = this.timeInPhase >= this.nextPhaseChangeTime;
        // Log when we're about to switch
        if (shouldSwitch && this.enableLogging) {
            this.log(`Time to switch phase: ${this.timeInPhase.toFixed(2)}s elapsed, threshold: ${this.nextPhaseChangeTime.toFixed(2)}s`);
        }
        return shouldSwitch;
    }
    /**
     * Advance to the next phase and reset timing
     */
    advanceToNextPhase() {
        const oldPhase = this.currentPhase;
        // Call the parent implementation
        super.advanceToNextPhase();
        if (this.enableLogging) {
            this.log(`Advanced from phase ${oldPhase + 1} to phase ${this.currentPhase + 1}`);
        }
    }
    /**
     * Get timing statistics for verification
     * @returns Timing statistics for all phases
     */
    getTimingStatistics() {
        // Calculate average and max deviation
        let totalDeviation = 0;
        let maxDeviation = 0;
        let validPhaseCount = 0;
        for (let i = 0; i < this.totalPhases; i++) {
            if (this.phaseDurations[i] > 0) {
                const deviation = Math.abs(this.phaseDurations[i] - this.phaseTargetDurations[i]);
                totalDeviation += deviation;
                maxDeviation = Math.max(maxDeviation, deviation);
                validPhaseCount++;
            }
        }
        const averageDeviation = validPhaseCount > 0 ? totalDeviation / validPhaseCount : 0;
        return {
            phaseStartTimes: [...this.phaseStartTimes],
            phaseDurations: [...this.phaseDurations],
            phaseTargetDurations: [...this.phaseTargetDurations],
            averageDeviation,
            maxDeviation
        };
    }
    /**
     * Reset all timing statistics
     */
    resetTimingStatistics() {
        this.resetTimingStats();
        if (this.enableLogging) {
            this.log('Timing statistics reset');
        }
    }
    /**
     * Set logging enabled/disabled
     * @param enabled Whether to enable detailed logging
     */
    setLogging(enabled) {
        this.enableLogging = enabled;
        this.configOptions.enableLogging = enabled;
        this.log(`Logging ${enabled ? 'enabled' : 'disabled'}`);
    }
}
exports.FixedTimingStrategy = FixedTimingStrategy;


/***/ }),

/***/ "./src/model/traffic-control/TrafficControlStrategyManager.ts":
/*!********************************************************************!*\
  !*** ./src/model/traffic-control/TrafficControlStrategyManager.ts ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


/**
 * TrafficControlStrategyManager
 *
 * Manages traffic control strategies, allowing for registration, selection,
 * and applying strategies to intersections.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.trafficControlStrategyManager = exports.TrafficControlStrategyManager = void 0;
const FixedTimingStrategy_1 = __webpack_require__(/*! ./FixedTimingStrategy */ "./src/model/traffic-control/FixedTimingStrategy.ts");
const AdaptiveTimingStrategy_1 = __webpack_require__(/*! ./AdaptiveTimingStrategy */ "./src/model/traffic-control/AdaptiveTimingStrategy.ts");
const AllRedFlashingStrategy_1 = __webpack_require__(/*! ./AllRedFlashingStrategy */ "./src/model/traffic-control/AllRedFlashingStrategy.ts");
const TrafficEnforcerStrategy_1 = __webpack_require__(/*! ./TrafficEnforcerStrategy */ "./src/model/traffic-control/TrafficEnforcerStrategy.ts");
/**
 * Manages traffic control strategies in the simulation
 */
class TrafficControlStrategyManager {
    /**
     * Initialize the strategy manager with default strategies
     */
    constructor() {
        /** Available strategies indexed by type */
        this.strategies = new Map();
        /** Currently selected strategy type */
        this.selectedStrategyType = 'fixed-timing';
        // Register all available strategies
        this.registerStrategy('fixed-timing', FixedTimingStrategy_1.FixedTimingStrategy);
        this.registerStrategy('adaptive-timing', AdaptiveTimingStrategy_1.AdaptiveTimingStrategy);
        this.registerStrategy('all-red-flashing', AllRedFlashingStrategy_1.AllRedFlashingStrategy);
        this.registerStrategy('traffic-enforcer', TrafficEnforcerStrategy_1.TrafficEnforcerStrategy);
    }
    /**
     * Register a new traffic control strategy
     * @param type Unique identifier for the strategy
     * @param strategyClass Constructor for the strategy class
     */
    registerStrategy(type, strategyClass) {
        this.strategies.set(type, strategyClass);
    }
    /**
     * Get a list of available strategy types
     */
    getAvailableStrategyTypes() {
        return Array.from(this.strategies.keys());
    }
    /**
     * Set the currently selected strategy
     * @param strategyType The type of strategy to select
     * @returns true if successful, false if the strategy type doesn't exist
     */
    selectStrategy(strategyType) {
        if (this.strategies.has(strategyType)) {
            this.selectedStrategyType = strategyType;
            return true;
        }
        return false;
    }
    /**
     * Get the currently selected strategy type
     */
    getSelectedStrategyType() {
        return this.selectedStrategyType;
    }
    /**
     * Create a new instance of the currently selected strategy
     */
    createStrategy() {
        const StrategyClass = this.strategies.get(this.selectedStrategyType);
        if (!StrategyClass) {
            throw new Error(`Strategy type '${this.selectedStrategyType}' not registered`);
        }
        return new StrategyClass();
    }
    /**
     * Apply the currently selected strategy to an intersection
     * @param intersection The intersection to apply the strategy to
     */
    applyToIntersection(intersection) {
        const strategy = this.createStrategy();
        strategy.initialize(intersection);
        return strategy;
    }
    /**
     * Create a strategy from saved data
     * @param data Serialized strategy data from toJSON
     * @param intersection The intersection to control
     */
    createFromJSON(data, intersection) {
        if (!data || !data.strategyType) {
            // Default to fixed timing if no valid data
            return this.applyToIntersection(intersection);
        }
        const StrategyClass = this.strategies.get(data.strategyType);
        if (!StrategyClass) {
            console.warn(`Strategy type '${data.strategyType}' not found, using default`);
            return this.applyToIntersection(intersection);
        }
        // Create an instance and initialize from data
        const strategy = new StrategyClass();
        return strategy.fromJSON ? strategy.fromJSON(data, intersection) : strategy;
    }
}
exports.TrafficControlStrategyManager = TrafficControlStrategyManager;
// Create a singleton instance
exports.trafficControlStrategyManager = new TrafficControlStrategyManager();


/***/ }),

/***/ "./src/model/traffic-control/TrafficEnforcerStrategy.ts":
/*!**************************************************************!*\
  !*** ./src/model/traffic-control/TrafficEnforcerStrategy.ts ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


/**
 * TrafficEnforcerStrategy
 *
 * Simulates a manual or AI-based traffic enforcer making decisions based on live conditions.
 * This strategy uses heuristics to prioritize lanes with high congestion or emergency situations.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TrafficEnforcerStrategy = void 0;
const AbstractTrafficControlStrategy_1 = __webpack_require__(/*! ./AbstractTrafficControlStrategy */ "./src/model/traffic-control/AbstractTrafficControlStrategy.ts");
/**
 * Traffic enforcer control strategy
 * Simulates a human or AI traffic enforcer making real-time decisions
 */
class TrafficEnforcerStrategy extends AbstractTrafficControlStrategy_1.AbstractTrafficControlStrategy {
    constructor() {
        super();
        this.strategyType = 'traffic-enforcer';
        this.displayName = 'Traffic Enforcer';
        this.description = 'Simulates a traffic enforcer (human or AI) making real-time decisions based on traffic conditions';
        // Track traffic metrics for each approach
        this.queueLengths = [0, 0, 0, 0]; // N, E, S, W
        this.waitTimes = [0, 0, 0, 0]; // N, E, S, W
        this.flowRates = [0, 0, 0, 0]; // N, E, S, W
        this.congestionScores = [0, 0, 0, 0]; // N, E, S, W
        // Current active signals (1 = green, 0 = red) for each approach and movement
        this.currentSignals = [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0] // West
        ];
        // Decision-making parameters
        this.decisionInterval = 5; // seconds between major decisions
        this.timeSinceLastDecision = 0;
        this.minimumGreenTime = 10; // minimum green time for any movement
        this.greenTimers = {}; // track time for each green signal
        this.activeMovements = []; // currently active movements
        // Safety constraint: conflicting movements can't be green simultaneously
        this.conflictMatrix = {
            'N-L': ['E-L', 'E-F', 'S-F', 'S-R', 'W-L', 'W-F'],
            'N-F': ['E-L', 'E-F', 'E-R', 'S-L', 'W-L', 'W-F', 'W-R'],
            'N-R': ['E-F', 'E-R', 'S-L', 'W-L'],
            'E-L': ['N-L', 'N-F', 'S-L', 'S-F', 'W-F', 'W-R'],
            'E-F': ['N-L', 'N-F', 'N-R', 'S-L', 'S-F', 'S-R', 'W-L'],
            'E-R': ['N-F', 'N-R', 'S-L', 'W-L'],
            'S-L': ['N-F', 'N-R', 'E-L', 'E-F', 'W-L', 'W-F'],
            'S-F': ['N-L', 'E-L', 'E-F', 'E-R', 'W-L', 'W-F', 'W-R'],
            'S-R': ['N-L', 'E-F', 'E-R', 'W-L'],
            'W-L': ['N-L', 'N-F', 'N-R', 'E-L', 'E-R', 'S-L', 'S-R'],
            'W-F': ['N-L', 'N-F', 'E-L', 'E-F', 'S-L', 'S-F'],
            'W-R': ['N-F', 'N-R', 'E-L', 'S-F']
        };
        // Enforcer rules and priorities
        this.priorityThreshold = 7; // congestion score above which a movement gets priority
        this.emergencyThreshold = 9; // threshold for emergency intervention
        this.fairnessWindow = 60; // time window (seconds) to ensure fairness
        this.directionHistory = {}; // track time given to each direction
        // Extra priorities that can be set via configuration
        this.prioritizedDirections = []; // directions that get priority (0=N, 1=E, 2=S, 3=W)
        this.prioritizedMovements = []; // specific movements with priority
        this.configOptions = {
            decisionInterval: this.decisionInterval,
            minimumGreenTime: this.minimumGreenTime,
            priorityThreshold: this.priorityThreshold,
            emergencyThreshold: this.emergencyThreshold,
            fairnessWindow: this.fairnessWindow,
            prioritizedDirections: [],
            prioritizedMovements: []
        };
        // Initialize green timers and direction history
        for (let d = 0; d < 4; d++) {
            for (let m = 0; m < 3; m++) {
                this.greenTimers[`${d}-${m}`] = 0;
            }
            this.directionHistory[d.toString()] = 0;
        }
    }
    /**
     * Initialize the strategy with an intersection
     */
    initialize(intersection) {
        super.initialize(intersection);
        // Reset state
        this.resetSignals();
        this.activeMovements = [];
        this.timeSinceLastDecision = 0;
        // Apply configuration
        this.decisionInterval = this.configOptions.decisionInterval || 5;
        this.minimumGreenTime = this.configOptions.minimumGreenTime || 10;
        this.priorityThreshold = this.configOptions.priorityThreshold || 7;
        this.emergencyThreshold = this.configOptions.emergencyThreshold || 9;
        this.fairnessWindow = this.configOptions.fairnessWindow || 60;
        // Set priorities from config
        this.prioritizedDirections = this.configOptions.prioritizedDirections || [];
        this.prioritizedMovements = this.configOptions.prioritizedMovements || [];
        // For non-standard intersections (e.g., T-intersections), adjust the conflict matrix
        if (intersection.roads && intersection.roads.length < 4) {
            this.adjustConflictMatrixForNonStandardIntersection();
        }
    }
    /**
     * Update strategy based on elapsed time and traffic states
     */
    update(delta, trafficStates) {
        // Update internal time tracking
        this.timeSinceLastDecision += delta;
        // Update green timers
        this.updateGreenTimers(delta);
        // Update direction history for fairness tracking
        for (const movement of this.activeMovements) {
            this.directionHistory[movement.direction.toString()] += delta;
        }
        // Process traffic states
        if (trafficStates && trafficStates.length > 0) {
            this.updateTrafficMetrics(trafficStates);
            // Check for emergency conditions that require immediate response
            if (this.checkForEmergencyConditions()) {
                console.log("[Enforcer] Emergency conditions detected, making immediate decision");
                this.makeTrafficDecision();
                this.timeSinceLastDecision = 0;
            }
            // Make normal decisions at regular intervals
            else if (this.timeSinceLastDecision >= this.decisionInterval) {
                this.makeTrafficDecision();
                this.timeSinceLastDecision = 0;
            }
        }
        return this.getCurrentSignalStates();
    }
    /**
     * Get current signal states
     */
    getCurrentSignalStates() {
        return this.currentSignals.map(signals => [...signals]);
    }
    /**
     * Implementation of abstract method
     */
    getSignalStates() {
        return this.getCurrentSignalStates();
    }
    /**
     * Reset the strategy to initial state
     */
    reset() {
        super.reset();
        this.resetSignals();
        this.timeSinceLastDecision = 0;
        this.activeMovements = [];
        // Reset timers and history
        for (let d = 0; d < 4; d++) {
            for (let m = 0; m < 3; m++) {
                this.greenTimers[`${d}-${m}`] = 0;
            }
            this.directionHistory[d.toString()] = 0;
        }
    }
    /**
     * Reset all signals to red
     */
    resetSignals() {
        this.currentSignals = [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0] // West
        ];
    }
    /**
     * Update traffic metrics based on current states
     */
    updateTrafficMetrics(trafficStates) {
        // Update current metrics
        for (let i = 0; i < trafficStates.length; i++) {
            if (i < this.queueLengths.length) {
                this.queueLengths[i] = trafficStates[i].queueLength;
                this.waitTimes[i] = trafficStates[i].averageWaitTime;
                this.flowRates[i] = trafficStates[i].flowRate;
            }
        }
        // Calculate congestion scores
        this.calculateCongestionScores();
    }
    /**
     * Calculate congestion scores for each approach and movement
     */
    calculateCongestionScores() {
        const directionNames = ['North', 'East', 'South', 'West'];
        for (let d = 0; d < 4; d++) {
            // Calculate based on queue length and wait time
            const queueScore = Math.min(10, this.queueLengths[d] / 2);
            const waitScore = Math.min(10, this.waitTimes[d] / 30);
            const flowScore = this.flowRates[d] > 0 ? 10 / Math.max(1, this.flowRates[d]) : 10;
            // Combined score (0-10)
            this.congestionScores[d] = (queueScore * 0.5 + waitScore * 0.3 + flowScore * 0.2);
            // Add priority bonus if this direction is prioritized
            if (this.prioritizedDirections.includes(d)) {
                this.congestionScores[d] += 2;
            }
            // Debug log
            if (this.congestionScores[d] > this.priorityThreshold) {
                console.log(`[Enforcer] ${directionNames[d]} approach has high congestion: ${this.congestionScores[d].toFixed(1)}`);
            }
        }
    }
    /**
     * Check if any green timer has exceeded minimum time
     */
    canSwitchSignals() {
        for (const movement of this.activeMovements) {
            const key = `${movement.direction}-${movement.movement}`;
            if (this.greenTimers[key] < this.minimumGreenTime) {
                return false; // Can't switch yet, minimum green time not met
            }
        }
        return true;
    }
    /**
     * Update timers for green signals
     */
    updateGreenTimers(delta) {
        // Increment timer for each active movement
        for (const movement of this.activeMovements) {
            const key = `${movement.direction}-${movement.movement}`;
            this.greenTimers[key] += delta;
        }
    }
    /**
     * Reset timer for a movement that just turned green
     */
    resetGreenTimer(direction, movement) {
        const key = `${direction}-${movement}`;
        this.greenTimers[key] = 0;
    }
    /**
     * Check if a movement has a priority configuration
     */
    hasConfiguredPriority(direction, movement) {
        return this.prioritizedMovements.some(m => m.direction === direction && m.movement === movement);
    }
    /**
     * Check if activating a movement would create conflicts with current active movements
     */
    wouldCreateConflict(direction, movement) {
        var _a, _b;
        // Get movement key (e.g., "N-L" for North Left)
        const directionCodes = ['N', 'E', 'S', 'W'];
        const movementCodes = ['L', 'F', 'R'];
        const movementKey = `${directionCodes[direction]}-${movementCodes[movement]}`;
        // Check against each active movement
        for (const active of this.activeMovements) {
            const activeKey = `${directionCodes[active.direction]}-${movementCodes[active.movement]}`;
            // If the active movement conflicts with proposed movement, it would create a conflict
            if (((_a = this.conflictMatrix[activeKey]) === null || _a === void 0 ? void 0 : _a.includes(movementKey)) ||
                ((_b = this.conflictMatrix[movementKey]) === null || _b === void 0 ? void 0 : _b.includes(activeKey))) {
                return true;
            }
        }
        return false;
    }
    /**
     * Calculate fairness score based on historical allocation
     * Returns 0-1 value where 0 is completely unfair and 1 is perfectly fair
     */
    calculateFairnessScore() {
        const times = Object.values(this.directionHistory);
        const maxTime = Math.max(...times);
        const minTime = Math.min(...times);
        if (maxTime === 0)
            return 1; // No history yet
        return minTime / maxTime; // Closer to 1 is more fair
    }
    /**
     * Check for emergency conditions that require immediate attention
     */
    checkForEmergencyConditions() {
        // Check for extremely high congestion in any direction
        for (let d = 0; d < 4; d++) {
            if (this.congestionScores[d] >= this.emergencyThreshold) {
                console.log(`[Enforcer] Emergency: Direction ${d} has critical congestion (${this.congestionScores[d].toFixed(1)})`);
                return true;
            }
        }
        // Check for extremely unfair allocation
        const fairnessScore = this.calculateFairnessScore();
        if (fairnessScore < 0.3 && Object.values(this.directionHistory).some(t => t > this.fairnessWindow)) {
            console.log(`[Enforcer] Emergency: Fairness is critically low (${fairnessScore.toFixed(2)})`);
            return true;
        }
        return false;
    }
    /**
     * Make traffic control decision based on current conditions
     * This is where the "enforcer intelligence" logic lives
     */
    makeTrafficDecision() {
        console.log("[Enforcer] Making traffic decision");
        // If we can't switch signals yet due to minimum green time, do nothing
        if (this.activeMovements.length > 0 && !this.canSwitchSignals()) {
            console.log("[Enforcer] Can't switch yet - minimum green time not met");
            return;
        }
        // Step 1: Score each possible movement
        const scores = [];
        const directionNames = ['North', 'East', 'South', 'West'];
        const movementNames = ['Left', 'Forward', 'Right'];
        for (let d = 0; d < 4; d++) {
            // Skip directions that don't exist in this intersection
            if (this.intersection && this.intersection.roads &&
                d >= this.intersection.roads.length) {
                continue;
            }
            for (let m = 0; m < 3; m++) {
                // Base score is the congestion score for this direction
                let score = this.congestionScores[d];
                // Adjust based on wait time for fairness
                const fairnessAdjustment = (1 - (this.directionHistory[d.toString()] /
                    Math.max(...Object.values(this.directionHistory)))) * 3;
                score += fairnessAdjustment;
                // Preference for letting traffic flow forward over turns
                if (m === 1)
                    score += 1; // Small bonus for forward movement
                // Add bonus for configured priorities
                if (this.hasConfiguredPriority(d, m)) {
                    score += 3;
                }
                scores.push({ direction: d, movement: m, score });
            }
        }
        // Sort by score (highest first)
        scores.sort((a, b) => b.score - a.score);
        // Step 2: Select movements to enable based on scores and conflicts
        const newActiveMovements = [];
        const activatedMovements = [];
        for (const candidate of scores) {
            // Skip low-priority movements
            if (candidate.score < this.priorityThreshold / 2)
                continue;
            // Check if this would conflict with any already selected movement
            let hasConflict = false;
            for (const active of newActiveMovements) {
                if (this.wouldCreateConflict(candidate.direction, candidate.movement)) {
                    hasConflict = true;
                    break;
                }
            }
            if (!hasConflict) {
                newActiveMovements.push({
                    direction: candidate.direction,
                    movement: candidate.movement
                });
                activatedMovements.push(candidate);
                console.log(`[Enforcer] Activating ${directionNames[candidate.direction]} ${movementNames[candidate.movement]} (score: ${candidate.score.toFixed(1)})`);
            }
        }
        // If nothing was selected, enable the highest scoring movement regardless
        if (newActiveMovements.length === 0 && scores.length > 0) {
            const best = scores[0];
            newActiveMovements.push({
                direction: best.direction,
                movement: best.movement
            });
            activatedMovements.push(best);
            console.log(`[Enforcer] Forced activation of ${directionNames[best.direction]} ${movementNames[best.movement]} (score: ${best.score.toFixed(1)})`);
        }
        // Step 3: Apply the new signal configuration
        this.resetSignals(); // All red first
        for (const movement of newActiveMovements) {
            // Set signal to green
            this.currentSignals[movement.direction][movement.movement] = 1;
            // Reset the green timer for this movement
            this.resetGreenTimer(movement.direction, movement.movement);
        }
        // Update active movements list
        this.activeMovements = [...newActiveMovements];
        // Log the decision
        console.log(`[Enforcer] New signal state: ${this.activeMovements.length} green signals`);
    }
    /**
     * Adjust conflict matrix for non-standard intersections (e.g., T-junctions)
     */
    adjustConflictMatrixForNonStandardIntersection() {
        // For simplicity, we'll implement a T-intersection case (3 roads)
        // Assuming road 3 (West) is missing
        if (this.intersection && this.intersection.roads && this.intersection.roads.length === 3) {
            // Remove all conflicts related to the missing road
            Object.keys(this.conflictMatrix).forEach(key => {
                if (key.startsWith('W-')) {
                    delete this.conflictMatrix[key];
                }
                else {
                    // Remove the missing road from conflict lists
                    this.conflictMatrix[key] = this.conflictMatrix[key].filter(conflict => !conflict.startsWith('W-'));
                }
            });
            console.log("[Enforcer] Adjusted conflict matrix for T-intersection");
        }
    }
    /**
     * Override updateConfig to handle complex configuration options
     */
    updateConfig(options) {
        super.updateConfig(options);
        // Update specific options
        if (options.decisionInterval !== undefined)
            this.decisionInterval = options.decisionInterval;
        if (options.minimumGreenTime !== undefined)
            this.minimumGreenTime = options.minimumGreenTime;
        if (options.priorityThreshold !== undefined)
            this.priorityThreshold = options.priorityThreshold;
        if (options.emergencyThreshold !== undefined)
            this.emergencyThreshold = options.emergencyThreshold;
        if (options.fairnessWindow !== undefined)
            this.fairnessWindow = options.fairnessWindow;
        // Handle direction priorities (array of numbers)
        if (options.prioritizedDirections !== undefined) {
            this.prioritizedDirections = Array.isArray(options.prioritizedDirections) ?
                options.prioritizedDirections : [];
        }
        // Handle movement priorities (array of objects)
        if (options.prioritizedMovements !== undefined) {
            this.prioritizedMovements = Array.isArray(options.prioritizedMovements) ?
                options.prioritizedMovements : [];
        }
    }
    /**
     * Create this strategy from JSON data
     */
    static fromJSON(data, intersection) {
        const strategy = new TrafficEnforcerStrategy();
        // Restore state from saved data
        strategy.configOptions = data.configOptions || {};
        // Restore enforcer-specific properties
        strategy.decisionInterval = data.decisionInterval || strategy.configOptions.decisionInterval || 5;
        strategy.minimumGreenTime = data.minimumGreenTime || strategy.configOptions.minimumGreenTime || 10;
        strategy.priorityThreshold = data.priorityThreshold || strategy.configOptions.priorityThreshold || 7;
        strategy.emergencyThreshold = data.emergencyThreshold || strategy.configOptions.emergencyThreshold || 9;
        strategy.fairnessWindow = data.fairnessWindow || strategy.configOptions.fairnessWindow || 60;
        strategy.prioritizedDirections = data.prioritizedDirections || strategy.configOptions.prioritizedDirections || [];
        strategy.prioritizedMovements = data.prioritizedMovements || strategy.configOptions.prioritizedMovements || [];
        // Restore signal state if available
        if (data.currentSignals) {
            strategy.currentSignals = data.currentSignals;
        }
        // Restore active movements
        if (data.activeMovements) {
            strategy.activeMovements = data.activeMovements;
        }
        // Restore timers and history
        if (data.greenTimers)
            strategy.greenTimers = data.greenTimers;
        if (data.directionHistory)
            strategy.directionHistory = data.directionHistory;
        if (data.timeSinceLastDecision !== undefined)
            strategy.timeSinceLastDecision = data.timeSinceLastDecision;
        strategy.initialize(intersection);
        return strategy;
    }
    /**
     * Convert to JSON for serialization
     */
    toJSON() {
        return {
            ...super.toJSON(),
            strategyType: this.strategyType,
            decisionInterval: this.decisionInterval,
            minimumGreenTime: this.minimumGreenTime,
            priorityThreshold: this.priorityThreshold,
            emergencyThreshold: this.emergencyThreshold,
            fairnessWindow: this.fairnessWindow,
            prioritizedDirections: this.prioritizedDirections,
            prioritizedMovements: this.prioritizedMovements,
            currentSignals: this.currentSignals,
            activeMovements: this.activeMovements,
            greenTimers: this.greenTimers,
            directionHistory: this.directionHistory,
            timeSinceLastDecision: this.timeSinceLastDecision,
            // Current traffic metrics
            queueLengths: this.queueLengths,
            waitTimes: this.waitTimes,
            flowRates: this.flowRates,
            congestionScores: this.congestionScores
        };
    }
}
exports.TrafficEnforcerStrategy = TrafficEnforcerStrategy;


/***/ }),

/***/ "./src/model/traffic-control/TrafficLightController.ts":
/*!*************************************************************!*\
  !*** ./src/model/traffic-control/TrafficLightController.ts ***!
  \*************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


/**
 * TrafficLightController
 *
 * Manages traffic light control for intersections using pluggable strategies.
 * This class replaces the old ControlSignals class with a more modular approach.
 */
const TrafficControlStrategyManager_1 = __webpack_require__(/*! ./TrafficControlStrategyManager */ "./src/model/traffic-control/TrafficControlStrategyManager.ts");
const kpi_collector_1 = __webpack_require__(/*! ../kpi-collector */ "./src/model/kpi-collector.ts");
class TrafficLightController {
    /**
     * Create a new traffic light controller for an intersection
     */
    constructor(intersection) {
        /** Current simulation time */
        this.time = 0;
        /** Traffic state metrics for each approach */
        this.trafficStates = [];
        /**
         * Update the traffic signals based on elapsed time
         * This is called every tick of the simulation
         */
        this.onTick = (delta) => {
            // Update time
            this.time += delta;
            // Update traffic states with real data from KPI collector
            this.updateTrafficStates();
            // Explicitly update the strategy with the latest traffic states
            // This ensures the strategy has the latest data even if state isn't accessed
            this.strategy.update(delta, this.trafficStates);
        };
        this.intersection = intersection;
        this.strategy = TrafficControlStrategyManager_1.trafficControlStrategyManager.applyToIntersection(intersection);
        this.initializeTrafficStates();
    }
    /**
     * Initialize traffic state tracking for each approach
     */
    initializeTrafficStates() {
        // Create a traffic state for each approach (N, E, S, W)
        this.trafficStates = [0, 1, 2, 3].map(() => ({
            queueLength: 0,
            averageWaitTime: 0,
            maxWaitTime: 0,
            flowRate: 0,
            signalState: [0, 0, 0] // [left, forward, right]
        }));
    }
    /**
     * Create a copy of a traffic light controller
     * Used when deserializing world state
     */
    static copy(controller, intersection) {
        if (!controller) {
            return new TrafficLightController(intersection);
        }
        // Create a proper instance with the correct prototype
        const result = new TrafficLightController(intersection);
        // Copy over basic properties
        result.time = controller.time || 0;
        // Load the strategy from saved data if available
        if (controller.strategy) {
            result.strategy = TrafficControlStrategyManager_1.trafficControlStrategyManager.createFromJSON(controller.strategy, intersection);
        }
        return result;
    }
    /**
     * Convert to a serializable object for storage
     */
    toJSON() {
        return {
            time: this.time,
            strategy: this.strategy.toJSON()
        };
    }
    /**
     * Change the active traffic control strategy
     */
    setStrategy(strategyType) {
        if (TrafficControlStrategyManager_1.trafficControlStrategyManager.selectStrategy(strategyType)) {
            this.strategy = TrafficControlStrategyManager_1.trafficControlStrategyManager.applyToIntersection(this.intersection);
            return true;
        }
        return false;
    }
    /**
     * Get the current active strategy
     */
    getStrategy() {
        return this.strategy;
    }
    /**
     * Get the current traffic light state for all approaches
     * Returns a 2D array: [approach][movement] where:
     * - approach is 0-3 (N, E, S, W)
     * - movement is 0-2 (left, forward, right)
     * - value is 0 (RED) or 1 (GREEN)
     */
    get state() {
        // Return the current state without updating the strategy again
        // The strategy is already updated in onTick
        return this.strategy.getCurrentSignalStates ?
            this.strategy.getCurrentSignalStates() :
            this.strategy.update(0, this.trafficStates);
    }
    /**
     * Update traffic states based on KPI metrics
     * This fetches real-time data from the KPI collector to inform adaptive strategies
     */
    updateTrafficStates() {
        // Get intersection ID for KPI lookups
        const intersectionId = this.intersection.id;
        // Get data from KPI collector
        const metrics = kpi_collector_1.kpiCollector.getMetrics();
        const intersectionMetric = metrics.intersectionMetrics[intersectionId];
        // Get lane metrics for all connected roads
        const connectedLanes = {
            0: [],
            1: [],
            2: [],
            3: [] // West
        };
        // Get road directions from intersection
        // Map lanes to their cardinal directions
        if (this.intersection.roads) {
            this.intersection.roads.forEach((road, index) => {
                // Use index % 4 to map to N, E, S, W (0, 1, 2, 3)
                const direction = index % 4;
                if (road.lanes) {
                    road.lanes.forEach(lane => {
                        if (lane.id && metrics.laneMetrics[lane.id]) {
                            connectedLanes[direction].push(metrics.laneMetrics[lane.id]);
                        }
                    });
                }
            });
        }
        // Update traffic states with real data
        for (let i = 0; i < this.trafficStates.length; i++) {
            // Get combined metrics for this approach
            const lanesToCheck = connectedLanes[i] || [];
            // Aggregate metrics from all lanes for this approach
            let queueLength = 0;
            let totalWaitTime = 0;
            let maxWaitTime = 0;
            let flowRate = 0;
            let count = 0;
            lanesToCheck.forEach(laneMetric => {
                queueLength += laneMetric.queueLength || 0;
                totalWaitTime += laneMetric.averageWaitTime || 0;
                maxWaitTime = Math.max(maxWaitTime, laneMetric.averageWaitTime || 0);
                flowRate += laneMetric.throughput || 0;
                count++;
            });
            // Update traffic state with real data
            this.trafficStates[i].queueLength = queueLength;
            this.trafficStates[i].averageWaitTime = count > 0 ? totalWaitTime / count : 0;
            this.trafficStates[i].maxWaitTime = maxWaitTime;
            this.trafficStates[i].flowRate = flowRate;
            // Copy current signal state
            if (this.state && this.state[i]) {
                this.trafficStates[i].signalState = [...this.state[i]];
            }
            // If intersection metrics exist, use them to enhance our data
            if (intersectionMetric) {
                this.trafficStates[i].queueLength = Math.max(this.trafficStates[i].queueLength, intersectionMetric.averageQueueLength / 4);
            }
        }
    }
}
module.exports = TrafficLightController;


/***/ }),

/***/ "./src/model/traffic-control/tests/AdaptiveTimingStrategyTest.ts":
/*!***********************************************************************!*\
  !*** ./src/model/traffic-control/tests/AdaptiveTimingStrategyTest.ts ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


/**
 * AdaptiveTimingStrategyTest
 *
 * Test suite for the AdaptiveTimingStrategy implementation
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AdaptiveTimingStrategyTest = void 0;
const Intersection = __webpack_require__(/*! ../../intersection */ "./src/model/intersection.ts");
const Rect = __webpack_require__(/*! ../../../geom/rect */ "./src/geom/rect.ts");
const AdaptiveTimingStrategy_1 = __webpack_require__(/*! ../AdaptiveTimingStrategy */ "./src/model/traffic-control/AdaptiveTimingStrategy.ts");
class AdaptiveTimingStrategyTest {
    constructor() {
        // Create a mock intersection
        this.intersection = new Intersection(new Rect(0, 0, 100, 100));
        this.intersection.id = 'test-intersection';
        // Create the strategy
        this.strategy = new AdaptiveTimingStrategy_1.AdaptiveTimingStrategy();
        // Enable logging for tests
        this.strategy.updateConfig({ enableLogging: true });
    }
    /**
     * Run all tests
     */
    runTests() {
        console.log('=== Running AdaptiveTimingStrategy Tests ===');
        let allPassed = true;
        const tests = [
            this.testInitialization,
            this.testNoTrafficDefaultBehavior,
            this.testLightTrafficBehavior,
            this.testHeavyTrafficBehavior,
            this.testImbalancedTrafficBehavior,
            this.testRushHourTrafficBehavior,
            this.testConfigOptions,
            this.testSerialization
        ];
        for (const test of tests) {
            try {
                console.log(`\nRunning: ${test.name}`);
                const passed = test.call(this);
                console.log(`${test.name}: ${passed ? 'PASSED' : 'FAILED'}`);
                allPassed = allPassed && passed;
            }
            catch (e) {
                console.error(`Test ${test.name} FAILED with error:`, e);
                allPassed = false;
            }
        }
        console.log(`\nFinal result: ${allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);
        return allPassed;
    }
    /**
     * Test basic initialization
     */
    testInitialization() {
        this.setup();
        // Check that strategy initialized properly
        return this.strategy.strategyType === 'adaptive-timing' &&
            this.strategy.getCurrentPhase() === 0;
    }
    /**
     * Test behavior with no traffic
     */
    testNoTrafficDefaultBehavior() {
        this.setup();
        // Simulate 30 seconds with no traffic
        const states = this.createTrafficStates([0, 0, 0, 0], [0, 0, 0, 0]);
        // Should behave like fixed timing
        let phaseChanged = false;
        let totalTime = 0;
        const timeStep = 1.0; // 1 second steps
        // Run for up to 120 seconds
        for (let i = 0; i < 120 && !phaseChanged; i++) {
            this.strategy.update(timeStep, states);
            totalTime += timeStep;
            // Check if phase changed
            if (this.strategy.getCurrentPhase() !== 0) {
                phaseChanged = true;
            }
        }
        console.log(`Phase changed after ${totalTime}s with no traffic`);
        // Should change at around the base duration (default is 30s)
        const baseTime = this.strategy.getConfigOptions().baseDuration;
        // Allow 20% tolerance
        return phaseChanged && Math.abs(totalTime - baseTime) < (baseTime * 0.2);
    }
    /**
     * Test behavior with light traffic
     */
    testLightTrafficBehavior() {
        this.setup();
        // Light traffic on all approaches
        const queueLengths = [1, 1, 1, 1];
        const waitTimes = [5, 5, 5, 5];
        const states = this.createTrafficStates(queueLengths, waitTimes);
        // Should adjust slightly from base timing
        let phaseChanged = false;
        let totalTime = 0;
        const timeStep = 1.0;
        // Run for up to 120 seconds
        for (let i = 0; i < 120 && !phaseChanged; i++) {
            this.strategy.update(timeStep, states);
            totalTime += timeStep;
            if (this.strategy.getCurrentPhase() !== 0) {
                phaseChanged = true;
            }
        }
        console.log(`Phase changed after ${totalTime}s with light traffic`);
        // Should be slightly longer than base
        const baseTime = this.strategy.getConfigOptions().baseDuration;
        return phaseChanged && totalTime > baseTime && totalTime < baseTime * 1.5;
    }
    /**
     * Test behavior with heavy traffic
     */
    testHeavyTrafficBehavior() {
        this.setup();
        // Heavy traffic on all approaches
        const queueLengths = [5, 5, 5, 5];
        const waitTimes = [20, 20, 20, 20];
        const states = this.createTrafficStates(queueLengths, waitTimes);
        // Should extend phase to closer to max duration
        let phaseChanged = false;
        let totalTime = 0;
        const timeStep = 1.0;
        // Run for up to 120 seconds
        for (let i = 0; i < 120 && !phaseChanged; i++) {
            this.strategy.update(timeStep, states);
            totalTime += timeStep;
            if (this.strategy.getCurrentPhase() !== 0) {
                phaseChanged = true;
            }
        }
        console.log(`Phase changed after ${totalTime}s with heavy traffic`);
        // Should be longer, close to max
        const baseTime = this.strategy.getConfigOptions().baseDuration;
        const maxTime = this.strategy.getConfigOptions().maxPhaseDuration;
        // Should be at least 50% of the way from base to max
        const expectedMinTime = baseTime + (maxTime - baseTime) * 0.5;
        return phaseChanged && totalTime >= expectedMinTime;
    }
    /**
     * Test behavior with imbalanced traffic
     */
    testImbalancedTrafficBehavior() {
        this.setup();
        // Start with balanced light traffic
        let queueLengths = [1, 1, 1, 1];
        let waitTimes = [5, 5, 5, 5];
        let states = this.createTrafficStates(queueLengths, waitTimes);
        // Run for a while to establish baseline
        for (let i = 0; i < 10; i++) {
            this.strategy.update(1.0, states);
        }
        // Now create imbalance - heavy traffic on next phase (E-W)
        queueLengths = [1, 5, 1, 5]; // Higher on East-West (indices 1 & 3)
        waitTimes = [5, 25, 5, 25]; // Higher on East-West
        states = this.createTrafficStates(queueLengths, waitTimes);
        // Should switch earlier than normal
        let phaseChanged = false;
        let totalTime = 0;
        const timeStep = 1.0;
        // Run for up to 120 seconds
        for (let i = 0; i < 120 && !phaseChanged; i++) {
            this.strategy.update(timeStep, states);
            totalTime += timeStep;
            if (this.strategy.getCurrentPhase() !== 0) {
                phaseChanged = true;
            }
        }
        console.log(`Phase changed after ${totalTime}s with imbalanced traffic`);
        // Should switch earlier than base time due to high demand in next phase
        const baseTime = this.strategy.getConfigOptions().baseDuration;
        return phaseChanged && totalTime < baseTime * 0.9;
    }
    /**
     * Test behavior with rush hour traffic pattern
     */
    testRushHourTrafficBehavior() {
        this.setup();
        // First test: consistent high demand on North-South (current phase)
        let queueLengths = [5, 1, 5, 1]; // High on N-S (indices 0 & 2)
        let waitTimes = [20, 5, 20, 5]; // High on N-S
        let states = this.createTrafficStates(queueLengths, waitTimes);
        // Should extend the phase
        let phaseChanged = false;
        let totalTime = 0;
        const timeStep = 1.0;
        // Run for up to 120 seconds
        for (let i = 0; i < 120 && !phaseChanged; i++) {
            this.strategy.update(timeStep, states);
            totalTime += timeStep;
            if (this.strategy.getCurrentPhase() !== 0) {
                phaseChanged = true;
            }
        }
        console.log(`Phase 1 changed after ${totalTime}s with rush hour traffic (N-S)`);
        // Now advance to E-W phase (phase 3)
        this.strategy.update(timeStep, states); // Phase 1
        this.strategy.update(timeStep, states); // Phase 2
        // Reset metrics
        phaseChanged = false;
        totalTime = 0;
        // Run with low traffic on E-W (current phase)
        queueLengths = [5, 1, 5, 1]; // Still high on N-S, low on E-W
        waitTimes = [20, 5, 20, 5];
        states = this.createTrafficStates(queueLengths, waitTimes);
        // Should shorten the phase for E-W since demand is low
        for (let i = 0; i < 120 && !phaseChanged; i++) {
            this.strategy.update(timeStep, states);
            totalTime += timeStep;
            if (this.strategy.getCurrentPhase() !== 2) { // Check phase 3 changed
                phaseChanged = true;
            }
        }
        console.log(`Phase 3 changed after ${totalTime}s with rush hour traffic (low E-W)`);
        // Should change quickly since there's low traffic on current phase but high on next
        const minTime = this.strategy.getConfigOptions().minPhaseDuration;
        const baseTime = this.strategy.getConfigOptions().baseDuration;
        // Should be closer to minimum than base
        return phaseChanged && totalTime < (minTime + baseTime) / 2;
    }
    /**
     * Test configuration options
     */
    testConfigOptions() {
        this.setup();
        // Update configuration
        const testConfig = {
            minPhaseDuration: 8,
            maxPhaseDuration: 45,
            baseDuration: 25,
            trafficSensitivity: 0.8,
            queueWeight: 1.5,
            waitTimeWeight: 0.7
        };
        this.strategy.updateConfig(testConfig);
        // Check that config was applied
        const config = this.strategy.getConfigOptions();
        return config.minPhaseDuration === 8 &&
            config.maxPhaseDuration === 45 &&
            config.baseDuration === 25 &&
            config.trafficSensitivity === 0.8 &&
            config.queueWeight === 1.5 &&
            config.waitTimeWeight === 0.7;
    }
    /**
     * Test serialization and deserialization
     */
    testSerialization() {
        this.setup();
        // Update configuration with non-default values
        this.strategy.updateConfig({
            minPhaseDuration: 8,
            maxPhaseDuration: 45,
            trafficSensitivity: 0.8,
            enableLogging: true
        });
        // Run for a bit to accumulate some history
        const states = this.createTrafficStates([3, 1, 3, 1], [15, 5, 15, 5]);
        for (let i = 0; i < 15; i++) {
            this.strategy.update(1.0, states);
        }
        // Serialize
        const json = this.strategy.toJSON();
        // Deserialize
        const newStrategy = AdaptiveTimingStrategy_1.AdaptiveTimingStrategy.fromJSON(json, this.intersection);
        // Check that key properties match
        return newStrategy.strategyType === this.strategy.strategyType &&
            newStrategy.getConfigOptions().minPhaseDuration === 8 &&
            newStrategy.getConfigOptions().maxPhaseDuration === 45 &&
            newStrategy.getConfigOptions().trafficSensitivity === 0.8 &&
            newStrategy.getConfigOptions().enableLogging === true;
    }
    /**
     * Helper to create traffic states for testing
     */
    createTrafficStates(queueLengths, waitTimes) {
        const states = [];
        for (let i = 0; i < 4; i++) {
            states.push({
                queueLength: queueLengths[i] || 0,
                averageWaitTime: waitTimes[i] || 0,
                maxWaitTime: waitTimes[i] * 1.5 || 0,
                flowRate: queueLengths[i] > 0 ? queueLengths[i] / 2 : 0,
                signalState: [0, 0, 0] // Placeholder, updated by strategy
            });
        }
        return states;
    }
    /**
     * Reset for a new test
     */
    setup() {
        this.strategy = new AdaptiveTimingStrategy_1.AdaptiveTimingStrategy();
        this.strategy.initialize(this.intersection);
        this.strategy.updateConfig({ enableLogging: true });
    }
}
exports.AdaptiveTimingStrategyTest = AdaptiveTimingStrategyTest;
// Export the test class
exports["default"] = AdaptiveTimingStrategyTest;


/***/ }),

/***/ "./src/model/traffic-control/tests/FixedTimingStrategyTest.ts":
/*!********************************************************************!*\
  !*** ./src/model/traffic-control/tests/FixedTimingStrategyTest.ts ***!
  \********************************************************************/
/***/ ((module, exports, __webpack_require__) => {

/* module decorator */ module = __webpack_require__.nmd(module);

/**
 * FixedTimingStrategy Tests
 *
 * This file contains tests for the FixedTimingStrategy to verify its behavior
 * and timing accuracy.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.runFixedTimingStrategyTests = exports.FixedTimingStrategyTest = void 0;
const Intersection = __webpack_require__(/*! ../../intersection */ "./src/model/intersection.ts");
const Rect = __webpack_require__(/*! ../../../geom/rect */ "./src/geom/rect.ts");
const FixedTimingStrategy_1 = __webpack_require__(/*! ../FixedTimingStrategy */ "./src/model/traffic-control/FixedTimingStrategy.ts");
/**
 * Simple test utility to verify FixedTimingStrategy behavior
 */
class FixedTimingStrategyTest {
    constructor() {
        this.testResults = [];
        // Create a test intersection
        this.intersection = new Intersection(new Rect(0, 0, 100, 100));
        // Create the strategy
        this.strategy = new FixedTimingStrategy_1.FixedTimingStrategy();
        this.strategy.initialize(this.intersection);
        // Enable logging for the strategy
        this.strategy.setLogging(true);
    }
    /**
     * Run all tests
     */
    runAllTests() {
        console.log('=== Running FixedTimingStrategy Tests ===');
        this.testInitialization();
        this.testPhaseTransitions();
        this.testTimingAccuracy();
        this.testConfigChanges();
        this.testSerializationDeserialization();
        // Report results
        this.reportResults();
    }
    /**
     * Test basic initialization
     */
    testInitialization() {
        try {
            // Check strategy has correct number of phases
            const totalPhases = this.strategy.getTotalPhases();
            this.assert(totalPhases > 0, 'Initialization', `Strategy should have phases defined (found ${totalPhases})`);
            // Check current phase is 0
            const currentPhase = this.strategy.getCurrentPhase();
            this.assert(currentPhase === 0, 'Initialization', `Initial phase should be 0 (found ${currentPhase})`);
            // Check config options
            const config = this.strategy.getConfigOptions();
            this.assert(config.baseDuration > 0, 'Initialization', `Base duration should be positive (found ${config.baseDuration})`);
        }
        catch (error) {
            this.fail('Initialization', `Unexpected error: ${error}`);
        }
    }
    /**
     * Test phase transitions
     */
    testPhaseTransitions() {
        try {
            // Reset the strategy
            this.strategy.reset();
            // Check initial phase
            const initialPhase = this.strategy.getCurrentPhase();
            this.assert(initialPhase === 0, 'PhaseTransitions', `Initial phase should be 0 (found ${initialPhase})`);
            // Get config and set base duration to 1 second for quicker tests
            const config = this.strategy.getConfigOptions();
            config.baseDuration = 1;
            config.variationPercentage = 0; // No variation for predictable tests
            this.strategy.updateConfig(config);
            // Get initial signal states
            const initialStates = this.strategy.update(0);
            // Advance time by just under 1 second
            this.strategy.update(0.9);
            const samePhaseStates = this.strategy.update(0);
            // Check we're still in the same phase
            this.assert(this.strategy.getCurrentPhase() === initialPhase, 'PhaseTransitions', `Should remain in phase ${initialPhase} after 0.9s`);
            // Signal states should be the same
            this.assert(JSON.stringify(initialStates) === JSON.stringify(samePhaseStates), 'PhaseTransitions', 'Signal states should be unchanged within the same phase');
            // Advance time beyond the phase duration
            this.strategy.update(0.2);
            // Check we've moved to the next phase
            const totalPhases = this.strategy.getTotalPhases();
            const expectedPhase = totalPhases > 1 ? 1 : 0;
            this.assert(this.strategy.getCurrentPhase() === expectedPhase, 'PhaseTransitions', `Should advance to phase ${expectedPhase} after exceeding duration`);
            // Signal states should be different if we have multiple phases
            if (totalPhases > 1) {
                const newStates = this.strategy.update(0);
                this.assert(JSON.stringify(initialStates) !== JSON.stringify(newStates), 'PhaseTransitions', 'Signal states should change between phases');
            }
        }
        catch (error) {
            this.fail('PhaseTransitions', `Unexpected error: ${error}`);
        }
    }
    /**
     * Test timing accuracy
     */
    testTimingAccuracy() {
        try {
            // Reset the strategy
            this.strategy.reset();
            this.strategy.resetTimingStatistics();
            // Get config and set base duration to 1 second for quicker tests
            const config = this.strategy.getConfigOptions();
            config.baseDuration = 1;
            config.variationPercentage = 0; // No variation for predictable tests
            this.strategy.updateConfig(config);
            // Run for multiple phases
            const phasesToTest = 3;
            const totalPhases = this.strategy.getTotalPhases();
            const actualPhases = Math.min(phasesToTest, totalPhases);
            console.log(`Testing timing accuracy over ${actualPhases} phases...`);
            for (let i = 0; i < actualPhases; i++) {
                // Small increments to simulate real-time updates
                for (let time = 0; time < 1.1; time += 0.1) {
                    this.strategy.update(0.1);
                }
            }
            // Get timing statistics
            const stats = this.strategy.getTimingStatistics();
            // Check average deviation is within 10%
            this.assert(stats.averageDeviation < 0.1, 'TimingAccuracy', `Average timing deviation should be less than 0.1s (found ${stats.averageDeviation.toFixed(3)}s)`);
            // Check max deviation is within 20%
            this.assert(stats.maxDeviation < 0.2, 'TimingAccuracy', `Max timing deviation should be less than 0.2s (found ${stats.maxDeviation.toFixed(3)}s)`);
        }
        catch (error) {
            this.fail('TimingAccuracy', `Unexpected error: ${error}`);
        }
    }
    /**
     * Test configuration changes
     */
    testConfigChanges() {
        try {
            // Reset the strategy
            this.strategy.reset();
            // Get initial config
            const initialConfig = this.strategy.getConfigOptions();
            // Update config
            const newConfig = {
                ...initialConfig,
                baseDuration: 2,
                variationPercentage: 0
            };
            this.strategy.updateConfig(newConfig);
            // Check config was updated
            const updatedConfig = this.strategy.getConfigOptions();
            this.assert(updatedConfig.baseDuration === 2, 'ConfigChanges', `Base duration should be updated to 2 (found ${updatedConfig.baseDuration})`);
            // Check timing is affected by config change
            // Run for one phase
            let phaseChanged = false;
            let initialPhase = this.strategy.getCurrentPhase();
            // Should NOT change phase after 1 second (new duration is 2 seconds)
            for (let time = 0; time < 1.1; time += 0.1) {
                this.strategy.update(0.1);
                if (this.strategy.getCurrentPhase() !== initialPhase) {
                    phaseChanged = true;
                }
            }
            this.assert(!phaseChanged, 'ConfigChanges', 'Phase should not change before the new duration');
            // Should change phase after another second
            phaseChanged = false;
            for (let time = 0; time < 1.1; time += 0.1) {
                this.strategy.update(0.1);
                if (this.strategy.getCurrentPhase() !== initialPhase) {
                    phaseChanged = true;
                }
            }
            // Only assert if we have more than one phase
            if (this.strategy.getTotalPhases() > 1) {
                this.assert(phaseChanged, 'ConfigChanges', 'Phase should change after the new duration');
            }
        }
        catch (error) {
            this.fail('ConfigChanges', `Unexpected error: ${error}`);
        }
    }
    /**
     * Test serialization and deserialization
     */
    testSerializationDeserialization() {
        try {
            // Reset the strategy
            this.strategy.reset();
            // Update config for a unique test value
            const testConfig = {
                baseDuration: 3.5,
                variationPercentage: 2.5,
                testValue: 'test123'
            };
            this.strategy.updateConfig(testConfig);
            // Set a specific phase
            while (this.strategy.getCurrentPhase() !== 1 % this.strategy.getTotalPhases()) {
                this.strategy.update(10); // Force phase change
            }
            // Serialize
            const serialized = this.strategy.toJSON();
            // Create a new strategy from the serialized data
            const newStrategy = FixedTimingStrategy_1.FixedTimingStrategy.fromJSON(serialized, this.intersection);
            // Check deserialized properties
            this.assert(newStrategy.getCurrentPhase() === this.strategy.getCurrentPhase(), 'Serialization', `Current phase should be preserved (expected ${this.strategy.getCurrentPhase()}, got ${newStrategy.getCurrentPhase()})`);
            // Check config was preserved
            const deserializedConfig = newStrategy.getConfigOptions();
            this.assert(deserializedConfig.baseDuration === testConfig.baseDuration, 'Serialization', `Base duration should be preserved (expected ${testConfig.baseDuration}, got ${deserializedConfig.baseDuration})`);
            this.assert(deserializedConfig.testValue === testConfig.testValue, 'Serialization', `Custom config values should be preserved (expected ${testConfig.testValue}, got ${deserializedConfig.testValue})`);
        }
        catch (error) {
            this.fail('Serialization', `Unexpected error: ${error}`);
        }
    }
    /**
     * Assert a condition and record the result
     */
    assert(condition, testName, message) {
        this.testResults.push({
            name: testName,
            passed: condition,
            message: message
        });
        if (!condition) {
            console.error(`❌ FAILED: ${testName} - ${message}`);
        }
    }
    /**
     * Record a failed test
     */
    fail(testName, message) {
        this.testResults.push({
            name: testName,
            passed: false,
            message: message
        });
        console.error(`❌ FAILED: ${testName} - ${message}`);
    }
    /**
     * Report test results
     */
    reportResults() {
        const total = this.testResults.length;
        const passed = this.testResults.filter(r => r.passed).length;
        console.log('=== FixedTimingStrategy Test Results ===');
        console.log(`Total Tests: ${total}`);
        console.log(`Passed: ${passed}`);
        console.log(`Failed: ${total - passed}`);
        const uniqueTests = [...new Set(this.testResults.map(r => r.name))];
        uniqueTests.forEach(testName => {
            const testsForName = this.testResults.filter(r => r.name === testName);
            const passedForName = testsForName.filter(r => r.passed).length;
            console.log(`\n${testName}: ${passedForName}/${testsForName.length} passed`);
            testsForName.filter(r => !r.passed).forEach(failed => {
                console.error(`  ❌ ${failed.message}`);
            });
        });
        console.log('\n=== End of Test Results ===');
    }
}
exports.FixedTimingStrategyTest = FixedTimingStrategyTest;
/**
 * Run the tests if this file is executed directly
 */
function runFixedTimingStrategyTests() {
    const tester = new FixedTimingStrategyTest();
    tester.runAllTests();
}
exports.runFixedTimingStrategyTests = runFixedTimingStrategyTests;
// If running directly from Node.js
if (typeof window === 'undefined' && __webpack_require__.c[__webpack_require__.s] === module) {
    runFixedTimingStrategyTests();
}


/***/ }),

/***/ "./src/model/traffic-control/tests/TestRunner.ts":
/*!*******************************************************!*\
  !*** ./src/model/traffic-control/tests/TestRunner.ts ***!
  \*******************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


/**
 * Test Runner
 *
 * This file exports a test runner that can be used to run tests from the browser console.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.testRunner = exports.TrafficControlTestRunner = void 0;
const FixedTimingStrategyTest_1 = __webpack_require__(/*! ./FixedTimingStrategyTest */ "./src/model/traffic-control/tests/FixedTimingStrategyTest.ts");
const AdaptiveTimingStrategyTest_1 = __importDefault(__webpack_require__(/*! ./AdaptiveTimingStrategyTest */ "./src/model/traffic-control/tests/AdaptiveTimingStrategyTest.ts"));
const TrafficEnforcerStrategyTest_1 = __importDefault(__webpack_require__(/*! ./TrafficEnforcerStrategyTest */ "./src/model/traffic-control/tests/TrafficEnforcerStrategyTest.ts"));
const TrafficLightControllerTest_1 = __importDefault(__webpack_require__(/*! ./TrafficLightControllerTest */ "./src/model/traffic-control/tests/TrafficLightControllerTest.ts"));
/**
 * Test runner for traffic control strategies
 */
class TrafficControlTestRunner {
    /**
     * Run all tests
     */
    runAllTests() {
        console.log('=== Running Traffic Control Tests ===');
        this.runTrafficLightControllerTests(); // Run controller tests first
        this.runFixedTimingTests();
        this.runAdaptiveTimingTests();
        this.runTrafficEnforcerTests();
        console.log('=== All Tests Completed ===');
    }
    /**
     * Run traffic light controller tests
     */
    runTrafficLightControllerTests() {
        console.log('\n=== Traffic Light Controller Tests ===');
        const tester = new TrafficLightControllerTest_1.default();
        tester.runTests();
    }
    /**
     * Run fixed timing strategy tests
     */
    runFixedTimingTests() {
        console.log('\n=== Fixed Timing Strategy Tests ===');
        (0, FixedTimingStrategyTest_1.runFixedTimingStrategyTests)();
    }
    /**
     * Run adaptive timing strategy tests
     */
    runAdaptiveTimingTests() {
        console.log('\n=== Adaptive Timing Strategy Tests ===');
        const tester = new AdaptiveTimingStrategyTest_1.default();
        tester.runTests();
    }
    /**
     * Run traffic enforcer strategy tests
     */
    runTrafficEnforcerTests() {
        console.log('\n=== Traffic Enforcer Strategy Tests ===');
        const tester = new TrafficEnforcerStrategyTest_1.default();
        tester.runTests();
    }
}
exports.TrafficControlTestRunner = TrafficControlTestRunner;
// Export a singleton instance
exports.testRunner = new TrafficControlTestRunner();


/***/ }),

/***/ "./src/model/traffic-control/tests/TrafficEnforcerStrategyTest.ts":
/*!************************************************************************!*\
  !*** ./src/model/traffic-control/tests/TrafficEnforcerStrategyTest.ts ***!
  \************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


/**
 * TrafficEnforcerStrategyTest
 *
 * Test suite for the TrafficEnforcerStrategy implementation
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TrafficEnforcerStrategyTest = void 0;
const Intersection = __webpack_require__(/*! ../../intersection */ "./src/model/intersection.ts");
const Rect = __webpack_require__(/*! ../../../geom/rect */ "./src/geom/rect.ts");
const TrafficEnforcerStrategy_1 = __webpack_require__(/*! ../TrafficEnforcerStrategy */ "./src/model/traffic-control/TrafficEnforcerStrategy.ts");
class TrafficEnforcerStrategyTest {
    constructor() {
        // Create a mock intersection
        this.intersection = new Intersection(new Rect(0, 0, 100, 100));
        this.intersection.id = 'test-intersection';
        // Create the strategy
        this.strategy = new TrafficEnforcerStrategy_1.TrafficEnforcerStrategy();
        // Configure for testing
        this.strategy.updateConfig({
            decisionInterval: 2,
            minimumGreenTime: 3 // Shorter minimum green time for testing
        });
        this.strategy.initialize(this.intersection);
    }
    /**
     * Run all tests
     */
    runTests() {
        console.log('=== Running TrafficEnforcerStrategy Tests ===');
        let allPassed = true;
        const tests = [
            this.testInitialization,
            this.testBasicDecisionMaking,
            this.testConflictAvoidance,
            this.testPriorityHandling,
            this.testEmergencyConditions,
            this.testFairnessHandling,
            this.testSerialization
        ];
        for (const test of tests) {
            try {
                console.log(`\nRunning: ${test.name}`);
                const passed = test.call(this);
                console.log(`${test.name}: ${passed ? 'PASSED' : 'FAILED'}`);
                allPassed = allPassed && passed;
            }
            catch (e) {
                console.error(`Test ${test.name} FAILED with error:`, e);
                allPassed = false;
            }
        }
        console.log(`\nFinal result: ${allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);
        return allPassed;
    }
    /**
     * Test basic initialization
     */
    testInitialization() {
        this.setup();
        // Check that strategy initialized properly
        const initialState = this.strategy.getCurrentSignalStates();
        // All signals should start as red
        const allRed = initialState.every(direction => direction.every(signal => signal === 0));
        return this.strategy.strategyType === 'traffic-enforcer' && allRed;
    }
    /**
     * Test basic decision-making
     */
    testBasicDecisionMaking() {
        this.setup();
        // Simulate traffic in North direction
        const states = this.createTrafficStates([5, 0, 0, 0], [20, 0, 0, 0]);
        // Run for a few seconds to trigger decision making
        for (let i = 0; i < 10; i++) {
            this.strategy.update(1.0, states);
        }
        // Check that at least one signal in the North direction is green
        const currentState = this.strategy.getCurrentSignalStates();
        const northSignal = currentState[0]; // North direction
        const northHasGreen = northSignal.some(signal => signal === 1);
        if (!northHasGreen) {
            console.log("Expected North direction to have at least one green signal");
            console.log("Current state:", currentState);
            return false;
        }
        return true;
    }
    /**
     * Test that conflicting movements aren't allowed simultaneously
     */
    testConflictAvoidance() {
        this.setup();
        // Heavy congestion in all directions
        const states = this.createTrafficStates([10, 10, 10, 10], [30, 30, 30, 30]);
        // Run for enough time to make several decisions
        for (let i = 0; i < 20; i++) {
            this.strategy.update(1.0, states);
        }
        // Check current state
        const currentState = this.strategy.getCurrentSignalStates();
        // Define conflicting pairs to check
        // We'll check a few key conflicts: 
        // 1. North-South vs East-West through movements
        // 2. Left turns vs opposing through movements
        const conflicts = [
            { dir1: 0, mov1: 1, dir2: 1, mov2: 1 },
            { dir1: 0, mov1: 0, dir2: 2, mov2: 1 },
            { dir1: 1, mov1: 0, dir2: 3, mov2: 1 }, // E-left vs W-straight
        ];
        // Check each conflict pair
        for (const conflict of conflicts) {
            const signal1 = currentState[conflict.dir1][conflict.mov1];
            const signal2 = currentState[conflict.dir2][conflict.mov2];
            if (signal1 === 1 && signal2 === 1) {
                console.log(`Conflict detected: Direction ${conflict.dir1} movement ${conflict.mov1} and Direction ${conflict.dir2} movement ${conflict.mov2} are both green`);
                console.log("Current state:", currentState);
                return false;
            }
        }
        return true;
    }
    /**
     * Test priority handling
     */
    testPriorityHandling() {
        this.setup();
        // Configure priorities
        this.strategy.updateConfig({
            prioritizedDirections: [1],
            prioritizedMovements: [{ direction: 1, movement: 1 }] // East straight movement
        });
        // Equal congestion in all directions
        const states = this.createTrafficStates([5, 5, 5, 5], [15, 15, 15, 15]);
        // Run for enough time to make a decision
        for (let i = 0; i < 10; i++) {
            this.strategy.update(1.0, states);
        }
        // Check that East direction has been prioritized
        const currentState = this.strategy.getCurrentSignalStates();
        const eastSignal = currentState[1]; // East direction
        const eastStraightIsGreen = eastSignal[1] === 1; // Check if straight movement is green
        if (!eastStraightIsGreen) {
            console.log("Expected East straight movement to be prioritized");
            console.log("Current state:", currentState);
            return false;
        }
        return true;
    }
    /**
     * Test emergency conditions
     */
    testEmergencyConditions() {
        this.setup();
        // Configure emergency threshold
        this.strategy.updateConfig({
            emergencyThreshold: 8 // Lower threshold for testing
        });
        // First, establish some baseline with moderate congestion
        let states = this.createTrafficStates([3, 3, 3, 3], [10, 10, 10, 10]);
        for (let i = 0; i < 5; i++) {
            this.strategy.update(1.0, states);
        }
        // Record initial state
        const initialState = this.strategy.getCurrentSignalStates();
        // Now create emergency in North direction
        states = this.createTrafficStates([15, 3, 3, 3], [45, 10, 10, 10]);
        // Should trigger immediate decision
        this.strategy.update(1.0, states);
        // Check that North direction has green signal after emergency
        const currentState = this.strategy.getCurrentSignalStates();
        const northSignal = currentState[0]; // North direction
        const northHasGreen = northSignal.some(signal => signal === 1);
        if (!northHasGreen) {
            console.log("Expected North direction to have green signal after emergency");
            console.log("Current state:", currentState);
            return false;
        }
        return true;
    }
    /**
     * Test fairness handling
     */
    testFairnessHandling() {
        this.setup();
        // First give a lot of green time to North direction
        let states = this.createTrafficStates([10, 1, 1, 1], [30, 5, 5, 5]);
        for (let i = 0; i < 30; i++) {
            this.strategy.update(1.0, states);
        }
        // Now equalize congestion but South has been neglected
        states = this.createTrafficStates([5, 5, 5, 5], [15, 15, 15, 15]);
        // Run for enough time to make several decisions
        for (let i = 0; i < 20; i++) {
            this.strategy.update(1.0, states);
        }
        // Check that South direction gets green time due to fairness
        const currentState = this.strategy.getCurrentSignalStates();
        let southGreenObserved = false;
        // We'd need to run the simulation longer to guarantee South gets green,
        // but for test purposes, we'll just check if South has green now
        if (currentState[2].some(signal => signal === 1)) {
            southGreenObserved = true;
        }
        return southGreenObserved;
    }
    /**
     * Test serialization and deserialization
     */
    testSerialization() {
        this.setup();
        // Configure with non-default values
        this.strategy.updateConfig({
            decisionInterval: 7,
            prioritizedDirections: [2],
            priorityThreshold: 6
        });
        // Establish some state
        const states = this.createTrafficStates([5, 3, 8, 2], [15, 10, 25, 8]);
        for (let i = 0; i < 10; i++) {
            this.strategy.update(1.0, states);
        }
        // Serialize
        const json = this.strategy.toJSON();
        // Deserialize
        const newStrategy = TrafficEnforcerStrategy_1.TrafficEnforcerStrategy.fromJSON(json, this.intersection);
        // Check that key properties match
        const matchesType = newStrategy.strategyType === 'traffic-enforcer';
        const matchesInterval = newStrategy.getConfigOptions().decisionInterval === 7;
        const matchesPriorities = Array.isArray(newStrategy.getConfigOptions().prioritizedDirections) &&
            newStrategy.getConfigOptions().prioritizedDirections.includes(2);
        const matchesThreshold = newStrategy.getConfigOptions().priorityThreshold === 6;
        // Also check that signal states were preserved
        const originalState = this.strategy.getCurrentSignalStates();
        const newState = newStrategy.getCurrentSignalStates();
        const signalsMatch = JSON.stringify(originalState) === JSON.stringify(newState);
        return matchesType && matchesInterval && matchesPriorities &&
            matchesThreshold && signalsMatch;
    }
    /**
     * Helper to create traffic states for testing
     */
    createTrafficStates(queueLengths, waitTimes) {
        const states = [];
        for (let i = 0; i < 4; i++) {
            states.push({
                queueLength: queueLengths[i] || 0,
                averageWaitTime: waitTimes[i] || 0,
                maxWaitTime: waitTimes[i] * 1.5 || 0,
                flowRate: queueLengths[i] > 0 ? queueLengths[i] / 2 : 0,
                signalState: [0, 0, 0] // Placeholder, updated by strategy
            });
        }
        return states;
    }
    /**
     * Reset for a new test
     */
    setup() {
        this.strategy = new TrafficEnforcerStrategy_1.TrafficEnforcerStrategy();
        this.strategy.updateConfig({
            decisionInterval: 2,
            minimumGreenTime: 3 // Shorter minimum green time for testing
        });
        this.strategy.initialize(this.intersection);
    }
}
exports.TrafficEnforcerStrategyTest = TrafficEnforcerStrategyTest;
// Export the test class
exports["default"] = TrafficEnforcerStrategyTest;


/***/ }),

/***/ "./src/model/traffic-control/tests/TrafficLightControllerTest.ts":
/*!***********************************************************************!*\
  !*** ./src/model/traffic-control/tests/TrafficLightControllerTest.ts ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


/**
 * TrafficLightControllerTest
 *
 * Test suite for the TrafficLightController class and its integration with strategies.
 * Tests that switching strategies changes control behavior and that the system
 * remains stable and efficient.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TrafficLightControllerTest = void 0;
const Intersection = __webpack_require__(/*! ../../intersection */ "./src/model/intersection.ts");
const Rect = __webpack_require__(/*! ../../../geom/rect */ "./src/geom/rect.ts");
const TrafficLightController = __webpack_require__(/*! ../TrafficLightController */ "./src/model/traffic-control/TrafficLightController.ts");
const TrafficControlStrategyManager_1 = __webpack_require__(/*! ../TrafficControlStrategyManager */ "./src/model/traffic-control/TrafficControlStrategyManager.ts");
class TrafficLightControllerTest {
    constructor() {
        // Create a mock intersection
        this.intersection = new Intersection(new Rect(0, 0, 100, 100));
        this.intersection.id = 'test-intersection';
        // Create the controller
        this.controller = new TrafficLightController(this.intersection);
    }
    /**
     * Run all tests
     */
    runTests() {
        console.log('=== Running TrafficLightController Tests ===');
        let allPassed = true;
        const tests = [
            this.testInitialization,
            this.testStrategySwitch,
            this.testDefaultStrategy,
            this.testStateAccess,
            this.testStrategyIntegration,
            this.testSerialization,
            this.testDifferentBehaviors
        ];
        for (const test of tests) {
            try {
                console.log(`\nRunning: ${test.name}`);
                const passed = test.call(this);
                console.log(`${test.name}: ${passed ? 'PASSED' : 'FAILED'}`);
                allPassed = allPassed && passed;
            }
            catch (e) {
                console.error(`Test ${test.name} FAILED with error:`, e);
                allPassed = false;
            }
        }
        console.log(`\nFinal result: ${allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);
        return allPassed;
    }
    /**
     * Test basic initialization
     */
    testInitialization() {
        // Check that controller initializes properly with default strategy
        const initialState = this.controller.state;
        // State should be a 4x3 array (4 approaches, 3 movements per approach)
        const isValidState = initialState.length === 4 &&
            initialState.every(approach => approach.length === 3);
        // Check that traffic states were initialized
        const hasTrafficStates = Array.isArray(this.controller['trafficStates']) &&
            this.controller['trafficStates'].length === 4;
        return isValidState && hasTrafficStates;
    }
    /**
     * Test strategy switching
     */
    testStrategySwitch() {
        // Get current strategy type
        const initialStrategyType = this.controller.getStrategy().strategyType;
        // Find a different strategy to switch to
        const availableTypes = TrafficControlStrategyManager_1.trafficControlStrategyManager.getAvailableStrategyTypes();
        const differentType = availableTypes.find(type => type !== initialStrategyType);
        if (!differentType) {
            console.error("Couldn't find a different strategy to switch to");
            return false;
        }
        // Switch to different strategy
        const switchSuccess = this.controller.setStrategy(differentType);
        if (!switchSuccess) {
            console.error(`Failed to switch to strategy ${differentType}`);
            return false;
        }
        // Verify that strategy changed
        const newStrategyType = this.controller.getStrategy().strategyType;
        return newStrategyType === differentType && newStrategyType !== initialStrategyType;
    }
    /**
     * Test that a default strategy is always active
     */
    testDefaultStrategy() {
        // Create a new controller
        const controller = new TrafficLightController(this.intersection);
        // Strategy should exist and have a valid type
        const strategy = controller.getStrategy();
        return !!strategy &&
            typeof strategy.strategyType === 'string' &&
            strategy.strategyType.length > 0;
    }
    /**
     * Test state access
     */
    testStateAccess() {
        // Get state
        const state = this.controller.state;
        // State should be a 4x3 array with valid values (0 or 1)
        const isValidState = state.length === 4 &&
            state.every(approach => approach.length === 3 &&
                approach.every(signal => signal === 0 || signal === 1));
        return isValidState;
    }
    /**
     * Test that controller correctly integrates with strategies
     */
    testStrategyIntegration() {
        // Set fixed timing strategy
        this.controller.setStrategy('fixed-timing');
        // Update a few times
        for (let i = 0; i < 5; i++) {
            this.controller.onTick(1.0);
        }
        // Get state after updates
        const state1 = this.controller.state;
        // Save phase info
        const phase1 = this.controller.getStrategy().getCurrentPhase();
        // Update a lot more to trigger phase change
        for (let i = 0; i < 30; i++) {
            this.controller.onTick(1.0);
        }
        // Get state after more updates
        const state2 = this.controller.state;
        // Phase should have changed
        const phase2 = this.controller.getStrategy().getCurrentPhase();
        // Either phase or state should be different
        const phaseDifferent = phase1 !== phase2;
        const stateDifferent = JSON.stringify(state1) !== JSON.stringify(state2);
        return phaseDifferent || stateDifferent;
    }
    /**
     * Test serialization and deserialization
     */
    testSerialization() {
        // Configure with non-default strategy
        this.controller.setStrategy('adaptive-timing');
        // Update a bit to establish state
        for (let i = 0; i < 5; i++) {
            this.controller.onTick(1.0);
        }
        // Serialize
        const json = this.controller.toJSON();
        // Deserialize
        const newController = TrafficLightController.copy(json, this.intersection);
        // Check that the strategy type matches
        const originalType = this.controller.getStrategy().strategyType;
        const newType = newController.getStrategy().strategyType;
        return originalType === newType;
    }
    /**
     * Test that different strategies produce different behaviors
     */
    testDifferentBehaviors() {
        const trafficStates = this.createHighTrafficStates();
        // Test with fixed timing strategy
        this.controller.setStrategy('fixed-timing');
        const fixedStates = [];
        for (let i = 0; i < 50; i++) {
            this.controller.onTick(1.0);
            // Only record every 10th state to reduce noise
            if (i % 10 === 0) {
                fixedStates.push(JSON.parse(JSON.stringify(this.controller.state)));
            }
        }
        // Test with adaptive timing strategy
        this.controller.setStrategy('adaptive-timing');
        const adaptiveStates = [];
        for (let i = 0; i < 50; i++) {
            // Update traffic states
            this.updateControllerTrafficStates(trafficStates);
            this.controller.onTick(1.0);
            // Only record every 10th state to reduce noise
            if (i % 10 === 0) {
                adaptiveStates.push(JSON.parse(JSON.stringify(this.controller.state)));
            }
        }
        // Test with enforcer strategy
        this.controller.setStrategy('traffic-enforcer');
        const enforcerStates = [];
        for (let i = 0; i < 50; i++) {
            // Update traffic states
            this.updateControllerTrafficStates(trafficStates);
            this.controller.onTick(1.0);
            // Only record every 10th state to reduce noise
            if (i % 10 === 0) {
                enforcerStates.push(JSON.parse(JSON.stringify(this.controller.state)));
            }
        }
        // Compare states between strategies
        // We expect at least some differences between the strategies
        let fixedVsAdaptiveDifferent = false;
        let fixedVsEnforcerDifferent = false;
        let adaptiveVsEnforcerDifferent = false;
        for (let i = 0; i < Math.min(fixedStates.length, adaptiveStates.length, enforcerStates.length); i++) {
            if (JSON.stringify(fixedStates[i]) !== JSON.stringify(adaptiveStates[i])) {
                fixedVsAdaptiveDifferent = true;
            }
            if (JSON.stringify(fixedStates[i]) !== JSON.stringify(enforcerStates[i])) {
                fixedVsEnforcerDifferent = true;
            }
            if (JSON.stringify(adaptiveStates[i]) !== JSON.stringify(enforcerStates[i])) {
                adaptiveVsEnforcerDifferent = true;
            }
        }
        // All strategy pairs should have at least one difference
        return fixedVsAdaptiveDifferent && fixedVsEnforcerDifferent && adaptiveVsEnforcerDifferent;
    }
    /**
     * Helper method to create traffic states with high traffic volume
     */
    createHighTrafficStates() {
        // Create traffic states with high volume in North direction
        return [
            { queueLength: 10, averageWaitTime: 30, maxWaitTime: 50, flowRate: 5, signalState: [0, 0, 0] },
            { queueLength: 2, averageWaitTime: 5, maxWaitTime: 10, flowRate: 8, signalState: [0, 0, 0] },
            { queueLength: 3, averageWaitTime: 10, maxWaitTime: 15, flowRate: 7, signalState: [0, 0, 0] },
            { queueLength: 1, averageWaitTime: 3, maxWaitTime: 5, flowRate: 10, signalState: [0, 0, 0] }
        ];
    }
    /**
     * Helper method to update controller traffic states
     */
    updateControllerTrafficStates(states) {
        // Update controller's traffic states directly
        // This is a bit of a hack, but it's the easiest way to test strategies
        if (this.controller['trafficStates']) {
            for (let i = 0; i < states.length; i++) {
                if (i < this.controller['trafficStates'].length) {
                    this.controller['trafficStates'][i].queueLength = states[i].queueLength;
                    this.controller['trafficStates'][i].averageWaitTime = states[i].averageWaitTime;
                    this.controller['trafficStates'][i].maxWaitTime = states[i].maxWaitTime;
                    this.controller['trafficStates'][i].flowRate = states[i].flowRate;
                }
            }
        }
    }
}
exports.TrafficLightControllerTest = TrafficLightControllerTest;
// Export the test class
exports["default"] = TrafficLightControllerTest;


/***/ }),

/***/ "./src/settings.ts":
/*!*************************!*\
  !*** ./src/settings.ts ***!
  \*************************/
/***/ ((module) => {


const settings = {
    colors: {
        background: '#97a1a1',
        redLight: 'hsl(0, 100%, 50%)',
        greenLight: '#85ee00',
        intersection: '#586970',
        road: '#586970',
        roadMarking: '#bbb',
        hoveredIntersection: '#3d4c53',
        tempRoad: '#aaa',
        gridPoint: '#586970',
        grid1: 'rgba(255, 255, 255, 0.5)',
        grid2: 'rgba(220, 220, 220, 0.5)',
        hoveredGrid: '#f4e8e1'
    },
    fps: 30,
    lightsFlipInterval: 160,
    gridSize: 14,
    defaultTimeFactor: 5
};
module.exports = settings;


/***/ }),

/***/ "./src/test-runner.ts":
/*!****************************!*\
  !*** ./src/test-runner.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


/**
 * Manual test script for traffic control strategies
 * Run this in the browser console to test the refactored traffic control system
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
// Import the test runner
const TestRunner_1 = __webpack_require__(/*! ./model/traffic-control/tests/TestRunner */ "./src/model/traffic-control/tests/TestRunner.ts");
// Run all tests
function runTests() {
    console.log("Starting traffic control tests...");
    TestRunner_1.testRunner.runAllTests();
}
// Export for browser access
window.runTrafficTests = runTests;
// Log instructions
console.log("Run traffic control tests by calling runTrafficTests() in the browser console");


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			loaded: false,
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = __webpack_module_cache__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/node module decorator */
/******/ 	(() => {
/******/ 		__webpack_require__.nmd = (module) => {
/******/ 			module.paths = [];
/******/ 			if (!module.children) module.children = [];
/******/ 			return module;
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// module cache are used so entry inlining is disabled
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	var __webpack_exports__ = __webpack_require__(__webpack_require__.s = "./src/test-runner.ts");
/******/ 	
/******/ })()
;
//# sourceMappingURL=tests.js.map