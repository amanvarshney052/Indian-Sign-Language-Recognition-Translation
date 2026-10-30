import React, { useState } from 'react';
import {
  Volume2,
  Copy,
  Trash2,
  Check,
  X,
  Sparkles,
  VolumeX,
} from 'lucide-react';
import { formatSignLabel } from '../../utils/formatting';
import { ConfirmationDialog } from '../common/ConfirmationDialog';

interface SentenceBuilderProps {
  tokens: string[];
  assembledSentence: string;
  isSpeaking: boolean;
  onSentenceChange: (text: string) => void;
  onRemoveToken: (index: number) => void;
  onClearSentence: () => void;
  onSpeak: () => void;
}

export const SentenceBuilder: React.FC<SentenceBuilderProps> = ({
  tokens,
  assembledSentence,
  isSpeaking,
  onSentenceChange,
  onRemoveToken,
  onClearSentence,
  onSpeak,
}) => {
  const [copied, setCopied] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleCopy = () => {
    if (!assembledSentence.trim()) return;
    navigator.clipboard.writeText(assembledSentence);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-soft border border-[#F0F2F3] space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#D5E2C2] flex items-center justify-center text-[#252720]">
            <Sparkles className="w-4 h-4 text-[#4D6431]" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-[#252720]">Your Sentence</h3>
            <p className="text-xs text-[#747873]">
              Assembled from consecutive accepted gesture signs
            </p>
          </div>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSpeak}
            disabled={!assembledSentence.trim()}
            title={isSpeaking ? 'Speaking...' : 'Speak Sentence'}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition ${
              isSpeaking
                ? 'bg-[#B7C8FF] text-[#1E3A8A] animate-pulse'
                : assembledSentence.trim()
                ? 'bg-[#F0F2F3] text-[#252720] hover:bg-[#D5E2C2]'
                : 'bg-[#F7F8F4] text-[#9DA29B] cursor-not-allowed'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>{isSpeaking ? 'Speaking...' : 'Speak'}</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            disabled={!assembledSentence.trim()}
            title="Copy sentence to clipboard"
            className={`p-2 rounded-full text-xs font-semibold flex items-center justify-center transition ${
              copied
                ? 'bg-[#E4F2D8] text-[#21431A]'
                : assembledSentence.trim()
                ? 'bg-[#F0F2F3] text-[#252720] hover:bg-[#E4E7E9]'
                : 'bg-[#F7F8F4] text-[#9DA29B] cursor-not-allowed'
            }`}
          >
            {copied ? <Check className="w-4 h-4 text-[#4D6431]" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            disabled={!assembledSentence.trim() && tokens.length === 0}
            title="Clear current sentence"
            className={`p-2 rounded-full text-xs font-semibold transition ${
              assembledSentence.trim() || tokens.length > 0
                ? 'bg-[#FEE2E2] text-[#991B1B] hover:bg-[#FECACA]'
                : 'bg-[#F7F8F4] text-[#9DA29B] cursor-not-allowed'
            }`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Ordered Token Chips */}
      {tokens.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 p-3 bg-[#F7F8F4] rounded-2xl border border-[#E8EEDF]/80">
          <span className="text-[11px] font-bold text-[#747873] mr-1">Tokens:</span>
          {tokens.map((token, index) => (
            <span
              key={`${token}-${index}`}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white text-[#252720] shadow-soft border border-[#E8EEDF] group"
            >
              <span>{formatSignLabel(token)}</span>
              <button
                type="button"
                onClick={() => onRemoveToken(index)}
                aria-label={`Remove ${token}`}
                className="w-4 h-4 rounded-full flex items-center justify-center text-[#9DA29B] hover:text-[#DC2626] hover:bg-[#FEE2E2] transition"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Editable Textarea */}
      <div className="relative">
        <textarea
          rows={3}
          value={assembledSentence}
          onChange={(e) => onSentenceChange(e.target.value)}
          placeholder="Recognized words will automatically appear here. You can also edit the text directly..."
          className="w-full p-4 rounded-2xl bg-[#F7F8F4] border border-[#E8EEDF] text-[#252720] font-medium text-base sm:text-lg focus:bg-white focus:border-[#4D6431] focus:ring-2 focus:ring-[#D5E2C2] transition resize-none placeholder:text-[#9DA29B] leading-relaxed"
        />
        <div className="absolute right-3 bottom-3 text-[11px] text-[#9DA29B] pointer-events-none">
          {assembledSentence.trim().length} characters
        </div>
      </div>

      {/* Confirmation Dialog for Clearing Sentence */}
      <ConfirmationDialog
        isOpen={showClearConfirm}
        title="Clear Sentence"
        description="Are you sure you want to clear your current assembled sentence? This will reset all accepted tokens."
        confirmLabel="Clear All"
        isDestructive={true}
        onConfirm={() => {
          onClearSentence();
          setShowClearConfirm(false);
        }}
        onCancel={() => setShowClearConfirm(false)}
      />
    </div>
  );
};

