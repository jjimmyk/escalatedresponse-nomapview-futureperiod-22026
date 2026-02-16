import { Check, Clock, ChevronDown, ArrowLeft, Calendar, BarChart3, FileText, Settings, MapPin, Users, Plus, List } from 'lucide-react';
import { DisasterPhase } from '../types/disaster';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Checkbox } from './ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { useState } from 'react';

interface PlanningPStepperProps {
  phases: DisasterPhase[];
  currentPhaseId: string;
  onPhaseSelect: (phaseId: string) => void;
  operationalPeriodNumber?: number;
  showHeader?: boolean;
}

export function PlanningPStepper({ phases, currentPhaseId, onPhaseSelect, operationalPeriodNumber = 0, showHeader = true }: PlanningPStepperProps) {
  // Apply reduced font sizes (50% of original) only for operational period 1+
  const isReducedFontSize = operationalPeriodNumber >= 1;
  // Check if any phase has descriptive text (only for operational period 0)
  const hasDescriptiveText = operationalPeriodNumber === 0;
  
  // Local state to track selected phase (for visual feedback only, doesn't affect content)
  const [selectedPhaseNum, setSelectedPhaseNum] = useState<number | null>(null);
  
  // Modal state
  const [timeModalOpen, setTimeModalOpen] = useState(false);
  const [selectedPhaseInfo, setSelectedPhaseInfo] = useState<{
    phaseNum: number;
    start: string;
    end: string;
    location: string;
    attendees: { position: string; name: string; email: string; }[];
  } | null>(null);
  
  // Attendee dropdown state
  const [showAttendeeDropdown, setShowAttendeeDropdown] = useState(false);
  const [selectedNewAttendees, setSelectedNewAttendees] = useState<string[]>([]);
  
  // Available people to add to meeting
  const availablePeople = [
    { id: '1', position: 'Safety Officer', name: 'Michael Chen', email: 'michael.chen@example.com' },
    { id: '2', position: 'Public Information Officer', name: 'Sarah Williams', email: 'sarah.williams@example.com' },
    { id: '3', position: 'Liaison Officer', name: 'David Martinez', email: 'david.martinez@example.com' },
    { id: '4', position: 'Operations Section Chief', name: 'Emily Taylor', email: 'emily.taylor@example.com' },
    { id: '5', position: 'Planning Section Chief', name: 'Robert Anderson', email: 'robert.anderson@example.com' },
    { id: '6', position: 'Logistics Section Chief', name: 'Jennifer Thompson', email: 'jennifer.thompson@example.com' },
    { id: '7', position: 'Finance/Admin Section Chief', name: 'William Garcia', email: 'william.garcia@example.com' },
  ];
  
  const handleToggleAttendee = (personId: string) => {
    setSelectedNewAttendees(prev => 
      prev.includes(personId)
        ? prev.filter(id => id !== personId)
        : [...prev, personId]
    );
  };
  
  const handleAddSelectedAttendees = () => {
    if (!selectedPhaseInfo || selectedNewAttendees.length === 0) return;
    
    const newAttendees = availablePeople
      .filter(person => selectedNewAttendees.includes(person.id))
      .map(({ id, ...rest }) => rest);
    
    setSelectedPhaseInfo({
      ...selectedPhaseInfo,
      attendees: [...selectedPhaseInfo.attendees, ...newAttendees]
    });
    
    setSelectedNewAttendees([]);
    setShowAttendeeDropdown(false);
  };
  
  return (
    <>
      <div className={`px-6 bg-card flex items-center justify-center ${hasDescriptiveText ? 'py-3' : 'py-2'}`} style={{ minHeight: '65px' }}>

        
        {/* Horizontal Planning Phases - Stepper Style */}
        <div className={`flex items-center justify-center overflow-x-auto mt-[10px] ${hasDescriptiveText ? 'pb-4' : 'pb-2'}`}>
          {phases.map((phase, index) => {
            const isActive = phase.id === currentPhaseId && selectedPhaseNum === null;
            const isCompleted = phase.completed;
            // For operational period 0, allow free access to first two phases (Initial Response & Incident Briefing)
            // For operational period 1+, allow free access to all phases
            // For other periods, maintain sequential access
            const canAccess = operationalPeriodNumber === 0 
              ? (index <= 1 || phases[index - 1]?.completed)
              : operationalPeriodNumber >= 1 
              ? true 
              : (index === 0 || phases[index - 1]?.completed);

            // Get descriptive text for Operational Period 0 phases
            const getDescriptiveText = () => {
              if (operationalPeriodNumber !== 0) return null;
              if (phase.id === 'initial-response') return 'Create ICS-201';
              if (phase.id === 'incident-briefing') return 'Use ICS-201';
              return null;
            };

            const descriptiveText = getDescriptiveText();
            
            // Generate mock times for phases (in military time UTC)
            const getPhaseTime = () => {
              const startHour = 8 + (index * 2);
              const endHour = startHour + 2;
              return {
                start: `${startHour.toString().padStart(2, '0')}:00 UTC`,
                end: `${endHour.toString().padStart(2, '0')}:00 UTC`
              };
            };
            
            const phaseTime = getPhaseTime();

            return (
              <div key={phase.id} className="flex items-center flex-shrink-0">
                <div className={`flex flex-col items-center ${hasDescriptiveText ? 'mt-3' : ''}`}>
                  
                  {/* Phase Label with Calendar Icon */}
                  <div className={`flex items-center gap-1.5 py-1 rounded-md transition-all`}>
                    <button
                      onClick={() => {
                        if (canAccess) {
                          onPhaseSelect(phase.id);
                          setSelectedPhaseNum(null);
                        }
                      }}
                      disabled={!canAccess}
                      className={`text-center font-medium transition-colors flex items-center gap-1 whitespace-nowrap ${
                        isActive
                          ? 'text-accent'
                          : canAccess
                          ? 'text-white hover:text-accent'
                          : 'text-muted-foreground cursor-not-allowed'
                      }`}
                      style={{ fontSize: '0.864rem', lineHeight: '1.2' }}
                    >
                      {/* Green checkmark for completed phases */}
                      {phase.id === 'initial-response' && (
                        <TooltipProvider delayDuration={100}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="rounded-full border-2 border-green-500 flex items-center justify-center flex-shrink-0 cursor-default" style={{ width: '12.8px', height: '12.8px' }}>
                                <Check className="text-green-500" style={{ width: '8px', height: '8px' }} />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="bg-card border border-border text-foreground text-xs px-2 py-1.5">
                              Phase Complete
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      
                      {phase.id === 'initial-response' ? 'IC/UC Objectives' : (
                        <>
                          {/* Blue dot indicator for incident-briefing and command-staff-meeting */}
                          {(phase.id === 'incident-briefing' || phase.id === 'command-staff-meeting') && (
                            <TooltipProvider delayDuration={100}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="mr-1 flex items-center cursor-default">
                                    <div 
                                      className="rounded-full"
                                      style={{ backgroundColor: '#02A3FE', width: '12.8px', height: '12.8px' }}
                                    />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="bg-card border border-border text-foreground text-xs px-2 py-1.5">
                                  Current Phase
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          {/* White empty circle for upcoming phases */}
                          {['prepare-tactics', 'tactics-meeting', 'prepare-planning', 'planning-meeting', 'iap-prep-approval', 'operations-briefing'].includes(phase.id) && (
                            <TooltipProvider delayDuration={100}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="rounded-full border-2 border-white flex items-center justify-center flex-shrink-0 cursor-default" style={{ width: '12.8px', height: '12.8px' }} />
                                </TooltipTrigger>
                                <TooltipContent side="top" className="bg-card border border-border text-foreground text-xs px-2 py-1.5">
                                  Not Started
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          {phase.shortName}
                        </>
                      )}
                    </button>
                    
                    {/* Calendar icon button */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPhaseInfo({
                          phaseNum: index + 1,
                          start: phaseTime.start,
                          end: phaseTime.end,
                          location: 'Incident Command Post',
                          attendees: [
                            { position: 'Incident Commander', name: 'John Doe', email: 'john.doe@example.com' },
                            { position: 'Planning Chief', name: 'Jane Smith', email: 'jane.smith@example.com' },
                            { position: 'Operations Chief', name: 'Alice Johnson', email: 'alice.johnson@example.com' },
                            { position: 'Logistics Chief', name: 'Bob Brown', email: 'bob.brown@example.com' }
                          ]
                        });
                        setTimeModalOpen(true);
                      }}
                      className="hover:text-accent transition-colors cursor-pointer text-white flex-shrink-0"
                    >
                      <Calendar className="w-3 h-3" />
                    </div>
                  </div>
                  
                  {/* Descriptive text for Operational Period 0 */}
                  {descriptiveText && (
                    <div className="mt-1 text-xs text-muted-foreground text-center whitespace-nowrap">
                      {descriptiveText}
                    </div>
                  )}
                </div>
                
                {/* Connecting Line between phases */}
                {index < phases.length - 1 && (
                  <div className={`flex items-center justify-center flex-shrink-0 ${isReducedFontSize ? 'w-6 mx-1' : 'w-8 mx-2'}`}>
                    <div className={`h-0.5 w-full ${
                      isCompleted 
                        ? 'bg-accent' 
                        : 'bg-border'
                    }`} />
                  </div>
                )}
              </div>
            );
          })}
          
        </div>
      </div>

      {/* Time Modal */}
      <Dialog open={timeModalOpen} onOpenChange={setTimeModalOpen}>
        <DialogContent className="sm:max-w-[850px]">
          <DialogHeader>
            <DialogTitle>Meeting Details</DialogTitle>
            <DialogDescription className="sr-only">
              Meeting information for planning phase
            </DialogDescription>
          </DialogHeader>
          {selectedPhaseInfo && (
            <div className="mt-4">
              {/* Event Type */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <FileText className="mr-2" />
                  <span className="text-sm">Event Type:</span>
                </div>
                <div className="text-sm">
                  Planning Meeting
                </div>
              </div>

              {/* Date */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Calendar className="mr-2" />
                  <span className="text-sm">Date:</span>
                </div>
                <div className="text-sm">
                  January 22, 2026
                </div>
              </div>

              {/* Time */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Clock className="mr-2" />
                  <span className="text-sm">Time:</span>
                </div>
                <div className="text-sm">
                  {selectedPhaseInfo.start} - {selectedPhaseInfo.end}
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <MapPin className="mr-2" />
                  <span className="text-sm">Location:</span>
                </div>
                <div className="text-sm">
                  {selectedPhaseInfo.location}
                </div>
              </div>

              {/* Agenda */}
              <div className="mb-4 pb-4 border-b border-border">
                <div className="flex items-center mb-2">
                  <List className="mr-2" />
                  <span className="text-sm font-medium">Agenda:</span>
                </div>
                <ol className="pl-8 space-y-2 list-decimal">
                  <li className="text-sm">Review current incident status and objectives</li>
                  <li className="text-sm">Assess resource needs and availability</li>
                  <li className="text-sm">Identify critical tasks and priorities</li>
                  <li className="text-sm">Discuss safety concerns and mitigation strategies</li>
                  <li className="text-sm">Develop operational period objectives</li>
                  <li className="text-sm">Assign responsibilities and action items</li>
                </ol>
              </div>
              
              {/* Attendees */}
              <div className="mt-4">
                <div className="flex items-center mb-2">
                  <Users className="mr-2" />
                  <span className="text-sm font-medium">Attendees:</span>
                </div>
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAttendeeDropdown(!showAttendeeDropdown)}
                    className="flex items-center gap-2 mb-3"
                  >
                    <Plus className="w-4 h-4" />
                    Add Attendees
                  </Button>
                  {showAttendeeDropdown && (
                    <div className="absolute top-full left-0 mt-1 bg-card border border-border shadow-lg rounded-md p-4 z-50 w-80 max-h-64 overflow-y-auto">
                      <div className="space-y-3 mb-3">
                        {availablePeople.map(person => (
                          <div key={person.id} className="flex items-start gap-3 p-2 hover:bg-muted/50 rounded transition-colors">
                            <Checkbox
                              id={person.id}
                              checked={selectedNewAttendees.includes(person.id)}
                              onCheckedChange={() => handleToggleAttendee(person.id)}
                              className="mt-0.5"
                            />
                            <label
                              htmlFor={person.id}
                              className="flex-1 cursor-pointer"
                            >
                              <div className="text-sm font-medium">{person.name}</div>
                              <div className="text-xs text-muted-foreground">{person.position}</div>
                            </label>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2 pt-3 border-t border-border">
                        <Button
                          size="sm"
                          onClick={handleAddSelectedAttendees}
                          disabled={selectedNewAttendees.length === 0}
                          className="flex-1"
                        >
                          Add {selectedNewAttendees.length > 0 && `(${selectedNewAttendees.length})`}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setShowAttendeeDropdown(false);
                            setSelectedNewAttendees([]);
                          }}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-3 pl-8">
                  {selectedPhaseInfo.attendees.map((attendee, idx) => (
                    <div key={idx} className="border-l-2 border-accent pl-3">
                      <div className="text-sm font-medium">{attendee.name}</div>
                      <div className="text-xs text-white">{attendee.position}</div>
                      <div className="text-xs text-white">{attendee.email}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}