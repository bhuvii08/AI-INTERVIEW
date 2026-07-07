import React from 'react'
import maleVideo from "../assets/videos/male-ai.mp4"
import femaleVideo from "../assets/videos/female-ai.mp4"
import Timer from './Timer'
import { motion } from "motion/react"
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import { useState } from 'react'
import { useRef } from 'react'
import { useEffect } from 'react'
import { useCallback } from 'react'
import axios from "axios"
import { ServerUrl } from '../config/api'
import { BsArrowRight } from 'react-icons/bs'

function Step2Interview({ interviewData, onFinish }) {
  const { interviewId, questions, userName, assistantVoice } = interviewData;
  const preferredAssistant = assistantVoice === "male" ? "male" : "female";
  const [isIntroPhase, setIsIntroPhase] = useState(true);

  const [isMicOn, setIsMicOn] = useState(true);
  const recognitionRef = useRef(null);
  const isRecognizingRef = useRef(false);
  const manualMicStopRef = useRef(false);
  const isMicOnRef = useRef(true);
  const isAIPlayingRef = useRef(false);
  const introPlayedRef = useRef(false);
  const lastSpokenQuestionIndexRef = useRef(-1);

  const [isAIPlaying, setIsAIPlaying] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [timeLeft, setTimeLeft] = useState(
    questions[0]?.timeLimit || 60
  );
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [voiceGender, setVoiceGender] = useState(preferredAssistant);
  const [subtitle, setSubtitle] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [micPermission, setMicPermission] = useState("unknown");
  const [speechSupported] = useState(() => {
    if (typeof window === "undefined") return false;
    return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  });
  const [micError, setMicError] = useState(() => (
    (typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition))
      ? ""
      : "Voice input is not supported in this browser."
  ));


  const videoRef = useRef(null);
  const finalTranscriptRef = useRef("");

  const currentQuestion = questions[currentIndex];

  const requestMicPermission = useCallback(async () => {
    if (!navigator?.mediaDevices?.getUserMedia) {
      setMicPermission("unavailable");
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setMicPermission("granted");
      return true;
    } catch {
      setMicPermission("denied");
      setMicError("Microphone permission denied. Please allow mic access and retry.");
      return false;
    }
  }, []);

  useEffect(() => {
    isMicOnRef.current = isMicOn;
  }, [isMicOn]);

  useEffect(() => {
    isAIPlayingRef.current = isAIPlaying;
  }, [isAIPlaying]);

  const stopMic = useCallback(() => {
    if (recognitionRef.current) {
      manualMicStopRef.current = true;
      recognitionRef.current.stop();
    }
  }, []);

  const startMic = useCallback(async () => {
    if (!speechSupported) return;
    if (!recognitionRef.current) return;
    if (!isMicOnRef.current || isAIPlayingRef.current || isRecognizingRef.current) return;

    if (micPermission !== "granted") {
      const allowed = await requestMicPermission();
      if (!allowed) return;
    }

    manualMicStopRef.current = false;
    setMicError("");

    try {
      recognitionRef.current.start();
    } catch (error) {
      // start() throws if recognition is already active; ignore safe no-op cases.
      if (!String(error?.message || "").toLowerCase().includes("already")) {
        console.log(error);
      }
    }
  }, [micPermission, requestMicPermission, speechSupported]);


  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return;

      // Avoid resetting voice repeatedly once selected.
      if (selectedVoice) return;

      const femaleVoice =
        voices.find(v =>
          v.name.toLowerCase().includes("zira") ||
          v.name.toLowerCase().includes("samantha") ||
          v.name.toLowerCase().includes("female")
        );

      const maleVoice =
        voices.find(v =>
          v.name.toLowerCase().includes("david") ||
          v.name.toLowerCase().includes("mark") ||
          v.name.toLowerCase().includes("male")
        );

      if (preferredAssistant === "male" && maleVoice) {
        setSelectedVoice(maleVoice);
        setVoiceGender("male");
        return;
      }

      if (preferredAssistant === "female" && femaleVoice) {
        setSelectedVoice(femaleVoice);
        setVoiceGender("female");
        return;
      }

      if (femaleVoice) {
        setSelectedVoice(femaleVoice);
        setVoiceGender("female");
        return;
      }

      if (maleVoice) {
        setSelectedVoice(maleVoice);
        setVoiceGender("male");
        return;
      }

      setSelectedVoice(voices[0]);
      setVoiceGender(preferredAssistant);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, [preferredAssistant, selectedVoice])

  const videoSource = voiceGender === "male" ? maleVideo : femaleVideo;


  const speakText = useCallback((text) => {
    return new Promise((resolve) => {
      if (!window.speechSynthesis || !selectedVoice) {
        resolve();
        return;
      }

      window.speechSynthesis.cancel();

      const humanText = text
        .replace(/,/g, ", ... ")
        .replace(/\./g, ". ... ");

      const utterance = new SpeechSynthesisUtterance(humanText);

      utterance.voice = selectedVoice;
      utterance.rate = 0.92;
      utterance.pitch = 1.05;
      utterance.volume = 1;

      utterance.onstart = () => {
        setIsAIPlaying(true);
        stopMic();
        videoRef.current?.play();
      };

      utterance.onend = () => {
        videoRef.current?.pause();
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
        }
        setIsAIPlaying(false);

        if (isMicOnRef.current) {
          startMic();
        }

        setTimeout(() => {
          setSubtitle("");
          resolve();
        }, 300);
      };

      setSubtitle(text);
      window.speechSynthesis.speak(utterance);
    });
  }, [selectedVoice, startMic, stopMic]);


  useEffect(() => {
    if (!selectedVoice) return;

    const runInterviewSpeech = async () => {
      if (!introPlayedRef.current) {
        introPlayedRef.current = true;

        await speakText(
          `Hi ${userName}, it's great to meet you today. I hope you're feeling confident and ready.`
        );

        await speakText(
          "I'll ask you a few questions. Just answer naturally, and take your time. Let's begin."
        );

        setIsIntroPhase(false);
        return;
      }

      if (isIntroPhase || !currentQuestion) return;
      if (lastSpokenQuestionIndexRef.current === currentIndex) return;

      lastSpokenQuestionIndexRef.current = currentIndex;

      await new Promise(r => setTimeout(r, 800));

      if (currentIndex === questions.length - 1) {
        await speakText("Alright, this one might be a bit more challenging.");
      }

      await speakText(currentQuestion.question);
    }

    runInterviewSpeech();
  }, [selectedVoice, isIntroPhase, currentIndex, currentQuestion, questions.length, speakText, userName])



  useEffect(() => {
    if (isIntroPhase) return;
    if (!currentQuestion) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0;
        }
        return prev - 1

      })
    }, 1000);

    return () => clearInterval(timer)

  }, [isIntroPhase, currentQuestion])


  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      isRecognizingRef.current = true;
      setIsListening(true);
    };

    recognition.onend = () => {
      isRecognizingRef.current = false;
      setIsListening(false);

      if (!manualMicStopRef.current && isMicOnRef.current && !isAIPlayingRef.current) {
        startMic();
      }
    };

    recognition.onerror = (event) => {
      isRecognizingRef.current = false;
      setIsListening(false);

      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setMicError("Microphone permission denied. Please allow mic access in your browser.");
        return;
      }

      if (event.error === "audio-capture") {
        setMicError("No microphone detected. Please connect or enable a microphone.");
        return;
      }

      if (event.error === "network") {
        setMicError("Network issue while listening. Please check connection and try again.");
        return;
      }

      if (event.error !== "aborted" && event.error !== "no-speech") {
        setMicError("Could not start listening. Try toggling mic again.");
      }
    };

    recognition.onresult = (event) => {
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const chunk = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscriptRef.current = `${finalTranscriptRef.current} ${chunk}`.trim();
        } else {
          interimTranscript += chunk;
        }
      }

      const composed = `${finalTranscriptRef.current} ${interimTranscript}`.trim();
      setAnswer(composed);
    };

    recognitionRef.current = recognition;

  }, [startMic]);

  useEffect(() => {
    if (isIntroPhase) return;
    if (!speechSupported) return;
    if (!isMicOn || isAIPlaying) return;
    if (!recognitionRef.current) return;

    startMic();
  }, [isAIPlaying, isIntroPhase, isMicOn, speechSupported, startMic]);


  const toggleMic = () => {
    if (!speechSupported) {
      setMicError("Voice input is not supported in this browser.");
      return;
    }

    if (isMicOn) {
      stopMic();
      setIsMicOn(false);
      setIsListening(false);
    } else {
      setIsMicOn(true);
      setMicError("");
      startMic();
    }
  };


  const submitAnswer = useCallback(async () => {
    if (isSubmitting) return false;

    const trimmedAnswer = answer.trim();
    if (!interviewId || !currentQuestion) {
      setSubmitError("Interview session is invalid. Please restart interview.");
      return false;
    }

    setSubmitError("");
    stopMic()
    setIsSubmitting(true)

    try {
      const result = await axios.post(ServerUrl + "/api/interview/submit-answer", {
        interviewId,
        questionIndex: currentIndex,
        answer: trimmedAnswer,
        timeTaken:
          currentQuestion.timeLimit - timeLeft,
      } , {withCredentials:true, timeout: 20000})

      setFeedback(result.data.feedback)
      await speakText(result.data.feedback)
      setIsSubmitting(false)
      return true
    } catch (error) {
      setSubmitError(error?.response?.data?.message || "Failed to submit answer. Please try again.")
      console.log(error)
      setIsSubmitting(false)
      return false
    }
  }, [answer, currentIndex, currentQuestion, interviewId, isSubmitting, speakText, stopMic, timeLeft]);

  const handleNext = async () => {
    if (isSubmitting) return;

    if (!feedback) {
      const submitted = await submitAnswer();
      if (!submitted) return;
    }

    finalTranscriptRef.current = "";
    setAnswer("");
    setFeedback("");
    setSubmitError("");

    if (currentIndex + 1 >= questions.length) {
      finishInterview();
      return;
    }

    await speakText("Alright, let's move to the next question.");

    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    setTimeLeft(questions[nextIndex]?.timeLimit || 60);
  }

  const finishInterview = async () => {
    stopMic()
    setIsMicOn(false)
    setIsListening(false)
    try {
      const result = await axios.post(ServerUrl + "/api/interview/finish", { interviewId }, { withCredentials: true })

      onFinish(result.data)
    } catch (error) {
      console.log(error)
    }
  }


  useEffect(() => {
    if (isIntroPhase) return;
    if (!currentQuestion) return;

    if (timeLeft === 0 && !isSubmitting && !feedback) {
      const timeoutId = setTimeout(() => {
        submitAnswer();
      }, 0);

      return () => clearTimeout(timeoutId);
    }
  }, [timeLeft, currentQuestion, feedback, isIntroPhase, isSubmitting, submitAnswer]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        manualMicStopRef.current = true;
        recognitionRef.current.stop();
        recognitionRef.current.abort();
      }
      setIsListening(false);

      window.speechSynthesis.cancel();
    };
  }, []);

  const micStatus = isAIPlaying
    ? "AI Speaking"
    : isMicOn
      ? (isListening ? "Listening" : "Mic On")
      : "Mic Off";






  return (
    <div className='min-h-screen bg-linear-to-br from-emerald-50 via-white to-teal-100 flex items-center justify-center p-4 sm:p-6'>
      <div className='w-full max-w-350 min-h-[80vh] bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col lg:flex-row overflow-hidden'>

        {/* video section */}
        <div className='w-full lg:w-[35%] bg-white flex flex-col items-center p-6 space-y-6 border-r border-gray-200'>
          <div className='w-full max-w-md rounded-2xl overflow-hidden shadow-xl'>
            <video
              src={videoSource}
              key={videoSource}
              ref={videoRef}
              muted
              playsInline
              preload="auto"
              className="w-full h-auto object-cover"
            />
          </div>

          {/* subtitle */}
          {subtitle && (
            <div className='w-full max-w-md bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm'>
              <p className='text-gray-700 text-sm sm:text-base font-medium text-center leading-relaxed'>{subtitle}</p>
            </div>
          )}


          {/* timer Area */}
          <div className='w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-md p-6 space-y-5'>
            <div className='flex justify-between items-center'>
              <span className='text-sm text-gray-500'>
                Interview Status
              </span>
              <span className={`text-sm font-semibold ${
                isAIPlaying
                  ? "text-emerald-600"
                  : isMicOn
                    ? "text-blue-600"
                    : "text-gray-500"
              }`}>
                {micStatus}
              </span>
            </div>

            <div className="h-px bg-gray-200"></div>

            <div className='flex justify-center'>

              <Timer timeLeft={timeLeft} totalTime={currentQuestion?.timeLimit} />
            </div>

            <div className="h-px bg-gray-200"></div>

            <div className='grid grid-cols-2 gap-6 text-center'>
              <div>
                <span className='text-2xl font-bold text-emerald-600'>{currentIndex + 1}</span>
                <span className='text-xs text-gray-400'>Current Questions</span>
              </div>

              <div>
                <span className='text-2xl font-bold text-emerald-600'>{questions.length}</span>
                <span className='text-xs text-gray-400'>Total Questions</span>
              </div>
            </div>


          </div>
        </div>

        {/* Text section */}

        <div className='flex-1 flex flex-col p-4 sm:p-6 md:p-8 relative'>
          <h2 className='text-xl sm:text-2xl font-bold text-emerald-600 mb-6'>
            AI Smart Interview
          </h2>


          {!isIntroPhase && (<div className='relative mb-6 bg-gray-50 p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-sm'>
            <p className='text-xs sm:text-sm text-gray-400 mb-2'>
              Question {currentIndex + 1} of {questions.length}
            </p>

            <div className='text-base sm:text-lg font-semibold text-gray-800 leading-relaxed '>{currentQuestion?.question}</div>
          </div>)
          }
          <textarea
            placeholder="Type your answer here..."
            onChange={(e) => {
              const nextValue = e.target.value;
              finalTranscriptRef.current = nextValue;
              setAnswer(nextValue);
            }}
            value={answer}
            className="flex-1 bg-gray-100 p-4 sm:p-6 rounded-2xl resize-none outline-none border border-gray-200 focus:ring-2 focus:ring-emerald-500 transition text-gray-800" />

          {micError && !feedback && (
            <p className='mt-3 text-sm text-red-500'>
              {micError}
            </p>
          )}

          {submitError && !feedback && (
            <p className='mt-3 text-sm text-red-500'>
              {submitError}
            </p>
          )}


         {!feedback ? ( <div className='flex items-center gap-4 mt-6'>
            <div className='flex flex-col items-center gap-2'>
              <motion.button
                onClick={toggleMic}
                whileTap={{ scale: 0.9 }}
                className='w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full bg-black text-white shadow-lg'>
                {isMicOn ? <FaMicrophone size={20} /> : <FaMicrophoneSlash size={20}/>}
              </motion.button>
              <span className={`text-xs font-medium px-2 py-1 rounded-full border ${
                isAIPlaying
                  ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                  : isMicOn
                    ? "text-blue-700 bg-blue-50 border-blue-200"
                    : "text-gray-600 bg-gray-50 border-gray-200"
              }`}>
                {micStatus}
              </span>
            </div>

            <motion.button
            onClick={handleNext}
            disabled={isSubmitting}
              whileTap={{ scale: 0.95 }}
              className='flex-1 bg-linear-to-r from-emerald-600 to-teal-500 text-white py-3 sm:py-4 rounded-2xl shadow-lg hover:opacity-90 transition font-semibold disabled:bg-gray-500'>
              {isSubmitting?"Submitting...":"Move to Next Question"}

            </motion.button>

          </div>):(
            <motion.div 
             initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            className='mt-6 bg-emerald-50 border border-emerald-200 p-5 rounded-2xl shadow-sm'>
              <p className='text-emerald-700 font-medium mb-4'>{feedback}</p>

              <button
              onClick={handleNext}

               className='w-full bg-linear-to-r from-emerald-600 to-teal-500 text-white py-3 rounded-xl shadow-md hover:opacity-90 transition flex items-center justify-center gap-1'>
                Next Question <BsArrowRight size={18}/>
              </button>

            </motion.div>
          )}
        </div>
      </div>

    </div>
  )
}

export default Step2Interview
