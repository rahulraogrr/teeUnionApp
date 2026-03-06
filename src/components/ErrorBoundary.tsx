import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button } from 'react-native-paper';
import * as Sentry from '@sentry/react-native';

interface Props {
  children: ReactNode;
  /** Optional custom fallback UI */
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  eventId: string | null;
}

/**
 * ErrorBoundary
 * Wraps any subtree — if it crashes, shows a friendly screen instead of a
 * white screen of death, and automatically reports the crash to Sentry.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <SomeScreen />
 *   </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, eventId: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, eventId: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Report to Sentry and get back an event ID so users can reference it
    const eventId = Sentry.captureException(error, {
      extra: { componentStack: errorInfo.componentStack },
    });
    this.setState({ eventId: eventId ?? null });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, eventId: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.icon}>⚠️</Text>
          <Text variant="headlineSmall" style={styles.title}>
            Something went wrong
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            The app encountered an unexpected error. Our team has been notified automatically.
          </Text>

          {this.state.eventId && (
            <View style={styles.refBox}>
              <Text variant="bodySmall" style={styles.refLabel}>Reference ID</Text>
              <Text variant="bodySmall" style={styles.refValue} selectable>
                {this.state.eventId}
              </Text>
            </View>
          )}

          <Button mode="contained" onPress={this.handleRetry} style={styles.button}>
            Try Again
          </Button>

          {__DEV__ && this.state.error && (
            <View style={styles.devBox}>
              <Text variant="bodySmall" style={styles.devTitle}>DEV — Error details:</Text>
              <Text variant="bodySmall" style={styles.devError} selectable>
                {this.state.error.toString()}
              </Text>
            </View>
          )}
        </ScrollView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#FFF8F7',
  },
  icon: { fontSize: 56, marginBottom: 16 },
  title: { fontWeight: '700', textAlign: 'center', marginBottom: 8, color: '#1A237E' },
  subtitle: { textAlign: 'center', color: '#555', marginBottom: 24 },
  refBox: {
    backgroundColor: '#f3f3f3',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
  },
  refLabel: { color: '#888', marginBottom: 4 },
  refValue: { fontFamily: 'monospace', color: '#333', fontSize: 11 },
  button: { borderRadius: 8, minWidth: 160 },
  // Dev-only stack trace box
  devBox: {
    marginTop: 32,
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    padding: 12,
    width: '100%',
  },
  devTitle: { fontWeight: '700', color: '#856404', marginBottom: 6 },
  devError: { color: '#333', fontSize: 11, fontFamily: 'monospace' },
});
