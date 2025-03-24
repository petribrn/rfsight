/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BaseQueryApi,
  FetchArgs,
  createApi,
  fetchBaseQuery,
} from '@reduxjs/toolkit/query/react';
import { ApiRoutes, backendUrl } from '../../../ts/enums';
import { IRefreshResponse } from '../../../ts/interfaces';
import type { RootState } from '../../store';
import { logOut, setCredentials } from '../auth/authSlice';

const baseQuery = fetchBaseQuery({
  baseUrl: backendUrl,
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const { token } = (getState() as RootState).auth;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReAuth = async (
  args: FetchArgs,
  api: BaseQueryApi,
  extraOptions: object
) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error?.status === 403) {
    const refreshResult = await baseQuery(ApiRoutes.Refresh, api, extraOptions);

    if (refreshResult.data) {
      const refreshData = refreshResult.data as IRefreshResponse;
      const { username } = (api.getState() as RootState).auth;
      api.dispatch(
        setCredentials({
          token: refreshData.accessToken,
          username: username || refreshData.username,
        })
      );
      result = await baseQuery(args, api, extraOptions);
    } else {
      api.dispatch(logOut());
    }
  }
  return result;
};

export const apiSlice = createApi({
  baseQuery: baseQueryWithReAuth,
  keepUnusedDataFor: 15,
  endpoints: (_builder) => ({}),
  tagTypes: ['User', 'Organization', 'Network', 'Device'],
});
