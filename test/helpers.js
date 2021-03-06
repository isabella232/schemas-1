/*
 * Copyright (c) 2015, Joyent, Inc.
 */

var fmt = require('util').format;
var mod_jsonschema = require('json-schema');


var MESSAGES = {
	missing: 'is missing and it is required',
	objStr: typeMsg('object', 'string'),
	strArr: typeMsg('string', 'array'),
	strInt: typeMsg('string', 'integer'),
	strObj: typeMsg('string', 'object'),
	/* BEGIN JSSTYLED */
	uuid: 'does not match the regex pattern ^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
	v4addr: 'does not match the regex pattern ^(?:(?:\\d|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5])\\.){3}(?:\\d|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5])$',
	netname: 'does not match the regex pattern ^[a-zA-Z][a-zA-Z0-9_\\./-]{1,255}$'
	/* END JSSTYLED */
};


/**
 * Return a "x is required" error
 */
function errMissing(param) {
	return ({ 'property': param, 'message': MESSAGES.missing });
}


/**
 * Validate using the schema, and expect a single error
 */
function expectSingleValidationError(t, schema, input, param, errMsg) {
	expectValidationErrors(t, schema, input, [
			{ 'property': param, 'message': errMsg }
		]);
}


/**
 * Validate using the schema, and expect success
 */
function expectSuccess(t, schema, input) {
	var res = mod_jsonschema.validate(input, schema);
	t.ok(res.valid, 'valid');
	t.deepEqual(res.errors, [], 'no errors');
}


/**
 * Validate using the schema, and expect errors
 */
function expectValidationErrors(t, schema, input, errs) {
	var res = mod_jsonschema.validate(input, schema);
	t.ok(!res.valid, 'invalid');
	t.deepEqual(res.errors.sort(function (a, b) {
		return ((a.property > b.property) ? 1 : -1);
	}), errs, 'errors');
}


/**
 * Return a "type is required" message
 */
function typeMsg(found, required) {
	return (fmt('%s value found, but a %s is required', found, required));
}


/**
 * Do a simple sanity check validation on all schemas exported by `schema`.
 */
function validateAllSchemas(schema, t) {
	for (var s in schema) {
		var res = mod_jsonschema.validate(schema[s]);
		t.deepEqual(res, { valid: true, errors: [] }, s + ': result');
	}

	t.end();
}


module.exports = {
	errMissing: errMissing,
	expectValidationErrors: expectValidationErrors,
	expectSingleValidationError: expectSingleValidationError,
	expectSuccess: expectSuccess,
	msg: MESSAGES,
	validateAll: validateAllSchemas
};
