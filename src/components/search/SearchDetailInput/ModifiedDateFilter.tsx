/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ko } from 'date-fns/locale';
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ModifiedDateFilterProps {
  activeModal: string | null | undefined;
  handleFilterClick: (modalName: string)=> void;
  modifiedDateRange: [Date | null | undefined, Date | null | undefined];
  hasInteractedModified: boolean;
  handleDateChange: (dates: [Date | null | undefined, Date | null | undefined], type: 'published' | 'modified')=> void;
  formatDateRange: (range: [Date | null | undefined, Date | null | undefined])=> string;
}

const ModifiedDateFilter = ({
  activeModal,
  handleFilterClick,
  modifiedDateRange,
  hasInteractedModified,
  handleDateChange,
  formatDateRange,
}: ModifiedDateFilterProps) => {
  // 월/년 선택 모드 상태 추가
  const [isMonthYearPickerVisible, setIsMonthYearPickerVisible] = useState(false);

  // 월 선택 핸들러
  const handleMonthYearChange = (date: Date) => {
    // 선택한 월의 첫날과 마지막날을 계산
    const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
    const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    // 날짜 범위 업데이트
    handleDateChange([startDate, endDate], 'modified');

    // 월/년 선택 모드 종료
    setIsMonthYearPickerVisible(false);
  };

  return (
    <div
      onClick={() => handleFilterClick('modifiedDate')}
      className={`group hidden lg:flex justify-between items-center py-3 pl-6 pr-3 rounded-full cursor-pointer relative
        before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-8 before:w-px before:bg-gray2
        ${ activeModal === 'modifiedDate' ? 'before:bg-primary' : '' }
        ${ activeModal === 'publishedDate' ? 'before:bg-primary' : '' }
        `}
    >
      <div className='flex flex-col group-hover:cursor-pointer'>
        <label htmlFor="modifiedDate" className={`text-xs text-main group-hover:cursor-pointer group-hover:text-primary ${ activeModal === 'modifiedDate' ? 'text-primary' : '' }`}>
          {'수정일'}
        </label>
        <span className={`${
          hasInteractedModified ? 'text-main' : 'text-gray1'
        } group-hover:cursor-pointer text-sm truncate`}
        >
          {formatDateRange(modifiedDateRange)}
        </span>
      </div>
      {activeModal === 'modifiedDate' && (
        <div className="filter-modal absolute top-full right-0 mt-2 w-64 border border-primary bg-background shadow-lg dark:shadow-gray5 rounded-lg p-3.5 z-10">
          {/* <div className="text-sm font-medium mb-2.5">{'수정일'}</div> */}
          <div className="flex justify-center">
            <DatePicker
              selected={modifiedDateRange[0]}
              onChange={(dates: Date | [Date | undefined, Date | undefined] | null ) => {
                if (isMonthYearPickerVisible) {
                  // 월/년 선택 모드에서는 단일 날짜가 선택됨
                  handleMonthYearChange(dates as Date);
                } else {
                  // 일반 모드에서는 날짜 범위가 선택됨
                  handleDateChange(dates as [Date | undefined, Date | undefined], 'modified');
                }
              }}
              startDate={modifiedDateRange[0]}
              endDate={modifiedDateRange[1]}
              selectsRange={!isMonthYearPickerVisible}
              calendarClassName="dark:bg-background"
              locale={ko}
              inline
              showMonthYearPicker={isMonthYearPickerVisible}
              dateFormat="MM/yyyy"
              renderCustomHeader={({
                date,
                decreaseMonth,
                increaseMonth,
                prevMonthButtonDisabled,
                nextMonthButtonDisabled,
                decreaseYear,
                increaseYear,
                prevYearButtonDisabled,
                nextYearButtonDisabled,
              }) => (
                <div className="flex justify-between items-center px-2">
                  {!isMonthYearPickerVisible ? (
                    // 일반 달력 모드일 때 월 네비게이션
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          decreaseMonth();
                        }}
                        disabled={prevMonthButtonDisabled}
                        type="button"
                        className="p-1 text-primary"
                      >
                        <ChevronLeft />
                      </button>

                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsMonthYearPickerVisible(true);
                        }}
                        className="cursor-pointer font-semibold text-main text-sm"
                      >
                        {new Intl.DateTimeFormat('ko', {
                          year: 'numeric',
                          month: 'long',
                        }).format(date)}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          increaseMonth();
                        }}
                        disabled={nextMonthButtonDisabled}
                        type="button"
                        className="p-1 text-primary"
                      >
                        <ChevronRight />
                      </button>
                    </>
                  ) : (
                    // 월/년 선택 모드일 때 연도 네비게이션
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          decreaseYear();
                        }}
                        disabled={prevYearButtonDisabled}
                        type="button"
                        className="p-1 text-primary"
                      >
                        <ChevronLeft />
                      </button>

                      <div className="font-semibold text-main text-sm">
                        {date.getFullYear()}{'년'}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          increaseYear();
                        }}
                        disabled={nextYearButtonDisabled}
                        type="button"
                        className="p-1 text-primary"
                      >
                        <ChevronRight />
                      </button>
                    </>
                  )}
                </div>
              )}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ModifiedDateFilter;