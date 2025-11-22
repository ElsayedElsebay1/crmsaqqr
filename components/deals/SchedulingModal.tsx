import React, { useState, useEffect, useMemo } from 'react';
import { Deal } from '../../types';
import * as api from '../../services/api';
import { useStore } from '../../store/store';
import BaseModal from '../shared/BaseModal';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import { ChevronRightIcon } from '../icons/ChevronRightIcon';
import { CalendarIcon } from '../icons/CalendarIcon';
import { ClockIcon } from '../icons/ClockIcon';

interface SchedulingModalProps {
  deal: Deal;
  onClose: () => void;
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
            <h3 className="text-md font-semibold text-slate-200 mb-3">اختر الوقت المناسب:</h3>
            {isLoading ? (
                <div className="grid grid-cols-3 gap-2">
                    {[...Array(6)].map((_, i) => <div key={i} className="h-10 bg-slate-700/50 rounded-md animate-pulse"></div>)}
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

const SchedulingModal: React.FC<SchedulingModalProps> = ({ deal, onClose }) => {
    const { scheduleMeeting, isSubmitting } = useStore(state => ({
        scheduleMeeting: state.scheduleMeeting,
        isSubmitting: state.isSubmitting,
    }));
    
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedTime, setSelectedTime] = useState<string | null>(null);

    const handleConfirm = async () => {
        if (!selectedTime) return;
        const meetingDateTime = new Date(selectedDate);
        const [hours, minutes] = selectedTime.split(':');
        meetingDateTime.setHours(parseInt(hours), parseInt(minutes));

        await scheduleMeeting(deal.id, meetingDateTime);
        onClose();
    };
    
    const changeMonth = (offset: number) => {
        setCurrentMonth(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() + offset);
            return newDate;
        });
    };

    const handleDateSelect = (day: number) => {
        const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        setSelectedDate(newDate);
        setSelectedTime(null);
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
    
    const footer = (
        <>
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={isSubmitting}>
                إلغاء
            </button>
            <button type="button" onClick={handleConfirm} className="btn btn-primary" disabled={isSubmitting || !selectedTime}>
                {isSubmitting ? 'جارٍ الحجز...' : 'تأكيد الموعد'}
            </button>
        </>
    );

    return (
        <BaseModal isOpen={true} onClose={onClose} title={`جدولة اجتماع لـ: ${deal.title}`} footer={footer} maxWidth="max-w-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <div className="space-y-4 pt-6 border-t md:border-t-0 md:border-r border-slate-700 md:pt-0 md:pr-6">
                    <TimeSlotPicker selectedDate={selectedDate} selectedTime={selectedTime} onTimeSelect={setSelectedTime} />
                    {selectedTime && (
                        <div className="p-3 bg-slate-800 rounded-lg space-y-2 border border-slate-700">
                             <div className="flex items-center gap-2">
                                <CalendarIcon className="w-5 h-5 text-slate-400" />
                                <span className="text-slate-200 font-semibold">{selectedDate.toLocaleDateString('ar-SA', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <ClockIcon className="w-5 h-5 text-slate-400" />
                                <span className="text-slate-200 font-semibold">{new Date(`1970-01-01T${selectedTime}`).toLocaleString('ar-SA', { hour: 'numeric', minute: 'numeric', hour12: true })}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </BaseModal>
    );
};

export default SchedulingModal;