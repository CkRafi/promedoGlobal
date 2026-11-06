import React from 'react';
import { Award, CheckCircle2 } from 'lucide-react';

interface CourseProgressBarProps {
  progress: number;
  totalLessons?: number;
  completedLessons?: number;
  compact?: boolean;
  className?: string;
  showDetails?: boolean;
}

export const CourseProgressBar: React.FC<CourseProgressBarProps> = ({
  progress = 0,
  totalLessons,
  completedLessons,
  compact = false,
  className = '',
  showDetails = true
}) => {
  const safeProgress = Math.min(Math.max(Math.round(progress), 0), 100);
  const isComplete = safeProgress === 100;

  if (compact) {
    return (
      <div className={`w-full space-y-1.5 ${className}`}>
        <div className="flex items-center justify-between text-[11px] font-bold text-gray-500">
          <span className="flex items-center gap-1 text-[#3853A4]">
            {isComplete ? (
              <CheckCircle2 size={12} className="text-emerald-500" />
            ) : (
              <Award size={12} />
            )}
            {safeProgress}% Complete
          </span>
          {totalLessons !== undefined && (
            <span>
              {completedLessons !== undefined ? completedLessons : Math.round((safeProgress / 100) * totalLessons)} of {totalLessons} Lessons
            </span>
          )}
        </div>
        <div className="w-full bg-[#E5EEFF] rounded-full h-2 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              isComplete ? 'bg-emerald-500' : 'bg-[#3853A4]'
            }`}
            style={{ width: `${safeProgress}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full bg-white rounded-2xl p-4 border border-[#E5EEFF] space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
            isComplete ? 'bg-emerald-50 text-emerald-600' : 'bg-[#EFF4FF] text-[#3853A4]'
          }`}>
            {isComplete ? <CheckCircle2 size={16} /> : <Award size={16} />}
          </div>
          <div>
            <h5 className="font-black text-xs text-[#0B1C30]">
              {isComplete ? 'Course Completed!' : 'Course Progress'}
            </h5>
            <p className="text-[10px] text-gray-400 font-semibold">
              {safeProgress}% Mastered
            </p>
          </div>
        </div>

        {totalLessons !== undefined && showDetails && (
          <div className="text-right">
            <span className="text-xs font-black text-[#0B1C30]">
              {completedLessons !== undefined ? completedLessons : Math.round((safeProgress / 100) * totalLessons)} / {totalLessons}
            </span>
            <span className="text-[10px] text-gray-400 block font-semibold">Lessons</span>
          </div>
        )}
      </div>

      <div className="w-full bg-[#E5EEFF] rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${
            isComplete ? 'bg-emerald-500' : 'bg-[#3853A4]'
          }`}
          style={{ width: `${safeProgress}%` }}
        />
      </div>
    </div>
  );
};

export default CourseProgressBar;
