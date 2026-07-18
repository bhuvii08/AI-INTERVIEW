import axios from 'axios'

const browserHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost'
const isProductionBuild = import.meta.env.PROD
const APP_TOKEN_KEY = 'ai_interview_app_token'

const normalizeUrl = (value) => {
	if (!value || typeof value !== 'string') return ''
	return value.trim().replace(/\/$/, '')
}

const envServerUrl = normalizeUrl(import.meta.env.VITE_SERVER_URL)
const localFallbackUrl = `http://${browserHost}:8000`
const productionFallbackUrl = 'https://ai-interview-server-chi.vercel.app'

// In production, avoid falling back to the frontend host:8000 because it breaks on Vercel.
export const ServerUrl = envServerUrl || (isProductionBuild ? productionFallbackUrl : localFallbackUrl)

const canUseStorage = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'

export const getStoredAuthToken = () => {
	if (!canUseStorage) return ''
	return window.localStorage.getItem(APP_TOKEN_KEY) || ''
}

export const applyAuthToken = (token) => {
	if (token) {
		axios.defaults.headers.common.Authorization = `Bearer ${token}`
		return
	}

	delete axios.defaults.headers.common.Authorization
}

export const setStoredAuthToken = (token) => {
	if (canUseStorage) {
		if (token) {
			window.localStorage.setItem(APP_TOKEN_KEY, token)
		} else {
			window.localStorage.removeItem(APP_TOKEN_KEY)
		}
	}

	applyAuthToken(token)
}

// Restore token-backed auth for page refreshes and Safari cookie restrictions.
applyAuthToken(getStoredAuthToken())