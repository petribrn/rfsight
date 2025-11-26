import { ApiRoutes } from '../../../ts/enums';
import { normalizeApiError } from '../../../ts/helpers';
import {
  INetworkUpdatePayload,
  INewNetworkPayload,
} from '../../../ts/interfaces';
import {
  DefaultResponse,
  NetworkCollection,
  NetworkData,
} from '../../../ts/types';
import { apiSlice } from '../api/apiSlice';

export const networkApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createNewNetwork: builder.mutation<DefaultResponse, INewNetworkPayload>({
      query: (newNetworkPayload) => {
        return {
          url: `${ApiRoutes.Networks}/new`,
          method: 'POST',
          credentials: 'include',
          body: newNetworkPayload,
        };
      },
      invalidatesTags: ['Network'],
      transformErrorResponse(baseQueryReturnValue) {
        return normalizeApiError(baseQueryReturnValue);
      },
    }),
    removeNetwork: builder.mutation<DefaultResponse, string>({
      query: (networkId) => {
        return {
          url: `${ApiRoutes.Networks}/${networkId}/delete`,
          method: 'DELETE',
          credentials: 'include',
        };
      },
      invalidatesTags: ['Network', 'Device'],
      transformErrorResponse(baseQueryReturnValue) {
        return normalizeApiError(baseQueryReturnValue);
      },
    }),
    getFullNetworksCollection: builder.query<NetworkCollection, void>({
      query: () => {
        return {
          url: `${ApiRoutes.Networks}`,
          method: 'GET',
          credentials: 'include',
        };
      },
      providesTags: ['Network'],
      transformErrorResponse(baseQueryReturnValue) {
        return normalizeApiError(baseQueryReturnValue);
      },
    }),
    getNetworksCollectionByOrg: builder.query<NetworkCollection, string | null>({
      query: (organizationId) => {
        return {
          url: `${ApiRoutes.Networks}/list?organizationId=${organizationId}`,
          method: 'GET',
          credentials: 'include',
        };
      },
      providesTags: ['Network'],
      transformErrorResponse(baseQueryReturnValue) {
        return normalizeApiError(baseQueryReturnValue);
      },
    }),
    getNetworkById: builder.query<NetworkData, string>({
      query: (networkId) => {
        return {
          url: `${ApiRoutes.Networks}/${networkId}`,
          method: 'GET',
          credentials: 'include',
        };
      },
      transformErrorResponse(baseQueryReturnValue) {
        return normalizeApiError(baseQueryReturnValue);
      },
    }),
    editNetworkById: builder.mutation<DefaultResponse, INetworkUpdatePayload>({
      query: (networkUpdatePayload) => {
        return {
          url: `${ApiRoutes.Networks}/${networkUpdatePayload.id}/edit`,
          method: 'PATCH',
          credentials: 'include',
          body: { ...networkUpdatePayload.newNetworkData },
        };
      },
      invalidatesTags: ['Network'],
      transformErrorResponse(baseQueryReturnValue) {
        return normalizeApiError(baseQueryReturnValue);
      },
    }),
  }),
});

export const {
  useCreateNewNetworkMutation,
  useGetNetworksCollectionByOrgQuery,
  useGetNetworkByIdQuery,
  useEditNetworkByIdMutation,
  useRemoveNetworkMutation,
  useGetFullNetworksCollectionQuery,
} = networkApiSlice;
