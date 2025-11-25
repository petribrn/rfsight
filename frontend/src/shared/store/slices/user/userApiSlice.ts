import { ApiRoutes } from '../../../ts/enums';
import { normalizeApiError } from '../../../ts/helpers';
import {
  IRegisterUserPayload,
  IUpdateUserPayload,
} from '../../../ts/interfaces';
import { DefaultResponse, UserInfo, UserRow } from '../../../ts/types';
import { apiSlice } from '../api/apiSlice';

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    registerNewUser: builder.mutation<DefaultResponse, IRegisterUserPayload>({
      query: (newUserInfo) => ({
        url: ApiRoutes.Register,
        method: 'POST',
        body: newUserInfo,
      }),
      invalidatesTags: ['User'],
      transformErrorResponse(baseQueryReturnValue) {
        return normalizeApiError(baseQueryReturnValue);
      },
    }),
    updateUser: builder.mutation<DefaultResponse, IUpdateUserPayload>({
      query: (updateUserPayload) => ({
        url: `${ApiRoutes.Users}/${updateUserPayload.id}/edit`,
        method: 'PATCH',
        body: updateUserPayload.updateUserData,
      }),
      transformErrorResponse(baseQueryReturnValue) {
        return normalizeApiError(baseQueryReturnValue);
      },
    }),
    getUserInfoPostAuth: builder.mutation<UserInfo, string>({
      query: (username) => ({
        url: `${ApiRoutes.Users}/${username}`,
        method: 'GET',
        credentials: 'include',
      }),
      transformErrorResponse(baseQueryReturnValue) {
        return normalizeApiError(baseQueryReturnValue);
      },
    }),
    getUserInfo: builder.query<UserInfo, string>({
      query: (username) => ({
        url: `${ApiRoutes.Users}/${username}`,
        method: 'GET',
        credentials: 'include',
      }),
      providesTags: ['User'],
      transformErrorResponse(baseQueryReturnValue) {
        return normalizeApiError(baseQueryReturnValue);
      },
    }),
    getAllUsers: builder.query<Array<UserRow>, void>({
      query: () => ({
        url: `${ApiRoutes.Users}`,
        method: 'GET',
        credentials: 'include',
      }),
      providesTags: ['User'],
      transformErrorResponse(baseQueryReturnValue) {
        return normalizeApiError(baseQueryReturnValue);
      },
    }),
    removeUser: builder.mutation<DefaultResponse, string>({
      query: (userId) => ({
        url: `${ApiRoutes.Users}/${userId}/delete`,
        method: 'DELETE',
        credentials: 'include',
      }),
      invalidatesTags: ['User'],
      transformErrorResponse(baseQueryReturnValue) {
        return normalizeApiError(baseQueryReturnValue);
      },
    }),
  }),
});

export const {
  useRegisterNewUserMutation,
  useGetUserInfoPostAuthMutation,
  useUpdateUserMutation,
  useGetAllUsersQuery,
  useGetUserInfoQuery,
  useRemoveUserMutation
} = userApiSlice;
