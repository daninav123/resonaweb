// Re-export desde @resona/api-client (el código real vive en packages/api-client/src/authStore.ts).
// Mantengo este archivo para no romper los imports existentes de '@stores/authStore'.
export { useAuthStore } from '@resona/api-client';
