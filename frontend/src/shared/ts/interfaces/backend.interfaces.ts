export interface DefaultApiError {
  detail: {
    success: boolean;
    message: string;
  };
}

export interface UnknownApiError {
  detail: string;
}
