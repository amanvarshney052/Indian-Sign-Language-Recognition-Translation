import React, { useRef, useEffect } from 'react';
import { DualHandLandmarks } from '../../types/translation';

interface LandmarkOverlayProps {
  landmarks: DualHandLandmarks;
  isActive: boolean;
}

// MediaPipe 21 Hand Landmarks bone connections
const HAND_CONNECTIONS: [number, number][] = [
  // Palm
  [0, 1], [1, 2], [2, 3], [3, 4],     // Thumb
  [0, 5], [5, 6], [6, 7], [7, 8],     // Index
  [0, 9], [9, 10], [10, 11], [11, 12],// Middle
  [0, 13], [13, 14], [14, 15], [15, 16], // Ring
  [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
  [5, 9], [9, 13], [13, 17],          // Knuckles base
];

export const LandmarkOverlay: React.FC<LandmarkOverlayProps> = ({
  landmarks,
  isActive,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear previous frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!isActive) return;

    const drawHand = (
      points: [number, number, number][],
      lineColor: string,
      jointColor: string,
      tipColor: string
    ) => {
      if (!points || points.length < 21) return;

      const w = canvas.width;
      const h = canvas.height;

      // Draw skeleton bone segments
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = lineColor;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      HAND_CONNECTIONS.forEach(([i, j]) => {
        const p1 = points[i];
        const p2 = points[j];
        if (!p1 || !p2) return;

        // In case coords are normalized [0, 1]
        const x1 = p1[0] <= 1 ? p1[0] * w : p1[0];
        const y1 = p1[1] <= 1 ? p1[1] * h : p1[1];
        const x2 = p2[0] <= 1 ? p2[0] * w : p2[0];
        const y2 = p2[1] <= 1 ? p2[1] * h : p2[1];

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      });

      // Draw landmark joint points
      points.forEach((pt, index) => {
        const x = pt[0] <= 1 ? pt[0] * w : pt[0];
        const y = pt[1] <= 1 ? pt[1] * h : pt[1];
        const isTip = [4, 8, 12, 16, 20].includes(index);

        ctx.beginPath();
        ctx.arc(x, y, isTip ? 5 : 3.5, 0, 2 * Math.PI);
        ctx.fillStyle = isTip ? tipColor : jointColor;
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      });
    };

    // Draw Left Hand (Green/Sage palette)
    if (landmarks.Left && landmarks.Left.length === 21) {
      drawHand(landmarks.Left, 'rgba(101, 130, 65, 0.85)', '#D5E2C2', '#252720');
    }

    // Draw Right Hand (Blue/Lavender palette)
    if (landmarks.Right && landmarks.Right.length === 21) {
      drawHand(landmarks.Right, 'rgba(30, 58, 138, 0.85)', '#B7C8FF', '#D1B9E8');
    }
  }, [landmarks, isActive]);

  return (
    <canvas
      ref={canvasRef}
      width={640}
      height={480}
      className="absolute inset-0 w-full h-full pointer-events-none object-contain z-10"
    />
  );
};

