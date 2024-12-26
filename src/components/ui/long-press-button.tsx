import React, { useState, useRef, useEffect } from "react";
import { Button } from "./button";

interface LongPressButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onLongPress: () => void;
  duration?: number;
  variant?: "outline" | "default";
}

export function LongPressButton({
  children,
  onLongPress,
  onClick,
  duration = 500,
  className,
  variant = "default",
  ...props
}: LongPressButtonProps) {
  const [pressing, setPressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const animationFrameRef = useRef<number>();
  const startTimeRef = useRef<number>();
  const hasLongPressed = useRef(false);
  const longPressStarted = useRef(false);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const updateProgress = () => {
    if (!startTimeRef.current) return;

    const elapsed = Date.now() - startTimeRef.current;
    if (elapsed >= 100) {
      longPressStarted.current = true;
    }
    const newProgress = Math.min((elapsed / duration) * 100, 100);
    setProgress(newProgress);

    if (elapsed >= duration) {
      stopPressing();
      hasLongPressed.current = true;
      onLongPress();
    } else {
      animationFrameRef.current = requestAnimationFrame(updateProgress);
    }
  };

  const startPressing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setPressing(true);
    longPressStarted.current = false;
    hasLongPressed.current = false;
    startTimeRef.current = Date.now();
    animationFrameRef.current = requestAnimationFrame(updateProgress);
  };

  const stopPressing = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setPressing(false);
    setProgress(0);
    startTimeRef.current = undefined;
    longPressStarted.current = false;
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!hasLongPressed.current && onClick) {
      onClick(e);
    }
    hasLongPressed.current = false;
  };

  return (
    <div className="relative">
      <Button
        variant={variant}
        className={className}
        onMouseDown={startPressing}
        onMouseUp={stopPressing}
        onMouseLeave={stopPressing}
        onTouchStart={startPressing}
        onTouchEnd={stopPressing}
        onClick={handleClick}
        {...props}
      >
        {children}
      </Button>
      {pressing && longPressStarted.current && (
        <div className="absolute bottom-0 left-0 h-1 bg-white/20 w-full overflow-hidden rounded-b-md">
          <div
            className="h-full bg-white/40"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
} 