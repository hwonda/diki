'use client';

import { useState, useEffect } from 'react';
import { Slider as MUISlider, styled } from '@mui/material';

interface SliderProps {
  displayLevels: string[];
  range: [number, number];
  onRangeChange: (newRange: [number, number])=> void;
}

// Styled MUI Slider component
const StyledSlider = styled(MUISlider)(() => ({
  color: 'var(--primary)',
  height: 3,
  '& .MuiSlider-thumb': {
    height: 12,
    width: 12,
    margin:0,
    backgroundColor: 'var(--primary)',
    '&:focus, &:hover, &.Mui-active': {
      boxShadow: '0 0 0 8px var(--primary-opacity)',
    },
  },
  '& .MuiSlider-rail': {
    backgroundColor: 'var(--gray4)',
    opacity: 1,
  },
  '& .MuiSlider-track': {
    height: 3,
  },
  '& .MuiSlider-mark': {
    backgroundColor: 'var(--gray3)',

  },
  '& .MuiSlider-markActive': {
    backgroundColor: 'var(--gray4)',
  },
  '& .MuiSlider-markLabel': {
    color: 'var(--gray3)',
    fontSize: '12px',
  },
  '& .MuiSlider-markLabelActive': {
    color: 'var(--accent)',
  },
  '& .css-swtyag-MuiSlider-markLabel, .css-1qb795b-MuiSlider-markLabel': {
    fontFamily: 'Pretendard',
    top: '25px',
  },
}));

const Slider = ({ displayLevels, range, onRangeChange }: SliderProps) => {
  // 슬라이더 range를 0-100 범위로 변환
  const [sliderValue, setSliderValue] = useState<[number, number]>([
    (range[0] / (displayLevels.length - 1)) * 100,
    (range[1] / (displayLevels.length - 1)) * 100,
  ]);

  // 슬라이더 마크 생성
  const marks = displayLevels.map((level, index) => ({
    value: (index / (displayLevels.length - 1)) * 100,
    label: level,
  }));

  // 외부 범위 변경 시 내부 값 업데이트
  useEffect(() => {
    setSliderValue([
      (range[0] / (displayLevels.length - 1)) * 100,
      (range[1] / (displayLevels.length - 1)) * 100,
    ]);
  }, [range, displayLevels.length]);

  const handleChange = (_event: Event, newValue: number | number[]) => {
    if (Array.isArray(newValue)) {
      setSliderValue(newValue as [number, number]);
    }
  };

  const handleChangeCommitted = (_event: React.SyntheticEvent | Event, newValue: number | number[]) => {
    if (Array.isArray(newValue)) {
      // 퍼센트 값을 인덱스로 변환
      const startIndex = Math.round((newValue[0] / 100) * (displayLevels.length - 1));
      const endIndex = Math.round((newValue[1] / 100) * (displayLevels.length - 1));

      // 범위 내에 있는지 확인
      const newRange: [number, number] = [
        Math.max(0, Math.min(displayLevels.length - 1, startIndex)),
        Math.max(0, Math.min(displayLevels.length - 1, endIndex)),
      ];

      onRangeChange(newRange);
    }
  };

  return (
    <div className="relative w-full">
      <StyledSlider
        value={sliderValue}
        onChange={handleChange}
        onChangeCommitted={handleChangeCommitted}
        // valueLabelDisplay="off"
        marks={marks}
        min={0}
        max={100}
      />
      {/* <div
        className="absolute top-[31px] text-center text-primary w-10 z-10 text-xs"
        style={{
          left: `${ sliderValue[0] }%`,
          transform: 'translateX(-50%)',
        }}
      >
        {displayLevels[range[0]]}
      </div>
      <div
        className="absolute top-[31px] text-center text-primary w-10 z-10 text-xs"
        style={{
          left: `${ sliderValue[1] }%`,
          transform: 'translateX(-50%)',
        }}
      >
        {displayLevels[range[1]]}
      </div> */}
    </div>
  );
};

export default Slider;
