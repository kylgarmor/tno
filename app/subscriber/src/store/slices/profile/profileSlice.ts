import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IReportResultForm } from 'features/my-reports/interfaces';
import {
  IContributorModel,
  IFilterModel,
  IFolderModel,
  IMinisterModel,
  IReportModel,
  ISubscriberUserModel,
  ISystemMessageModel,
} from 'tno-core';

import { IProfileState } from './interfaces';

export const initialProfileState: IProfileState = {
  contributors: [],
  myFilters: [],
  myFolders: [],
  myMinisters: [],
  myReports: [],
  reportsFilter: '',
  reportContent: {},
  systemMessages: [],
};

export const profileSlice = createSlice({
  name: 'profile',
  initialState: initialProfileState,
  reducers: {
    storeMyProfile(state: IProfileState, action: PayloadAction<ISubscriberUserModel | undefined>) {
      state.profile = action.payload;
    },
    storeFilter(state: IProfileState, action: PayloadAction<IFilterModel | undefined>) {
      state.filter = action.payload;
    },
    storeMyFilters(state: IProfileState, action: PayloadAction<IFilterModel[]>) {
      state.myFilters = action.payload;
    },
    storeMyFolders(state: IProfileState, action: PayloadAction<IFolderModel[]>) {
      state.myFolders = action.payload;
    },
    storeMyMinisters(state: IProfileState, action: PayloadAction<IMinisterModel[]>) {
      state.myMinisters = action.payload;
    },
    storeMyReports(state: IProfileState, action: PayloadAction<IReportModel[]>) {
      state.myReports = action.payload;
    },
    storeReportsFilter(state: IProfileState, action: PayloadAction<string>) {
      state.reportsFilter = action.payload;
    },
    storeReportOutput(state: IProfileState, action: PayloadAction<IReportResultForm | undefined>) {
      state.reportOutput = action.payload;
    },
    storeReportContent(
      state: IProfileState,
      action: PayloadAction<{ [reportId: number]: number[] }>,
    ) {
      state.reportContent = action.payload;
    },
    contributors(state: IProfileState, action: PayloadAction<IContributorModel[]>) {
      state.contributors = action.payload;
    },
    storeSystemMessages(state: IProfileState, action: PayloadAction<ISystemMessageModel[]>) {
      state.systemMessages = action.payload;
    },
  },
});

export const {
  storeMyProfile,
  storeFilter,
  storeMyFilters,
  storeMyFolders,
  storeMyMinisters,
  storeMyReports,
  storeReportsFilter,
  storeReportOutput,
  storeReportContent,
  storeSystemMessages,
} = profileSlice.actions;
