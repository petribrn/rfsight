import { ApiRoutes } from '../../../ts/enums';
import { normalizeApiError } from '../../../ts/helpers';
import {
  IAuthResponse,
  IForgotPasswdPayload,
  ILoginPayload,
  IRefreshResponse,
  IResetPasswdPayload,
} from '../../../ts/interfaces';
import { DefaultResponse } from '../../../ts/types';
import { apiSlice } from '../api/apiSlice';

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<IAuthResponse, ILoginPayload>({
      query: (credentials) => {
        const bodyFormData = new FormData();
        bodyFormData.append('username', credentials.username);
        bodyFormData.append('password', credentials.password);
        return {
          url: ApiRoutes.Login,
          method: 'POST',
          body: bodyFormData,
        };
      },
      transformErrorResponse(baseQueryReturnValue) {
        return normalizeApiError(baseQueryReturnValue);
      },
    }),
    refresh: builder.mutation<IRefreshResponse, void>({
      query: () => ({
        url: ApiRoutes.Refresh,
        credentials: 'include',
        method: 'GET',
      }),
      transformErrorResponse(baseQueryReturnValue) {
        return normalizeApiError(baseQueryReturnValue);
      },
    }),
    forgotPassword: builder.mutation<DefaultResponse, IForgotPasswdPayload>({
      query: (forgotPasswdPayload) => ({
        url: ApiRoutes.ForgotPassword,
        method: 'POST',
        body: forgotPasswdPayload,
      }),
      transformErrorResponse(baseQueryReturnValue) {
        return normalizeApiError(baseQueryReturnValue);
      },
    }),
    resetPassword: builder.mutation<DefaultResponse, IResetPasswdPayload>({
      query: (resetPasswdPayload) => ({
        url: ApiRoutes.ResetPassword,
        method: 'POST',
        body: resetPasswdPayload,
      }),
      transformErrorResponse(baseQueryReturnValue) {
        return normalizeApiError(baseQueryReturnValue);
      },
    }),
    logout: builder.mutation<DefaultResponse, void>({
      query: () => ({
        url: ApiRoutes.Logout,
        credentials: 'include',
        method: 'GET',
      }),
      transformErrorResponse(baseQueryReturnValue) {
        return normalizeApiError(baseQueryReturnValue);
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useRefreshMutation,
  useLogoutMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApiSlice;
