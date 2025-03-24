import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { DefaultApiError, UnknownApiError } from '../interfaces';

export const normalizeApiError = (apiError: FetchBaseQueryError) => {
  let message = '';

  if (apiError.data) {
    message =
      (apiError.data as DefaultApiError).detail.message ||
      (apiError.data as UnknownApiError).detail;
  }

  const errorToReturn: DefaultApiError = {
    detail: {
      success: false,
      message,
    },
  };
  return errorToReturn;
};
