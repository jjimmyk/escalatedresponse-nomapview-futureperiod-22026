import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { ArrowRight, ArrowLeft, Users, ClipboardList, ChevronDown, ChevronRight, StickyNote, Video, Calendar, Clock, MapPin, Link, Trash2, Download, FileText, Plus, ListTodo, Crosshair, AlertTriangle, Info, Shield, FileCheck, Target, Layers, Zap, Edit2, Search, Filter, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useState } from 'react';
import { CreateMeetingModal } from '../CreateMeetingModal';

interface Meeting {
  id: string;
  meetingName: string;
  meetingType: string;
  attendees: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  isInPerson: boolean;
  virtualLink: string;
  agenda: string;
  createdAt: Date;
}

interface ActionItem {
  id: string;
  taskName: string;
  pointOfContact: string;
  pocBriefed: 'Yes' | 'No';
  startDate: string;
  deadline: string;
  status: string;
  createdAt: Date;
}

interface WorkTactic {
  id: string;
  name: string;
  description: string;
  assignedTo: string;
  priority: 'High' | 'Medium' | 'Low';
}

interface WorkStrategy {
  id: string;
  name: string;
  description: string;
  tactics: WorkTactic[];
  expanded: boolean;
}

interface WorkObjective {
  id: string;
  name: string;
  description: string;
  strategies: WorkStrategy[];
  expanded: boolean;
}

interface Resource {
  id: string;
  name: string;
  quantityRequired: number;
  quantityHad: number;
  quantityNeeded: number;
}

interface WorkAssignment {
  id: string;
  name: string;
  divisionGroupLocation: string;
  resources: Resource[];
  overheadPositions: string;
  specialEquipmentSupplies: string;
  reportingLocation: string;
  requestedArrivalTime: string;
}

interface Hazard {
  id: string;
  name: string;
  incidentArea: string;
  mitigations: string;
  garScore: number;
}

interface InitialUCMeetingPhaseProps {
  data?: Record<string, any>;
  onDataChange?: (data: Record<string, any>) => void;
  onComplete?: () => void;
  onPrevious?: () => void;
  operationalPeriodNumber?: number;
  currentPhaseId?: string;
}

export function InitialUCMeetingPhase({ data = {}, onDataChange, onComplete, onPrevious, operationalPeriodNumber = 0, currentPhaseId = 'ic-uc-objectives-meeting' }: InitialUCMeetingPhaseProps) {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(data.checkedItems || {});
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(data.expandedItems || {});
  const [notes, setNotes] = useState<Record<string, string>>(data.notes || {});
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showAddActionModal, setShowAddActionModal] = useState(false);
  const [newAction, setNewAction] = useState<Partial<ActionItem>>({
    taskName: '',
    pointOfContact: '',
    pocBriefed: 'No',
    startDate: '',
    deadline: '',
    status: 'Not Started'
  });
  
  // Incident Objectives state (for Strategy Meeting)
  const [selectedLifelines, setSelectedLifelines] = useState<Record<string, boolean>>(data.selectedLifelines || {});
  const [incidentPriorities, setIncidentPriorities] = useState<string>(data.incidentPriorities || '');
  const [incidentObjectives, setIncidentObjectives] = useState<string>(data.incidentObjectives || '');
  const [commandEmphasis, setCommandEmphasis] = useState<string>(data.commandEmphasis || '');
  const [siteSafetyPlanRequired, setSiteSafetyPlanRequired] = useState<string>(data.siteSafetyPlanRequired || 'No');
  const [siteSafetyPlanLocation, setSiteSafetyPlanLocation] = useState<string>(data.siteSafetyPlanLocation || '');
  const [criticalInformationRequirements, setCriticalInformationRequirements] = useState<string>(data.criticalInformationRequirements || '');
  const [limitationsConstraints, setLimitationsConstraints] = useState<string>(data.limitationsConstraints || '');
  const [keyDecisionsProcedures, setKeyDecisionsProcedures] = useState<string>(data.keyDecisionsProcedures || '');
  
  // Get meetings and actions from data or initialize empty arrays
  const meetings: Meeting[] = data.meetings || [];
  const actions: ActionItem[] = data.actions || [];

  // ICS 201 Form State - Identical to ICUCObjectivesPhase
  const [ics201Data, setIcs201Data] = useState({
    mapSketch: data.ics201Data?.mapSketch || '',
    currentSituation: data.ics201Data?.currentSituation || '',
    responseObjectives: data.ics201Data?.responseObjectives || [
      { 
        id: '1', 
        objective: '', 
        time: '',
        actions: [
          { id: '1', action: '', status: 'Current', time: '' }
        ]
      }
    ],
    organizationRoster: data.ics201Data?.organizationRoster || [
      { id: '1', position: '', assignee: '' }
    ],
    resourcesSummary: data.ics201Data?.resourcesSummary || [
      { id: '1', resource: '', resourceIdentifier: '', dateTimeOrdered: '', eta: '', onScene: false, notes: '' }
    ],
    safetyAnalysis: data.ics201Data?.safetyAnalysis || {
      safetyOfficer: '',
      physicalHazards: [],
      environmentalHazards: [],
      otherHazards: [],
      weatherConditions: {
        temperature: '',
        conditions: '',
        wind: '',
        tides: '',
        seaState: '',
        waterTemperature: '',
        forecast: '',
        safetyNotes: ''
      },
      ppeRequirements: {
        requiredPPE: [],
        ppeNotes: '',
        isHazmat: false
      },
      hazmatAssessment: {
        hazmatClassification: [],
        protectionLevels: [],
        materialDescriptions: [
          {
            id: '1',
            material: '',
            quantity: '',
            physicalState: '',
            nioshNumber: '',
            specificGravity: '',
            ph: '',
            idlh: '',
            flashPoint: '',
            lel: '',
            uel: ''
          }
        ]
      }
    }
  });

  // Search, Filter, and Sort State
  const [globalSearch, setGlobalSearch] = useState<string>('');
  const [actionTableStates, setActionTableStates] = useState<Record<string, {
    search: string;
    statusFilter: string;
    sortBy: 'action' | 'status' | 'time';
    sortOrder: 'asc' | 'desc';
  }>>(data.actionTableStates || {});

  // Work Analysis Matrix state (for Prepare Tactics Meeting, Tactics Meeting, and Prepare Planning Meeting)
  const [workObjectives, setWorkObjectives] = useState<WorkObjective[]>(data.workObjectives || []);
  const [showAddObjectiveModal, setShowAddObjectiveModal] = useState(false);
  const [showAddStrategyModal, setShowAddStrategyModal] = useState(false);
  const [showAddTacticModal, setShowAddTacticModal] = useState(false);
  const [selectedObjectiveId, setSelectedObjectiveId] = useState<string>('');
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>('');
  const [newObjective, setNewObjective] = useState({ name: '', description: '' });
  const [newStrategy, setNewStrategy] = useState({ name: '', description: '' });
  const [newTactic, setNewTactic] = useState({ name: '', description: '', assignedTo: '', priority: 'Medium' as const });

  // Operational Planning state (for Prepare Tactics Meeting, Tactics Meeting, and Prepare Planning Meeting)
  const [workAssignments, setWorkAssignments] = useState<WorkAssignment[]>(data.workAssignments || []);
  const [showAddWorkAssignmentModal, setShowAddWorkAssignmentModal] = useState(false);
  const [newWorkAssignment, setNewWorkAssignment] = useState({
    name: '',
    divisionGroupLocation: '',
    resources: [] as Resource[],
    overheadPositions: '',
    specialEquipmentSupplies: '',
    reportingLocation: '',
    requestedArrivalTime: ''
  });
  const [newResource, setNewResource] = useState({
    name: '',
    quantityRequired: 0,
    quantityHad: 0,
    quantityNeeded: 0
  });

  // IAP Safety Analysis state (for Prepare Tactics Meeting)
  const [hazards, setHazards] = useState<Hazard[]>(data.hazards || []);
  const [showAddHazardModal, setShowAddHazardModal] = useState(false);
  const [newHazard, setNewHazard] = useState({
    name: '',
    incidentArea: '',
    mitigations: '',
    garScore: 1
  });

  // Community Lifelines for Strategy Meeting
  const communityLifelines = [
    'Safety & Security',
    'Food, Water, Sheltering',
    'Health & Medical',
    'Energy',
    'Communications',
    'Transportation',
    'Hazardous Materials'
  ];

  const agendaItems = [
    {
      id: 'rollcall',
      role: 'PSC',
      roleColor: 'bg-blue-600',
      item: 'Roll call, review ground rules and meeting agenda'
    },
    {
      id: 'regulatory-authority',
      role: 'IC/UC',
      roleColor: 'bg-green-600',
      item: 'Review regulatory authority, jurisdictional priorities, and initial objectives'
    },
    {
      id: 'uc-membership',
      role: 'IC/UC',
      roleColor: 'bg-green-600',
      item: 'Identify membership of Unified Command'
    },
    {
      id: 'uc-roles',
      role: 'IC/UC',
      roleColor: 'bg-green-600',
      item: 'Clarify UC roles and responsibilities'
    },
    {
      id: 'incident-priorities',
      role: 'IC/UC',
      roleColor: 'bg-green-600',
      item: 'Agree on incident priorities'
    },
    {
      id: 'assisting-agencies',
      role: 'IC/UC',
      roleColor: 'bg-green-600',
      item: 'Identify assisting and coordinating agencies'
    },
    {
      id: 'key-decisions',
      role: 'IC/UC',
      roleColor: 'bg-green-600',
      item: 'Negotiate and agree on key decisions',
      subItems: [
        'UC jurisdictional boundaries and focus AOR',
        'Name of incident',
        'Overall response organization, including integration of assisting and cooperating agencies',
        'Operational period length/start time and work shift hours',
        'Location of ICP and other critical facilities, as appropriate',
        'Command and General Staff composition, including deputies (especially OSC, PSC, and Public Information Officer (PIO))',
        'Resource ordering process',
        'Covers public affairs and public information issues'
      ]
    },
    {
      id: 'sensitive-info',
      role: 'PSC',
      roleColor: 'bg-blue-600',
      item: 'Agree on sensitive information, intelligence, and operational security issues'
    },
    {
      id: 'document-decisions',
      role: 'PSC',
      roleColor: 'bg-blue-600',
      item: 'Summarize and document key decisions'
    },
    {
      id: 'objectives-meeting',
      role: 'PSC',
      roleColor: 'bg-blue-600',
      item: 'Identify Objectives Meeting time, attendees, and location'
    }
  ];

  const handleItemCheck = (itemId: string, checked: boolean) => {
    const newCheckedItems = { ...checkedItems, [itemId]: checked };
    setCheckedItems(newCheckedItems);
    updateData({ checkedItems: newCheckedItems });
  };

  const handleItemExpand = (itemId: string) => {
    const newExpandedItems = { ...expandedItems, [itemId]: !expandedItems[itemId] };
    setExpandedItems(newExpandedItems);
    updateData({ expandedItems: newExpandedItems });
  };

  const handleNotesChange = (itemId: string, noteText: string) => {
    const newNotes = { ...notes, [itemId]: noteText };
    setNotes(newNotes);
    updateData({ notes: newNotes });
  };

  const updateData = (updates: Record<string, any>) => {
    if (onDataChange) {
      onDataChange({ 
        ...data, 
        checkedItems, 
        expandedItems, 
        notes,
        selectedLifelines,
        incidentPriorities,
        incidentObjectives,
        commandEmphasis,
        siteSafetyPlanRequired,
        siteSafetyPlanLocation,
        criticalInformationRequirements,
        limitationsConstraints,
        keyDecisionsProcedures,
        workObjectives,
        workAssignments,
        hazards,
        ics201Data,
        globalSearch,
        actionTableStates,
        ...updates 
      });
    }
  };

  // ICS-201 Handler Functions - Identical to ICUCObjectivesPhase
  const handleIcs201Change = (field: string, value: string | any[]) => {
    const newIcs201Data = { ...ics201Data, [field]: value };
    setIcs201Data(newIcs201Data);
    updateData({ ics201Data: newIcs201Data });
  };

  const handleObjectiveChange = (objectiveId: string, field: 'objective' | 'time', value: string) => {
    const newObjectives = ics201Data.responseObjectives.map(obj =>
      obj.id === objectiveId ? { ...obj, [field]: value } : obj
    );
    handleIcs201Change('responseObjectives', newObjectives);
  };

  const handleActionChange = (objectiveId: string, actionId: string, field: 'action' | 'status' | 'time', value: string) => {
    const newObjectives = ics201Data.responseObjectives.map(obj =>
      obj.id === objectiveId 
        ? {
            ...obj,
            actions: obj.actions.map(action =>
              action.id === actionId ? { ...action, [field]: value } : action
            )
          }
        : obj
    );
    handleIcs201Change('responseObjectives', newObjectives);
  };

  const addObjective = () => {
    const newObjective = {
      id: Date.now().toString(),
      objective: '',
      time: '',
      actions: [
        { id: Date.now().toString() + '-1', action: '', status: 'Current', time: '' }
      ]
    };
    handleIcs201Change('responseObjectives', [...ics201Data.responseObjectives, newObjective]);
  };

  const removeObjective = (objectiveId: string) => {
    if (ics201Data.responseObjectives.length > 1) {
      const newObjectives = ics201Data.responseObjectives.filter(obj => obj.id !== objectiveId);
      handleIcs201Change('responseObjectives', newObjectives);
    }
  };

  const addAction = (objectiveId: string) => {
    const newAction = {
      id: Date.now().toString(),
      action: '',
      status: 'Current',
      time: ''
    };
    const newObjectives = ics201Data.responseObjectives.map(obj =>
      obj.id === objectiveId 
        ? { ...obj, actions: [...obj.actions, newAction] }
        : obj
    );
    handleIcs201Change('responseObjectives', newObjectives);
  };

  const removeAction = (objectiveId: string, actionId: string) => {
    const newObjectives = ics201Data.responseObjectives.map(obj =>
      obj.id === objectiveId 
        ? { 
            ...obj, 
            actions: obj.actions.length > 1 
              ? obj.actions.filter(action => action.id !== actionId)
              : obj.actions
          }
        : obj
    );
    handleIcs201Change('responseObjectives', newObjectives);
  };

  const handleRosterChange = (id: string, field: 'position' | 'assignee', value: string) => {
    const newRoster = ics201Data.organizationRoster.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    );
    handleIcs201Change('organizationRoster', newRoster);
  };

  const addRosterItem = () => {
    const newItem = {
      id: Date.now().toString(),
      position: '',
      assignee: ''
    };
    handleIcs201Change('organizationRoster', [...ics201Data.organizationRoster, newItem]);
  };

  const removeRosterItem = (id: string) => {
    if (ics201Data.organizationRoster.length > 1) {
      const newRoster = ics201Data.organizationRoster.filter(item => item.id !== id);
      handleIcs201Change('organizationRoster', newRoster);
    }
  };

  const handleResourceChange = (id: string, field: 'resource' | 'resourceIdentifier' | 'dateTimeOrdered' | 'eta' | 'onScene' | 'notes', value: string | boolean) => {
    const newResources = ics201Data.resourcesSummary.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    );
    handleIcs201Change('resourcesSummary', newResources);
  };

  const addResourceItem = () => {
    const newItem = {
      id: Date.now().toString(),
      resource: '',
      resourceIdentifier: '',
      dateTimeOrdered: '',
      eta: '',
      onScene: false,
      notes: ''
    };
    handleIcs201Change('resourcesSummary', [...ics201Data.resourcesSummary, newItem]);
  };

  const removeResourceItem = (id: string) => {
    if (ics201Data.resourcesSummary.length > 1) {
      const newResources = ics201Data.resourcesSummary.filter(item => item.id !== id);
      handleIcs201Change('resourcesSummary', newResources);
    }
  };

  // Search, Filter, and Sort Handlers
  const updateActionTableState = (objectiveId: string, updates: Partial<{
    search: string;
    statusFilter: string;
    sortBy: 'action' | 'status' | 'time';
    sortOrder: 'asc' | 'desc';
  }>) => {
    const currentState = actionTableStates[objectiveId] || {
      search: '',
      statusFilter: 'all',
      sortBy: 'action',
      sortOrder: 'asc'
    };
    const newState = { ...currentState, ...updates };
    const newActionTableStates = { ...actionTableStates, [objectiveId]: newState };
    setActionTableStates(newActionTableStates);
    updateData({ actionTableStates: newActionTableStates });
  };

  // Filter and sort functions
  const getFilteredAndSortedActions = (objectiveId: string, actions: any[]) => {
    const tableState = actionTableStates[objectiveId] || {
      search: '',
      statusFilter: 'all',
      sortBy: 'action',
      sortOrder: 'asc'
    };

    let filteredActions = [...actions];

    // Apply search filter
    if (tableState.search) {
      filteredActions = filteredActions.filter(action =>
        action.action.toLowerCase().includes(tableState.search.toLowerCase()) ||
        action.time.toLowerCase().includes(tableState.search.toLowerCase())
      );
    }

    // Apply status filter
    if (tableState.statusFilter !== 'all') {
      filteredActions = filteredActions.filter(action => action.status === tableState.statusFilter);
    }

    // Apply sorting
    filteredActions.sort((a, b) => {
      let aValue = a[tableState.sortBy] || '';
      let bValue = b[tableState.sortBy] || '';
      
      if (tableState.sortBy === 'time') {
        // Handle time sorting differently if needed
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (tableState.sortOrder === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });

    return filteredActions;
  };

  // Global search filter for objectives
  const getFilteredObjectives = () => {
    if (!globalSearch) return ics201Data.responseObjectives;
    
    return ics201Data.responseObjectives.filter(objective => {
      // Search in objective text
      const objectiveMatch = objective.objective.toLowerCase().includes(globalSearch.toLowerCase());
      
      // Search in actions
      const actionMatch = objective.actions.some(action =>
        action.action.toLowerCase().includes(globalSearch.toLowerCase()) ||
        action.time.toLowerCase().includes(globalSearch.toLowerCase())
      );
      
      return objectiveMatch || actionMatch;
    });
  };

  const handleCreateMeeting = (meetingData: any) => {
    const newMeeting: Meeting = {
      id: Date.now().toString(), // Simple ID generation
      ...meetingData,
      createdAt: new Date()
    };

    const updatedMeetings = [...meetings, newMeeting];
    updateData({ meetings: updatedMeetings });
  };

  const handleDeleteMeeting = (meetingId: string) => {
    const updatedMeetings = meetings.filter(meeting => meeting.id !== meetingId);
    updateData({ meetings: updatedMeetings });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const handleExportICS201 = () => {
    // TODO: Implement ICS-201 export functionality
    console.log('Exporting ICS-201 form...');
    // This would typically generate and download the ICS-201 form
  };

  const handleExportICS202 = () => {
    // TODO: Implement ICS-202 export functionality
    console.log('Exporting ICS-202 form...');
    // This would typically generate and download the ICS-202 form
  };

  const handleExportICS233 = () => {
    // TODO: Implement ICS-233 export functionality
    console.log('Exporting ICS-233 form...');
    // This would typically generate and download the ICS-233 form
  };

  const handleExportICS234 = () => {
    // TODO: Implement ICS-234 export functionality
    console.log('Exporting ICS-234 form...');
    // This would typically generate and download the ICS-234 form
  };

  const handleExportICS215 = () => {
    // TODO: Implement ICS-215 export functionality
    console.log('Exporting ICS-215 form...');
    // This would typically generate and download the ICS-215 form
  };

  const handleExportICS215A = () => {
    // TODO: Implement ICS-215A export functionality
    console.log('Exporting ICS-215A form...');
    // This would typically generate and download the ICS-215A form
  };

  const handleExportICS213RR = () => {
    // TODO: Implement ICS-213RR export functionality
    console.log('Exporting ICS-213RR form...');
    // This would typically generate and download the ICS-213RR form
  };

  const handleAddAction = () => {
    if (!newAction.taskName || !newAction.pointOfContact) return;
    
    const action: ActionItem = {
      id: Date.now().toString(),
      taskName: newAction.taskName!,
      pointOfContact: newAction.pointOfContact!,
      pocBriefed: newAction.pocBriefed || 'No',
      startDate: newAction.startDate || '',
      deadline: newAction.deadline || '',
      status: newAction.status || 'Not Started',
      createdAt: new Date()
    };

    const updatedActions = [...actions, action];
    updateData({ actions: updatedActions });
    
    // Reset form
    setNewAction({
      taskName: '',
      pointOfContact: '',
      pocBriefed: 'No',
      startDate: '',
      deadline: '',
      status: 'Not Started'
    });
    setShowAddActionModal(false);
  };

  const handleUpdateAction = (actionId: string, field: keyof ActionItem, value: any) => {
    const updatedActions = actions.map(action =>
      action.id === actionId ? { ...action, [field]: value } : action
    );
    updateData({ actions: updatedActions });
  };

  const handleDeleteAction = (actionId: string) => {
    const updatedActions = actions.filter(action => action.id !== actionId);
    updateData({ actions: updatedActions });
  };

  // Incident Objectives handlers (for Strategy Meeting)
  const handleLifelineChange = (lifeline: string, checked: boolean) => {
    const newSelectedLifelines = { ...selectedLifelines, [lifeline]: checked };
    setSelectedLifelines(newSelectedLifelines);
    updateData({ selectedLifelines: newSelectedLifelines });
  };

  const handleIncidentPrioritiesChange = (value: string) => {
    setIncidentPriorities(value);
    updateData({ incidentPriorities: value });
  };

  const handleIncidentObjectivesChange = (value: string) => {
    setIncidentObjectives(value);
    updateData({ incidentObjectives: value });
  };

  const handleCommandEmphasisChange = (value: string) => {
    setCommandEmphasis(value);
    updateData({ commandEmphasis: value });
  };

  const handleSiteSafetyPlanRequiredChange = (value: string) => {
    setSiteSafetyPlanRequired(value);
    updateData({ siteSafetyPlanRequired: value });
  };

  const handleSiteSafetyPlanLocationChange = (value: string) => {
    setSiteSafetyPlanLocation(value);
    updateData({ siteSafetyPlanLocation: value });
  };

  const handleCriticalInformationRequirementsChange = (value: string) => {
    setCriticalInformationRequirements(value);
    updateData({ criticalInformationRequirements: value });
  };

  const handleLimitationsConstraintsChange = (value: string) => {
    setLimitationsConstraints(value);
    updateData({ limitationsConstraints: value });
  };

  const handleKeyDecisionsProceduresChange = (value: string) => {
    setKeyDecisionsProcedures(value);
    updateData({ keyDecisionsProcedures: value });
  };

  // Work Analysis Matrix handlers (for Prepare Tactics Meeting, Tactics Meeting, and Prepare Planning Meeting)
  const handleAddObjective = () => {
    if (!newObjective.name) return;
    
    const objective: WorkObjective = {
      id: Date.now().toString(),
      name: newObjective.name,
      description: newObjective.description,
      strategies: [],
      expanded: true
    };

    const updatedObjectives = [...workObjectives, objective];
    setWorkObjectives(updatedObjectives);
    updateData({ workObjectives: updatedObjectives });
    
    setNewObjective({ name: '', description: '' });
    setShowAddObjectiveModal(false);
  };

  const handleDeleteObjective = (objectiveId: string) => {
    const updatedObjectives = workObjectives.filter(obj => obj.id !== objectiveId);
    setWorkObjectives(updatedObjectives);
    updateData({ workObjectives: updatedObjectives });
  };

  const handleToggleObjective = (objectiveId: string) => {
    const updatedObjectives = workObjectives.map(obj =>
      obj.id === objectiveId ? { ...obj, expanded: !obj.expanded } : obj
    );
    setWorkObjectives(updatedObjectives);
    updateData({ workObjectives: updatedObjectives });
  };

  const handleAddStrategy = () => {
    if (!newStrategy.name || !selectedObjectiveId) return;
    
    const strategy: WorkStrategy = {
      id: Date.now().toString(),
      name: newStrategy.name,
      description: newStrategy.description,
      tactics: [],
      expanded: true
    };

    const updatedObjectives = workObjectives.map(obj =>
      obj.id === selectedObjectiveId
        ? { ...obj, strategies: [...obj.strategies, strategy] }
        : obj
    );
    
    setWorkObjectives(updatedObjectives);
    updateData({ workObjectives: updatedObjectives });
    
    setNewStrategy({ name: '', description: '' });
    setSelectedObjectiveId('');
    setShowAddStrategyModal(false);
  };

  const handleDeleteStrategy = (objectiveId: string, strategyId: string) => {
    const updatedObjectives = workObjectives.map(obj =>
      obj.id === objectiveId
        ? { ...obj, strategies: obj.strategies.filter(strategy => strategy.id !== strategyId) }
        : obj
    );
    setWorkObjectives(updatedObjectives);
    updateData({ workObjectives: updatedObjectives });
  };

  const handleToggleStrategy = (objectiveId: string, strategyId: string) => {
    const updatedObjectives = workObjectives.map(obj =>
      obj.id === objectiveId
        ? {
            ...obj,
            strategies: obj.strategies.map(strategy =>
              strategy.id === strategyId ? { ...strategy, expanded: !strategy.expanded } : strategy
            )
          }
        : obj
    );
    setWorkObjectives(updatedObjectives);
    updateData({ workObjectives: updatedObjectives });
  };

  const handleAddTactic = () => {
    if (!newTactic.name || !selectedObjectiveId || !selectedStrategyId) return;
    
    const tactic: WorkTactic = {
      id: Date.now().toString(),
      name: newTactic.name,
      description: newTactic.description,
      assignedTo: newTactic.assignedTo,
      priority: newTactic.priority
    };

    const updatedObjectives = workObjectives.map(obj =>
      obj.id === selectedObjectiveId
        ? {
            ...obj,
            strategies: obj.strategies.map(strategy =>
              strategy.id === selectedStrategyId
                ? { ...strategy, tactics: [...strategy.tactics, tactic] }
                : strategy
            )
          }
        : obj
    );
    
    setWorkObjectives(updatedObjectives);
    updateData({ workObjectives: updatedObjectives });
    
    setNewTactic({ name: '', description: '', assignedTo: '', priority: 'Medium' });
    setSelectedObjectiveId('');
    setSelectedStrategyId('');
    setShowAddTacticModal(false);
  };

  const handleDeleteTactic = (objectiveId: string, strategyId: string, tacticId: string) => {
    const updatedObjectives = workObjectives.map(obj =>
      obj.id === objectiveId
        ? {
            ...obj,
            strategies: obj.strategies.map(strategy =>
              strategy.id === strategyId
                ? { ...strategy, tactics: strategy.tactics.filter(tactic => tactic.id !== tacticId) }
                : strategy
            )
          }
        : obj
    );
    setWorkObjectives(updatedObjectives);
    updateData({ workObjectives: updatedObjectives });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-destructive';
      case 'Medium': return 'text-yellow-500';
      case 'Low': return 'text-green-500';
      default: return 'text-muted-foreground';
    }
  };

  // Operational Planning handlers (for Prepare Tactics Meeting, Tactics Meeting, and Prepare Planning Meeting)
  const handleAddWorkAssignment = () => {
    if (!newWorkAssignment.name) return;
    
    const workAssignment: WorkAssignment = {
      id: Date.now().toString(),
      name: newWorkAssignment.name,
      divisionGroupLocation: newWorkAssignment.divisionGroupLocation,
      resources: newWorkAssignment.resources,
      overheadPositions: newWorkAssignment.overheadPositions,
      specialEquipmentSupplies: newWorkAssignment.specialEquipmentSupplies,
      reportingLocation: newWorkAssignment.reportingLocation,
      requestedArrivalTime: newWorkAssignment.requestedArrivalTime
    };

    const updatedWorkAssignments = [...workAssignments, workAssignment];
    setWorkAssignments(updatedWorkAssignments);
    updateData({ workAssignments: updatedWorkAssignments });
    
    setNewWorkAssignment({
      name: '',
      divisionGroupLocation: '',
      resources: [],
      overheadPositions: '',
      specialEquipmentSupplies: '',
      reportingLocation: '',
      requestedArrivalTime: ''
    });
    setShowAddWorkAssignmentModal(false);
  };

  const handleUpdateWorkAssignment = (assignmentId: string, field: keyof WorkAssignment, value: any) => {
    const updatedWorkAssignments = workAssignments.map(assignment =>
      assignment.id === assignmentId ? { ...assignment, [field]: value } : assignment
    );
    setWorkAssignments(updatedWorkAssignments);
    updateData({ workAssignments: updatedWorkAssignments });
  };

  const handleDeleteWorkAssignment = (assignmentId: string) => {
    const updatedWorkAssignments = workAssignments.filter(assignment => assignment.id !== assignmentId);
    setWorkAssignments(updatedWorkAssignments);
    updateData({ workAssignments: updatedWorkAssignments });
  };

  // Resource management handlers
  const handleAddResourceToAssignment = (assignmentId: string, resource: Resource) => {
    const updatedWorkAssignments = workAssignments.map(assignment =>
      assignment.id === assignmentId
        ? { ...assignment, resources: [...assignment.resources, resource] }
        : assignment
    );
    setWorkAssignments(updatedWorkAssignments);
    updateData({ workAssignments: updatedWorkAssignments });
  };

  const handleUpdateResource = (assignmentId: string, resourceId: string, field: keyof Resource, value: any) => {
    const updatedWorkAssignments = workAssignments.map(assignment =>
      assignment.id === assignmentId
        ? {
            ...assignment,
            resources: assignment.resources.map(resource =>
              resource.id === resourceId ? { ...resource, [field]: value } : resource
            )
          }
        : assignment
    );
    setWorkAssignments(updatedWorkAssignments);
    updateData({ workAssignments: updatedWorkAssignments });
  };

  const handleDeleteResource = (assignmentId: string, resourceId: string) => {
    const updatedWorkAssignments = workAssignments.map(assignment =>
      assignment.id === assignmentId
        ? { ...assignment, resources: assignment.resources.filter(resource => resource.id !== resourceId) }
        : assignment
    );
    setWorkAssignments(updatedWorkAssignments);
    updateData({ workAssignments: updatedWorkAssignments });
  };

  const handleAddResourceToModal = () => {
    if (!newResource.name) return;
    
    const resource: Resource = {
      id: Date.now().toString(),
      name: newResource.name,
      quantityRequired: newResource.quantityRequired,
      quantityHad: newResource.quantityHad,
      quantityNeeded: newResource.quantityNeeded
    };

    setNewWorkAssignment(prev => ({
      ...prev,
      resources: [...prev.resources, resource]
    }));
    
    setNewResource({
      name: '',
      quantityRequired: 0,
      quantityHad: 0,
      quantityNeeded: 0
    });
  };

  const handleRemoveResourceFromModal = (resourceId: string) => {
    setNewWorkAssignment(prev => ({
      ...prev,
      resources: prev.resources.filter(resource => resource.id !== resourceId)
    }));
  };

  // IAP Safety Analysis handlers (for Prepare Tactics Meeting)
  const handleAddHazard = () => {
    if (!newHazard.name) return;
    
    const hazard: Hazard = {
      id: Date.now().toString(),
      name: newHazard.name,
      incidentArea: newHazard.incidentArea,
      mitigations: newHazard.mitigations,
      garScore: newHazard.garScore
    };

    const updatedHazards = [...hazards, hazard];
    setHazards(updatedHazards);
    updateData({ hazards: updatedHazards });
    
    setNewHazard({
      name: '',
      incidentArea: '',
      mitigations: '',
      garScore: 1
    });
    setShowAddHazardModal(false);
  };

  const handleUpdateHazard = (hazardId: string, field: keyof Hazard, value: any) => {
    const updatedHazards = hazards.map(hazard =>
      hazard.id === hazardId ? { ...hazard, [field]: value } : hazard
    );
    setHazards(updatedHazards);
    updateData({ hazards: updatedHazards });
  };

  const handleDeleteHazard = (hazardId: string) => {
    const updatedHazards = hazards.filter(hazard => hazard.id !== hazardId);
    setHazards(updatedHazards);
    updateData({ hazards: updatedHazards });
  };

  const getGarScoreColor = (score: number) => {
    if (score >= 1 && score <= 3) return 'text-green-500';
    if (score >= 4 && score <= 6) return 'text-yellow-500';
    if (score >= 7 && score <= 10) return 'text-destructive';
    return 'text-muted-foreground';
  };

  // Remove completion requirement - allow users to proceed without completing all items
  const allItemsCompleted = true;

  // Get phase-specific header content
  const getPhaseHeader = () => {
    switch (currentPhaseId) {
      case 'ic-uc-objectives-meeting':
        return {
          icon: <Users className="w-5 h-5 text-accent" />,
          title: 'IC/UC Objectives Meeting',
          description: 'Incident Commander and Unified Command objectives meeting'
        };
      case 'strategy-meeting':
        return {
          icon: <Target className="w-5 h-5 text-accent" />,
          title: 'Strategy Meeting',
          description: 'Develop strategic approach for incident response'
        };
      case 'prepare-tactics-meeting':
        return {
          icon: <Layers className="w-5 h-5 text-accent" />,
          title: 'Prepare for Tactics Meeting',
          description: 'Preparation activities for the tactics meeting'
        };
      case 'tactics-meeting':
        return {
          icon: <Crosshair className="w-5 h-5 text-accent" />,
          title: 'Tactics Meeting',
          description: 'Tactical planning and resource assignment meeting'
        };
      case 'prepare-planning-meeting':
        return {
          icon: <ClipboardList className="w-5 h-5 text-accent" />,
          title: 'Prepare for Planning Meeting',
          description: 'Preparation activities for the planning meeting'
        };
      case 'planning-meeting':
        return {
          icon: <Users className="w-5 h-5 text-accent" />,
          title: 'Planning Meeting',
          description: 'Planning and coordination meeting'
        };
      case 'iap-prep-approval':
        return {
          icon: <FileCheck className="w-5 h-5 text-accent" />,
          title: 'IAP Prep & Approval',
          description: 'Incident Action Plan preparation and approval'
        };
      case 'operations-briefing':
        return {
          icon: <Info className="w-5 h-5 text-accent" />,
          title: 'Operations Briefing',
          description: 'Operations briefing and assignment communication'
        };
      default:
        return {
          icon: <Users className="w-5 h-5 text-accent" />,
          title: 'Meeting Phase',
          description: 'Meeting phase description'
        };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-foreground">{getPhaseHeader().title}</h2>
          <p className="text-muted-foreground">{getPhaseHeader().description}</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Period {operationalPeriodNumber}
        </Badge>
      </div>

      {/* Scheduled Meetings Card - Hidden during Incident Briefing */}
      {currentPhaseId !== 'incident-briefing' && (
        <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Scheduled Meetings ({meetings.length})
              </CardTitle>
              <CardDescription>
                {getPhaseHeader().title} meetings that have been scheduled
              </CardDescription>
            </div>
            <Button 
              onClick={() => setShowScheduleModal(true)}
              className="flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Schedule Meeting
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {meetings.length > 0 ? (
            meetings.map((meeting) => (
              <div key={meeting.id} className="border border-border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{meeting.meetingName}</h4>
                      <Badge variant="outline" className="text-xs">
                        {meeting.meetingType}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(meeting.date)}
                      </div>
                      {meeting.startTime && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTime(meeting.startTime)}
                          {meeting.endTime && ` - ${formatTime(meeting.endTime)}`}
                        </div>
                      )}
                    </div>

                    {meeting.location && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                        <MapPin className="w-3 h-3" />
                        {meeting.location}
                        {meeting.isInPerson ? ' (In-Person)' : ' (Virtual)'}
                      </div>
                    )}

                    {!meeting.isInPerson && meeting.virtualLink && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                        <Link className="w-3 h-3" />
                        <a 
                          href={meeting.virtualLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-accent hover:underline"
                        >
                          Join Meeting
                        </a>
                      </div>
                    )}

                    {meeting.attendees && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                        <Users className="w-3 h-3" />
                        <span className="truncate">{meeting.attendees}</span>
                      </div>
                    )}

                    {meeting.agenda && (
                      <div className="mt-3">
                        <p className="text-sm font-medium mb-2 text-card-foreground">Agenda:</p>
                        <div className="bg-card/50 border border-border/50 rounded-lg p-4 max-h-24 overflow-y-auto">
                          <div className="text-sm text-card-foreground/90 leading-relaxed whitespace-pre-wrap font-normal">
                            {meeting.agenda}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteMeeting(meeting.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 ml-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="sr-only">Delete meeting</span>
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No {getPhaseHeader().title} meetings scheduled</p>
            </div>
          )}
        </CardContent>
        </Card>
      )}

      {/* Strategy Meeting Specific Cards */}
      {currentPhaseId === 'strategy-meeting' && (
        <>
          {/* Incident Objectives Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-accent" />
                Incident Objectives
              </CardTitle>
              <CardDescription>
                Define strategic objectives and priorities for the incident response
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Community Lifelines */}
              <div className="space-y-3">
                <Label className="font-medium text-card-foreground">Affected Community Lifelines</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {communityLifelines.map((lifeline) => (
                    <div key={lifeline} className="flex items-center space-x-2">
                      <Checkbox
                        id={`lifeline-${lifeline}`}
                        checked={selectedLifelines[lifeline] || false}
                        onCheckedChange={(checked) => handleLifelineChange(lifeline, checked as boolean)}
                      />
                      <Label 
                        htmlFor={`lifeline-${lifeline}`} 
                        className="text-sm text-card-foreground cursor-pointer"
                      >
                        {lifeline}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Incident Priorities */}
              <div className="space-y-3">
                <Label htmlFor="incident-priorities" className="font-medium text-card-foreground">
                  Incident Priorities
                </Label>
                <Textarea
                  id="incident-priorities"
                  placeholder="Define the key priorities for this incident..."
                  value={incidentPriorities}
                  onChange={(e) => handleIncidentPrioritiesChange(e.target.value)}
                  className="min-h-20"
                />
              </div>

              {/* Incident Objectives */}
              <div className="space-y-3">
                <Label htmlFor="incident-objectives" className="font-medium text-card-foreground">
                  Incident Objectives
                </Label>
                <Textarea
                  id="incident-objectives"
                  placeholder="List the specific objectives for this operational period..."
                  value={incidentObjectives}
                  onChange={(e) => handleIncidentObjectivesChange(e.target.value)}
                  className="min-h-24"
                />
              </div>

              {/* Command Emphasis */}
              <div className="space-y-3">
                <Label htmlFor="command-emphasis" className="font-medium text-card-foreground">
                  Command Emphasis
                </Label>
                <Textarea
                  id="command-emphasis"
                  placeholder="Specify any particular emphasis or focus areas from command..."
                  value={commandEmphasis}
                  onChange={(e) => handleCommandEmphasisChange(e.target.value)}
                  className="min-h-20"
                />
              </div>

              {/* Site Safety Plan */}
              <div className="space-y-3">
                <Label className="font-medium text-card-foreground">Site Safety Plan</Label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-card-foreground">Is a Site Safety Plan Required?</span>
                    <Select value={siteSafetyPlanRequired} onValueChange={handleSiteSafetyPlanRequiredChange}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {siteSafetyPlanRequired === 'Yes' && (
                    <div className="space-y-2">
                      <Label htmlFor="safety-plan-location" className="text-sm text-card-foreground">
                        Site Safety Plan Location/Details
                      </Label>
                      <Input
                        id="safety-plan-location"
                        placeholder="Specify location or details of the site safety plan..."
                        value={siteSafetyPlanLocation}
                        onChange={(e) => handleSiteSafetyPlanLocationChange(e.target.value)}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Critical Information Requirements */}
              <div className="space-y-3">
                <Label htmlFor="critical-info" className="font-medium text-card-foreground">
                  Critical Information Requirements
                </Label>
                <Textarea
                  id="critical-info"
                  placeholder="List critical information needed for decision making..."
                  value={criticalInformationRequirements}
                  onChange={(e) => handleCriticalInformationRequirementsChange(e.target.value)}
                  className="min-h-20"
                />
              </div>

              {/* Limitations and Constraints */}
              <div className="space-y-3">
                <Label htmlFor="limitations" className="font-medium text-card-foreground">
                  Limitations and Constraints
                </Label>
                <Textarea
                  id="limitations"
                  placeholder="Identify any limitations or constraints affecting the response..."
                  value={limitationsConstraints}
                  onChange={(e) => handleLimitationsConstraintsChange(e.target.value)}
                  className="min-h-20"
                />
              </div>

              {/* Key Decisions and Procedures */}
              <div className="space-y-3">
                <Label htmlFor="key-decisions" className="font-medium text-card-foreground">
                  Key Decisions and Procedures
                </Label>
                <Textarea
                  id="key-decisions"
                  placeholder="Document key decisions made and procedures to follow..."
                  value={keyDecisionsProcedures}
                  onChange={(e) => handleKeyDecisionsProceduresChange(e.target.value)}
                  className="min-h-20"
                />
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Prepare Tactics Meeting, Tactics Meeting, and Prepare Planning Meeting Specific Cards */}
      {(currentPhaseId === 'prepare-tactics-meeting' || currentPhaseId === 'tactics-meeting' || currentPhaseId === 'prepare-planning-meeting') && (
        <>
          {/* Work Analysis Matrix Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-accent" />
                    Work Analysis Matrix
                  </CardTitle>
                  <CardDescription>
                    Break down objectives into strategies and tactics
                  </CardDescription>
                </div>
                <Button 
                  onClick={() => setShowAddObjectiveModal(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Objective
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {workObjectives.length > 0 ? (
                workObjectives.map((objective) => (
                  <div key={objective.id} className="border border-border rounded-lg">
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleObjective(objective.id)}
                            className="p-1"
                          >
                            {objective.expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </Button>
                          <div>
                            <h4 className="font-medium text-card-foreground">{objective.name}</h4>
                            {objective.description && (
                              <p className="text-sm text-muted-foreground mt-1">{objective.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedObjectiveId(objective.id);
                              setShowAddStrategyModal(true);
                            }}
                            className="text-xs"
                          >
                            Add Strategy
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteObjective(objective.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {objective.expanded && (
                        <div className="ml-6 space-y-3 pt-3 border-t border-border/50">
                          {objective.strategies.map((strategy) => (
                            <div key={strategy.id} className="border border-border/50 rounded-lg">
                              <div className="p-3">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleToggleStrategy(objective.id, strategy.id)}
                                      className="p-1"
                                    >
                                      {strategy.expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                    </Button>
                                    <div>
                                      <h5 className="text-sm font-medium text-card-foreground">{strategy.name}</h5>
                                      {strategy.description && (
                                        <p className="text-xs text-muted-foreground mt-1">{strategy.description}</p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedObjectiveId(objective.id);
                                        setSelectedStrategyId(strategy.id);
                                        setShowAddTacticModal(true);
                                      }}
                                      className="text-xs"
                                    >
                                      Add Tactic
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteStrategy(objective.id, strategy.id)}
                                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                                
                                {strategy.expanded && strategy.tactics.length > 0 && (
                                  <div className="ml-5 space-y-2 pt-2 border-t border-border/30">
                                    {strategy.tactics.map((tactic) => (
                                      <div key={tactic.id} className="flex items-start justify-between p-2 bg-muted/20 rounded">
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-card-foreground">{tactic.name}</span>
                                            <Badge variant="outline" className={`text-xs ${getPriorityColor(tactic.priority)}`}>
                                              {tactic.priority}
                                            </Badge>
                                          </div>
                                          {tactic.description && (
                                            <p className="text-xs text-muted-foreground mt-1">{tactic.description}</p>
                                          )}
                                          {tactic.assignedTo && (
                                            <p className="text-xs text-muted-foreground">Assigned to: {tactic.assignedTo}</p>
                                          )}
                                        </div>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleDeleteTactic(objective.id, strategy.id, tactic.id)}
                                          className="text-destructive hover:text-destructive hover:bg-destructive/10 ml-2"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-2">No objectives defined</p>
                  <p className="text-sm text-muted-foreground">Add objectives to break down the work into manageable strategies and tactics</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Operational Planning Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-accent" />
                    Operational Planning
                  </CardTitle>
                  <CardDescription>
                    Define work assignments and resource requirements
                  </CardDescription>
                </div>
                <Button 
                  onClick={() => setShowAddWorkAssignmentModal(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Work Assignment
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {workAssignments.length > 0 ? (
                workAssignments.map((assignment) => (
                  <div key={assignment.id} className="border border-border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-card-foreground mb-1">{assignment.name}</h4>
                        {assignment.divisionGroupLocation && (
                          <p className="text-sm text-muted-foreground">Division/Group: {assignment.divisionGroupLocation}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteWorkAssignment(assignment.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">Overhead Positions</Label>
                        <Input
                          value={assignment.overheadPositions}
                          onChange={(e) => handleUpdateWorkAssignment(assignment.id, 'overheadPositions', e.target.value)}
                          placeholder="List overhead positions..."
                          className="mt-1 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">Reporting Location</Label>
                        <Input
                          value={assignment.reportingLocation}
                          onChange={(e) => handleUpdateWorkAssignment(assignment.id, 'reportingLocation', e.target.value)}
                          placeholder="Specify reporting location..."
                          className="mt-1 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">Special Equipment/Supplies</Label>
                        <Input
                          value={assignment.specialEquipmentSupplies}
                          onChange={(e) => handleUpdateWorkAssignment(assignment.id, 'specialEquipmentSupplies', e.target.value)}
                          placeholder="List special equipment..."
                          className="mt-1 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">Requested Arrival Time</Label>
                        <Input
                          value={assignment.requestedArrivalTime}
                          onChange={(e) => handleUpdateWorkAssignment(assignment.id, 'requestedArrivalTime', e.target.value)}
                          placeholder="HH:MM"
                          className="mt-1 text-sm"
                        />
                      </div>
                    </div>

                    {assignment.resources.length > 0 && (
                      <div className="pt-3 border-t border-border/50">
                        <Label className="text-xs font-medium text-muted-foreground mb-2 block">Resources</Label>
                        <div className="space-y-2">
                          {assignment.resources.map((resource) => (
                            <div key={resource.id} className="flex items-center justify-between p-2 bg-muted/20 rounded text-sm">
                              <div className="flex-1">
                                <span className="font-medium">{resource.name}</span>
                                <span className="text-muted-foreground ml-2">
                                  Required: {resource.quantityRequired}, Have: {resource.quantityHad}, Need: {resource.quantityNeeded}
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteResource(assignment.id, resource.id)}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10 ml-2"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <ClipboardList className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-2">No work assignments defined</p>
                  <p className="text-sm text-muted-foreground">Add work assignments to organize operational activities and resources</p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Prepare Tactics Meeting Specific Cards */}
      {currentPhaseId === 'prepare-tactics-meeting' && (
        <>
          {/* IAP Safety Analysis Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-accent" />
                    IAP Safety Analysis
                  </CardTitle>
                  <CardDescription>
                    Identify hazards and safety considerations for the operational period
                  </CardDescription>
                </div>
                <Button 
                  onClick={() => setShowAddHazardModal(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Hazard
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {hazards.length > 0 ? (
                hazards.map((hazard) => (
                  <div key={hazard.id} className="border border-border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-card-foreground">{hazard.name}</h4>
                          <Badge variant="outline" className={`text-xs ${getGarScoreColor(hazard.garScore)}`}>
                            GAR: {hazard.garScore}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-xs font-medium text-muted-foreground">Incident Area</Label>
                            <Input
                              value={hazard.incidentArea}
                              onChange={(e) => handleUpdateHazard(hazard.id, 'incidentArea', e.target.value)}
                              placeholder="Specify incident area..."
                              className="mt-1 text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs font-medium text-muted-foreground">GAR Score (1-10)</Label>
                            <Select 
                              value={hazard.garScore.toString()} 
                              onValueChange={(value) => handleUpdateHazard(hazard.id, 'garScore', parseInt(value))}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {[1,2,3,4,5,6,7,8,9,10].map((score) => (
                                  <SelectItem key={score} value={score.toString()}>{score}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <Label className="text-xs font-medium text-muted-foreground">Mitigations</Label>
                          <Textarea
                            value={hazard.mitigations}
                            onChange={(e) => handleUpdateHazard(hazard.id, 'mitigations', e.target.value)}
                            placeholder="Describe mitigation measures..."
                            className="mt-1 text-sm min-h-20"
                          />
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteHazard(hazard.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-2">No hazards identified</p>
                  <p className="text-sm text-muted-foreground">Add hazards to conduct safety analysis for the operational period</p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Prepare Planning Meeting Specific Cards */}
      {currentPhaseId === 'prepare-planning-meeting' && (
        <>
          {/* ICS Forms Export Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5 text-accent" />
                ICS Forms Export
              </CardTitle>
              <CardDescription>
                Export completed ICS forms for the planning meeting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button
                  onClick={handleExportICS215}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export ICS-215
                </Button>
                
                <Button
                  onClick={handleExportICS215A}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export ICS-215A
                </Button>
                
                <Button
                  onClick={handleExportICS213RR}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export ICS-213RR
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Planning Meeting Specific Cards */}
      {currentPhaseId === 'planning-meeting' && (
        <>
          {/* Operational Planning Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-accent" />
                Operational Planning
              </CardTitle>
              <CardDescription>
                Review and finalize operational planning for the next operational period
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8">
                <ClipboardList className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="text-muted-foreground mb-2">Operational Planning</h4>
                <p className="text-muted-foreground">Planning meeting functionality coming soon</p>
                <p className="text-sm text-muted-foreground mt-1">
                  This will facilitate the comprehensive planning meeting process including resource assignments, tactical objectives, and coordination activities.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Open Actions Tracker Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListTodo className="w-5 h-5 text-accent" />
                Open Actions Tracker
              </CardTitle>
              <CardDescription>
                Track open action items and assignments from the planning meeting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8">
                <ListTodo className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="text-muted-foreground mb-2">Open Actions Tracker</h4>
                <p className="text-muted-foreground">Action tracking functionality coming soon</p>
                <p className="text-sm text-muted-foreground mt-1">
                  This will provide comprehensive action item tracking including assignments, deadlines, and status updates from planning meeting decisions.
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* IAP Prep & Approval Specific Cards */}
      {currentPhaseId === 'iap-prep-approval' && (
        <>
          {/* Objectives Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-accent" />
                Objectives
              </CardTitle>
              <CardDescription>
                Review and finalize incident objectives for the operational period
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="text-muted-foreground mb-2">Objectives</h4>
                <p className="text-muted-foreground">Objectives review functionality coming soon</p>
                <p className="text-sm text-muted-foreground mt-1">
                  This will provide comprehensive objectives management including priority setting, resource allocation, and success metrics for the IAP.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Organization Assignment List Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-accent" />
                Organization Assignment List
              </CardTitle>
              <CardDescription>
                Define organizational structure and personnel assignments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="text-muted-foreground mb-2">Organization Assignment List</h4>
                <p className="text-muted-foreground">Organization assignments functionality coming soon</p>
                <p className="text-sm text-muted-foreground mt-1">
                  This will provide comprehensive organizational structure management including ICS positions, personnel assignments, and command relationships.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Organization Chart Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-accent" />
                Organization Chart
              </CardTitle>
              <CardDescription>
                Visual representation of the incident organization structure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8">
                <Layers className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="text-muted-foreground mb-2">Organization Chart</h4>
                <p className="text-muted-foreground">Organization chart functionality coming soon</p>
                <p className="text-sm text-muted-foreground mt-1">
                  This will provide visual organization chart creation and management including ICS structure, reporting relationships, and span of control visualization.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Safety Plan Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-accent" />
                Safety Plan
              </CardTitle>
              <CardDescription>
                Comprehensive safety planning and hazard mitigation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8">
                <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="text-muted-foreground mb-2">Safety Plan</h4>
                <p className="text-muted-foreground">Safety planning functionality coming soon</p>
                <p className="text-sm text-muted-foreground mt-1">
                  This will provide comprehensive safety plan development including hazard analysis, safety protocols, emergency procedures, and risk mitigation strategies.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Assignment List Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-accent" />
                Assignment List
              </CardTitle>
              <CardDescription>
                Detailed work assignments and resource allocations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8">
                <ClipboardList className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="text-muted-foreground mb-2">Assignment List</h4>
                <p className="text-muted-foreground">Assignment list functionality coming soon</p>
                <p className="text-sm text-muted-foreground mt-1">
                  This will provide detailed assignment management including work assignments, resource requirements, reporting instructions, and special equipment needs.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Incident Radio Communications Plan Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-accent" />
                Incident Radio Communications Plan
              </CardTitle>
              <CardDescription>
                Radio frequency assignments and communication protocols
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8">
                <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="text-muted-foreground mb-2">Incident Radio Communications Plan</h4>
                <p className="text-muted-foreground">Communications planning functionality coming soon</p>
                <p className="text-sm text-muted-foreground mt-1">
                  This will provide comprehensive communications planning including frequency assignments, talk group management, and communication protocols for operational coordination.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Medical Plan Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-accent" />
                Medical Plan
              </CardTitle>
              <CardDescription>
                Medical support and emergency medical procedures
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8">
                <Plus className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="text-muted-foreground mb-2">Medical Plan</h4>
                <p className="text-muted-foreground">Medical planning functionality coming soon</p>
                <p className="text-sm text-muted-foreground mt-1">
                  This will provide comprehensive medical planning including medical support locations, evacuation procedures, medical personnel assignments, and emergency medical protocols.
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Operations Briefing Specific Cards */}
      {currentPhaseId === 'operations-briefing' && (
        <>
          {/* Assignment List Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-accent" />
                    Assignment List
                  </CardTitle>
                  <CardDescription>
                    Review and communicate operational assignments and responsibilities
                  </CardDescription>
                </div>
                <Button 
                  className="flex items-center gap-2"
                  disabled
                >
                  <Plus className="w-4 h-4" />
                  Add Assignment
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8">
                <ClipboardList className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="text-muted-foreground mb-2">Assignment List</h4>
                <p className="text-muted-foreground">Assignment briefing functionality coming soon</p>
                <p className="text-sm text-muted-foreground mt-1">
                  This will provide comprehensive assignment briefing tools including operational objectives, resource assignments, safety reminders, and communication protocols for the operational period.
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Initial UC Meeting Phase specific content */}
      {currentPhaseId === 'ic-uc-objectives-meeting' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getPhaseHeader().icon}
              Meeting Agenda
            </CardTitle>
            <CardDescription>
              IC/UC Objectives meeting agenda and tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {agendaItems.map((item) => (
              <div key={item.id} className="border border-border rounded-lg">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id={`item-${item.id}`}
                        checked={checkedItems[item.id] || false}
                        onCheckedChange={(checked) => handleItemCheck(item.id, checked as boolean)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={`${item.roleColor} text-white text-xs`}>
                            {item.role}
                          </Badge>
                        </div>
                        <Label 
                          htmlFor={`item-${item.id}`} 
                          className="text-card-foreground cursor-pointer"
                        >
                          {item.item}
                        </Label>
                        {item.subItems && (
                          <div className="mt-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleItemExpand(item.id)}
                              className="flex items-center gap-2 text-sm p-2 h-auto"
                            >
                              {expandedItems[item.id] ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                              Show Details ({item.subItems.length} items)
                            </Button>
                            {expandedItems[item.id] && (
                              <div className="ml-6 mt-2 space-y-2">
                                {item.subItems.map((subItem, index) => (
                                  <div key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                                    <span className="text-accent mt-1">•</span>
                                    <span>{subItem}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleItemExpand(`notes-${item.id}`)}
                      className="text-muted-foreground hover:text-accent"
                    >
                      <StickyNote className="w-4 h-4" />
                    </Button>
                  </div>
                  {expandedItems[`notes-${item.id}`] && (
                    <div className="mt-4 pl-8">
                      <Textarea
                        placeholder="Add notes for this agenda item..."
                        value={notes[item.id] || ''}
                        onChange={(e) => handleNotesChange(item.id, e.target.value)}
                        className="min-h-24"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* ICS-201 Expandable Card - Only shown during Incident Briefing */}
      {currentPhaseId === 'incident-briefing' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-accent" />
                  ICS-201 Initial Response Objectives
                </CardTitle>
                <CardDescription>
                  Incident Command System 201 form for initial response objectives and assessment
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleItemExpand('ics-201-form')}
                className="flex items-center gap-2 text-muted-foreground hover:text-accent"
              >
                {expandedItems['ics-201-form'] ? (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Collapse
                  </>
                ) : (
                  <>
                    <ChevronRight className="w-4 h-4" />
                    Expand
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          {expandedItems['ics-201-form'] && (
            <CardContent>
              <div className="space-y-5">
                {/* Map Sketch Section */}
                <div>
                  <Label className="text-sm text-foreground">Map Sketch</Label>
                  <div className="mt-2 w-full h-48 border border-border rounded-lg overflow-hidden bg-primary flex items-center justify-center relative">
                    <div className="text-center text-primary-foreground">
                      <svg className="w-12 h-12 mx-auto mb-2 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                      <div className="font-medium">Interactive Map</div>
                      <div className="text-sm opacity-80">Coming Soon</div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute bottom-2 right-2 h-7 px-2.5 text-xs border-white text-white hover:text-white hover:bg-white/20"
                      onClick={() => {
                        console.log('Save image clicked');
                      }}
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Save Image
                    </Button>
                  </div>
                </div>

                {/* Current Situation Section */}
                <div>
                  <Label className="text-sm text-foreground">Current Situation</Label>
                  <Textarea
                    value={ics201Data.currentSituation}
                    onChange={(e) => handleIcs201Change('currentSituation', e.target.value)}
                    placeholder="Describe the current situation..."
                    className="mt-2 bg-input-background border-border text-foreground placeholder:text-muted-foreground"
                    rows={6}
                  />
                </div>

                {/* Initial Response Objectives Section */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label className="text-sm text-foreground">Initial Response Objectives</Label>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={addObjective}
                      className="h-6 px-2 text-xs border-border text-white hover:text-white bg-transparent hover:bg-accent"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Objective
                    </Button>
                    <div className="relative flex-1 max-w-64">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                      <Input
                        placeholder="Search objectives..."
                        value={globalSearch}
                        onChange={(e) => setGlobalSearch(e.target.value)}
                        className="pl-7 h-6 text-xs bg-input-background border-border text-foreground placeholder:text-muted-foreground"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {getFilteredObjectives().map((objective, index) => (
                      <div key={objective.id} className="bg-muted/20 p-4 rounded-lg border border-border">
                        <div className="flex items-center justify-between mb-3">
                          <Badge variant="outline" className="bg-accent/10 text-accent border-accent">
                            Objective {index + 1}
                          </Badge>
                          {ics201Data.responseObjectives.length > 1 && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeObjective(objective.id)}
                              className="h-6 w-6 p-0 hover:bg-destructive/20 text-destructive"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                        
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-xs text-foreground font-medium">Objective</Label>
                              <Input
                                value={objective.objective}
                                onChange={(e) => handleObjectiveChange(objective.id, 'objective', e.target.value)}
                                placeholder="Enter objective description..."
                                className="mt-1 bg-input-background border-border text-foreground placeholder:text-muted-foreground"
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-foreground font-medium">Time</Label>
                              <Input
                                value={objective.time}
                                onChange={(e) => handleObjectiveChange(objective.id, 'time', e.target.value)}
                                placeholder="Enter time frame..."
                                className="mt-1 bg-input-background border-border text-foreground placeholder:text-muted-foreground"
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <Label className="text-xs text-foreground font-medium">Aligned Actions</Label>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => addAction(objective.id)}
                                  className="h-6 px-2 text-xs border-border text-white hover:text-white bg-transparent hover:bg-accent"
                                >
                                  <Plus className="w-3 h-3 mr-1" />
                                  Action
                                </Button>
                              </div>
                            </div>

                            <div className="border border-border rounded-lg overflow-hidden">
                              <div className="grid grid-cols-12 bg-muted/20 border-b border-border">
                                <div className="col-span-5 p-2 border-r border-border">
                                  <Label className="text-xs text-foreground font-medium">Aligned Actions</Label>
                                </div>
                                <div className="col-span-2 p-2 border-r border-border">
                                  <Label className="text-xs text-foreground font-medium">Status</Label>
                                </div>
                                <div className="col-span-4 p-2 border-r border-border">
                                  <Label className="text-xs text-foreground font-medium">Time</Label>
                                </div>
                                <div className="col-span-1 p-2">
                                  <Label className="text-xs text-foreground font-medium"></Label>
                                </div>
                              </div>

                              {getFilteredAndSortedActions(objective.id, objective.actions).map((action) => (
                                <div key={action.id} className="grid grid-cols-12 border-b border-border last:border-b-0">
                                  <div className="col-span-5 p-2 border-r border-border">
                                    <Input
                                      value={action.action}
                                      onChange={(e) => handleActionChange(objective.id, action.id, 'action', e.target.value)}
                                      placeholder="Enter action description..."
                                      className="h-8 text-xs bg-input-background border-0 text-foreground placeholder:text-muted-foreground"
                                    />
                                  </div>
                                  <div className="col-span-2 p-2 border-r border-border">
                                    <Select value={action.status} onValueChange={(value) => handleActionChange(objective.id, action.id, 'status', value)}>
                                      <SelectTrigger className="h-8 text-xs bg-input-background border-0 text-foreground">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Current">Current</SelectItem>
                                        <SelectItem value="Planned">Planned</SelectItem>
                                        <SelectItem value="Completed">Completed</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="col-span-4 p-2 border-r border-border">
                                    <Input
                                      value={action.time}
                                      onChange={(e) => handleActionChange(objective.id, action.id, 'time', e.target.value)}
                                      placeholder="Enter time frame..."
                                      className="h-8 text-xs bg-input-background border-0 text-foreground placeholder:text-muted-foreground"
                                    />
                                  </div>
                                  <div className="col-span-1 p-2 flex items-center justify-center">
                                    {objective.actions.length > 1 && (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => removeAction(objective.id, action.id)}
                                        className="h-6 w-6 p-0 hover:bg-destructive/20 text-destructive"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Organization Roster Section */}
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Label className="text-sm text-foreground">Organization Roster</Label>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={addRosterItem}
                      className="h-6 px-2 text-xs border-border text-foreground hover:text-foreground"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Row
                    </Button>
                  </div>
                  
                  <div className="border border-border rounded-lg overflow-hidden">
                    <div className="grid grid-cols-12 bg-muted/20 border-b border-border">
                      <div className="col-span-5 p-3 border-r border-border">
                        <Label className="text-xs text-foreground font-medium">Position</Label>
                      </div>
                      <div className="col-span-6 p-3 border-r border-border">
                        <Label className="text-xs text-foreground font-medium">Assignee</Label>
                      </div>
                      <div className="col-span-1 p-3">
                        <Label className="text-xs text-foreground font-medium"></Label>
                      </div>
                    </div>
                    
                    {ics201Data.organizationRoster.map((item) => (
                      <div key={item.id} className="grid grid-cols-12 border-b border-border last:border-b-0">
                        <div className="col-span-5 p-2 border-r border-border">
                          <Input
                            value={item.position}
                            onChange={(e) => handleRosterChange(item.id, 'position', e.target.value)}
                            placeholder="Incident Commander, Safety Officer..."
                            className="h-8 text-xs bg-input-background border-0 text-foreground placeholder:text-muted-foreground"
                          />
                        </div>
                        <div className="col-span-6 p-2 border-r border-border">
                          <Input
                            value={item.assignee}
                            onChange={(e) => handleRosterChange(item.id, 'assignee', e.target.value)}
                            placeholder="Name and contact information..."
                            className="h-8 text-xs bg-input-background border-0 text-foreground placeholder:text-muted-foreground"
                          />
                        </div>
                        <div className="col-span-1 p-2 flex items-center justify-center">
                          {ics201Data.organizationRoster.length > 1 && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeRosterItem(item.id)}
                              className="h-6 w-6 p-0 hover:bg-destructive/20 text-destructive"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Resources Summary Section */}
                <div>
                  <Label className="text-sm text-foreground mb-3 block">Resources Summary</Label>
                  
                  <div className="bg-accent rounded-lg p-8 flex items-center justify-center">
                    <span className="text-accent-foreground text-base font-medium">
                      Placeholder for embedded resources module
                    </span>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2.5 text-xs border-border text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      console.log('Saving ICS-201 data:', ics201Data);
                    }}
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Save
                  </Button>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Open Actions Tracker - Hidden during Incident Briefing */}
      {currentPhaseId !== 'incident-briefing' && (
        <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ListTodo className="w-5 h-5 text-accent" />
                Open Actions Tracker ({actions.length})
              </CardTitle>
              <CardDescription>
                Track action items and follow-ups from the meeting
              </CardDescription>
            </div>
            <Button 
              onClick={() => setShowAddActionModal(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Action
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {actions.length > 0 ? (
            actions.map((action) => (
              <div key={action.id} className="border border-border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-card-foreground mb-1">{action.taskName}</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      POC: {action.pointOfContact} • POC Briefed: {action.pocBriefed}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">Start Date</Label>
                        <Input
                          type="date"
                          value={action.startDate}
                          onChange={(e) => handleUpdateAction(action.id, 'startDate', e.target.value)}
                          className="mt-1 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">Deadline</Label>
                        <Input
                          type="date"
                          value={action.deadline}
                          onChange={(e) => handleUpdateAction(action.id, 'deadline', e.target.value)}
                          className="mt-1 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">Status</Label>
                        <Select 
                          value={action.status} 
                          onValueChange={(value) => handleUpdateAction(action.id, 'status', value)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Not Started">Not Started</SelectItem>
                            <SelectItem value="In Progress">In Progress</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                            <SelectItem value="Cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteAction(action.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 ml-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <ListTodo className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No action items tracked</p>
            </div>
          )}
        </CardContent>
        </Card>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6">
        <div>
          {onPrevious && (
            <Button
              onClick={onPrevious}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous Phase
            </Button>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {onComplete && (
            <Button
              onClick={onComplete}
              disabled={!allItemsCompleted}
              className="flex items-center gap-2"
            >
              Complete Phase
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Meeting Creation Modal */}
      {showScheduleModal && (
        <CreateMeetingModal
          isOpen={showScheduleModal}
          onClose={() => setShowScheduleModal(false)}
          onCreateMeeting={handleCreateMeeting}
        />
      )}

      {/* Add Action Modal */}
      <Dialog open={showAddActionModal} onOpenChange={setShowAddActionModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Action Item</DialogTitle>
            <DialogDescription>
              Create a new action item to track
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="task-name">Task Name</Label>
              <Input
                id="task-name"
                value={newAction.taskName || ''}
                onChange={(e) => setNewAction(prev => ({ ...prev, taskName: e.target.value }))}
                placeholder="Enter task name..."
              />
            </div>
            <div>
              <Label htmlFor="point-of-contact">Point of Contact</Label>
              <Input
                id="point-of-contact"
                value={newAction.pointOfContact || ''}
                onChange={(e) => setNewAction(prev => ({ ...prev, pointOfContact: e.target.value }))}
                placeholder="Enter point of contact..."
              />
            </div>
            <div className="flex items-center space-x-4">
              <Label>POC Briefed:</Label>
              <Select 
                value={newAction.pocBriefed} 
                onValueChange={(value: 'Yes' | 'No') => setNewAction(prev => ({ ...prev, pocBriefed: value }))}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Yes">Yes</SelectItem>
                  <SelectItem value="No">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={newAction.startDate || ''}
                  onChange={(e) => setNewAction(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={newAction.deadline || ''}
                  onChange={(e) => setNewAction(prev => ({ ...prev, deadline: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label>Status</Label>
              <Select 
                value={newAction.status} 
                onValueChange={(value) => setNewAction(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Not Started">Not Started</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowAddActionModal(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddAction}>
                Add Action
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Objective Modal */}
      <Dialog open={showAddObjectiveModal} onOpenChange={setShowAddObjectiveModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Objective</DialogTitle>
            <DialogDescription>
              Create a new objective for work analysis
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="objective-name">Objective Name</Label>
              <Input
                id="objective-name"
                value={newObjective.name}
                onChange={(e) => setNewObjective(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter objective name..."
              />
            </div>
            <div>
              <Label htmlFor="objective-description">Description</Label>
              <Textarea
                id="objective-description"
                value={newObjective.description}
                onChange={(e) => setNewObjective(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter objective description..."
                className="min-h-20"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowAddObjectiveModal(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddObjective}>
                Add Objective
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Strategy Modal */}
      <Dialog open={showAddStrategyModal} onOpenChange={setShowAddStrategyModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Strategy</DialogTitle>
            <DialogDescription>
              Create a new strategy for the selected objective
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="strategy-name">Strategy Name</Label>
              <Input
                id="strategy-name"
                value={newStrategy.name}
                onChange={(e) => setNewStrategy(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter strategy name..."
              />
            </div>
            <div>
              <Label htmlFor="strategy-description">Description</Label>
              <Textarea
                id="strategy-description"
                value={newStrategy.description}
                onChange={(e) => setNewStrategy(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter strategy description..."
                className="min-h-20"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowAddStrategyModal(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddStrategy}>
                Add Strategy
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Tactic Modal */}
      <Dialog open={showAddTacticModal} onOpenChange={setShowAddTacticModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Tactic</DialogTitle>
            <DialogDescription>
              Create a new tactic for the selected strategy
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="tactic-name">Tactic Name</Label>
              <Input
                id="tactic-name"
                value={newTactic.name}
                onChange={(e) => setNewTactic(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter tactic name..."
              />
            </div>
            <div>
              <Label htmlFor="tactic-description">Description</Label>
              <Textarea
                id="tactic-description"
                value={newTactic.description}
                onChange={(e) => setNewTactic(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter tactic description..."
                className="min-h-20"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="assigned-to">Assigned To</Label>
                <Input
                  id="assigned-to"
                  value={newTactic.assignedTo}
                  onChange={(e) => setNewTactic(prev => ({ ...prev, assignedTo: e.target.value }))}
                  placeholder="Enter assignment..."
                />
              </div>
              <div>
                <Label>Priority</Label>
                <Select 
                  value={newTactic.priority} 
                  onValueChange={(value: 'High' | 'Medium' | 'Low') => setNewTactic(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowAddTacticModal(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddTactic}>
                Add Tactic
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Work Assignment Modal */}
      <Dialog open={showAddWorkAssignmentModal} onOpenChange={setShowAddWorkAssignmentModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Work Assignment</DialogTitle>
            <DialogDescription>
              Create a new work assignment with resources
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="assignment-name">Assignment Name</Label>
                <Input
                  id="assignment-name"
                  value={newWorkAssignment.name}
                  onChange={(e) => setNewWorkAssignment(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter assignment name..."
                />
              </div>
              <div>
                <Label htmlFor="division-group">Division/Group/Location</Label>
                <Input
                  id="division-group"
                  value={newWorkAssignment.divisionGroupLocation}
                  onChange={(e) => setNewWorkAssignment(prev => ({ ...prev, divisionGroupLocation: e.target.value }))}
                  placeholder="Enter division, group, or location..."
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="overhead-positions">Overhead Positions</Label>
                <Input
                  id="overhead-positions"
                  value={newWorkAssignment.overheadPositions}
                  onChange={(e) => setNewWorkAssignment(prev => ({ ...prev, overheadPositions: e.target.value }))}
                  placeholder="List overhead positions..."
                />
              </div>
              <div>
                <Label htmlFor="special-equipment">Special Equipment/Supplies</Label>
                <Input
                  id="special-equipment"
                  value={newWorkAssignment.specialEquipmentSupplies}
                  onChange={(e) => setNewWorkAssignment(prev => ({ ...prev, specialEquipmentSupplies: e.target.value }))}
                  placeholder="List special equipment..."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="reporting-location">Reporting Location</Label>
                <Input
                  id="reporting-location"
                  value={newWorkAssignment.reportingLocation}
                  onChange={(e) => setNewWorkAssignment(prev => ({ ...prev, reportingLocation: e.target.value }))}
                  placeholder="Specify reporting location..."
                />
              </div>
              <div>
                <Label htmlFor="arrival-time">Requested Arrival Time</Label>
                <Input
                  id="arrival-time"
                  value={newWorkAssignment.requestedArrivalTime}
                  onChange={(e) => setNewWorkAssignment(prev => ({ ...prev, requestedArrivalTime: e.target.value }))}
                  placeholder="HH:MM"
                />
              </div>
            </div>

            {/* Resources Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="font-medium">Resources</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddResourceToModal}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Resource
                </Button>
              </div>

              <div className="space-y-3 mb-4">
                <div className="grid grid-cols-4 gap-2">
                  <Input
                    value={newResource.name}
                    onChange={(e) => setNewResource(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Resource name..."
                  />
                  <Input
                    type="number"
                    value={newResource.quantityRequired}
                    onChange={(e) => setNewResource(prev => ({ ...prev, quantityRequired: parseInt(e.target.value) || 0 }))}
                    placeholder="Required"
                  />
                  <Input
                    type="number"
                    value={newResource.quantityHad}
                    onChange={(e) => setNewResource(prev => ({ ...prev, quantityHad: parseInt(e.target.value) || 0 }))}
                    placeholder="Have"
                  />
                  <Input
                    type="number"
                    value={newResource.quantityNeeded}
                    onChange={(e) => setNewResource(prev => ({ ...prev, quantityNeeded: parseInt(e.target.value) || 0 }))}
                    placeholder="Need"
                  />
                </div>
              </div>

              {newWorkAssignment.resources.length > 0 && (
                <div className="border border-border rounded-lg p-3 space-y-2 max-h-32 overflow-y-auto">
                  {newWorkAssignment.resources.map((resource) => (
                    <div key={resource.id} className="flex items-center justify-between text-sm">
                      <span>{resource.name} - Req: {resource.quantityRequired}, Have: {resource.quantityHad}, Need: {resource.quantityNeeded}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveResourceFromModal(resource.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddWorkAssignmentModal(false);
                  setNewWorkAssignment({
                    name: '',
                    divisionGroupLocation: '',
                    resources: [],
                    overheadPositions: '',
                    specialEquipmentSupplies: '',
                    reportingLocation: '',
                    requestedArrivalTime: ''
                  });
                  setNewResource({
                    name: '',
                    quantityRequired: 0,
                    quantityHad: 0,
                    quantityNeeded: 0
                  });
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleAddWorkAssignment}>
                Add Work Assignment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Hazard Modal */}
      <Dialog open={showAddHazardModal} onOpenChange={setShowAddHazardModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Hazard</DialogTitle>
            <DialogDescription>
              Identify a new hazard and its mitigation measures
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="hazard-name">Hazard Name</Label>
              <Input
                id="hazard-name"
                value={newHazard.name}
                onChange={(e) => setNewHazard(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter hazard name..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="incident-area">Incident Area</Label>
                <Input
                  id="incident-area"
                  value={newHazard.incidentArea}
                  onChange={(e) => setNewHazard(prev => ({ ...prev, incidentArea: e.target.value }))}
                  placeholder="Specify incident area..."
                />
              </div>
              <div>
                <Label>GAR Score (1-10)</Label>
                <Select 
                  value={newHazard.garScore.toString()} 
                  onValueChange={(value) => setNewHazard(prev => ({ ...prev, garScore: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1,2,3,4,5,6,7,8,9,10].map((score) => (
                      <SelectItem key={score} value={score.toString()}>{score}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="mitigations">Mitigations</Label>
              <Textarea
                id="mitigations"
                value={newHazard.mitigations}
                onChange={(e) => setNewHazard(prev => ({ ...prev, mitigations: e.target.value }))}
                placeholder="Describe mitigation measures..."
                className="min-h-20"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowAddHazardModal(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddHazard}>
                Add Hazard
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}