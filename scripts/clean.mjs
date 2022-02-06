import { rm } from 'fs/promises';

const rootDir = new URL('../', import.meta.url);
const packagesDir = new URL('packages/', rootDir);
const options = { recursive: true, force: true };

const paths = [
	// Dist folders
	new URL('http-framework/dist/', packagesDir),
	new URL('shared-gateway-pieces/dist/', packagesDir),
	new URL('shared-http-pieces/dist/', packagesDir),

	// Turbo folders
	new URL('http-framework/.turbo/', packagesDir),
	new URL('shared-gateway-pieces/.turbo/', packagesDir),
	new URL('shared-http-pieces/.turbo/', packagesDir)
];

await Promise.all(paths.map((path) => rm(path, options)));
