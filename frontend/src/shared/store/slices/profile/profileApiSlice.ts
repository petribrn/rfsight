import { ApiRoutes } from '../../../ts/enums';
import { normalizeApiError } from '../../../ts/helpers';
import {
  INewProfilePayload,
  IProfileUpdatePayload,
} from '../../../ts/interfaces/profile.interfaces';
import {
  DefaultResponse,
  ProfileCollection,
  ProfileData,
} from '../../../ts/types';
import { apiSlice } from '../api/apiSlice';

export const profileApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createNewProfile: builder.mutation<DefaultResponse, INewProfilePayload>({
      query: (newProfilePayload) => {
        return {
          url: `${ApiRoutes.Profiles}/new`,
          method: 'POST',
          credentials: 'include',
          body: newProfilePayload,
        };
      },
      invalidatesTags: ['Profile'],
      transformErrorResponse(baseQueryReturnValue) {
        return normalizeApiError(baseQueryReturnValue);
      },
    }),
    removeProfile: builder.mutation<DefaultResponse, string>({
      query: (profileId) => {
        return {
          url: `${ApiRoutes.Profiles}/${profileId}/delete`,
          method: 'DELETE',
          credentials: 'include',
        };
      },
      invalidatesTags: ['Profile', 'Device'],
      transformErrorResponse(baseQueryReturnValue) {
        return normalizeApiError(baseQueryReturnValue);
      },
    }),
    getProfilesCollection: builder.query<ProfileCollection, void>({
      query: () => {
        return {
          url: `${ApiRoutes.Profiles}`,
          method: 'GET',
          credentials: 'include',
        };
      },
      providesTags: ['Profile'],
      transformErrorResponse(baseQueryReturnValue) {
        return normalizeApiError(baseQueryReturnValue);
      },
    }),
    getProfileById: builder.query<ProfileData, string>({
      query: (profileId) => {
        return {
          url: `${ApiRoutes.Profiles}/${profileId}`,
          method: 'GET',
          credentials: 'include',
        };
      },
      transformErrorResponse(baseQueryReturnValue) {
        return normalizeApiError(baseQueryReturnValue);
      },
    }),
    editProfileById: builder.mutation<DefaultResponse, IProfileUpdatePayload>({
      query: (profileUpdatePayload) => {
        return {
          url: `${ApiRoutes.Profiles}/${profileUpdatePayload.id}/update`,
          method: 'PUT',
          credentials: 'include',
          body: { ...profileUpdatePayload.newProfileData },
        };
      },
      invalidatesTags: ['Profile'],
      transformErrorResponse(baseQueryReturnValue) {
        return normalizeApiError(baseQueryReturnValue);
      },
    }),
  }),
});

export const {
  useCreateNewProfileMutation,
  useGetProfilesCollectionQuery,
  useGetProfileByIdQuery,
  useEditProfileByIdMutation,
  useRemoveProfileMutation,
} = profileApiSlice;
