import React from 'react'
import { BsRobot } from "react-icons/bs";
import { IoSparkles } from "react-icons/io5";
import { motion } from "motion/react"
import { FcGoogle } from "react-icons/fc";
import { getRedirectResult, signInWithPopup, signInWithRedirect, signOut } from 'firebase/auth';
import { auth, provider } from '../utils/firebase';
import axios from 'axios';
import { ServerUrl, setStoredAuthToken } from '../config/api';
import { useDispatch } from 'react-redux';
import { setUserData } from '../redux/userSlice';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const mapFirebaseError = (code) => {
    switch (code) {
        case "auth/popup-timeout":
            return "Google popup took too long. Trying redirect sign-in...";
        case "auth/popup-blocked":
            return "Popup blocked by browser. Use redirect login button below.";
        case "auth/popup-closed-by-user":
            return "Sign-in popup was closed before completing login.";
        case "auth/cancelled-popup-request":
            return "Another login request is already in progress.";
        case "auth/unauthorized-domain":
            return "Unauthorized domain. Add localhost in Firebase Authorized Domains.";
        case "auth/network-request-failed":
            return "Network issue while signing in. Please check your internet connection.";
        case "auth/operation-not-allowed":
            return "Google provider is disabled in Firebase Authentication settings.";
        default:
            return code ? `Firebase error: ${code}` : "Google sign-in failed.";
    }
};

const mapBackendError = (error) => {
    const status = error?.response?.status;
    const message = error?.response?.data?.message;

    if (status === 401) return "Session issue detected. Please try signing in again.";
    if (!error?.response) return "Cannot reach server. Please check backend deployment and network connection.";
    return message || "Backend login failed. Please try again.";
};

const isIosSafari = () => {
    if (typeof navigator === "undefined") return false

    const ua = navigator.userAgent || ""
    const isIOS = /iP(hone|ad|od)/i.test(ua)
    const isWebKitSafari = /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua)

    return isIOS && isWebKitSafari
}

function Auth({isModel = false}) {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")

    const syncUserToBackend = useCallback(async (firebaseUser) => {
        const email = firebaseUser?.email?.trim()?.toLowerCase()
        const fallbackName = email ? email.split("@")[0] : "Candidate"
        const name = firebaseUser?.displayName?.trim() || fallbackName
        const firebaseIdToken = await firebaseUser?.getIdToken?.(true)

        if (!email || !firebaseIdToken) {
            throw new Error("Google account token is missing")
        }

        let lastError
        for (let attempt = 1; attempt <= 2; attempt += 1) {
            try {
                const result = await axios.post(
                    ServerUrl + "/api/auth/google",
                    { name, email },
                    {
                        withCredentials: true,
                        timeout: 15000,
                        headers: {
                            Authorization: `Bearer ${firebaseIdToken}`,
                        },
                    }
                )

                const appToken = result?.data?.token
                if (appToken) {
                    setStoredAuthToken(appToken)
                }

                let currentUser = result?.data?.user || result.data
                try {
                    const currentUserResult = await axios.get(
                        ServerUrl + "/api/user/current-user",
                        {
                            withCredentials: true,
                            timeout: 15000,
                            headers: appToken
                                ? {
                                    Authorization: `Bearer ${appToken}`,
                                }
                                : undefined,
                        }
                    )
                    currentUser = currentUserResult?.data || currentUser
                } catch (currentUserError) {
                    if (currentUserError?.response?.status !== 401) {
                        throw currentUserError
                    }
                }

                if (currentUser?.email?.toLowerCase?.() !== email) {
                    await axios.get(ServerUrl + "/api/auth/logout", { withCredentials: true }).catch(() => undefined)
                    setStoredAuthToken('')
                    dispatch(setUserData(null))
                    throw new Error("Session mismatch detected. Please try Google sign-in again.")
                }

                dispatch(setUserData(currentUser))
                return currentUser
            } catch (error) {
                lastError = error
                const isRetryable = !error?.response || error?.code === "ECONNABORTED"
                if (!isRetryable || attempt === 2) {
                    if (error?.response?.status === 401) {
                        setStoredAuthToken('')
                    }
                    throw error
                }

                // Small backoff for temporary network hiccups.
                await new Promise((resolve) => setTimeout(resolve, 500))
            }
        }

        throw lastError
    }, [dispatch])

    useEffect(() => {
        const handleRedirectResult = async () => {
            try {
                const redirectResult = await getRedirectResult(auth)
                if (redirectResult?.user) {
                    setIsLoading(true)
                    setErrorMessage("")
                    await syncUserToBackend(redirectResult.user)
                    if (!isModel) {
                        navigate("/", { replace: true })
                    }
                }
            } catch (error) {
                const firebaseMessage = mapFirebaseError(error?.code)
                const apiMessage = mapBackendError(error)
                setErrorMessage(error?.code ? firebaseMessage : apiMessage)
                setStoredAuthToken('')
                dispatch(setUserData(null))
            } finally {
                setIsLoading(false)
            }
        }

        handleRedirectResult()
    }, [dispatch, isModel, navigate, syncUserToBackend])

    const handleGoogleAuth = async () => {
        let popupTimer
        try {
            setIsLoading(true)
            setErrorMessage("")
            await signOut(auth).catch(() => undefined)

            // iOS Safari handles redirect auth more reliably than popup auth.
            if (isIosSafari()) {
                setErrorMessage("Redirecting to Google...")
                await signInWithRedirect(auth, provider)
                return
            }

            const popupTimeout = new Promise((_, reject) => {
                popupTimer = setTimeout(() => {
                    const timeoutError = new Error("auth/popup-timeout")
                    timeoutError.code = "auth/popup-timeout"
                    reject(timeoutError)
                }, 12000)
            })

            const response = await Promise.race([
                signInWithPopup(auth, provider),
                popupTimeout,
            ])

            if (popupTimer) {
                clearTimeout(popupTimer)
            }

            await syncUserToBackend(response.user)
            if (!isModel) {
                navigate("/", { replace: true })
            }
            


            
        } catch (error) {
            if (popupTimer) {
                clearTimeout(popupTimer)
            }

            const code = error?.code || error?.message
            const shouldFallbackToRedirect = [
                "auth/popup-blocked",
                "auth/popup-closed-by-user",
                "auth/cancelled-popup-request",
                "auth/popup-timeout",
            ].includes(code)

            if (shouldFallbackToRedirect) {
                try {
                    setErrorMessage(mapFirebaseError(code))
                    await signInWithRedirect(auth, provider)
                    return
                } catch (redirectError) {
                    const redirectMessage = mapFirebaseError(redirectError?.code)
                    setErrorMessage(redirectMessage)
                    dispatch(setUserData(null))
                    setIsLoading(false)
                    return
                }
            }

            const firebaseMessage = mapFirebaseError(error?.code)
            const apiMessage = mapBackendError(error)
            setErrorMessage(error?.code ? firebaseMessage : apiMessage)
                        setStoredAuthToken('')
                        dispatch(setUserData(null))
        } finally {
            setIsLoading(false)
        }
    }

    const handleRedirectAuth = async () => {
        try {
            setIsLoading(true)
            setErrorMessage("Redirecting to Google...")
            await signOut(auth).catch(() => undefined)
            await signInWithRedirect(auth, provider)
        } catch (error) {
            const redirectMessage = mapFirebaseError(error?.code)
            setErrorMessage(redirectMessage)
            dispatch(setUserData(null))
            setIsLoading(false)
        }
    }
  return (
    <div className={`
      w-full 
      ${isModel ? "py-4" : "min-h-screen bg-[#f3f3f3] flex items-center justify-center px-6 py-20"}
    `}>
        <motion.div 
        initial={{opacity:0 , y:-40}} 
        animate={{opacity:1 , y:0}} 
        transition={{duration:1.05}}
        className={`
        w-full 
        ${isModel ? "max-w-md p-8 rounded-3xl" : "max-w-lg p-12 rounded-4xl"}
        bg-white shadow-2xl border border-gray-200
      `}>
            <div className='flex items-center justify-center gap-3 mb-6'>
                <div className='bg-black text-white p-2 rounded-lg'>
                    <BsRobot size={18}/>

                </div>
                <h2 className='font-semibold text-lg'>InterviewIQ.AI</h2>
            </div>

            <h1 className='text-2xl md:text-3xl font-semibold text-center leading-snug mb-4'>
                Continue with
                <span className='bg-green-100 text-green-600 px-3 py-1 rounded-full inline-flex items-center gap-2'>
                    <IoSparkles size={16}/>
                    AI Smart Interview

                </span>
            </h1>

            <p className='text-gray-500 text-center text-sm md:text-base leading-relaxed mb-8'>
                Sign in to start AI-powered mock interviews,
        track your progress, and unlock detailed performance insights.
            </p>


            <motion.button 
            onClick={handleGoogleAuth}
                        disabled={isLoading}
            whileHover={{opacity:0.9 , scale:1.03}}
            whileTap={{opacity:1 , scale:0.98}}
                        className='w-full flex items-center justify-center gap-3 py-3 bg-black text-white rounded-full shadow-md disabled:opacity-60 disabled:cursor-not-allowed'>
                <FcGoogle size={20}/>
                        {isLoading ? "Signing in..." : "Continue with Google"}

   
            </motion.button>

                        <button
                            type='button'
                            onClick={handleRedirectAuth}
                            disabled={isLoading}
                            className='w-full mt-3 py-3 border border-gray-300 text-gray-700 rounded-full text-sm hover:bg-gray-50 transition disabled:opacity-60 disabled:cursor-not-allowed'
                        >
                            Having trouble? Sign in with Redirect
                        </button>

                        <p className='mt-3 text-xs text-gray-500 text-center'>
                            If login still fails, add localhost and 127.0.0.1 to Firebase Authorized Domains.
                        </p>

                        {errorMessage && (
                            <p className='mt-4 text-sm text-red-500 text-center'>
                                {errorMessage}
                            </p>
                        )}
        </motion.div>

      
    </div>
  )
}

export default Auth
