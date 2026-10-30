import React, { useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCamera } from '../hooks/useCamera';
import { useBackendStatus } from '../hooks/useBackendStatus';
import { useTranslationSession } from '../hooks/useTranslationSession';
import { PageHeader } from '../components/common/PageHeader';
import { CameraPreview } from '../components/translation/CameraPreview';
import { ModeSelector } from '../components/translation/ModeSelector';
import { PredictionResultCard } from '../components/translation/PredictionResultCard';
import { SentenceBuilder } from '../components/translation/SentenceBuilder';
import { SessionControls } from '../components/translation/SessionControls';
import { Sparkles, Video, HelpCircle } from 'lucide-react';

export const TranslatePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isOnline } = useBackendStatus(12000);

  const {
    videoRef,
    isActive: isCameraActive,
    permission: cameraPermission,
    devices,
    selectedDeviceId,
    error: cameraError,
    startCamera,
    stopCamera,
    switchDevice,
    captureFrame,
    captureFrameBase64,
  } = useCamera();

  const {
    isSessionActive,
    isPaused,
    mode,
    sessionDuration,
    isMockMode,
    handStatus,
    landmarks,
    currentPrediction,
    rawPrediction,
    confidence,
    candidates,
    bufferFill,
    lastUpdateTime,
    sentenceTokens,
    assembledSentence,
    isSpeaking,
    isProcessingFrame,
    isWsConnected,
    startSession,
    pauseSession,
    resumeSession,
    endSession,
    handleModeChange,
    clearSentence,
    resetBuffer,
    removeToken,
    handleSentenceChange,
    processFrame,
    streamFrame,
    speakSentence,
  } = useTranslationSession(isOnline);

  // Sync mode with URL search param
  useEffect(() => {
    const urlMode = searchParams.get('mode');
    if (urlMode === 'STATIC' || urlMode === 'DYNAMIC') {
      if (urlMode !== mode) {
        handleModeChange(urlMode);
      }
    }
  }, [searchParams, handleModeChange, mode]);

  const onModeSelect = (newMode: 'STATIC' | 'DYNAMIC') => {
    handleModeChange(newMode);
    setSearchParams({ mode: newMode });
  };

  // Analyze active video frame using POST /api/predict/frame
  const handleAnalyzeFrame = useCallback(async () => {
    const blob = await captureFrame();
    if (blob) {
      await processFrame(blob);
    }
  }, [captureFrame, processFrame]);

  // Upload an image file for classification
  const handleUploadImage = useCallback(
    async (file: File) => {
      await processFrame(file);
    },
    [processFrame]
  );

  // Continuous Real-Time Streaming Loop: runs whenever camera is active
  useEffect(() => {
    if (!isCameraActive || isPaused || isMockMode) {
      return;
    }

    const intervalTimer = window.setInterval(async () => {
      if (isProcessingFrame) return;

      const base64 = captureFrameBase64(0.55);
      if (!base64) return;

      if (isWsConnected) {
        streamFrame(base64);
      } else {
        const blob = await captureFrame();
        if (blob) {
          await processFrame(blob);
        }
      }
    }, 180); // ~5.5 FPS streaming to backend

    return () => {
      clearInterval(intervalTimer);
    };
  }, [
    isCameraActive,
    isPaused,
    isMockMode,
    isProcessingFrame,
    isWsConnected,
    captureFrameBase64,
    captureFrame,
    streamFrame,
    processFrame,
  ]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header with Mode Selector */}
      <PageHeader
        title="Live Translation Studio"
        subtitle="Translate Indian Sign Language gestures in real time using dual-hand landmark tracking."
        badge={
          isSessionActive ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#E4F2D8] text-[#21431A] border border-[#BFD3A3]">
              <span className="w-2 h-2 rounded-full bg-[#4D6431] animate-ping" />
              <span>Studio Active</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F0F2F3] text-[#747873]">
              Studio Ready
            </span>
          )
        }
        actions={
          <div className="w-full sm:w-auto">
            <ModeSelector mode={mode} onModeChange={onModeSelect} />
          </div>
        }
      />

      {/* Session Controls Header Strip */}
      <SessionControls
        isSessionActive={isSessionActive}
        isPaused={isPaused}
        sessionDuration={sessionDuration}
        bufferFill={bufferFill}
        onStartSession={() => {
          if (!isCameraActive) {
            startCamera();
          }
          startSession();
        }}
        onPauseSession={pauseSession}
        onResumeSession={resumeSession}
        onEndSession={endSession}
        onResetBuffer={resetBuffer}
      />

      {/* Main Two-Column Translation Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Live Camera Panel (7 cols on desktop) */}
        <div className="lg:col-span-7 space-y-6">
          <CameraPreview
            videoRef={videoRef}
            isActive={isCameraActive}
            permission={cameraPermission}
            devices={devices}
            selectedDeviceId={selectedDeviceId}
            error={cameraError}
            handStatus={handStatus}
            landmarks={landmarks}
            isSessionActive={isSessionActive}
            isProcessingFrame={isProcessingFrame}
            isMockMode={isMockMode}
            isWsConnected={isWsConnected}
            onStartCamera={() => startCamera()}
            onStopCamera={stopCamera}
            onSwitchDevice={switchDevice}
            onCaptureFrame={handleAnalyzeFrame}
            onUploadImage={handleUploadImage}
          />

          {/* Quick Instructions / Accessibility Guidance */}
          <div className="p-4 rounded-3xl bg-white border border-[#F0F2F3] shadow-soft flex items-start gap-3 text-xs text-[#747873]">
            <HelpCircle className="w-4 h-4 text-[#A4BF80] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-[#252720] block">
                How recognition works:
              </span>
              <p>
                Keep both hands clearly within view of the webcam against a well-lit background.
                The system translates gestures at a minimum <strong>65% confidence threshold</strong> with a 5-frame temporal majority-voting filter to prevent false positives.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Prediction Results & Sentence Builder (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Recognition Result Card */}
          <PredictionResultCard
            mode={mode}
            currentPrediction={currentPrediction}
            rawPrediction={rawPrediction}
            confidence={confidence}
            candidates={candidates}
            bufferFill={bufferFill}
            lastUpdateTime={lastUpdateTime}
            isMockMode={isMockMode}
          />

          {/* Dedicated Sentence Builder ("Your Sentence") */}
          <SentenceBuilder
            tokens={sentenceTokens}
            assembledSentence={assembledSentence}
            isSpeaking={isSpeaking}
            onSentenceChange={handleSentenceChange}
            onRemoveToken={removeToken}
            onClearSentence={clearSentence}
            onSpeak={() => speakSentence()}
          />
        </div>
      </div>
    </div>
  );
};

