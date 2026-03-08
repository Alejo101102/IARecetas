import '@testing-library/jest-dom';
import { jest } from '@jest/globals';

jest.mock('./firebase', () => ({
  auth: {
    currentUser: { uid: 'test-uid-123', displayName: 'Test User', email: 'test@example.com' },
  },
  db: {},
  googleProvider: {},
}));

jest.mock('firebase/firestore', () => ({
  collection:   jest.fn(() => 'mock-collection-ref'),
  addDoc:       jest.fn(() => Promise.resolve({ id: 'mock-doc-id' })),
  getDocs:      jest.fn(() => Promise.resolve({ docs: [] })),
  doc:          jest.fn(() => 'mock-doc-ref'),
  deleteDoc:    jest.fn(() => Promise.resolve()),
  updateDoc:    jest.fn(() => Promise.resolve()),
  getFirestore: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
  getAuth:            jest.fn(),
  GoogleAuthProvider: jest.fn().mockImplementation(() => ({})),
  signInWithPopup:    jest.fn(),
  signOut:            jest.fn(() => Promise.resolve()),
  onAuthStateChanged: jest.fn((_auth, callback) => {
    callback({ uid: 'test-uid-123', displayName: 'Test User', email: 'test@example.com' });
    return jest.fn();
  }),
}));

jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({})),
}));

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});