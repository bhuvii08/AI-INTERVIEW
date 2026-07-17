const browserHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost'
const isProductionBuild = import.meta.env.PROD

const normalizeUrl = (value) => {
	if (!value || typeof value !== 'string') return ''
	return value.trim().replace(/\/$/, '')
}

const envServerUrl = normalizeUrl(import.meta.env.VITE_SERVER_URL)
const localFallbackUrl = `http://${browserHost}:8000`
const productionFallbackUrl = 'https://aiinterview-api.onrender.com'

// In production, avoid falling back to the frontend host:8000 because it breaks on Vercel.
export const ServerUrl = envServerUrl || (isProductionBuild ? productionFallbackUrl : localFallbackUrl)