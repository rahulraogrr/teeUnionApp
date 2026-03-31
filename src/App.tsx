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
import { getToken, sessionStorage } from './utils/storage';
import { setCredentials } from './store/slices/authSlice';
import { initialiseSentry } from './utils/sentry';
import { ErrorBoundary } from './components/ErrorBoundary';

// Initialize crash reporting as early as possible
initialiseSentry();

/**
 * Bootstrap: rehydrate auth state on cold start.
 *
 * SECURITY (OWASP M2): Token is now read from Keychain/Keystore (async),
 * not from plain MMKV. Non-sensitive session data (role, employeeId) is
 * still read synchronously from MMKV.
 */
function AppBootstrap() {
  useEffect(() => {
    (async () => {
      const token = await getToken();          // Keychain — encrypted
      const user  = sessionStorage.getUser(); // MMKV — non-sensitive

      if (token && user.userId !== undefined) {
        store.dispatch(setCredentials({
          token,
          user: {
            userId:            user.userId ?? '',
            roles:             user.roles ?? [],
            employeeId:        user.employeeId ?? '',
            requiresPinChange: user.requiresPinChange,
          },
        }));
      }
    })();
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
