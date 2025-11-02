import { HttpDetails, ProfileAction, SshDetails } from '../types';

export const defaultHttpDetails: HttpDetails = {
  method: 'GET',
  successStatusCode: 200,
  path: '',
  responseType: 'text/json',
  responseMapping: {},
};

export const defaultSshDetails: SshDetails = {
  port: 22,
  command: '',
};

export const defaultAction: ProfileAction = {
  actionType: 'monitor',
  protocol: 'http',
  httpDetails: defaultHttpDetails,
  sshDetails: null,
};
