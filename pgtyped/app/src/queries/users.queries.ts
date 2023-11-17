/** Types generated for queries found in "src/queries/users.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'SelectAll' parameters type */
export type ISelectAllParams = void;

/** 'SelectAll' return type */
export interface ISelectAllResult {
  age: number | null;
  name: string;
  userId: number;
}

/** 'SelectAll' query type */
export interface ISelectAllQuery {
  params: ISelectAllParams;
  result: ISelectAllResult;
}

const selectAllIR: any = {"usedParamSet":{},"params":[],"statement":"SELECT * FROM users"};

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM users
 * ```
 */
export const selectAll = new PreparedQuery<ISelectAllParams,ISelectAllResult>(selectAllIR);


/** 'SelectOne' parameters type */
export interface ISelectOneParams {
  userId?: number | null | void;
}

/** 'SelectOne' return type */
export interface ISelectOneResult {
  age: number | null;
  name: string;
  userId: number;
}

/** 'SelectOne' query type */
export interface ISelectOneQuery {
  params: ISelectOneParams;
  result: ISelectOneResult;
}

const selectOneIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":false,"transform":{"type":"scalar"},"locs":[{"a":36,"b":42}]}],"statement":"SELECT * FROM users WHERE user_id = :userId"};

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM users WHERE user_id = :userId
 * ```
 */
export const selectOne = new PreparedQuery<ISelectOneParams,ISelectOneResult>(selectOneIR);


/** 'Insert' parameters type */
export interface IInsertParams {
  age?: number | null | void;
  name?: string | null | void;
}

/** 'Insert' return type */
export interface IInsertResult {
  age: number | null;
  name: string;
  userId: number;
}

/** 'Insert' query type */
export interface IInsertQuery {
  params: IInsertParams;
  result: IInsertResult;
}

const insertIR: any = {"usedParamSet":{"name":true,"age":true},"params":[{"name":"name","required":false,"transform":{"type":"scalar"},"locs":[{"a":38,"b":42}]},{"name":"age","required":false,"transform":{"type":"scalar"},"locs":[{"a":45,"b":48}]}],"statement":"INSERT INTO users (name, age) VALUES (:name, :age) RETURNING *"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO users (name, age) VALUES (:name, :age) RETURNING *
 * ```
 */
export const insert = new PreparedQuery<IInsertParams,IInsertResult>(insertIR);


