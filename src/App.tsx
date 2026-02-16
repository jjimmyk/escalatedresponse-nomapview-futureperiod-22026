import { useState, useEffect } from 'react';
import { PlanningPStepper } from './components/PlanningPStepper';
import { InitialUCMeetingPhase } from './components/phases/InitialUCMeetingPhase';
import { ICUCObjectivesPhase } from './components/phases/ICUCObjectivesPhase';
import { GenericPhase } from './components/phases/GenericPhase';
import { CalendarView } from './components/CalendarView';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Switch } from './components/ui/switch';
import { Label } from './components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './components/ui/dialog';
import { Input } from './components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './components/ui/tooltip';
import { DisasterPhase, OperationalPeriod, OPERATIONAL_PERIOD_PHASES } from './types/disaster';
import { RefreshCw, Clock, CheckCircle, Menu, HelpCircle, Search, FileText, Download, Map, ChevronUp, ChevronDown, MoreHorizontal, Send, X, Bot, User, AlertTriangle, Users, MapPin, Calendar, Package, List, Plus, Edit2, Check, Bell } from 'lucide-react';
import svgPaths from './imports/svg-4ab4ujrm1u';
import imgCapsule from "figma:asset/371be526cb6c078a2a123792205d9842b99edd6d.png";
import imgCapsule1 from "figma:asset/eae313a48883a46e7a2a60ee806e73a8052191be.png";

export default function App() {
  const [currentOperationalPeriod, setCurrentOperationalPeriod] = useState<OperationalPeriod>({
    id: '2',
    number: 2,
    startTime: new Date(),
    phases: OPERATIONAL_PERIOD_PHASES.map(phase => ({
      ...phase,
      completed: false,
      data: {}
    }))
  });

  const [pastOperationalPeriods, setPastOperationalPeriods] = useState<OperationalPeriod[]>([]);
  const [viewingPastPeriod, setViewingPastPeriod] = useState<OperationalPeriod | null>(null);
  const [currentPhaseId, setCurrentPhaseId] = useState<string>('initial-response');
  const [showCompletionSummary, setShowCompletionSummary] = useState(false);

  const [copCollapsed, setCopCollapsed] = useState(false);
  const [copModalOpen, setCopModalOpen] = useState(false);
  const [showMapPanel, setShowMapPanel] = useState(false);
  const [calendarModalOpen, setCalendarModalOpen] = useState(false);
  const [showChatPanel, setShowChatPanel] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{id: string, role: 'user' | 'assistant', content: string, timestamp: Date}>>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI assistant for the Oil Spill Alpha incident management system. I can help you with planning phases, ICS forms, operational procedures, and any questions about incident response. How can I assist you today?',
      timestamp: new Date()
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [selectedViewPill, setSelectedViewPill] = useState<'resources' | 'incident-roster'>('resources');
  const [selectedPeriodView, setSelectedPeriodView] = useState<'current' | 'next'>('current');
  const [activityLogModalOpen, setActivityLogModalOpen] = useState(false);
  const [submitActivityLogModalOpen, setSubmitActivityLogModalOpen] = useState(false);
  const [previewIcs214, setPreviewIcs214] = useState(false);
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [showResources, setShowResources] = useState(false);
  const [showIncidentRoster, setShowIncidentRoster] = useState(false);
  const [activityLogDate, setActivityLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [activityLogDateDropdownOpen, setActivityLogDateDropdownOpen] = useState(false);
  const [activityLogView, setActivityLogView] = useState<'mine' | 'all'>('mine');
  const [showPlanningP, setShowPlanningP] = useState(true);
  const [activityLogEntries, setActivityLogEntries] = useState<Array<{id: string, datetime: string, timezone: string, activity: string}>>([]);
  const [newActivityDatetime, setNewActivityDatetime] = useState('');
  const [newActivityTimezone, setNewActivityTimezone] = useState('UTC');
  const [newActivityText, setNewActivityText] = useState('');
  const [showAddEntryRow, setShowAddEntryRow] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editingDatetime, setEditingDatetime] = useState('');
  const [editingTimezone, setEditingTimezone] = useState('UTC');
  const [editingActivity, setEditingActivity] = useState('');

  const clearAllViews = () => { setShowActivityLog(false); setShowNotifications(false); setShowReports(false); setShowResources(false); setShowIncidentRoster(false); setShowPlanningP(false); };

  // Mock incident data - Updated for Oil Spill Alpha
  const [incidentData] = useState({
    name: 'Oil Spill Alpha',
    type: 'Special Event',
    location: 'AT&T Stadium, Arlington, TX',
    startTime: new Date('2026-06-11T10:00:00'),
    icName: 'Captain Maria Rodriguez',
    status: 'Active',
    priority: 'High',
    capacity: '80,000 attendees',
    security: '85% complete',
    venues: {
      primary: 'AT&T Stadium',
      coverage: '16 host venues nationwide'
    }
  });

  const currentPhase = currentOperationalPeriod.phases.find(p => p.id === currentPhaseId);
  const currentPhaseIndex = currentOperationalPeriod.phases.findIndex(p => p.id === currentPhaseId);

  const handlePhaseDataChange = (data: Record<string, any>) => {
    setCurrentOperationalPeriod(prev => ({
      ...prev,
      phases: prev.phases.map(phase =>
        phase.id === currentPhaseId
          ? { ...phase, data }
          : phase
      )
    }));
  };

  const handlePhaseComplete = () => {
    setCurrentOperationalPeriod(prev => ({
      ...prev,
      phases: prev.phases.map(phase =>
        phase.id === currentPhaseId
          ? { ...phase, completed: true }
          : phase
      )
    }));

    // Move to next phase or show completion
    const nextPhaseIndex = currentPhaseIndex + 1;
    if (nextPhaseIndex < currentOperationalPeriod.phases.length) {
      setCurrentPhaseId(currentOperationalPeriod.phases[nextPhaseIndex].id);
    } else {
      setShowCompletionSummary(true);
    }
  };

  const handlePreviousPhase = () => {
    const previousPhaseIndex = currentPhaseIndex - 1;
    if (previousPhaseIndex >= 0) {
      setCurrentPhaseId(currentOperationalPeriod.phases[previousPhaseIndex].id);
    }
  };

  const advanceOperationalPeriod = () => {
    // Save current period to past periods before advancing
    setPastOperationalPeriods(prev => [...prev, { 
      ...currentOperationalPeriod, 
      endTime: new Date() 
    }]);
    
    const newPeriodNumber = currentOperationalPeriod.number + 1;
    
    setCurrentOperationalPeriod(prev => ({
      id: (parseInt(prev.id) + 1).toString(),
      number: newPeriodNumber,
      startTime: new Date(),
      endTime: undefined,
      phases: OPERATIONAL_PERIOD_PHASES.map(phase => ({
        ...phase,
        completed: false,
        data: {}
      }))
    }));
    setCurrentPhaseId('initial-response');
    setShowCompletionSummary(false);
    setViewingPastPeriod(null); // Return to current period
  };

  const handleViewPastPeriod = (periodId: string) => {
    if (periodId === 'current') {
      setViewingPastPeriod(null);
    } else {
      const pastPeriod = pastOperationalPeriods.find(p => p.id === periodId);
      if (pastPeriod) {
        setViewingPastPeriod(pastPeriod);
        setCurrentPhaseId('initial-response');
      }
    }
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: chatInput,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');

    // Simulate AI response after a short delay
    setTimeout(() => {
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: generateAIResponse(chatInput),
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const generateAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('ics') || input.includes('form')) {
      return 'I can help you with ICS forms! The Incident Command System uses standardized forms for documentation and communication. For the Oil Spill Alpha incident, key forms include ICS-202 (Incident Objectives), ICS-203 (Organization Assignment List), and ICS-204 (Assignment List). Would you like me to explain any specific form or help you fill one out?';
    }
    
    if (input.includes('objective') || input.includes('goal')) {
      return 'For incident objectives, remember they should be SMART: Specific, Measurable, Achievable, Relevant, and Time-bound. For the Oil Spill Alpha incident, typical objectives might include containment and recovery, environmental protection, public safety, and coordinating with response agencies. What specific objectives are you working on?';
    }
    
    if (input.includes('planning') || input.includes('phase')) {
      return 'The Planning-P process has 8 key phases in our operational workflow. You\\\'re currently in the IC/UC Objectives Meeting phase. This phase focuses on establishing incident priorities, objectives, and critical information requirements. Each phase builds upon the previous one to create a comprehensive Incident Action Plan (IAP). What aspect of the planning process would you like to discuss?';
    }
    
    if (input.includes('threat') || input.includes('risk')) {
      return 'Threat assessment is crucial for oil spill incidents like Oil Spill Alpha. Key threats to monitor include weather conditions, marine life impacts, shoreline contamination, public health risks, and equipment failures. Each threat should be evaluated for probability and impact. Would you like help developing threat mitigation strategies?';
    }
    
    return 'Thank you for your question. I\\\'m here to help with incident management, planning phases, ICS procedures, and operational guidance for the Oil Spill Alpha incident. Could you provide more specific details about what you\\\'d like assistance with?';
  };

  const handleAddActivityLogEntry = () => {
    if (!newActivityDatetime || !newActivityText.trim()) return;

    const newEntry = {
      id: Date.now().toString(),
      datetime: newActivityDatetime,
      timezone: newActivityTimezone,
      activity: newActivityText
    };

    setActivityLogEntries(prev => [...prev, newEntry].sort((a, b) => 
      new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
    ));
    
    // Clear inputs and hide row
    setNewActivityDatetime('');
    setNewActivityTimezone('UTC');
    setNewActivityText('');
    setShowAddEntryRow(false);
  };

  const handleDeleteActivityLogEntry = (id: string) => {
    setActivityLogEntries(prev => prev.filter(entry => entry.id !== id));
    if (editingEntryId === id) setEditingEntryId(null);
  };

  const handleStartEditEntry = (entry: {id: string, datetime: string, timezone: string, activity: string}) => {
    setEditingEntryId(entry.id);
    setEditingDatetime(entry.datetime);
    setEditingTimezone(entry.timezone);
    setEditingActivity(entry.activity);
  };

  const handleSaveEditEntry = () => {
    if (!editingEntryId || !editingDatetime || !editingActivity.trim()) return;
    setActivityLogEntries(prev => prev.map(entry =>
      entry.id === editingEntryId
        ? { ...entry, datetime: editingDatetime, timezone: editingTimezone, activity: editingActivity }
        : entry
    ).sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime()));
    setEditingEntryId(null);
  };

  const TIMEZONE_OPTIONS = [
    'UTC', 'US/Eastern', 'US/Central', 'US/Mountain', 'US/Pacific', 'US/Alaska', 'US/Hawaii',
    'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Asia/Tokyo', 'Asia/Shanghai',
    'Asia/Kolkata', 'Australia/Sydney', 'Pacific/Auckland'
  ];

  // Get the period currently being displayed (either current or past)
  const displayedPeriod = viewingPastPeriod || currentOperationalPeriod;
  const displayedPhase = displayedPeriod.phases.find(p => p.id === currentPhaseId);
  const displayedPhaseIndex = displayedPeriod.phases.findIndex(p => p.id === currentPhaseId);

  const renderCurrentPhase = () => {
    // Always show Phase 1 (IC/UC Objectives) content regardless of which phase is selected
    const phase1 = displayedPeriod.phases.find(p => p.id === 'initial-response');
    if (!phase1) return null;

    // If viewing a past period, make it read-only
    const isReadOnly = viewingPastPeriod !== null;

    const commonProps = {
      data: phase1.data,
      onDataChange: isReadOnly ? () => {} : handlePhaseDataChange,
      onComplete: isReadOnly ? () => {} : handlePhaseComplete,
      onPrevious: undefined, // Phase 1 has no previous
    };

    // Always render Phase 1 content
    return <ICUCObjectivesPhase {...commonProps} operationalPeriodNumber={displayedPeriod.number} onOpenCalendar={() => setCalendarModalOpen(true)} />;
  };

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'Complete':
        return 'default';
      case 'Ongoing':
        return 'destructive';
      case 'Scheduled':
        return 'outline';
      default:
        return 'outline';
    }
  };

  // Common Operating Picture Content Component
  const COPContent = ({ showMap = true }: { showMap?: boolean }) => (
    <>
      {showMap && (
        <div className="w-full h-[26rem] border border-border rounded-lg overflow-hidden bg-primary flex items-center justify-center">
          <div className="text-center text-primary-foreground">
            <svg className="w-12 h-12 mx-auto mb-2 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <div className="font-medium">Interactive Map</div>
            <div className="text-sm opacity-80">Coming Soon</div>
          </div>
        </div>
      )}
      
      {/* Incident Details - Only show when map is not displayed */}
      {!showMap && (
        <div className="space-y-3">
          <div className="bg-muted/30 p-3 rounded-lg">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Location</div>
            <div className="font-medium">{incidentData.location}</div>
          </div>
          <div className="bg-muted/30 p-3 rounded-lg">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Event Coverage</div>
            <div className="font-medium">{incidentData.venues.coverage}</div>
          </div>
          <div className="bg-muted/30 p-3 rounded-lg">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Security Status</div>
            <div className="font-medium">{incidentData.security}</div>
          </div>
          <div className="bg-muted/30 p-3 rounded-lg">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Capacity</div>
            <div className="font-medium">{incidentData.capacity}</div>
          </div>
        </div>
      )}
    </>
  );

  if (showCompletionSummary) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-accent" />
              </div>
              <h1>Operational Period {currentOperationalPeriod.number} Complete</h1>
              <p className="text-muted-foreground mt-2">
                All planning phases have been completed successfully
              </p>
            </div>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Phase Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentOperationalPeriod.phases.map((phase) => (
                    <div key={phase.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="font-medium text-sm truncate">{phase.shortName}</div>
                        <div className="text-xs text-muted-foreground truncate">{phase.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={advanceOperationalPeriod}
                size="lg"
                className="bg-primary hover:bg-primary/90 flex items-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Start New Operational Period
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Navigation Bar - Imported Design */}
      <div className="relative bg-black h-16 w-full">
        {/* Left Control */}
        <div className="absolute content-stretch flex gap-4 items-center justify-start left-0 top-0 h-16">
          {/* Menu Icon Logo */}
          <div className="bg-gradient-to-r box-border content-stretch flex flex-col from-[#02a3fe] from-[8.524%] gap-8 items-center justify-center overflow-clip p-[8px] relative shrink-0 size-16 to-[#6876ee] to-[94.739%]">
            <div className="content-stretch flex flex-col gap-11 items-start justify-start relative shrink-0">
              <div className="relative shrink-0 size-14">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 56 56">
                  <g id="Capsule">
                    <path d={svgPaths.p29a8a500} fill="white" id="Vector" />
                  </g>
                </svg>
              </div>
            </div>
          </div>
          
          {/* Incident Name and Start Time */}
          <div className="flex items-center gap-4">
            <h2 className="text-white">{incidentData.name}</h2>
            <div className="bg-purple-500/10 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-purple-400/20">
              <span className="text-white text-sm">
                My Position: IC
              </span>
            </div>
            <div className="bg-purple-500/10 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-purple-400/20">
              <span className="text-white text-sm">
                Current Time: {new Date().toLocaleString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric',
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: false,
                  timeZone: 'UTC'
                })} UTC
              </span>
            </div>

            <TooltipProvider delayDuration={100}>
              <div className="flex items-center gap-2">
                {/* Notifications Button */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { const next = !showNotifications; clearAllViews(); if (next) setShowNotifications(true); }}
                      className={`h-8 px-1.5 gap-1 transition-all duration-200 flex items-center ${
                        showNotifications
                          ? 'bg-accent text-accent-foreground hover:bg-accent/90'
                          : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                      }`}
                    >
                      <span className="flex items-center justify-center w-4 h-4 rounded-full text-white font-semibold flex-shrink-0" style={{ backgroundColor: '#e05a5a', fontSize: '9.75px', lineHeight: '1' }}>3</span>
                      <Bell className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-card border border-border text-foreground text-xs px-2 py-1.5">
                    Notifications
                  </TooltipContent>
                </Tooltip>

                {/* Activity Log Button */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { const next = !showActivityLog; clearAllViews(); if (next) setShowActivityLog(true); }}
                      className={`h-8 w-8 p-0 transition-all duration-200 ${
                        showActivityLog
                          ? 'bg-accent text-accent-foreground hover:bg-accent/90'
                          : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-card border border-border text-foreground text-xs px-2 py-1.5">
                    Activity Log
                  </TooltipContent>
                </Tooltip>

                {/* Reports Button */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { const next = !showReports; clearAllViews(); if (next) setShowReports(true); }}
                      className={`h-8 w-8 p-0 transition-all duration-200 ${
                        showReports
                          ? 'bg-accent text-accent-foreground hover:bg-accent/90'
                          : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                      }`}
                    >
                      <FileText className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-card border border-border text-foreground text-xs px-2 py-1.5">
                    Reports
                  </TooltipContent>
                </Tooltip>

                {/* Resources Button */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { const next = !showResources; clearAllViews(); if (next) setShowResources(true); }}
                      className={`h-8 w-8 p-0 transition-all duration-200 ${
                        showResources
                          ? 'bg-accent text-accent-foreground hover:bg-accent/90'
                          : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                      }`}
                    >
                      <Package className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-card border border-border text-foreground text-xs px-2 py-1.5">
                    Resources
                  </TooltipContent>
                </Tooltip>

                {/* Incident Roster Button */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { const next = !showIncidentRoster; clearAllViews(); if (next) setShowIncidentRoster(true); }}
                      className={`h-8 w-8 p-0 transition-all duration-200 ${
                        showIncidentRoster
                          ? 'bg-accent text-accent-foreground hover:bg-accent/90'
                          : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                      }`}
                    >
                      <Users className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-card border border-border text-foreground text-xs px-2 py-1.5">
                    Incident Roster
                  </TooltipContent>
                </Tooltip>

                {/* Planning P Button */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { const next = !showPlanningP; clearAllViews(); if (next) setShowPlanningP(true); }}
                      className={`h-8 w-8 p-0 transition-all duration-200 font-bold text-sm ${
                        showPlanningP
                          ? 'bg-accent text-accent-foreground hover:bg-accent/90'
                          : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                      }`}
                    >
                      P
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-card border border-border text-foreground text-xs px-2 py-1.5">
                    Planning P
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </div>
        </div>

        {/* Right Control */}
        <div className="absolute content-stretch flex gap-4 h-16 items-center justify-end right-4 top-0">
          {/* Period Toggle - only shown when Planning P is selected */}
          {showPlanningP && (
            <div className="flex border border-border rounded-md overflow-hidden">
              <button
                onClick={() => setSelectedPeriodView('current')}
                className={`px-3 py-1 text-sm transition-all duration-200 ${
                  selectedPeriodView === 'current'
                    ? 'bg-accent text-accent-foreground'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                Current Period: {currentOperationalPeriod.number}
              </button>
              <div className="w-px bg-border"></div>
              <button
                onClick={() => setSelectedPeriodView('next')}
                className={`px-3 py-1 text-sm transition-all duration-200 ${
                  selectedPeriodView === 'next'
                    ? 'bg-accent text-accent-foreground'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                Next Period: {currentOperationalPeriod.number + 1}
              </button>
            </div>
          )}

          {/* Map View Button */}
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 border-border text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200"
          >
            <Map className="w-4 h-4" />
            Map View
          </Button>

          {/* AI Chat Toggle Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowChatPanel(!showChatPanel)}
            className={`flex items-center gap-2 transition-all duration-200 ${
              showChatPanel
                ? 'bg-accent text-accent-foreground border-accent hover:bg-accent/90'
                : 'border-border text-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            <svg className="w-4 h-4" fill="none" preserveAspectRatio="none" viewBox="0 0 56 56">
              <path d={svgPaths.p29a8a500} fill="currentColor" />
            </svg>
            PRATUS AI
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col">

        {/* Planning Stepper - Full Width, only when Planning P is selected */}
        {showPlanningP && (
          <div className="border-b border-border min-h-[65px]">
            <PlanningPStepper
              phases={displayedPeriod.phases}
              currentPhaseId={currentPhaseId}
              onPhaseSelect={setCurrentPhaseId}
              operationalPeriodNumber={displayedPeriod.number}
            />
          </div>
        )}

        {/* Content Area - Split between phase content and chat panel */}
        <div className="flex flex-1 overflow-hidden">
          {/* Phase Content */}
          <div className={`${showChatPanel ? 'w-1/2' : 'w-full'} flex flex-col overflow-y-auto transition-all duration-300`}>
            {showNotifications ? (
              /* Notifications Placeholder */
              <div className="flex-1 flex flex-col items-center justify-center p-6">
                <Bell className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-lg text-muted-foreground">[placeholder for notifications]</p>
              </div>
            ) : showReports ? (
              /* Reports Placeholder */
              <div className="flex-1 flex flex-col items-center justify-center p-6">
                <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-lg text-muted-foreground">[placeholder for reports]</p>
              </div>
            ) : showResources ? (
              /* Resources Placeholder */
              <div className="flex-1 flex flex-col items-center justify-center p-6">
                <Package className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-lg text-muted-foreground">[placeholder for resources]</p>
              </div>
            ) : showIncidentRoster ? (
              /* Incident Roster Placeholder */
              <div className="flex-1 flex flex-col items-center justify-center p-6">
                <Users className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-lg text-muted-foreground">[placeholder for incident roster]</p>
              </div>
            ) : showActivityLog ? (
              /* Activity Log Inline View */
              <div className="flex-1 flex flex-col p-6">
                {/* My / All Activity Logs Toggle */}
                <div className="mb-3">
                  <div className="flex border border-border rounded-md overflow-hidden w-fit">
                    <button
                      onClick={() => setActivityLogView('mine')}
                      className={`px-3 py-1 text-sm transition-all duration-200 ${
                        activityLogView === 'mine'
                          ? 'bg-accent text-accent-foreground'
                          : 'text-foreground hover:bg-muted'
                      }`}
                    >
                      My Activity Logs
                    </button>
                    <div className="w-px bg-border"></div>
                    <button
                      onClick={() => setActivityLogView('all')}
                      className={`px-3 py-1 text-sm transition-all duration-200 ${
                        activityLogView === 'all'
                          ? 'bg-accent text-accent-foreground'
                          : 'text-foreground hover:bg-muted'
                      }`}
                    >
                      All Activity Logs
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <List className="w-5 h-5 text-accent" />
                  <h2 className="text-lg font-semibold flex items-center gap-1">
                    Activity Log for
                    <div className="relative">
                      <button
                        onClick={() => setActivityLogDateDropdownOpen(!activityLogDateDropdownOpen)}
                        className="flex items-center gap-1 cursor-pointer bg-transparent border-none outline-none"
                        style={{ font: 'inherit', color: 'inherit' }}
                      >
                        {new Date(activityLogDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      {activityLogDateDropdownOpen && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setActivityLogDateDropdownOpen(false)} />
                          <div className="absolute left-0 top-full mt-2 z-50 bg-card border border-border rounded-md shadow-lg py-1 min-w-[200px]">
                            {Array.from({ length: 6 }, (_, i) => {
                              const d = new Date();
                              d.setDate(d.getDate() - i);
                              const value = d.toISOString().split('T')[0];
                              const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                              return (
                                <button
                                  key={value}
                                  onClick={() => { setActivityLogDate(value); setActivityLogDateDropdownOpen(false); }}
                                  className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground ${
                                    activityLogDate === value ? 'bg-accent/50 text-accent-foreground' : 'text-foreground'
                                  }`}
                                >
                                  {label}{i === 0 ? ' (Today)' : ''}
                                </button>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  </h2>
                </div>
                {/* Buttons above table */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    {activityLogView === 'mine' && !showAddEntryRow && (
                      <Button
                        onClick={() => setShowAddEntryRow(true)}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add Entry
                      </Button>
                    )}
                  </div>
                  {activityLogView === 'mine' && (
                    <Button
                      size="sm"
                      onClick={() => setSubmitActivityLogModalOpen(true)}
                      className="bg-accent hover:bg-accent/90 text-accent-foreground flex items-center gap-2"
                    >
                      Submit Activity Log for {new Date(activityLogDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </Button>
                  )}
                </div>
                <div className="border border-border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-black border-b border-border">
                        {activityLogView === 'all' && (
                          <th className="text-left px-4 py-3 font-medium w-1/5">Person</th>
                        )}
                        <th className="text-left px-4 py-3 font-medium w-1/3">Date & Time</th>
                        <th className="text-left px-4 py-3 font-medium">Notable Activities</th>
                        <th className="w-24"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {activityLogEntries.map((entry) => (
                        <tr key={entry.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                          {editingEntryId === entry.id ? (
                            <>
                              {activityLogView === 'all' && (
                                <td className="px-4 py-3 text-sm text-muted-foreground">—</td>
                              )}
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="datetime-local"
                                    value={editingDatetime}
                                    onChange={(e) => setEditingDatetime(e.target.value)}
                                    className="flex-1"
                                  />
                                  <select
                                    value={editingTimezone}
                                    onChange={(e) => setEditingTimezone(e.target.value)}
                                    className="h-9 rounded-md border border-border bg-background px-2 text-sm text-foreground"
                                  >
                                    {TIMEZONE_OPTIONS.map(tz => (
                                      <option key={tz} value={tz}>{tz}</option>
                                    ))}
                                  </select>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <Input
                                  type="text"
                                  value={editingActivity}
                                  onChange={(e) => setEditingActivity(e.target.value)}
                                  className="w-full"
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      handleSaveEditEntry();
                                    }
                                  }}
                                />
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1">
                                  <Button
                                    onClick={handleSaveEditEntry}
                                    disabled={!editingDatetime || !editingActivity.trim()}
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-green-500 hover:text-green-400 hover:bg-green-500/10"
                                  >
                                    <Check className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    onClick={() => setEditingEntryId(null)}
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              </td>
                            </>
                          ) : (
                            <>
                              {activityLogView === 'all' && (
                                <td className="px-4 py-3 text-sm">Captain Maria Rodriguez</td>
                              )}
                              <td className="px-4 py-3">
                                {new Date(entry.datetime).toLocaleString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  hour12: false,
                                  timeZone: entry.timezone || 'UTC'
                                })} {entry.timezone || 'UTC'}
                              </td>
                              <td className="px-4 py-3">{entry.activity}</td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleStartEditEntry(entry)}
                                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteActivityLogEntry(entry.id)}
                                    className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                      {/* New Entry Row - shown on demand */}
                      {showAddEntryRow && activityLogView === 'mine' && (
                        <tr className="bg-black">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Input
                                type="datetime-local"
                                value={newActivityDatetime}
                                onChange={(e) => setNewActivityDatetime(e.target.value)}
                                placeholder="Select date & time"
                                className="flex-1"
                              />
                              <select
                                value={newActivityTimezone}
                                onChange={(e) => setNewActivityTimezone(e.target.value)}
                                className="h-9 rounded-md border border-border bg-background px-2 text-sm text-foreground"
                              >
                                {TIMEZONE_OPTIONS.map(tz => (
                                  <option key={tz} value={tz}>{tz}</option>
                                ))}
                              </select>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Input
                              type="text"
                              value={newActivityText}
                              onChange={(e) => setNewActivityText(e.target.value)}
                              placeholder="Enter activity description..."
                              className="w-full"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  handleAddActivityLogEntry();
                                }
                              }}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <Button
                                onClick={handleAddActivityLogEntry}
                                disabled={!newActivityDatetime || !newActivityText.trim()}
                                size="sm"
                                className="h-8 w-8 p-0 bg-accent hover:bg-accent/90 text-accent-foreground"
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => { setShowAddEntryRow(false); setNewActivityDatetime(''); setNewActivityText(''); }}
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )}
                      {/* Empty state */}
                      {activityLogEntries.length === 0 && !showAddEntryRow && (
                        <tr>
                          <td colSpan={activityLogView === 'all' ? 4 : 3} className="px-4 py-8 text-center text-muted-foreground text-sm">
                            {activityLogView === 'all' ? 'No activity log entries yet.' : 'No activity log entries yet. Click "+ Add Entry" to get started.'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4">
                  <span className="text-sm text-muted-foreground">
                    {activityLogEntries.length} {activityLogEntries.length === 1 ? 'entry' : 'entries'}
                  </span>
                </div>
              </div>
            ) : showPlanningP ? (
              /* Planning Content - Vertical Layout */
              <div className="flex-1 flex flex-col gap-6 p-6">
                {/* Common Operating Picture - Top Panel (conditional) */}
                {showMapPanel && (
                  <div className="w-full transition-all duration-300">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                            Common Operating Picture
                          </CardTitle>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowMapPanel(false)}
                            className="px-3 h-8 hover:bg-muted/20 text-white hover:text-white"
                          >
                            Hide
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <COPContent />
                      </CardContent>
                    </Card>
                  </div>
                )}
                
                {/* Planning Phase Content - Full Width Below COP */}
                <div className="w-full transition-all duration-300">
                  {renderCurrentPhase()}
                </div>
              </div>
            ) : null}
          </div>

          {/* AI Assistant Panel */}
          {showChatPanel && (
            <div className="bg-black border-l border-border flex flex-col w-1/2">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((message) => (
                <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-accent-foreground" fill="none" preserveAspectRatio="none" viewBox="0 0 56 56">
                        <path d={svgPaths.p29a8a500} fill="currentColor" />
                      </svg>
                    </div>
                  )}
                  <div className={`max-w-[70%] rounded-lg p-3 ${
                    message.role === 'user' 
                      ? 'bg-accent text-accent-foreground ml-auto' 
                      : 'bg-muted/30 text-card-foreground'
                  }`}>
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <div className="text-xs opacity-70 mt-2">
                      {message.timestamp.toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit',
                        hour12: true 
                      })}
                    </div>
                  </div>
                  {message.role === 'user' && (
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask me about incident management..."
                  className="flex-1 bg-input-background border-border text-card-foreground"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSendMessage();
                    }
                  }}
                />
                <Button
                  onClick={handleSendMessage}
                  size="sm"
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                  disabled={!chatInput.trim()}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>

      {/* Common Operating Picture Modal */}
      <Dialog open={copModalOpen} onOpenChange={setCopModalOpen}>
        <DialogContent className="max-w-none w-[80vw] max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Common Operating Picture
            </DialogTitle>
            <DialogDescription>
              Expanded view of the real-time situational awareness and incident overview for {incidentData.name}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <COPContent />
          </div>
        </DialogContent>
      </Dialog>

      {/* Calendar Modal */}
      <Dialog open={calendarModalOpen} onOpenChange={setCalendarModalOpen}>
        <DialogContent className="w-[96vw] max-h-[90vh] overflow-auto" style={{ maxWidth: 'none' }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-accent" />
              Calendar View
            </DialogTitle>
            <DialogDescription>
              Timeline of phases and activities for Operational Period {displayedPeriod.number}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <CalendarView
              operationalPeriod={displayedPeriod}
              currentPhaseId={currentPhaseId}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Submit Activity Log Confirmation Modal */}
      <Dialog open={submitActivityLogModalOpen} onOpenChange={(open) => { setSubmitActivityLogModalOpen(open); if (!open) setPreviewIcs214(false); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-accent" />
              Submit Activity Log
            </DialogTitle>
            <DialogDescription className="sr-only">
              Confirm activity log submission
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-foreground">
              Are you sure you want to submit the Activity Log for <span className="font-semibold text-accent">{new Date(activityLogDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>?
            </p>
            <p className="text-sm text-muted-foreground">
              On submission, your <span className="font-medium text-foreground">ICS-214</span> will be generated and stored within <span className="font-medium text-foreground">PRATUS File Manager</span> for within <span className="font-medium text-foreground">Incident Alpha Workspace</span>.
            </p>
            <div className="flex items-center justify-between bg-muted/30 border border-border rounded-md px-4 py-3">
              <Label htmlFor="preview-ics214" className="text-sm font-medium text-foreground cursor-pointer">
                Preview ICS-214
              </Label>
              <Switch
                id="preview-ics214"
                checked={previewIcs214}
                onCheckedChange={setPreviewIcs214}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setSubmitActivityLogModalOpen(false); setPreviewIcs214(false); }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
                onClick={() => { setSubmitActivityLogModalOpen(false); setPreviewIcs214(false); }}
              >
                Submit Activity Log
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}