/**
 * This module initializes and exports a QueryClient instance
 * for use with TanStack Svelte Query throughout the application.
 */

import { QueryClient } from '@tanstack/svelte-query';

const queryClient = new QueryClient();

export default queryClient;
