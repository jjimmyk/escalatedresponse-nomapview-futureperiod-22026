import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Users, Calendar as CalendarIcon, Pencil, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';

interface Meeting {
  id: string;
  title: string;
  dateTime: Date;
  phaseId: string;
  phaseName: string;
  location?: string;
  attendees?: string;
  link?: string;
  description?: string;
  isRecurring?: boolean;
  recurrencePattern?: string;
}

interface CalendarViewProps {
  phases: any[];
}

export function CalendarView({ phases }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');
  const [mode, setMode] = useState<'calendar' | 'table'>('calendar');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isAddMeetingOpen, setIsAddMeetingOpen] = useState(false);
  const [viewMeetingOpen, setViewMeetingOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [editingMeetingId, setEditingMeetingId] = useState<string | null>(null);

  const phaseOptions = [
    'Incident Briefing',
    'Initial UC Meeting',
    'UC Objectives Meeting',
    'Command & General Staff Meeting',
    'Tactics Meeting',
    'Planning Meeting',
    'IAP Preparation and Approval Meeting',
    'Operations Briefing Meeting',
    'Prepare for Tactics Meeting',
    'Preparing for Planning Meeting'
  ];

  // Track all unique meeting types (phaseIds) that exist in the meetings list
  const [uniqueMeetingTypes, setUniqueMeetingTypes] = useState<Set<string>>(new Set());

  const getMeetingColorScheme = (phaseId: string) => {
    const colorMap: { [key: string]: { bg: string; text: string; border: string; hoverBg: string } } = {
      'Incident Briefing': {
        bg: 'bg-chart-1/30',
        text: 'text-chart-1',
        border: 'border-chart-1/50',
        hoverBg: 'hover:bg-chart-1/40'
      },
      'Initial UC Meeting': {
        bg: 'bg-chart-2/30',
        text: 'text-chart-2',
        border: 'border-chart-2/50',
        hoverBg: 'hover:bg-chart-2/40'
      },
      'UC Objectives Meeting': {
        bg: 'bg-chart-3/30',
        text: 'text-chart-3',
        border: 'border-chart-3/50',
        hoverBg: 'hover:bg-chart-3/40'
      },
      'Command & General Staff Meeting': {
        bg: 'bg-chart-4/30',
        text: 'text-chart-4',
        border: 'border-chart-4/50',
        hoverBg: 'hover:bg-chart-4/40'
      },
      'Tactics Meeting': {
        bg: 'bg-chart-5/30',
        text: 'text-chart-5',
        border: 'border-chart-5/50',
        hoverBg: 'hover:bg-chart-5/40'
      },
      'Planning Meeting': {
        bg: 'bg-accent/30',
        text: 'text-accent-foreground',
        border: 'border-accent/50',
        hoverBg: 'hover:bg-accent/40'
      },
      'IAP Preparation and Approval Meeting': {
        bg: 'bg-primary/20',
        text: 'text-primary',
        border: 'border-primary/30',
        hoverBg: 'hover:bg-primary/30'
      },
      'Operations Briefing Meeting': {
        bg: 'bg-success/20',
        text: 'text-success',
        border: 'border-success/30',
        hoverBg: 'hover:bg-success/30'
      },
      'Prepare for Tactics Meeting': {
        bg: 'bg-warning/20',
        text: 'text-warning',
        border: 'border-warning/30',
        hoverBg: 'hover:bg-warning/30'
      },
      'Preparing for Planning Meeting': {
        bg: 'bg-muted',
        text: 'text-muted-foreground',
        border: 'border-border',
        hoverBg: 'hover:bg-muted/80'
      }
    };

    return colorMap[phaseId] || {
      bg: 'bg-muted',
      text: 'text-muted-foreground',
      border: 'border-border',
      hoverBg: 'hover:bg-muted/80'
    };
  };

  const [meetings, setMeetings] = useState<Meeting[]>(() => {
    const existingMeetings: Meeting[] = [];
    
    phases?.forEach((phase) => {
      if (phase.data?.meetingData?.dateTime) {
        existingMeetings.push({
          id: phase.id,
          title: phase.data.meetingData.title || phase.shortName,
          dateTime: new Date(phase.data.meetingData.dateTime),
          phaseId: phase.id,
          phaseName: phase.shortName,
          location: phase.data.meetingData.location,
          attendees: phase.data.meetingData.attendees,
          link: phase.data.meetingData.link,
        });
      }
    });
    
    // Add sample meetings for visualization
    const today = new Date();
    const sampleMeetings: Meeting[] = [
      {
        id: 'sample-1',
        title: 'Initial UC Meeting',
        dateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0),
        phaseId: 'Initial UC Meeting',
        phaseName: 'Initial UC Meeting',
        location: 'Command Post - Room A',
        attendees: 'Incident Commander\\nPlanning Chief\\nOperations Chief\\nLogistics Chief',
        link: 'https://meet.example.com/initial-uc',
        description: '• Establish unified command structure\\n• Define jurisdictional responsibilities\\n• Set initial priorities\\n• Agency coordination protocols',
        isRecurring: false
      },
      {
        id: 'sample-2',
        title: 'UC Objectives Meeting',
        dateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 10, 30),
        phaseId: 'UC Objectives Meeting',
        phaseName: 'UC Objectives Meeting',
        location: 'Conference Room B',
        attendees: 'Unified Command\\nPlanning Section\\nOperations Section',
        link: 'https://meet.example.com/uc-objectives',
        description: '• Review and approve incident objectives\\n• Multi-agency coordination\\n• Strategic priorities alignment\\n• Resource sharing agreements',
        isRecurring: false
      },
      {
        id: 'sample-3',
        title: 'Command & General Staff Meeting',
        dateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 14, 0),
        phaseId: 'Command & General Staff Meeting',
        phaseName: 'Command & General Staff Meeting',
        location: 'Main Operations Center',
        attendees: 'All Section Chiefs\\nIncident Commander\\nDeputy IC\\nSafety Officer',
        link: 'https://meet.example.com/command-staff',
        description: '• Comprehensive status update from all sections\\n• Inter-section coordination issues\\n• Strategic decisions\\n• Policy and resource constraints',
        isRecurring: true,
        recurrencePattern: 'weekly'
      },
      {
        id: 'sample-4',
        title: 'Tactics Meeting',
        dateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3, 11, 0),
        phaseId: 'Tactics Meeting',
        phaseName: 'Tactics Meeting',
        location: 'Tactical Operations Room',
        attendees: 'Operations Section Chief\\nTactical Leaders\\nPlanning Section',
        link: 'https://meet.example.com/tactics',
        description: '• Tactical alternatives discussion\\n• Work assignments development\\n• Air operations coordination\\n• Safety analysis and concerns',
        isRecurring: false
      },
      {
        id: 'sample-5',
        title: 'Planning Meeting',
        dateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 4, 15, 30),
        phaseId: 'Planning Meeting',
        phaseName: 'Planning Meeting',
        location: 'Planning Room',
        attendees: 'Planning Section\\nAll Section Chiefs\\nTechnical Specialists',
        link: 'https://meet.example.com/planning',
        description: '• Review current Incident Action Plan\\n• Resource needs assessment\\n• Documentation requirements\\n• Demobilization planning (if applicable)',
        isRecurring: true,
        recurrencePattern: 'daily'
      },
      {
        id: 'sample-6',
        title: 'IAP Preparation and Approval Meeting',
        dateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5, 13, 0),
        phaseId: 'IAP Preparation and Approval Meeting',
        phaseName: 'IAP Preparation and Approval Meeting',
        location: 'Command Post',
        attendees: 'Incident Commander\\nPlanning Section Chief\\nAll Section Chiefs',
        link: 'https://meet.example.com/iap-approval',
        description: '• Review draft Incident Action Plan\\n• Finalize objectives and strategies\\n• Approve assignments and resources\\n• IAP distribution plan',
        isRecurring: false
      },
      {
        id: 'sample-7',
        title: 'Operations Briefing Meeting',
        dateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 6, 8, 30),
        phaseId: 'Operations Briefing Meeting',
        phaseName: 'Operations Briefing Meeting',
        location: 'Main Briefing Hall',
        attendees: 'All Personnel\\nSection Chiefs\\nUnit Leaders',
        link: 'https://meet.example.com/ops-briefing',
        description: '• Field operations update\\n• Division/group status reports\\n• Tactical objectives review\\n• Coordination requirements',
        isRecurring: false
      },
      {
        id: 'sample-8',
        title: 'Prepare for Tactics Meeting',
        dateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7, 16, 0),
        phaseId: 'Prepare for Tactics Meeting',
        phaseName: 'Prepare for Tactics Meeting',
        location: 'Operations Center',
        attendees: 'Operations Section\\nPlanning Section\\nSafety Officer',
        link: 'https://meet.example.com/tactics-prep',
        description: '• Gather operational information\\n• Identify tactical options\\n• Prepare situation briefing\\n• Review safety considerations',
        isRecurring: false
      },
      {
        id: 'sample-9',
        title: 'Preparing for Planning Meeting',
        dateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 8, 10, 0),
        phaseId: 'Preparing for Planning Meeting',
        phaseName: 'Preparing for Planning Meeting',
        location: 'Planning Section Office',
        attendees: 'Planning Section Staff\\nSituation Unit Leader\\nResource Unit Leader',
        link: 'https://meet.example.com/prep-planning',
        description: '• Collect planning information\\n• Review documentation needs\\n• Coordinate with all sections\\n• Agenda preparation',
        isRecurring: false
      }
    ];
    
    return [...existingMeetings, ...sampleMeetings];
  });
  
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    date: '',
    time: '',
    phaseId: '',
    location: '',
    attendees: '',
    link: '',
    description: '',
  });

  const [calendarDate, setCalendarDate] = useState<Date | undefined>(undefined);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Update unique meeting types whenever meetings change
  useEffect(() => {
    const types = new Set<string>();
    meetings.forEach(meeting => {
      if (meeting.phaseId) {
        types.add(meeting.phaseId);
      }
    });
    setUniqueMeetingTypes(types);
  }, [meetings]);

  const getMeetingsForDate = (date: Date) => {
    return meetings.filter(meeting => {
      const meetingDate = new Date(meeting.dateTime);
      return (
        meetingDate.getDate() === date.getDate() &&
        meetingDate.getMonth() === date.getMonth() &&
        meetingDate.getFullYear() === date.getFullYear()
      );
    }).sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevMonthDay = new Date(year, month, -startingDayOfWeek + i + 1);
      days.push({ date: prevMonthDay, isCurrentMonth: false });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }

    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }

    return days;
  };

  const getWeekDays = (date: Date) => {
    const day = date.getDay();
    const diff = date.getDate() - day;
    const weekStart = new Date(date.setDate(diff));
    
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      return d;
    });
  };

  const handlePreviousPeriod = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(currentDate.getMonth() - 1);
    } else {
      newDate.setDate(currentDate.getDate() - 7);
    }
    setCurrentDate(newDate);
  };

  const handleNextPeriod = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(currentDate.getMonth() + 1);
    } else {
      newDate.setDate(currentDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };

  const handleAddMeeting = () => {
    if (newMeeting.title && newMeeting.date && newMeeting.time && newMeeting.phaseId) {
      const [year, month, day] = newMeeting.date.split('-').map(Number);
      const [hours, minutes] = newMeeting.time.split(':').map(Number);
      
      if (editingMeetingId) {
        // Update existing meeting
        const updatedMeetings = meetings.map(m => {
          if (m.id === editingMeetingId) {
            return {
              ...m,
              title: newMeeting.title,
              dateTime: new Date(year, month - 1, day, hours, minutes),
              phaseId: newMeeting.phaseId,
              phaseName: newMeeting.phaseId,
              location: newMeeting.location || undefined,
              attendees: newMeeting.attendees || undefined,
              link: newMeeting.link || undefined,
              description: newMeeting.description || undefined,
            };
          }
          return m;
        });
        setMeetings(updatedMeetings);
        setEditingMeetingId(null);
      } else {
        // Create new meeting
        const meeting: Meeting = {
          id: `meeting-${Date.now()}`,
          title: newMeeting.title,
          dateTime: new Date(year, month - 1, day, hours, minutes),
          phaseId: newMeeting.phaseId,
          phaseName: newMeeting.phaseId,
          location: newMeeting.location || undefined,
          attendees: newMeeting.attendees || undefined,
          link: newMeeting.link || undefined,
          description: newMeeting.description || undefined,
        };
        setMeetings([...meetings, meeting]);
      }

      setNewMeeting({
        title: '',
        date: '',
        time: '',
        phaseId: '',
        location: '',
        attendees: '',
        link: '',
        description: '',
      });
      setCalendarDate(undefined);
      setIsAddMeetingOpen(false);
    }
  };

  const handleEditMeeting = (meeting: Meeting) => {
    // Close view dialog
    setViewMeetingOpen(false);
    
    // Populate form with meeting data
    const meetingDate = new Date(meeting.dateTime);
    const year = meetingDate.getFullYear();
    const month = String(meetingDate.getMonth() + 1).padStart(2, '0');
    const day = String(meetingDate.getDate()).padStart(2, '0');
    const hours = String(meetingDate.getHours()).padStart(2, '0');
    const minutes = String(meetingDate.getMinutes()).padStart(2, '0');
    
    setNewMeeting({
      title: meeting.title,
      date: `${year}-${month}-${day}`,
      time: `${hours}:${minutes}`,
      phaseId: meeting.phaseId,
      location: meeting.location || '',
      attendees: meeting.attendees || '',
      link: meeting.link || '',
      description: meeting.description || '',
    });
    
    setCalendarDate(meetingDate);
    setEditingMeetingId(meeting.id);
    setIsAddMeetingOpen(true);
  };

  const handleDeleteMeeting = (meetingId: string) => {
    const updatedMeetings = meetings.filter(meeting => meeting.id !== meetingId);
    setMeetings(updatedMeetings);
    setViewMeetingOpen(false);
  };

  const getTimeSlots = () => {
    return Array.from({ length: 24 }, (_, i) => i);
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const formatWeekRange = (date: Date) => {
    const weekDays = getWeekDays(new Date(date));
    const start = weekDays[0];
    const end = weekDays[6];
    
    if (start.getMonth() === end.getMonth()) {
      return `${start.toLocaleDateString('en-US', { month: 'long' })} ${start.getDate()} - ${end.getDate()}, ${start.getFullYear()}`;
    } else {
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${end.getFullYear()}`;
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-foreground" />
            <h2 className="text-foreground" style={{ fontWeight: 'var(--font-weight-semibold)' }}>
              {view === 'month' ? formatMonthYear(currentDate) : formatWeekRange(currentDate)}
            </h2>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPeriod}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPeriod}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-muted rounded-lg p-1">
            <Button
              variant={mode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setMode('table')}
              className="h-7 px-3"
            >
              Table View
            </Button>
            <Button
              variant={mode === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setMode('calendar')}
              className="h-7 px-3"
            >
              Calendar View
            </Button>
          </div>

          {mode === 'calendar' && (
            <div className="flex items-center bg-muted rounded-lg p-1">
              <Button
                variant={view === 'month' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setView('month')}
                className="h-7 px-3"
              >
                Month
              </Button>
              <Button
                variant={view === 'week' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setView('week')}
                className="h-7 px-3"
              >
                Week
              </Button>
            </div>
          )}
          
          <Button
            onClick={() => setIsAddMeetingOpen(true)}
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Meeting
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        {mode === 'table' ? (
          <div className="p-4">
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-black border-b border-border">
                    <th className="text-left px-4 py-3 font-medium text-foreground">Start - End</th>
                    <th className="text-left px-4 py-3 font-medium text-foreground">Meeting</th>
                    <th className="text-left px-4 py-3 font-medium text-foreground">Agenda</th>
                    <th className="text-left px-4 py-3 font-medium text-foreground">Attendees</th>
                    <th className="text-left px-4 py-3 font-medium text-foreground">Location</th>
                  </tr>
                </thead>
                <tbody>
                  {[...meetings]
                    .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime())
                    .map(meeting => {
                      const start = new Date(meeting.dateTime);
                      const end = new Date(start.getTime() + 60 * 60 * 1000);
                      const formatDateTime = (d: Date) =>
                        d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
                        ' ' +
                        d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
                      const colors = getMeetingColorScheme(meeting.phaseId);
                      return (
                        <tr
                          key={meeting.id}
                          className="border-b border-border hover:bg-muted/50 cursor-pointer transition-colors"
                          onClick={() => { setSelectedMeeting(meeting); setViewMeetingOpen(true); }}
                        >
                          <td className="px-4 py-3 text-sm text-foreground">
                            {formatDateTime(start)} – {formatDateTime(end)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className={`w-2.5 h-2.5 rounded-full ${colors.bg} border ${colors.border} flex-shrink-0`} />
                              <span className="text-sm text-foreground">{meeting.title}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-foreground">
                            {meeting.description ? meeting.description.split('\\n').map(item => item.replace(/^[•\-]\s*/, '')).filter(Boolean).join(', ') : '—'}
                          </td>
                          <td className="px-4 py-3 text-sm text-foreground">
                            {meeting.attendees ? meeting.attendees.split('\\n').join(', ') : '—'}
                          </td>
                          <td className="px-4 py-3 text-sm text-foreground">
                            {meeting.location || '—'}
                          </td>
                        </tr>
                      );
                    })}
                  {meetings.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground text-sm">
                        No meetings scheduled.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : view === 'month' ? (
          <div className="h-full p-4">
            <div className="grid grid-cols-7 gap-2 h-full">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div
                  key={day}
                  className="text-center text-muted-foreground border-b border-border pb-2"
                  style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-semibold)' }}
                >
                  {day}
                </div>
              ))}
              
              {getDaysInMonth(currentDate).map((day, index) => {
                const dayMeetings = getMeetingsForDate(day.date);
                const isToday = 
                  day.date.getDate() === new Date().getDate() &&
                  day.date.getMonth() === new Date().getMonth() &&
                  day.date.getFullYear() === new Date().getFullYear();

                return (
                  <div
                    key={index}
                    className={`border border-border rounded-lg p-2 min-h-[120px] flex flex-col ${
                      !day.isCurrentMonth ? 'bg-muted/30' : 'bg-card'
                    } ${isToday ? 'ring-2 ring-primary' : ''}`}
                  >
                    <div
                      className={`mb-2 ${
                        day.isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'
                      }`}
                      style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-semibold)' }}
                    >
                      {day.date.getDate()}
                    </div>
                    
                    <div className="flex-1 space-y-1 overflow-hidden">
                      {dayMeetings.slice(0, 3).map(meeting => {
                        const colors = getMeetingColorScheme(meeting.phaseId);
                        return (
                          <div
                            key={meeting.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedMeeting(meeting);
                              setViewMeetingOpen(true);
                            }}
                            className={`px-2.5 py-2 rounded-md ${colors.bg} ${colors.text} ${colors.hoverBg} transition-colors cursor-pointer shadow-sm`}
                          >
                            <div className="truncate mb-1" style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--text-sm)' }}>
                              {meeting.title}
                            </div>
                            <div className="truncate" style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)' }}>
                              {new Date(meeting.dateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                            </div>
                            {meeting.location && (
                              <div className="truncate mt-0.5" style={{ fontSize: 'var(--text-xs)', opacity: 0.9 }}>
                                {meeting.location}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {dayMeetings.length > 3 && (
                        <div className="text-foreground px-2 py-1 rounded bg-muted/50" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-semibold)' }}>
                          +{dayMeetings.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="h-full p-4">
            <div className="grid grid-cols-8 gap-2 h-full">
              <div className="col-span-1" />
              {getWeekDays(new Date(currentDate)).map((day, index) => {
                const isToday = 
                  day.getDate() === new Date().getDate() &&
                  day.getMonth() === new Date().getMonth() &&
                  day.getFullYear() === new Date().getFullYear();
                
                return (
                  <div
                    key={index}
                    className={`text-center pb-2 border-b border-border ${
                      isToday ? 'text-primary' : 'text-foreground'
                    }`}
                  >
                    <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)' }} className="text-muted-foreground">
                      {day.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-semibold)' }}>
                      {day.getDate()}
                    </div>
                  </div>
                );
              })}

              {getTimeSlots().map(hour => {
                const weekDays = getWeekDays(new Date(currentDate));
                
                return (
                  <>
                    <div
                      key={`time-${hour}`}
                      className="text-right pr-2 text-muted-foreground border-r border-border"
                      style={{ fontSize: 'var(--text-xs)' }}
                    >
                      {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                    </div>
                    
                    {weekDays.map((day, dayIndex) => {
                      const dayMeetings = getMeetingsForDate(day).filter(meeting => {
                        const meetingHour = new Date(meeting.dateTime).getHours();
                        return meetingHour === hour;
                      });

                      return (
                        <div
                          key={`${hour}-${dayIndex}`}
                          className={`border border-border min-h-[60px] relative ${
                            dayIndex === 6 ? '' : 'border-r-0'
                          }`}
                        >
                          {dayMeetings.map(meeting => {
                            const colors = getMeetingColorScheme(meeting.phaseId);
                            return (
                              <div
                                key={meeting.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedMeeting(meeting);
                                  setViewMeetingOpen(true);
                                }}
                                className={`absolute inset-x-1 top-1 bottom-1 px-2 py-1.5 rounded ${colors.bg}/90 border ${colors.border} ${colors.text} overflow-hidden ${colors.hoverBg.replace('hover:', 'hover:')} transition-colors cursor-pointer`}
                              >
                                <div className="truncate mb-0.5" style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--text-xs)' }}>
                                  {meeting.title}
                                </div>
                                <div className="truncate" style={{ fontSize: '10px', fontWeight: 'var(--font-weight-medium)' }}>
                                  {new Date(meeting.dateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                                </div>
                                {meeting.location && (
                                  <div className="truncate opacity-90 mt-0.5" style={{ fontSize: '10px' }}>
                                    {meeting.location}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Add Meeting Dialog */}
      <Dialog open={isAddMeetingOpen} onOpenChange={(open) => {
        setIsAddMeetingOpen(open);
        if (!open) {
          setEditingMeetingId(null);
          setNewMeeting({
            title: '',
            date: '',
            time: '',
            phaseId: '',
            location: '',
            attendees: '',
            link: '',
            description: '',
          });
          setCalendarDate(undefined);
        }
      }}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editingMeetingId ? 'Edit Meeting' : 'Schedule Meeting'}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {editingMeetingId ? 'Update the meeting details' : 'Add a new meeting to the calendar'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="meeting-type" className="text-foreground">Meeting Type</Label>
              <Select value={newMeeting.phaseId} onValueChange={(value) => {
                const templates: Record<string, {
                  title: string;
                  location: string;
                  attendees: string;
                  link: string;
                  description: string;
                }> = {
                  'Incident Briefing': {
                    title: 'Incident Briefing',
                    location: 'Emergency Operations Center',
                    attendees: 'Incident Commander\nOperations Section Chief\nPlanning Section Chief\nLogistics Section Chief\nFinance Section Chief\nPublic Information Officer',
                    link: 'https://meet.example.com/incident-briefing',
                    description: '• Current situation status update\n• Resource allocation review\n• Priority objectives discussion\n• Safety concerns and mitigation',
                  },
                  'Planning Meeting': {
                    title: 'Planning Meeting',
                    location: 'Planning Room',
                    attendees: 'Planning Section Chief\nResources Unit Leader\nSituation Unit Leader\nDocumentation Unit Leader\nDemobilization Unit Leader',
                    link: 'https://meet.example.com/planning-meeting',
                    description: '• Review current Incident Action Plan\n• Resource needs assessment\n• Documentation requirements\n• Demobilization planning (if applicable)',
                  },
                  'Operations Briefing Meeting': {
                    title: 'Operations Briefing',
                    location: 'Operations Center',
                    attendees: 'Operations Section Chief\nDivision Supervisors\nBranch Directors\nStrike Team Leaders\nTask Force Leaders',
                    link: 'https://meet.example.com/operations-briefing',
                    description: '• Field operations update\n• Division/group status reports\n• Tactical objectives review\n• Coordination requirements',
                  },
                  'Tactics Meeting': {
                    title: 'Tactics Meeting',
                    location: 'Tactical Operations Center',
                    attendees: 'Operations Section Chief\nPlanning Section Chief\nAir Operations Branch Director\nTechnical Specialists\nSafety Officer',
                    link: 'https://meet.example.com/tactics-meeting',
                    description: '• Tactical alternatives discussion\n• Work assignments development\n• Air operations coordination\n• Safety analysis and concerns',
                  },
                  'Initial UC Meeting': {
                    title: 'Initial UC Meeting',
                    location: 'Unified Command Center',
                    attendees: 'Unified Command Representatives\nCommand Staff\nLiaison Officer',
                    link: 'https://meet.example.com/initial-uc-meeting',
                    description: '• Establish unified command structure\n• Define jurisdictional responsibilities\n• Set initial priorities\n• Agency coordination protocols',
                  },
                  'UC Objectives Meeting': {
                    title: 'UC Objectives Meeting',
                    location: 'Unified Command Center',
                    attendees: 'Unified Command Representatives\nPlanning Section Chief\nOperations Section Chief\nCommand Staff',
                    link: 'https://meet.example.com/uc-objectives',
                    description: '• Review and approve incident objectives\n• Multi-agency coordination\n• Strategic priorities alignment\n• Resource sharing agreements',
                  },
                  'Command & General Staff Meeting': {
                    title: 'Command & General Staff Meeting',
                    location: 'Command Post',
                    attendees: 'Incident Commander\nAll Section Chiefs\nCommand Staff\nTechnical Specialists',
                    link: 'https://meet.example.com/command-staff',
                    description: '• Comprehensive status update from all sections\n• Inter-section coordination issues\n• Strategic decisions\n• Policy and resource constraints',
                  },
                  'IAP Preparation and Approval Meeting': {
                    title: 'IAP Prep & Approval',
                    location: 'Planning Section',
                    attendees: 'Incident Commander\nPlanning Section Chief\nAll Section Chiefs\nCommand Staff',
                    link: 'https://meet.example.com/iap-approval',
                    description: '• Review draft Incident Action Plan\n• Finalize objectives and strategies\n• Approve assignments and resources\n• IAP distribution plan',
                  },
                  'Prepare for Tactics Meeting': {
                    title: 'Tactics Prep Meeting',
                    location: 'Operations Section',
                    attendees: 'Operations Section Chief\nPlanning Section Chief\nDivision Supervisors',
                    link: 'https://meet.example.com/tactics-prep',
                    description: '• Gather operational information\n• Identify tactical options\n• Prepare situation briefing\n• Review safety considerations',
                  },
                  'Preparing for Planning Meeting': {
                    title: 'Planning Prep Meeting',
                    location: 'Planning Section',
                    attendees: 'Planning Section Chief\nAll Unit Leaders\nDocumentation Unit',
                    link: 'https://meet.example.com/planning-prep',
                    description: '• Collect planning information\n• Review documentation needs\n• Coordinate with all sections\n• Agenda preparation',
                  },
                };
                
                const template = templates[value];
                if (template && !editingMeetingId) {
                  setNewMeeting({
                    ...newMeeting,
                    phaseId: value,
                    title: template.title,
                    location: template.location,
                    attendees: template.attendees,
                    link: template.link,
                    description: template.description,
                  });
                } else {
                  setNewMeeting({ ...newMeeting, phaseId: value });
                }
              }}>
                <SelectTrigger id="meeting-type" className="bg-background border-border text-foreground">
                  <SelectValue placeholder="Select meeting type" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {phaseOptions.map(phase => (
                    <SelectItem key={phase} value={phase} className="text-foreground">
                      {phase}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="meeting-title" className="text-foreground">Meeting Title</Label>
              <Input
                id="meeting-title"
                value={newMeeting.title}
                onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
                placeholder="Enter meeting title"
                className="bg-background border-border text-foreground"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="meeting-date" className="text-foreground">Date</Label>
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between rounded-md border border-border bg-background px-3 h-10 text-foreground hover:bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                    >
                      {newMeeting.date ? (
                        <span>
                          {new Date(newMeeting.date + 'T00:00:00').toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">MM/DD/YYYY</span>
                      )}
                      <CalendarIcon className="w-4 h-4 text-foreground" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
                    <Calendar
                      mode="single"
                      selected={calendarDate}
                      onSelect={(date) => {
                        if (date) {
                          setCalendarDate(date);
                          // Format date as YYYY-MM-DD for storage
                          const year = date.getFullYear();
                          const month = String(date.getMonth() + 1).padStart(2, '0');
                          const day = String(date.getDate()).padStart(2, '0');
                          setNewMeeting({ ...newMeeting, date: `${year}-${month}-${day}` });
                          setIsCalendarOpen(false);
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meeting-time" className="text-foreground">Time</Label>
                <div className="relative">
                  <Select
                    value={newMeeting.time}
                    onValueChange={(value) => setNewMeeting({ ...newMeeting, time: value })}
                  >
                    <SelectTrigger id="meeting-time" className="bg-background border-border text-foreground">
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border max-h-[200px]">
                      {Array.from({ length: 24 }, (_, hour) => {
                        return ['00', '30'].map((minute, idx) => {
                          const timeValue = `${String(hour).padStart(2, '0')}:${minute}`;
                          return (
                            <SelectItem key={`time-${hour}-${minute}`} value={timeValue} className="text-foreground">
                              {timeValue}
                            </SelectItem>
                          );
                        });
                      }).flat()}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="meeting-location" className="text-foreground">Location</Label>
              <Input
                id="meeting-location"
                value={newMeeting.location}
                onChange={(e) => setNewMeeting({ ...newMeeting, location: e.target.value })}
                placeholder="Enter location"
                className="bg-background border-border text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="meeting-link" className="text-foreground">Meeting Link</Label>
              <Input
                id="meeting-link"
                value={newMeeting.link}
                onChange={(e) => setNewMeeting({ ...newMeeting, link: e.target.value })}
                placeholder="Enter virtual meeting link"
                className="bg-background border-border text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="meeting-attendees" className="text-foreground">Attendees</Label>
              <Textarea
                id="meeting-attendees"
                value={newMeeting.attendees}
                onChange={(e) => setNewMeeting({ ...newMeeting, attendees: e.target.value })}
                placeholder="Enter attendees (one per line)"
                rows={3}
                className="bg-background border-border text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="meeting-description" className="text-foreground">Description / Discussion Topics</Label>
              <Textarea
                id="meeting-description"
                value={newMeeting.description}
                onChange={(e) => setNewMeeting({ ...newMeeting, description: e.target.value })}
                placeholder="Enter notes or discussion topics for this meeting"
                rows={4}
                className="bg-background border-border text-foreground"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsAddMeetingOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMeeting}>
              {editingMeetingId ? 'Save Changes' : 'Add Meeting'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Meeting Dialog */}
      <Dialog open={viewMeetingOpen} onOpenChange={setViewMeetingOpen}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">{selectedMeeting?.title}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {selectedMeeting?.phaseName}
            </DialogDescription>
          </DialogHeader>

          {selectedMeeting && (
            <div className="space-y-4">
              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Date</Label>
                  <div className="px-3 py-2 rounded-lg bg-muted/30 border border-border">
                    <span className="text-foreground" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                      {new Date(selectedMeeting.dateTime).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground">Time</Label>
                  <div className="px-3 py-2 rounded-lg bg-muted/30 border border-border">
                    <span className="text-foreground" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                      {new Date(selectedMeeting.dateTime).toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Location */}
              {selectedMeeting.location && (
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Location</Label>
                  <div className="px-3 py-2 rounded-lg bg-muted/30 border border-border">
                    <span className="text-foreground" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                      {selectedMeeting.location}
                    </span>
                  </div>
                </div>
              )}

              {/* Attendees */}
              {selectedMeeting.attendees && (
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Attendees</Label>
                  <div className="px-3 py-2 rounded-lg bg-muted/30 border border-border">
                    <div className="text-foreground whitespace-pre-line" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                      {selectedMeeting.attendees.split('\\n').join('\n')}
                    </div>
                  </div>
                </div>
              )}

              {/* Meeting Link */}
              {selectedMeeting.link && (
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Meeting Link</Label>
                  <div className="px-3 py-2 rounded-lg bg-muted/30 border border-border">
                    <a
                      href={selectedMeeting.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline break-all"
                      style={{ fontWeight: 'var(--font-weight-medium)' }}
                    >
                      {selectedMeeting.link}
                    </a>
                  </div>
                </div>
              )}

              {/* Description */}
              {selectedMeeting.description && (
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Description / Discussion Topics</Label>
                  <div className="px-3 py-2 rounded-lg bg-muted/30 border border-border">
                    <div className="text-foreground whitespace-pre-line" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                      {selectedMeeting.description}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => selectedMeeting && handleEditMeeting(selectedMeeting)}
              className="flex items-center gap-2"
            >
              <Pencil className="w-4 h-4" />
              Edit Meeting
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => selectedMeeting && handleDeleteMeeting(selectedMeeting.id)}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}