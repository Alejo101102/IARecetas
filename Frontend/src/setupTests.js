import '@testing-library/jest-dom';
import { jest } from '@jest/globals'

globalThis.__VITE_API_URL__ = 'http://localhost:5000'

// Mock de Firebase
jest.mock('./firebase', () => ({
  auth: { currentUser: { uid: 'test_user_123' } },
  db: {},
  googleProvider: {}
}));

jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn((_, callback) => {
    callback({ uid: 'test_user_123', email: 'test@example.com' })
    return jest.fn()
  }),
  signInWithPopup: jest.fn(),
  signOut: jest.fn(),
  getAuth: jest.fn(),
  GoogleAuthProvider: jest.fn(),
}))

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(() => ({ __type: 'collectionRef' })),
  addDoc: jest.fn(async () => ({ id: 'doc-1' })),
  getDocs: jest.fn(async () => ({
    docs: [
      {
        id: 'doc-1',
        data: () => ({
          nombre: 'Leche',
          cantidad: 1,
          unidad: 'L',
          categoria: 'lacteos',
        }),
      },
    ],
  })),
  doc: jest.fn(() => ({ __type: 'docRef' })),
  deleteDoc: jest.fn(async () => {}),
  updateDoc: jest.fn(async () => {}),
  getFirestore: jest.fn(() => ({})),
}))

// Mock de window.matchMedia
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
