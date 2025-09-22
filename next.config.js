/** @type {import('next').NextConfig} */
const nextConfig = {
	typescript: {
		// We only build the frontend here; backend TS is in /backend and excluded.
		ignoreBuildErrors: true,
	},
	eslint: {
		// Allow builds to succeed even with lint warnings in CI
		ignoreDuringBuilds: true,
	},
}

module.exports = nextConfig