import { ApiRoutes } from '../../../ts/enums';
import { normalizeApiError } from '../../../ts/helpers';
import {
  IDetailedOrganization,
  INewOrganizationPayload,
  IOrgUpdate,
  IOrganization,
} from '../../../ts/interfaces';
import {
  DefaultResponse,
  NewOrganizationResponse,
  OrganizationCollection,
} from '../../../ts/types';
import { apiSlice } from '../api/apiSlice';

export const orgApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createNewOrganization: builder.mutation<
      NewOrganizationResponse,
      INewOrganizationPayload
    >({
      query: (newOrganizationPayload) => {
        return {
          url: `${ApiRoutes.Organizations}/new`,
          method: 'POST',
          credentials: 'include',
          body: newOrganizationPayload,
        };
      },
      invalidatesTags: ['Organization'],
      transformErrorResponse(baseQueryReturnValue) {
        return normalizeApiError(baseQueryReturnValue);
      },
    }),
    getOrganizationById: builder.query<IOrganization, string>({
      query: (organizationId) => {
        return {
          url: `${ApiRoutes.Organizations}/${organizationId}`,
          credentials: 'include',
          method: 'GET',
        };
      },
      transformErrorResponse(baseQueryReturnValue) {
        return normalizeApiError(baseQueryReturnValue);
      },
    }),
    getDetailedOrganizationById: builder.query<IDetailedOrganization, string>({
      query: (organizationId) => {
        return {
          url: `${ApiRoutes.Organizations}/detailed-info/${organizationId}`,
          credentials: 'include',
          method: 'GET',
        };
      },
      transformErrorResponse(baseQueryReturnValue) {
        return normalizeApiError(baseQueryReturnValue);
      },
    }),
    getUserOrganization: builder.query<IOrganization, string>({
      query: (userId) => {
        return {
          url: `${ApiRoutes.Users}/${userId}/organization`,
          credentials: 'include',
          method: 'GET',
        };
      },
      transformErrorResponse(baseQueryReturnValue) {
        return normalizeApiError(baseQueryReturnValue);
      },
    }),
    getUserOrganizationPostAuth: builder.mutation<IOrganization, string>({
      query: (userId) => {
        return {
          url: `${ApiRoutes.Users}/${userId}/organization`,
          credentials: 'include',
          method: 'GET',
        };
      },
      transformErrorResponse(baseQueryReturnValue) {
        return normalizeApiError(baseQueryReturnValue);
      },
    }),
    getAllOrganizations: builder.query<OrganizationCollection, void>({
      query: () => {
        return {
          url: ApiRoutes.Organizations,
          credentials: 'include',
          method: 'GET',
        };
      },
      providesTags: ['Organization'],
      transformErrorResponse(baseQueryReturnValue) {
        return normalizeApiError(baseQueryReturnValue);
      },
    }),
    changeOrganizationName: builder.mutation<DefaultResponse, IOrgUpdate>({
      query: (orgUpdatePayload) => {
        return {
          url: `${ApiRoutes.Organizations}/${orgUpdatePayload.organizationId}/edit`,
          method: 'POST',
          credentials: 'include',
          body: {
            name: orgUpdatePayload.name,
          },
        };
      },
      transformErrorResponse(baseQueryReturnValue) {
        return normalizeApiError(baseQueryReturnValue);
      },
    }),
  }),
});

export const {
  useGetUserOrganizationQuery,
  useGetDetailedOrganizationByIdQuery,
  useChangeOrganizationNameMutation,
  useGetAllOrganizationsQuery,
  useCreateNewOrganizationMutation,
  useGetOrganizationByIdQuery,
  useGetUserOrganizationPostAuthMutation
} = orgApiSlice;
