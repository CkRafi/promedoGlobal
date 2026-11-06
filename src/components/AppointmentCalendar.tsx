import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  CheckCircle, 
  AlertCircle, 
  Filter, 
  MessageSquare, 
  Trash2, 
  Globe, 
  GraduationCap, 
  Sparkles,
  CalendarDays
} from 'lucide-react';

interface Appointment {
  id: string;
  fullName: string;
  email: string;
  whatsapp: string;
  qualification?: string;
  graduationYear?: string;
  plannedExamDate?: string;
  examPreparingFor?: string;
  otherDetails?: string;
  country?: string;
  status?: string;
  createdAt?: string;
}

interface AppointmentCalendarProps {
  appointments: Appointment[];
  onToggleStatus: (id: string, currentStatus: string) => Promise<void> | void;
  onDelete: (id: string) => Promise<void> | void;
}

export const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({
  appointments,
  onToggleStatus,
  onDelete
}) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Pending' | 'Contacted' | 'Completed'>('ALL');

  // Month navigation
  const prevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDateStr(today.toISOString().split('T')[0]);
  };

  // Helper to format date to YYYY-MM-DD string safely
  const getApptDateStr = (createdAt?: string): string | null => {
    if (!createdAt) return null;
    try {
      const d = new Date(createdAt);
      if (isNaN(d.getTime())) return null;
      return d.toISOString().split('T')[0];
    } catch {
      return null;
    }
  };

  // Group appointments by YYYY-MM-DD
  const apptsByDate = React.useMemo(() => {
    const map: Record<string, Appointment[]> = {};
    appointments.forEach(appt => {
      const dateStr = getApptDateStr(appt.createdAt);
      if (dateStr) {
        if (!map[dateStr]) map[dateStr] = [];
        map[dateStr].push(appt);
      }
    });
    return map;
  }, [appointments]);

  // Calendar math
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Create grid cells (padding + actual days)
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const paddingSlots = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  // Month stats calculation
  const currentMonthAppts = appointments.filter(a => {
    const dStr = getApptDateStr(a.createdAt);
    if (!dStr) return false;
    const apptDate = new Date(a.createdAt!);
    return apptDate.getFullYear() === year && apptDate.getMonth() === month;
  });

  const monthPendingCount = currentMonthAppts.filter(a => (a.status || 'Pending') === 'Pending').length;
  const monthContactedCount = currentMonthAppts.filter(a => a.status === 'Contacted').length;
  const monthCompletedCount = currentMonthAppts.filter(a => a.status === 'Completed').length;

  // Selected date appointments
  const selectedDayAppts = (apptsByDate[selectedDateStr] || []).filter(a => {
    if (statusFilter === 'ALL') return true;
    return (a.status || 'Pending') === statusFilter;
  });

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="space-y-8">
      {/* Month Metrics Header Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 text-brand-blue flex items-center justify-center shrink-0">
            <CalendarDays size={22} />
          </div>
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Month Total</p>
            <p className="text-2xl font-black text-brand-dark">{currentMonthAppts.length}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-amber-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <AlertCircle size={22} />
          </div>
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600">Pending</p>
            <p className="text-2xl font-black text-amber-900">{monthPendingCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-blue-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <Clock size={22} />
          </div>
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600">Contacted</p>
            <p className="text-2xl font-black text-blue-900">{monthContactedCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-emerald-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle size={22} />
          </div>
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600">Completed</p>
            <p className="text-2xl font-black text-emerald-900">{monthCompletedCount}</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Calendar Grid (8 cols on large screens) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
          {/* Calendar Header with controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-dark text-white flex items-center justify-center">
                <CalendarIcon size={20} />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-brand-dark">
                  {monthNames[month]} {year}
                </h3>
                <p className="text-xs text-gray-400 font-medium">Click any date to view booked consultations</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={goToToday}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors cursor-pointer mr-1"
              >
                Today
              </button>
              <button
                onClick={prevMonth}
                className="p-2 hover:bg-gray-100 rounded-xl text-gray-600 transition-colors cursor-pointer border border-gray-200"
                title="Previous Month"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-gray-100 rounded-xl text-gray-600 transition-colors cursor-pointer border border-gray-200"
                title="Next Month"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {weekDays.map((day, idx) => (
              <div 
                key={day} 
                className={`py-2 text-[11px] font-black uppercase tracking-wider ${idx === 0 || idx === 6 ? 'text-amber-600' : 'text-gray-400'}`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {/* Empty slots before day 1 */}
            {paddingSlots.map(slot => (
              <div key={`pad-${slot}`} className="h-16 sm:h-20 rounded-2xl bg-gray-50/50 border border-transparent opacity-30" />
            ))}

            {/* Actual Month Days */}
            {daysArray.map(dayNum => {
              const formattedDay = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
              const formattedMonth = (month + 1) < 10 ? `0${month + 1}` : `${month + 1}`;
              const dateStr = `${year}-${formattedMonth}-${formattedDay}`;

              const dayAppts = apptsByDate[dateStr] || [];
              const isSelected = selectedDateStr === dateStr;

              const todayStr = new Date().toISOString().split('T')[0];
              const isToday = todayStr === dateStr;

              const pendingInDay = dayAppts.filter(a => (a.status || 'Pending') === 'Pending').length;
              const contactedInDay = dayAppts.filter(a => a.status === 'Contacted').length;
              const completedInDay = dayAppts.filter(a => a.status === 'Completed').length;

              return (
                <div
                  key={dateStr}
                  onClick={() => setSelectedDateStr(dateStr)}
                  className={`h-16 sm:h-20 p-2 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                    isSelected 
                      ? 'bg-brand-blue text-white border-brand-blue shadow-md ring-2 ring-brand-blue/30 scale-[1.02] z-10' 
                      : isToday
                      ? 'bg-blue-50/80 text-brand-blue border-brand-blue/40 font-bold hover:bg-blue-100'
                      : dayAppts.length > 0
                      ? 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-900'
                      : 'bg-white hover:bg-gray-50/80 border-gray-100 text-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-black ${isSelected ? 'text-white' : isToday ? 'text-brand-blue font-black' : 'text-gray-900'}`}>
                      {dayNum}
                    </span>
                    {isToday && (
                      <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded ${isSelected ? 'bg-white/20 text-white' : 'bg-brand-blue text-white'}`}>
                        Today
                      </span>
                    )}
                  </div>

                  {/* Appointment Count Pills / Dots */}
                  {dayAppts.length > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 flex-wrap">
                        {pendingInDay > 0 && (
                          <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-amber-300' : 'bg-amber-500'}`} title={`${pendingInDay} Pending`} />
                        )}
                        {contactedInDay > 0 && (
                          <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-cyan-200' : 'bg-blue-500'}`} title={`${contactedInDay} Contacted`} />
                        )}
                        {completedInDay > 0 && (
                          <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-emerald-300' : 'bg-emerald-500'}`} title={`${completedInDay} Completed`} />
                        )}
                      </div>

                      <div className={`text-[10px] font-black truncate rounded-md px-1 py-0.5 ${
                        isSelected 
                          ? 'bg-white/20 text-white' 
                          : 'bg-brand-blue/10 text-brand-blue'
                      }`}>
                        {dayAppts.length} {dayAppts.length === 1 ? 'Booking' : 'Bookings'}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-4 text-xs font-bold text-gray-500 flex-wrap">
            <span className="text-gray-400 font-extrabold uppercase text-[10px]">Legend:</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Pending</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Contacted</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Completed</span>
          </div>
        </div>

        {/* Selected Date Appointments List Sidebar (5 cols on large screens) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-blue">
                Schedule View
              </span>
              <h3 className="text-lg font-black text-brand-dark">
                {new Date(`${selectedDateStr}T00:00:00`).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </h3>
            </div>

            <span className="px-3 py-1 bg-brand-blue/10 text-brand-blue rounded-full text-xs font-black">
              {selectedDayAppts.length} {selectedDayAppts.length === 1 ? 'Booking' : 'Bookings'}
            </span>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-1.5 bg-gray-50 p-1.5 rounded-2xl border border-gray-100 overflow-x-auto">
            {(['ALL', 'Pending', 'Contacted', 'Completed'] as const).map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  statusFilter === status 
                    ? 'bg-white text-brand-dark shadow-xs border border-gray-200/80 font-black' 
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Selected Day Appointments Cards */}
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
            {selectedDayAppts.length === 0 ? (
              <div className="py-12 text-center text-gray-400 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                <CalendarIcon size={36} className="mx-auto mb-2 text-gray-300" />
                <p className="text-xs font-bold text-gray-600">No appointments for this date</p>
                <p className="text-[11px] text-gray-400 mt-1">Select another day with booking dots on the calendar grid.</p>
              </div>
            ) : (
              selectedDayAppts.map(appt => {
                const isOthers = appt.examPreparingFor === 'OTHERS' || appt.examPreparingFor === 'Other';
                return (
                  <div
                    key={appt.id}
                    className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-md transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-black text-brand-dark text-sm">{appt.fullName || 'Candidate'}</h4>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md inline-block mt-1 ${
                          isOthers ? 'bg-purple-100 text-purple-700' : 'bg-brand-blue/10 text-brand-blue'
                        }`}>
                          {appt.examPreparingFor || 'Consultation'}
                        </span>
                      </div>

                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        appt.status === 'Completed' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                        appt.status === 'Contacted' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                        'bg-amber-100 text-amber-700 border border-amber-200'
                      }`}>
                        {appt.status || 'Pending'}
                      </span>
                    </div>

                    {isOthers && appt.otherDetails && (
                      <div className="bg-purple-50 p-3 rounded-xl border border-purple-100 text-xs">
                        <p className="font-bold text-purple-900 flex items-center gap-1 mb-1 text-[11px]">
                          <MessageSquare size={12} className="text-purple-600" />
                          <span>Custom Requirement:</span>
                        </p>
                        <p className="text-purple-950 italic text-[11px]">"{appt.otherDetails}"</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-600 pt-1 border-t border-gray-200/60">
                      <div>
                        <span className="block text-[9px] font-extrabold text-gray-400 uppercase">WhatsApp</span>
                        <a
                          href={`https://wa.me/${(appt.whatsapp || '').replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-extrabold text-emerald-600 hover:underline flex items-center gap-1 mt-0.5"
                        >
                          <Phone size={10} />
                          <span>{appt.whatsapp || 'N/A'}</span>
                        </a>
                      </div>

                      <div>
                        <span className="block text-[9px] font-extrabold text-gray-400 uppercase">Qualification</span>
                        <span className="font-bold text-gray-800 block mt-0.5 truncate">
                          {appt.qualification || 'N/A'}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-200/60">
                      <button
                        onClick={() => onToggleStatus(appt.id, appt.status || 'Pending')}
                        className="px-3 py-1.5 rounded-xl text-[11px] font-extrabold bg-blue-50 hover:bg-blue-100 text-brand-blue border border-blue-200 transition-all cursor-pointer"
                      >
                        Status: {appt.status === 'Contacted' ? 'Set Completed' : appt.status === 'Completed' ? 'Set Pending' : 'Set Contacted'}
                      </button>

                      <button
                        onClick={() => onDelete(appt.id)}
                        className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 border border-red-200 transition-colors cursor-pointer"
                        title="Delete Appointment"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
