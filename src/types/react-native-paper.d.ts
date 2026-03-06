/**
 * Type patch for react-native-paper@5.x
 * Paper's Text component is typed as returning ReactNode, which TypeScript strict mode
 * rejects as a valid JSX element. We override it to return React.ReactElement | null.
 */
import * as React from 'react';
import type { StyleProp, Text as NativeText, TextStyle } from 'react-native';

declare module 'react-native-paper' {
  type VariantProp<T = never> =
    | 'displayLarge' | 'displayMedium' | 'displaySmall'
    | 'headlineLarge' | 'headlineMedium' | 'headlineSmall'
    | 'titleLarge' | 'titleMedium' | 'titleSmall'
    | 'labelLarge' | 'labelMedium' | 'labelSmall'
    | 'bodyLarge' | 'bodyMedium' | 'bodySmall';

  interface TextProps extends React.ComponentPropsWithRef<typeof NativeText> {
    variant?: VariantProp;
    children?: React.ReactNode;
    style?: StyleProp<TextStyle>;
    theme?: object;
  }

  export const Text: React.FC<TextProps>;
  export function customText<T>(): React.FC<TextProps>;
}
