// Re-export desde @resona/api-client (el código real vive en packages/api-client/src/api.ts).
// Mantengo este archivo para no romper los ~200 imports de '@services/api' existentes.
// Migrar imports a '@resona/api-client' se hará progresivamente durante la extracción del admin.
export { api, apiClient as default } from '@resona/api-client';
