import kakapoAssets from 'kakapo-assets';
import { bridgedSettings } from 'kakapoBridge';
import constants from 'constants/';
import { createReducer, flatten } from 'utils/';

let initialState = {
  lang: bridgedSettings.getItem('lang'),
  intlData: { ...kakapoAssets.i18n.en, ...{
    messages: flatten(kakapoAssets.i18n.en.messages)
  } }
};

if (__DESKTOP__) {
  initialState = { ...initialState, ...{
    dockIcon: bridgedSettings.getItem('dockIcon'),
    devTools: bridgedSettings.getItem('devTools')
  } };
}

const settingReducers = {
  toggleDock(state, value) {
    bridgedSettings.setItem('dockIcon', value);
    return { ...state, ...{ dockIcon: value } };
  },
  toggleDevTools(state, value) {
    bridgedSettings.setItem('devTools', value);
    return { ...state, ...{ devTools: value } };
  }
};

export default createReducer(initialState, {
  [constants.SETTINGS_LANGUAGE]: state => state,
  [constants.SETTINGS_DOCK]: (state, action) => settingReducers.toggleDock(state, action.bool),
  [constants.SETTINGS_DEVTOOLS]: (state, action) => settingReducers.toggleDevTools(state, action.bool)
});
