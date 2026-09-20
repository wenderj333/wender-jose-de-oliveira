import { Capacitor, registerPlugin } from '@capacitor/core';

// This bridge exists only in the installed Android app. Browsers keep using
// the existing Firebase popup flow.
const NativeGoogleAuth = registerPlugin('NativeGoogleAuth');

export const isNativeGoogleSignInAvailable = () => Capacitor.isNativePlatform();

export async function signInWithNativeGoogle() {
  return NativeGoogleAuth.signIn();
}
