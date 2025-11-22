import React, { useState, useEffect, useCallback, useMemo } from 'react';
import * as api from '../services/api';
import { ChevronLeftIcon } from '../components/icons/ChevronLeftIcon';
import { ChevronRightIcon } from '../components/icons/ChevronRightIcon';
import { CalendarIcon } from '../components/icons/CalendarIcon';
import { CheckCircleIcon } from '../components/icons/CheckCircleIcon';
import { ClockIcon } from '../components/icons/ClockIcon';

interface SchedulingPageProps {
  dealId: string;
}

const TimeSlotPicker: React.FC<{
    selectedDate: Date;
    selectedTime: string | null;
    onTimeSelect: (time: string) => void;
}> = ({ selectedDate, selectedTime, onTimeSelect }) => {
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSlots = async () => {
            setIsLoading(true);
            try {
                const slots = await api.getAvailableSlots(selectedDate.toISOString().split('T')[0]);
                setAvailableSlots(slots);
            } catch (error) {
                console.error("Failed to fetch slots", error);
                setAvailableSlots([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSlots();
    }, [selectedDate]);

    return (
        <div>
            <h3 className="text-lg font-semibold text-slate-200 mb-3">اختر الوقت المناسب:</h3>
            {isLoading ? (
                <div className="text-center p-4 bg-slate-800/50 rounded-md h-24 flex items-center justify-center">
                    <p className="text-slate-400 animate-pulse">جارٍ تحميل الأوقات المتاحة...</p>
                </div>
            ) : availableSlots.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                    {availableSlots.map(time => (
                        <button
                            key={time}
                            onClick={() => onTimeSelect(time)}
                            className={`p-2 rounded-md text-sm font-semibold transition-colors ${
                                selectedTime === time
                                    ? 'bg-[var(--color-primary)] text-white ring-2 ring-offset-2 ring-offset-[#1A2B4D] ring-[var(--color-primary)]'
                                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                            }`}
                        >
                            {new Date(`1970-01-01T${time}`).toLocaleString('ar-SA', { hour: 'numeric', minute: 'numeric', hour12: true })}
                        </button>
                    ))}
                </div>
            ) : (
                <p className="text-center text-slate-400 bg-slate-800/50 p-4 rounded-md">
                    عذراً، لا توجد مواعيد متاحة في هذا اليوم.
                </p>
            )}
        </div>
    );
};


const SchedulingPage: React.FC<SchedulingPageProps> = ({ dealId }) => {
  const [dealTitle, setDealTitle] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const fetchDealInfo = async () => {
      try {
        const info = await api.fetchPublicDealInfo(dealId);
        setDealTitle(info.title);
      } catch (err) {
        setError('تعذّر العثور على تفاصيل الاجتماع. قد يكون الرابط غير صالح.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDealInfo();
  }, [dealId]);

  const handleDateSelect = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelectedDate(newDate);
    setSelectedTime(null);
  };

  const changeMonth = (offset: number) => {
    setCurrentMonth(prev => {
        const newDate = new Date(prev);
        newDate.setMonth(newDate.getMonth() + offset);
        return newDate;
    });
  };
  
  const handleBooking = async () => {
    if (!selectedTime || !clientName || !clientEmail) {
        setFormError('يرجى ملء جميع الحقول وتحديد وقت.');
        return;
    }
    if (!/\S+@\S+\.\S+/.test(clientEmail)) {
        setFormError('صيغة البريد الإلكتروني غير صحيحة.');
        return;
    }
    setFormError('');
    setIsBooking(true);
    try {
        const meetingDateTime = new Date(selectedDate);
        const [hours, minutes] = selectedTime.split(':');
        meetingDateTime.setHours(parseInt(hours), parseInt(minutes));

        await api.bookMeeting(dealId, clientName, clientEmail, meetingDateTime);
        setBookingSuccess(true);
    } catch(err) {
        setFormError('حدث خطأ أثناء حجز الموعد. يرجى المحاولة مرة أخرى.');
    } finally {
        setIsBooking(false);
    }
  };

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(<div key={`empty-${i}`} className="w-10 h-10"></div>);
    }
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const today = new Date();
        today.setHours(0,0,0,0);
        const isToday = date.toDateString() === new Date().toDateString();
        const isSelected = date.toDateString() === selectedDate.toDateString();
        const isPast = date < today;

        days.push(
            <button
                key={day}
                onClick={() => !isPast && handleDateSelect(day)}
                disabled={isPast}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors
                    ${isSelected ? 'bg-[var(--color-primary)] text-white' : ''}
                    ${!isSelected && isToday ? 'text-[var(--color-primary-light)] border border-[var(--color-primary)]' : ''}
                    ${isPast ? 'text-slate-600 cursor-not-allowed' : 'hover:bg-slate-700'}
                `}
            >
                {day}
            </button>
        );
    }
    return days;
  }, [currentMonth, selectedDate]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    );
  }

  if (error) {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 text-center">
            <p className="text-red-400 text-lg">{error}</p>
        </div>
    );
  }
  
  if (bookingSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-lg text-center bg-slate-800/50 border border-slate-700 rounded-2xl shadow-2xl p-8 modal-content">
            <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 bg-green-400/20 rounded-full animate-ping"></div>
                <CheckCircleIcon className="relative w-24 h-24 text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">تم تأكيد موعدك بنجاح!</h1>
            <p className="text-slate-300 mt-2">
                شكراً لك، {clientName}. لقد تم حجز اجتماع بخصوص "{dealTitle}".<br/>
                سيصلك تأكيد عبر البريد الإلكتروني يحتوي على تفاصيل الاجتماع ورابط Google Meet.
            </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
            <img src="https://l.top4top.io/p_356010hdb1.png" alt="Saqqr CRM Logo" className="w-24 h-16 mx-auto mb-4 object-cover object-right" />
            <h1 className="text-3xl font-bold text-white">حجز اجتماع</h1>
            <p className="text-slate-400 mt-2">لتنسيق اجتماع بخصوص: <span className="font-semibold text-slate-200">{dealTitle}</span></p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl shadow-2xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Side: Calendar & Time */}
            <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-200">1. اختر الموعد</h3>
                {/* Calendar */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-slate-700"><ChevronRightIcon className="w-5 h-5" /></button>
                        <h2 className="font-semibold text-lg text-slate-100">{currentMonth.toLocaleString('ar-SA', { month: 'long', year: 'numeric' })}</h2>
                        <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-slate-700"><ChevronLeftIcon className="w-5 h-5" /></button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-400 mb-2">
                        {['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'].map(day => <div key={day}>{day}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-1 justify-items-center">
                        {calendarDays}
                    </div>
                </div>
                {/* Time Slots */}
                <TimeSlotPicker selectedDate={selectedDate} selectedTime={selectedTime} onTimeSelect={setSelectedTime} />
            </div>

            {/* Right Side: Details & Booking */}
            <div className="space-y-4 pt-6 border-t md:border-t-0 md:border-r border-slate-700 md:pt-0 md:pr-8">
                <h3 className="text-lg font-semibold text-slate-200">2. أدخل بياناتك للتأكيد</h3>
                 {selectedTime ? (
                    <div className="p-4 bg-slate-800 rounded-lg space-y-2 border border-slate-700">
                        <div className="flex items-center gap-2">
                            <CalendarIcon className="w-5 h-5 text-slate-400" />
                            <span className="text-slate-200 font-semibold">{selectedDate.toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <ClockIcon className="w-5 h-5 text-slate-400" />
                            <span className="text-slate-200 font-semibold">{new Date(`1970-01-01T${selectedTime}`).toLocaleString('ar-SA', { hour: 'numeric', minute: 'numeric', hour12: true })}</span>
                        </div>
                    </div>
                ) : (
                    <div className="p-4 bg-slate-900/50 rounded-lg text-center text-slate-400 h-[88px] flex items-center justify-center">
                        يرجى اختيار يوم ووقت.
                    </div>
                )}
                <div>
                    <label htmlFor="clientName" className="block text-sm font-medium text-slate-300 mb-1">الاسم الكامل</label>
                    <input type="text" id="clientName" value={clientName} onChange={e => setClientName(e.target.value)} className="w-full bg-[#2C3E5F] border border-[#3E527B] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7C1]" />
                </div>
                 <div>
                    <label htmlFor="clientEmail" className="block text-sm font-medium text-slate-300 mb-1">البريد الإلكتروني</label>
                    <input type="email" id="clientEmail" value={clientEmail} onChange={e => setClientEmail(e.target.value)} className="w-full bg-[#2C3E5F] border border-[#3E527B] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00B7C1]" />
                </div>
                {formError && <p className="text-red-400 text-sm text-center">{formError}</p>}
                <button
                    onClick={handleBooking}
                    disabled={isBooking || !selectedTime || !clientName || !clientEmail}
                    className="w-full btn btn-primary !py-3 !text-base"
                >
                    {isBooking ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : 'تأكيد الحجز'}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SchedulingPage;