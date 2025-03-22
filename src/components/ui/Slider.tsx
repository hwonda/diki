'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface SliderProps {
  displayLevels: string[];
  range: [number, number];
  onRangeChange: (newRange: [number, number])=> void;
}

const Slider = ({ displayLevels, range, onRangeChange }: SliderProps) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeHandle, setActiveHandle] = useState<'start' | 'end' | null>(null);

  const getPositionFromValue = (value: number) => {
    return (value / (displayLevels.length - 1)) * 100;
  };

  const handleMouseDown = (e: React.MouseEvent, handle: 'start' | 'end') => {
    e.preventDefault();
    setIsDragging(true);
    setActiveHandle(handle);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !activeHandle) return;

    const bounds = sliderRef.current?.getBoundingClientRect();
    if (!bounds) return;

    const percent = Math.max(0, Math.min(100, (e.clientX - bounds.left) / bounds.width * 100));
    const newValue = (percent / 100) * (displayLevels.length - 1);

    const newRange: [number, number] = [...range];
    if (activeHandle === 'start') {
      newRange[0] = Math.min(newValue, range[1]);
    } else {
      newRange[1] = Math.max(newValue, range[0]);
    }

    onRangeChange(newRange);
  }, [isDragging, activeHandle, range, onRangeChange, displayLevels.length]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setActiveHandle(null);

    // 가장 가까운 마커로 스냅
    const newRange: [number, number] = [...range];
    newRange[0] = Math.round(newRange[0]);
    newRange[1] = Math.round(newRange[1]);
    onRangeChange(newRange);
  }, [range, onRangeChange]);

  const handleTrackClick = useCallback((e: React.MouseEvent) => {
    const bounds = sliderRef.current?.getBoundingClientRect();
    if (!bounds) return;

    const percent = Math.max(0, Math.min(100, (e.clientX - bounds.left) / bounds.width * 100));
    const clickedValue = (percent / 100) * (displayLevels.length - 1);

    // 클릭한 위치에 해당하는 가장 가까운 인덱스 찾기
    const leftIndex = Math.floor(clickedValue);
    const rightIndex = Math.ceil(clickedValue);

    // 정확히 마커 위를 클릭한 경우
    if (leftIndex === rightIndex) {
      if (leftIndex === range[0] || leftIndex === range[1]) return;
      if (leftIndex > range[0] && leftIndex < range[1]) {
        onRangeChange([leftIndex, range[1]]);
      } else if (leftIndex < range[0]) {
        onRangeChange([leftIndex, range[1]]);
      } else if (leftIndex > range[1]) {
        onRangeChange([range[0], leftIndex]);
      }
      return;
    }

    // 마커 사이를 클릭한 경우 (세그먼트 토글 동작)
    // 해당 세그먼트가 현재 활성화 상태인지 확인
    const isSegmentActive = leftIndex >= range[0] && rightIndex <= range[1];

    if (isSegmentActive) {
      // 활성화된 세그먼트를 클릭한 경우, 가장 가까운 핸들을 움직여 비활성화
      const distanceToStart = Math.abs(clickedValue - range[0]);
      const distanceToEnd = Math.abs(clickedValue - range[1]);

      if (distanceToStart <= distanceToEnd) {
        onRangeChange([rightIndex, range[1]]);
      } else {
        onRangeChange([range[0], leftIndex]);
      }
    } else {
      // 비활성화된 세그먼트를 클릭한 경우, 가장 가까운 핸들을 움직여 활성화
      if (clickedValue < range[0]) {
        onRangeChange([leftIndex, range[1]]);
      } else if (clickedValue > range[1]) {
        onRangeChange([range[0], rightIndex]);
      } else {
        const distanceToStart = Math.abs(clickedValue - range[0]);
        const distanceToEnd = Math.abs(clickedValue - range[1]);

        if (distanceToStart <= distanceToEnd) {
          onRangeChange([leftIndex, range[1]]);
        } else {
          onRangeChange([range[0], rightIndex]);
        }
      }
    }
  }, [range, onRangeChange, displayLevels.length]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, activeHandle, handleMouseMove, handleMouseUp]);

  return (
    <div className="relative w-full h-12 px-2">
      {/* Level Markers */}
      {displayLevels.map((level, index) => (
        <div
          key={index}
          className="absolute top-1 text-center text-[13px] text-gray3 w-10 cursor-pointer z-10"
          style={{
            left: `${ getPositionFromValue(index) + 4.5 }%`,
            transform: 'translateX(-50%)',
          }}
          onClick={(e) => {
            e.stopPropagation();

            // 현재 범위의 시작이나 끝 마커 클릭 시 아무 작업도 하지 않음
            if (index === range[0] || index === range[1]) return;

            // 범위 내부의 마커 클릭 시
            if (index > range[0] && index < range[1]) {
              // 가장 가까운 핸들을 이동하여 해당 마커 제외
              const distanceToStart = Math.abs(index - range[0]);
              const distanceToEnd = Math.abs(index - range[1]);

              if (distanceToStart <= distanceToEnd) {
                onRangeChange([index, range[1]]);
              } else {
                onRangeChange([range[0], index]);
              }
            }
            // 범위 왼쪽의 마커 클릭 시
            else if (index < range[0]) {
              onRangeChange([index, range[1]]);
            }
            // 범위 오른쪽의 마커 클릭 시
            else if (index > range[1]) {
              onRangeChange([range[0], index]);
            }
          }}
        >
          {level}
        </div>
      ))}

      {/* Start Level Label */}
      <div
        className="absolute top-1 text-center text-[13px] text-primary w-10 z-10"
        style={{
          left: `${ getPositionFromValue(range[0]) + 4.5 }%`,
          transform: 'translateX(-50%)',
          opacity: isDragging && activeHandle === 'start' ? 0 : 1,
        }}
      >
        {displayLevels[range[0]]}
      </div>

      {/* End Level Label */}
      <div
        className="absolute top-1 text-center text-[13px] text-primary w-10 z-10"
        style={{
          left: `${ getPositionFromValue(range[1]) + 4.5 }%`,
          transform: 'translateX(-50%)',
          opacity: isDragging && activeHandle === 'end' ? 0 : 1,
        }}
      >
        {displayLevels[range[1]]}
      </div>

      {/* Background Track (Gray Bar) */}
      <div
        className="absolute top-6 w-full h-1 bg-gray4 z-0"
        style={{ top: '26px' }}
      />

      {/* Slider Track with Invisible Padding */}
      <div
        ref={sliderRef}
        className="absolute top-6 w-full h-1 cursor-pointer z-20"
        onClick={handleTrackClick}
        style={{ padding: '20px 0', marginTop: '-10px', backgroundColor: 'transparent' }}
      >
        {/* Level Markers on Track */}
        {displayLevels.map((_, index) => (
          <div
            key={index}
            className="absolute w-px h-2 bg-gray3 top-[8px] z-10"
            style={{
              left: `${ getPositionFromValue(index) }%`,
              transform: 'translateX(-50%)',
            }}
          />
        ))}

        {/* Selected Range */}
        <div
          className="absolute h-1 bg-primary rounded-full top-[12px] z-10"
          style={{
            left: `${ getPositionFromValue(range[0]) }%`,
            right: `${ 100 - getPositionFromValue(range[1]) }%`,
            transition: isDragging ? 'none' : 'left 0.2s ease-out, right 0.2s ease-out',
          }}
        />

        {/* Handles */}
        <div
          className={`absolute size-3 -mt-px ml-[-6px] bg-primary rounded-full cursor-pointer z-30 ${
            activeHandle === 'start' ? 'ring-4 ring-primary/10 dark:ring-primary/30' : ''
          }`}
          style={{
            left: `${ getPositionFromValue(range[0]) }%`,
            top: '9px',
            transition: isDragging ? 'none' : 'left 0.2s ease-out, opacity 0.1s ease-out',
          }}
          onMouseDown={(e) => handleMouseDown(e, 'start')}
        />
        <div
          className={`absolute size-3 -mt-px ml-[-6px] bg-primary rounded-full cursor-pointer z-30 ${
            activeHandle === 'end' ? 'ring-4 ring-primary/10 dark:ring-primary/30' : ''
          }`}
          style={{
            left: `${ getPositionFromValue(range[1]) }%`,
            top: '9px',
            transition: isDragging ? 'none' : 'left 0.2s ease-out, opacity 0.1s ease-out',
          }}
          onMouseDown={(e) => handleMouseDown(e, 'end')}
        />
      </div>
    </div>
  );
};

export default Slider;
