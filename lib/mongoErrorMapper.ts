// Centralized Mongo/Mongoose error mapper to consistent API responses
// Detects duplicate key errors (single and bulk), validation errors, and generic cases

export type ApiError = {
  status: number;
  body: Record<string, unknown>;
};

type DuplicateKeyInfo = {
  fields: string[];
  keyValue?: Record<string, unknown>;
};

type UnknownRecord = Record<string, unknown>;

/**
 * Determines whether a value is a non-null object that can be treated as an UnknownRecord.
 *
 * @returns `true` if `value` is an object and not `null`, `false` otherwise.
 */
function isRecord(value: unknown): value is UnknownRecord {
  return !!value && typeof value === 'object';
}

/**
 * Retrieve a property's value if it is a string.
 *
 * @returns The string value of `obj[key]` if it is a string, `undefined` otherwise.
 */
function getStringProp(obj: UnknownRecord, key: string): string | undefined {
  const v = obj[key];
  return typeof v === 'string' ? v : undefined;
}

/**
 * Retrieve a numeric property from a record if present.
 *
 * @param obj - The record to read the property from
 * @param key - The property name to retrieve
 * @returns The property's numeric value if `obj[key]` is a number, `undefined` otherwise
 */
function getNumberProp(obj: UnknownRecord, key: string): number | undefined {
  const v = obj[key];
  return typeof v === 'number' ? v : undefined;
}

/**
 * Retrieve an object-valued property from a record.
 *
 * @param obj - Source record to read the property from
 * @param key - Property name to retrieve
 * @returns The property's value as a record if it is a non-null object, `undefined` otherwise
 */
function getRecordProp(obj: UnknownRecord, key: string): UnknownRecord | undefined {
  const v = obj[key];
  return isRecord(v) ? v : undefined;
}

/**
 * Get the property at `key` as an array if present.
 *
 * @param obj - The record to read the property from
 * @param key - The property name to retrieve
 * @returns The array value of the property, or `undefined` if the property is missing or not an array
 */
function getArrayProp(obj: UnknownRecord, key: string): unknown[] | undefined {
  const v = obj[key];
  return Array.isArray(v) ? v : undefined;
}

/**
 * Extracts the names of fields that caused a duplicate-key error and optional key/value pairs from a Mongo/Mongoose error object.
 *
 * The function looks for duplicate-key information in `keyValue`, in `writeErrors` (bulk operations), or by parsing a `dup key` pattern in the error `message`. If no field names can be determined, it returns a fallback field name `['unique field']`.
 *
 * @param errObj - The MongoDB/Mongoose error record to inspect (may contain `keyValue`, `writeErrors`, or a `message` with a dup key fragment)
 * @returns An object with `fields` (the names of fields that caused the duplicate) and an optional `keyValue` map of field -> duplicated value when available
 */
function extractDuplicateFields(errObj: UnknownRecord): DuplicateKeyInfo {
  // Mongoose duplicate error usually has code 11000 and keyValue
  const keyValue = getRecordProp(errObj, 'keyValue');
  if (keyValue) {
    return { fields: Object.keys(keyValue), keyValue };
  }

  // BulkWriteError may have writeErrors array
  const writeErrors = getArrayProp(errObj, 'writeErrors');
  if (writeErrors?.length) {
    const fields = new Set<string>();
    const aggregateKeyValue: Record<string, unknown> = {};

    for (const we of writeErrors) {
      if (!isRecord(we)) continue;
      const weErr = getRecordProp(we, 'err');
      if (!weErr) continue;

      const weKeyValue = getRecordProp(weErr, 'keyValue');
      if (!weKeyValue) continue;

      Object.assign(aggregateKeyValue, weKeyValue);
      Object.keys(weKeyValue).forEach((k) => fields.add(k));
    }

    return {
      fields: Array.from(fields),
      keyValue: Object.keys(aggregateKeyValue).length ? aggregateKeyValue : undefined,
    };
  }

  // Try parse from message e.g., E11000 duplicate key error collection: db.coll index: slug_1 dup key: { slug: "xyz" }
  const msg = String(getStringProp(errObj, 'message') ?? '');
  const match = msg.match(/dup key:\s*\{\s*([^}]+)\s*}/i);
  if (match?.[1]) {
    const parts = match[1].split(',').map((s) => s.trim());
    const fields: string[] = [];

    for (const p of parts) {
      const kv = p.split(':');
      if (kv[0]) fields.push(kv[0].trim());
    }

    return { fields: fields.length ? fields : ['unique field'] };
  }

  return { fields: ['unique field'] };
}

/**
 * Map a MongoDB/Mongoose error object to a standardized ApiError suitable for HTTP responses.
 *
 * Recognizes duplicate-key (unique index) errors, validation errors, and cast errors and
 * converts them into structured response bodies with appropriate HTTP status codes.
 *
 * @param err - The error value thrown by MongoDB/Mongoose to map
 * @returns An ApiError with `status` and `body` describing the mapped error, or `null` if the error is not mappable
 */
export function mapMongoError(err: unknown): ApiError | null {
  if (!isRecord(err)) return null;

  const code = getNumberProp(err, 'code');
  const message = getStringProp(err, 'message');
  const name = getStringProp(err, 'name');

  // Duplicate key (unique index) errors
  if (code === 11000 || /E11000/i.test(String(message ?? ''))) {
    const { fields, keyValue } = extractDuplicateFields(err);
    const fieldList = fields.join(', ');

    return {
      status: 409,
      body: {
        message: `Duplicate value for unique field(s): ${fieldList}`,
        fields,
        keyValue,
        code: 'DUPLICATE_KEY',
      },
    };
  }

  // Validation errors
  if (name === 'ValidationError') {
    const errorsObj = getRecordProp(err, 'errors');
    const errors = errorsObj
      ? Object.values(errorsObj).map((e) => {
          if (isRecord(e) && typeof e.message === 'string') return e.message;
          return String(e);
        })
      : [];

    return {
      status: 400,
      body: {
        message: 'Validation failed',
        errors,
        code: 'VALIDATION_ERROR',
      },
    };
  }

  // Cast errors (e.g., invalid ObjectId)
  if (name === 'CastError') {
    return {
      status: 400,
      body: {
        message: (message ?? 'Invalid value provided') as string,
        path: err.path,
        value: err.value,
        code: 'CAST_ERROR',
      },
    };
  }

  return null;
}