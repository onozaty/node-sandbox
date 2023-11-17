/** Types generated for queries found in "src/queries/users.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'SelectAll' parameters type */
export type ISelectAllParams = void;

/** 'SelectAll' return type */
export interface ISelectAllResult {
  name: string | null;
  user_id: number;
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
  name: string | null;
  user_id: number;
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
  user: {
    name: string | null | void
  };
}

/** 'Insert' return type */
export interface IInsertResult {
  user_id: number;
}

/** 'Insert' query type */
export interface IInsertQuery {
  params: IInsertParams;
  result: IInsertResult;
}

const insertIR: any = {"usedParamSet":{"user":true},"params":[{"name":"user","required":false,"transform":{"type":"pick_tuple","keys":[{"name":"name","required":false}]},"locs":[{"a":32,"b":36}]}],"statement":"INSERT INTO users (name) VALUES :user RETURNING user_id"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO users (name) VALUES :user RETURNING user_id
 * ```
 */
export const insert = new PreparedQuery<IInsertParams,IInsertResult>(insertIR);


