import axios from 'axios';
import React from 'react';
import { IAppState, IErrorModel, useAppStore } from 'store/slices';
import {
  AccountAuthStateName,
  IRegisterModel,
  IUserInfoModel,
  IUserLocationModel,
  IUserModel,
  useApiAuth,
  useKeycloakWrapper,
  UserStatusName,
} from 'tno-core';

import { useAjaxWrapper } from '..';
import { useLookup } from '../lookup';

/**
 * Global information outside of redux so that the controller dependency doesn't cause infinite loops.
 */
let userInfo: IUserInfoModel = {
  id: 0,
  key: '',
  username: '',
  email: '',
  preferredEmail: '',
  status: UserStatusName.Requested,
  displayName: '',
  isEnabled: false,
  roles: [],
  authState: AccountAuthStateName.Authorized,
};

let initialized = false;

interface IAppController {
  /**
   * Make an request to the API for user information.
   */
  getUserInfo: (refresh?: boolean) => Promise<IUserInfoModel>;
  requestCode: (model: IRegisterModel) => Promise<IRegisterModel>;
  requestApproval: (model: IUserModel) => Promise<IUserModel>;
  /**
   * Add new error to state.
   */
  addError: (error: IErrorModel) => void;
  /**
   * Remove specified error from state.
   */
  removeError: (error: IErrorModel) => void;
  /**
   * Clear errors from state.
   */
  clearErrors: () => void;
  /**
   * Whether the application has been initialized.
   */
  initialized: boolean;
  /**
   * Whether the application has been initialized.
   */
  authenticated: boolean;
}

/**
 * useApp is a hook that provides overall application state and an api to get user information.
 * @returns Hook with application state and api.
 */
export const useApp = (): [IAppState, IAppController] => {
  const keycloak = useKeycloakWrapper();
  const [state, store] = useAppStore();
  const [, { init }] = useLookup();
  const dispatch = useAjaxWrapper();
  const api = useApiAuth();

  const hasClaim = keycloak.hasClaim();

  React.useEffect(() => {
    // Initialize lookup values the first time the app loads.
    if (!initialized && keycloak.authenticated && hasClaim) {
      initialized = true;
      init();
    }
  }, [init, keycloak.authenticated, hasClaim]);

  const controller = React.useMemo(
    () => ({
      getUserInfo: async (refresh: boolean = false) => {
        if (userInfo.id !== 0 && !refresh) return userInfo;
        var location: IUserLocationModel | undefined;
        try {
          // Generate a unique key for this user and store in local storage.
          var key = localStorage.getItem('device-key');
          if (!key) {
            key = crypto.randomUUID();
            localStorage.setItem('device-key', key);
          }
          const locationResponse = await dispatch(
            'get-location',
            () => axios.get('https://geolocation-db.com/json/'),
            'location',
            true,
            true,
          );
          location = { ...locationResponse.data, key };
        } catch {
          // Ignore location error
        }
        const response = await dispatch('get-user-info', () => api.getUserInfo(location));
        userInfo = response.data;
        store.storeUserInfo(userInfo);
        if ((!keycloak.hasClaim() || refresh) && !!response.data.roles.length)
          await keycloak.instance.updateToken(86400);
        return userInfo;
      },
      requestCode: async (model: IRegisterModel) => {
        return (await dispatch<IRegisterModel>('request-code', () => api.requestCode(model))).data;
      },
      requestApproval: async (model: IUserModel) => {
        return (await dispatch<IUserModel>('request-approval', () => api.requestApproval(model)))
          .data;
      },
      addError: store.addError,
      removeError: store.removeError,
      clearErrors: store.clearErrors,
      initialized,
      authenticated: keycloak.authenticated ?? false,
    }),
    [api, dispatch, store, keycloak],
  );

  return [state, controller];
};
