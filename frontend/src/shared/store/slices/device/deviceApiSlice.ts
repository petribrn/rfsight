import { ApiRoutes } from '../../../ts/enums';
import { normalizeApiError } from '../../../ts/helpers';
import {
  ExecuteActionSequencePayload,
  IAdoptDevicePayload,
  IEditDevicePayload,
  IGetDeviceCollectionPayload
} from '../../../ts/interfaces';
import {
  DefaultResponse,
  DeviceCollection,
  DeviceConfig,
  DeviceData,
  ExecuteActionSequenceResponse,
} from '../../../ts/types';
import { apiSlice } from '../api/apiSlice';

export const deviceApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    adoptDevice: builder.mutation<DefaultResponse, IAdoptDevicePayload>({
      query: (adoptPayload) => {
        return {
          url: `${ApiRoutes.Devices}/adopt`,
          method: 'POST',
          credentials: 'include',
          body: adoptPayload,
        };
      },
      invalidatesTags: ['Device', 'Network'],
      transformErrorResponse(baseQueryReturnValue) {
        return normalizeApiError(baseQueryReturnValue);
      },
    }),
    removeDevice: builder.mutation<DefaultResponse, string>({
      query: (deviceId) => {
        return {
          url: `${ApiRoutes.Devices}/${deviceId}/delete`,
          method: 'DELETE',
          credentials: 'include',
        };
      },
      invalidatesTags: ['Device', 'Network'],
      transformErrorResponse(baseQueryReturnValue) {
        return normalizeApiError(baseQueryReturnValue);
      },
    }),
    executeActionSequence: builder.mutation<ExecuteActionSequenceResponse, ExecuteActionSequencePayload>({
      query: (payload) => ({
        url: `${ApiRoutes.Devices}/${payload.deviceId}/execute-sequence`,
        method: 'POST',
        body: payload.sequence,
        credentials: 'include'
      }),
      transformErrorResponse(baseQueryReturnValue) {
        return normalizeApiError(baseQueryReturnValue);
      },
    }),
    updateDeviceById: builder.mutation<DefaultResponse, IEditDevicePayload>({
      query: (payload) => ({
        url: `${ApiRoutes.Devices}/${payload.deviceId}/edit`,
        method: 'POST',
        body: payload.deviceEditData,
        credentials: 'include'
      }),
      transformErrorResponse(baseQueryReturnValue) {
        return normalizeApiError(baseQueryReturnValue);
      },
    }),
    getDeviceCollectionByOrgNetwork: builder.query<
      DeviceCollection,
      IGetDeviceCollectionPayload
    >({
      query: (payload) => {
        return {
          url: `${ApiRoutes.Devices}/list?organizationId=${payload.organizationId}&networkId=${payload.networkId}`,
          method: 'GET',
          credentials: 'include',
        };
      },
      providesTags: ['Device'],
      transformErrorResponse(baseQueryReturnValue) {
        return normalizeApiError(baseQueryReturnValue);
      },
    }),
    getDeviceCollectionByOrganization: builder.query<
      DeviceCollection,
      IGetDeviceCollectionPayload
    >({
      query: (payload) => {
        return {
          url: `${ApiRoutes.Devices}/list?organizationId=${payload.organizationId}`,
          method: 'GET',
          credentials: 'include',
        };
      },
      providesTags: ['Device'],
      transformErrorResponse(baseQueryReturnValue) {
        return normalizeApiError(baseQueryReturnValue);
      },
    }),
    getDeviceById: builder.query<DeviceData, string>({
      query: (deviceId) => {
        return {
          url: `${ApiRoutes.Devices}/${deviceId}`,
          method: 'GET',
          credentials: 'include',
        };
      },
      transformErrorResponse(baseQueryReturnValue) {
        return normalizeApiError(baseQueryReturnValue);
      },
    }),
    getDeviceConfigById: builder.query<DeviceConfig, string>({
      query: (deviceId) => {
        return {
          url: `${ApiRoutes.Devices}/${deviceId}/config`,
          method: 'GET',
          credentials: 'include',
        };
      },
      transformErrorResponse(baseQueryReturnValue) {
        return normalizeApiError(baseQueryReturnValue);
      },
    }),
  }),
});

export const {
  useAdoptDeviceMutation,
  useExecuteActionSequenceMutation,
  useGetDeviceByIdQuery,
  useGetDeviceCollectionByOrgNetworkQuery,
  useGetDeviceCollectionByOrganizationQuery,
  useLazyGetDeviceCollectionByOrganizationQuery,
  useRemoveDeviceMutation,
  useGetDeviceConfigByIdQuery,
  useUpdateDeviceByIdMutation
} = deviceApiSlice;
