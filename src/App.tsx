import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as ReduxProvider } from 'react-redux';
import { PaperProvider } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import * as Sentry from '@sentry/react-native';

import { store } from './store';
import { AppLightTheme } from './theme';
import RootNavigator from './navigation/RootNavigator';
import { tokenStorage } from './utils/storage';
import { setCredentials } from './store/slices/authSlice';
import { initialiseSentry } from './utils/sentry';
import { ErrorBoundary } from './components/ErrorBoundary';

// Initialize crash reporting as early as possible
initialiseSentry();

// Bootstrap: rehydrate auth state from MMKV on cold start
function AppBootstrap() {
  useEffect(() => {
    const token = tokenStorage.getToken();
    const user = tokenStorage.getUser();
    if (token && user.userId !== undefined) {
      store.dispatch(setCredentials({
        token,
        user: {
          userId: user.userId ?? '',
          role: user.role ?? '',
          employeeId: user.employeeId ?? '',
          requiresPinChange: user.requiresPinChange,
        },
      }));
    }
  }, []);

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={AppLightTheme.colors.primary} />
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
      <Toast />
    </>
  );
}

function App() {
  return (
    // ErrorBoundary wraps everything — any unhandled render crash lands here
    // instead of showing a blank white screen
    <ErrorBoundary>
      <ReduxProvider store={store}>
        <PaperProvider theme={AppLightTheme}>
          <AppBootstrap />
        </PaperProvider>
      </ReduxProvider>
    </ErrorBoundary>
  );
}

// Wrap with Sentry's higher-order component — adds automatic breadcrumbs
// (navigation events, taps, network calls) to every crash report
export default Sentry.wrap(App);
