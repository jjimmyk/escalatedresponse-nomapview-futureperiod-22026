import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Progress } from '../ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { ArrowRight, ArrowLeft, Target, ChevronDown, Trash2, FileText, AlertTriangle, Shield, FileCheck, Download, Plus, Maximize, Minimize, Users, Calendar, ClipboardList, ListTodo, X, Search, Filter, ArrowUpDown, ArrowUp, ArrowDown, Edit2, Save, XCircle, CheckCircle, Package } from 'lucide-react';
import React, { useState, Fragment, useRef } from 'react';
import ButtonXs from '../../imports/ButtonXs';
import ButtonXsAddAction from '../../imports/ButtonXs-70001-434';
import ButtonAddMaterial from '../../imports/ButtonAddMaterial';
import organizationRosterImage from 'figma:asset/0e46008b6891c0e8504a61d06f5884916585b5a3.png';
import resourcesSummaryImage from 'figma:asset/dea0249fada64b45617982ce53c115a57ff195b2.png';




interface ThreatAlert {
  id: string;
  threatType: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  location: string;
  timeDetected: string;
  status: 'Active' | 'Monitoring' | 'Resolved';
  assignedTo: string;
  createdAt: Date;
}

interface WorkAssignment {
  id: string;
  assignmentName: string;
  assignedTo: string;
  status: 'Assigned' | 'In Progress' | 'Complete';
  priority: 'Low' | 'Medium' | 'High';
  resources: string;
  location: string;
}

interface Tactic {
  id: string;
  tacticName: string;
  description: string;
  workAssignments: WorkAssignment[];
  createdAt: Date;
}

interface ICUCObjectivesPhaseProps {
  data?: Record<string, any>;
  onDataChange?: (data: Record<string, any>) => void;
  onComplete?: () => void;
  onPrevious?: () => void;
  operationalPeriodNumber?: number;
  onOpenCalendar?: () => void;
}

export function ICUCObjectivesPhase({ data = {}, onDataChange, onComplete, onPrevious, operationalPeriodNumber = 0, onOpenCalendar }: ICUCObjectivesPhaseProps) {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(data.checkedItems || {});
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(data.expandedItems || {});
  const [notes, setNotes] = useState<Record<string, string>>(data.notes || {});

  const [expandedThreats, setExpandedThreats] = useState<Record<string, boolean>>(data.expandedThreats || {});
  const [expandedTactics, setExpandedTactics] = useState<Record<string, boolean>>(data.expandedTactics || {});
  const [expandedDeliverables, setExpandedDeliverables] = useState<Record<string, boolean>>(data.expandedDeliverables || {});

  


  // Deliverables state
  const [deliverables, setDeliverables] = useState<Record<string, boolean>>(data.deliverables || {});
  
  // Fullscreen state
  const [fullscreenCard, setFullscreenCard] = useState<string | null>(null);
  
  // ICS 201 Form State
  const [ics201Data, setIcs201Data] = useState({
    mapSketch: data.ics201Data?.mapSketch || '',
    currentSituation: data.ics201Data?.currentSituation || '',
    responseObjectives: data.ics201Data?.responseObjectives || [],
    organizationMembers: data.ics201Data?.organizationMembers || [],
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

  // Current Situation Edit State
  const [isEditingCurrentSituation, setIsEditingCurrentSituation] = useState(false);
  const [currentSituationDraft, setCurrentSituationDraft] = useState(ics201Data.currentSituation);
  
  // ICS-201 Review Status State
  const [ics201ReviewStatus, setIcs201ReviewStatus] = useState<'draft' | 'ready-for-review'>(data.ics201ReviewStatus || 'draft');
  
  // Selected ICS Form State
  const [selectedIcsForm, setSelectedIcsForm] = useState<'ics-202' | 'ics-233' | 'ics-209'>('ics-202');
  
  // Preview ICS-201 Modal State
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  
  // Expanded ICS-201 Modal State
  const [isExpandedModalOpen, setIsExpandedModalOpen] = useState(false);
  
  // Complete Phase Modal State
  const [showCompletePhaseModal, setShowCompletePhaseModal] = useState(false);

  // Objective and Action Edit State
  const [editingObjectiveId, setEditingObjectiveId] = useState<string | null>(null);
  const [editingActionId, setEditingActionId] = useState<string | null>(null);
  const [objectiveDraft, setObjectiveDraft] = useState('');
  const [actionDraft, setActionDraft] = useState({
    action: '',
    status: '',
    time: ''
  });
  
  // Objective Expand/Collapse State
  const [expandedObjectives, setExpandedObjectives] = useState<Record<string, boolean>>({});
  
  // Objective Sort State
  const [objectiveSortOrder, setObjectiveSortOrder] = useState<'asc' | 'desc' | null>(null);
  
  // Action Sort State (per objective)
  const [actionSortOrders, setActionSortOrders] = useState<Record<string, 'asc' | 'desc' | null>>({});
  const [actionStatusSortOrders, setActionStatusSortOrders] = useState<Record<string, 'asc' | 'desc' | null>>({});
  const [actionTimeSortOrders, setActionTimeSortOrders] = useState<Record<string, 'asc' | 'desc' | null>>({});

  // Organization Roster State
  const [expandedMembers, setExpandedMembers] = useState<Record<string, boolean>>({});
  const [memberSortOrder, setMemberSortOrder] = useState<'asc' | 'desc' | null>(null);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [memberDraft, setMemberDraft] = useState({
    memberId: '',
    position: '',
    activationStatus: '',
    checkInStatus: '',
    activationTime: '',
    approvalAuthority: '',
    // Profile details
    name: '',
    contactNumber: '',
    email: '',
    certifications: '',
    notes: ''
  });

  // Safety Fields Edit State
  const [editingSafetyOfficer, setEditingSafetyOfficer] = useState(false);
  const [safetyOfficerDraft, setSafetyOfficerDraft] = useState('');
  const [editingTemperature, setEditingTemperature] = useState(false);
  const [temperatureDraft, setTemperatureDraft] = useState('');
  const [editingConditions, setEditingConditions] = useState(false);
  const [conditionsDraft, setConditionsDraft] = useState('');
  const [editingWind, setEditingWind] = useState(false);
  const [windDraft, setWindDraft] = useState('');
  const [editingTides, setEditingTides] = useState(false);
  const [tidesDraft, setTidesDraft] = useState('');
  const [editingSeaState, setEditingSeaState] = useState(false);
  const [seaStateDraft, setSeaStateDraft] = useState('');
  const [editingWaterTemperature, setEditingWaterTemperature] = useState(false);
  const [waterTemperatureDraft, setWaterTemperatureDraft] = useState('');
  const [editingForecast, setEditingForecast] = useState(false);
  const [forecastDraft, setForecastDraft] = useState('');
  const [editingSafetyNotes, setEditingSafetyNotes] = useState(false);
  const [safetyNotesDraft, setSafetyNotesDraft] = useState('');
  const [editingPPENotes, setEditingPPENotes] = useState(false);
  const [ppeNotesDraft, setPPENotesDraft] = useState('');

  // Material Row Edit State
  const [editingMaterialId, setEditingMaterialId] = useState<string | null>(null);
  const [materialDraft, setMaterialDraft] = useState({
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
  });

  // Agenda State
  const [agendaPanelOpen, setAgendaPanelOpen] = useState(false);
  const [agendaItems, setAgendaItems] = useState({
    currentSituation: false,
    initialResponseObjectives: false,
    incidentRoster: false,
    resourceManagement: false,
    safetyAnalysis: false
  });

  // Agenda Notes State
  const [agendaNotes, setAgendaNotes] = useState({
    currentSituation: '',
    initialResponseObjectives: '',
    incidentRoster: '',
    resourceManagement: '',
    safetyAnalysis: ''
  });

  // Agenda Notes Edit State
  const [editingAgendaNote, setEditingAgendaNote] = useState<string | null>(null);
  const [agendaNoteDraft, setAgendaNoteDraft] = useState('');
  
  // Agenda Notes Visibility State
  const [expandedAgendaNotes, setExpandedAgendaNotes] = useState<Record<string, boolean>>({});
  
  // Agenda Notes Validation State
  const [agendaNoteValidationError, setAgendaNoteValidationError] = useState(false);

  // Scroll and Highlight State
  const initialResponseObjectivesRef = useRef<HTMLDivElement>(null);
  const initialResponseObjectivesAgendaRef = useRef<HTMLDivElement>(null);
  const [highlightObjectives, setHighlightObjectives] = useState(false);
  const [highlightObjectivesAgenda, setHighlightObjectivesAgenda] = useState(false);
  const currentSituationRef = useRef<HTMLDivElement>(null);
  const [highlightCurrentSituation, setHighlightCurrentSituation] = useState(false);
  const [highlightCurrentSituationAgenda, setHighlightCurrentSituationAgenda] = useState(false);
  const incidentRosterRef = useRef<HTMLButtonElement>(null);
  const incidentRosterAgendaRef = useRef<HTMLDivElement>(null);
  const [highlightIncidentRoster, setHighlightIncidentRoster] = useState(false);
  const [highlightIncidentRosterAgenda, setHighlightIncidentRosterAgenda] = useState(false);
  const ics201ScrollContainerRef = useRef<HTMLDivElement>(null);
  const currentSituationAgendaRef = useRef<HTMLDivElement>(null);

  // Connector line state
  const [showConnector, setShowConnector] = useState(false);
  const [connectorCoords, setConnectorCoords] = useState({ x1: 0, y1: 0, x2: 0, y2: 0 });

  // Meeting Dialog State
  const [meetingDialogOpen, setMeetingDialogOpen] = useState(false);
  const [meetingInfoDialogOpen, setMeetingInfoDialogOpen] = useState(false);
  
  // Meeting Data State
  const [meetingData, setMeetingData] = useState<{
    title: string;
    dateTime: string;
    location: string;
    attendees: string;
    link: string;
  } | null>(data.meetingData || null);
  
  // Meeting Form Draft State
  const [meetingFormData, setMeetingFormData] = useState({
    title: '',
    dateTime: '',
    location: '',
    attendees: '',
    link: ''
  });

  // Calculate agenda progress
  const agendaProgress = React.useMemo(() => {
    // PSC agenda items
    const pscItems = ['currentSituation', 'initialResponseObjectives', 'incidentRoster'];
    const pscCompleted = pscItems.filter(item => agendaItems[item]).length;
    const pscTotal = pscItems.length;
    
    // IC/UC agenda items
    const icucItems = ['resourceManagement', 'safetyAnalysis'];
    const icucCompleted = icucItems.filter(item => agendaItems[item]).length;
    const icucTotal = icucItems.length;
    
    // Overall progress
    const totalItems = pscTotal + icucTotal;
    const completedItems = pscCompleted + icucCompleted;
    const percentage = Math.round((completedItems / totalItems) * 100);
    
    return { 
      completedItems, 
      totalItems, 
      percentage,
      psc: { completed: pscCompleted, total: pscTotal, percentage: Math.round((pscCompleted / pscTotal) * 100) },
      icuc: { completed: icucCompleted, total: icucTotal, percentage: Math.round((icucCompleted / icucTotal) * 100) }
    };
  }, [agendaItems]);
  
  // Sample threat alerts data for World Cup 2026
  const threats: ThreatAlert[] = data.threats || [
    {
      id: '1',
      threatType: 'High-Risk Drones Approaching TFR',
      description: 'Multiple unauthorized drones detected entering Temporary Flight Restriction zone - immediate response required',
      severity: 'Critical',
      location: 'AT&T Stadium - 2 miles north',
      timeDetected: '14:23',
      status: 'Active',
      assignedTo: 'Airspace Security Unit',
      createdAt: new Date()
    }
  ];

  // Sample tactics data for World Cup 2026
  const tactics: Tactic[] = data.tactics || [
    {
      id: '1',
      tacticName: 'Perimeter Security Operations',
      description: 'Maintain secure perimeter around stadium and surrounding areas',
      workAssignments: [
        {
          id: '1',
          assignmentName: 'Stadium North Gate Security',
          assignedTo: 'Security Team Alpha',
          status: 'In Progress',
          priority: 'High',
          resources: '12 Officers, K-9 Unit',
          location: 'AT&T Stadium - North Gate'
        },
        {
          id: '2',
          assignmentName: 'Parking Area Patrol',
          assignedTo: 'Mobile Patrol Unit B',
          status: 'Assigned',
          priority: 'Medium',
          resources: '6 Officers, 3 Vehicles',
          location: 'Lots A-C'
        }
      ],
      createdAt: new Date()
    }
  ];



  // Deliverables checklist with enhanced data
  const deliverablesItems = [
    {
      id: 'draft-ics-202',
      text: 'ICS-201',
      description: 'Initial Response & Assessment',
      icon: FileText,
      color: 'text-accent'
    },
    {
      id: 'uc-division-labor',
      text: 'UC Division of Labor', 
      description: 'Unified Command workload distribution and responsibilities',
      icon: Users,
      color: 'text-blue-500'
    },
    {
      id: 'daily-meeting-schedule',
      text: 'ICS 230',
      description: 'Meeting and briefing schedule',
      icon: Calendar,
      color: 'text-green-500'
    },
    {
      id: 'updated-ics-233',
      text: 'ICS 233',
      description: 'Work Unit Analysis and assignment tracking',
      icon: FileText,
      color: 'text-orange-500'
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

  const handleDeliverableExpand = (deliverableId: string) => {
    const newExpandedDeliverables = { ...expandedDeliverables, [deliverableId]: !expandedDeliverables[deliverableId] };
    setExpandedDeliverables(newExpandedDeliverables);
    updateData({ expandedDeliverables: newExpandedDeliverables });
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
        expandedThreats,
        expandedTactics,
        expandedDeliverables,
        deliverables,
        ics201Data,
        globalSearch,
        actionTableStates,
        ...updates 
      });
    }
  };

  const handleDeliverableChange = (deliverableId: string, checked: boolean) => {
    const newDeliverables = { ...deliverables, [deliverableId]: checked };
    setDeliverables(newDeliverables);
    updateData({ deliverables: newDeliverables });
  };

  const handleIcs201Change = (field: string, value: string | any[]) => {
    const newIcs201Data = { ...ics201Data, [field]: value };
    setIcs201Data(newIcs201Data);
    updateData({ ics201Data: newIcs201Data });
  };

  // Current Situation Edit Handlers
  const handleEditCurrentSituation = () => {
    setCurrentSituationDraft(ics201Data.currentSituation);
    setIsEditingCurrentSituation(true);
  };

  const handleSaveCurrentSituation = () => {
    handleIcs201Change('currentSituation', currentSituationDraft);
    setIsEditingCurrentSituation(false);
  };

  const handleCancelCurrentSituation = () => {
    setCurrentSituationDraft(ics201Data.currentSituation);
    setIsEditingCurrentSituation(false);
  };

  // Objective Edit Handlers
  const handleEditObjective = (objectiveId: string, currentValue: string) => {
    setObjectiveDraft(currentValue);
    setEditingObjectiveId(objectiveId);
  };

  const handleSaveObjective = () => {
    if (editingObjectiveId) {
      handleObjectiveChange(editingObjectiveId, 'objective', objectiveDraft);
      setEditingObjectiveId(null);
      setObjectiveDraft('');
    }
  };

  const handleCancelObjective = () => {
    setEditingObjectiveId(null);
    setObjectiveDraft('');
  };

  // Action Edit Handlers
  const handleEditAction = (objectiveId: string, actionId: string, action: any) => {
    setActionDraft({
      action: action.action || '',
      status: action.status || 'Current',
      time: action.time || ''
    });
    setEditingActionId(actionId);
  };

  const handleSaveAction = (objectiveId: string) => {
    if (editingActionId) {
      // Save all three values
      handleActionChange(objectiveId, editingActionId, 'action', actionDraft.action);
      handleActionChange(objectiveId, editingActionId, 'status', actionDraft.status);
      handleActionChange(objectiveId, editingActionId, 'time', actionDraft.time);
      setEditingActionId(null);
      setActionDraft({ action: '', status: '', time: '' });
    }
  };

  const handleCancelAction = () => {
    setEditingActionId(null);
    setActionDraft({ action: '', status: '', time: '' });
  };

  // Safety Officer Edit Handlers
  const handleEditSafetyOfficer = () => {
    setSafetyOfficerDraft(ics201Data.safetyAnalysis.safetyOfficer);
    setEditingSafetyOfficer(true);
  };

  const handleSaveSafetyOfficer = () => {
    handleSafetyChange('safetyOfficer', safetyOfficerDraft);
    setEditingSafetyOfficer(false);
  };

  const handleCancelSafetyOfficer = () => {
    setSafetyOfficerDraft(ics201Data.safetyAnalysis.safetyOfficer);
    setEditingSafetyOfficer(false);
  };

  // Temperature Edit Handlers
  const handleEditTemperature = () => {
    setTemperatureDraft(ics201Data.safetyAnalysis.weatherConditions.temperature);
    setEditingTemperature(true);
  };

  const handleSaveTemperature = () => {
    handleWeatherChange('temperature', temperatureDraft);
    setEditingTemperature(false);
  };

  const handleCancelTemperature = () => {
    setTemperatureDraft(ics201Data.safetyAnalysis.weatherConditions.temperature);
    setEditingTemperature(false);
  };

  // Conditions Edit Handlers
  const handleEditConditions = () => {
    setConditionsDraft(ics201Data.safetyAnalysis.weatherConditions.conditions);
    setEditingConditions(true);
  };

  const handleSaveConditions = () => {
    handleWeatherChange('conditions', conditionsDraft);
    setEditingConditions(false);
  };

  const handleCancelConditions = () => {
    setConditionsDraft(ics201Data.safetyAnalysis.weatherConditions.conditions);
    setEditingConditions(false);
  };

  // Wind Edit Handlers
  const handleEditWind = () => {
    setWindDraft(ics201Data.safetyAnalysis.weatherConditions.wind);
    setEditingWind(true);
  };

  const handleSaveWind = () => {
    handleWeatherChange('wind', windDraft);
    setEditingWind(false);
  };

  const handleCancelWind = () => {
    setWindDraft(ics201Data.safetyAnalysis.weatherConditions.wind);
    setEditingWind(false);
  };

  // Tides Edit Handlers
  const handleEditTides = () => {
    setTidesDraft(ics201Data.safetyAnalysis.weatherConditions.tides);
    setEditingTides(true);
  };

  const handleSaveTides = () => {
    handleWeatherChange('tides', tidesDraft);
    setEditingTides(false);
  };

  const handleCancelTides = () => {
    setTidesDraft(ics201Data.safetyAnalysis.weatherConditions.tides);
    setEditingTides(false);
  };

  // Sea State Edit Handlers
  const handleEditSeaState = () => {
    setSeaStateDraft(ics201Data.safetyAnalysis.weatherConditions.seaState);
    setEditingSeaState(true);
  };

  const handleSaveSeaState = () => {
    handleWeatherChange('seaState', seaStateDraft);
    setEditingSeaState(false);
  };

  const handleCancelSeaState = () => {
    setSeaStateDraft(ics201Data.safetyAnalysis.weatherConditions.seaState);
    setEditingSeaState(false);
  };

  // Water Temperature Edit Handlers
  const handleEditWaterTemperature = () => {
    setWaterTemperatureDraft(ics201Data.safetyAnalysis.weatherConditions.waterTemperature);
    setEditingWaterTemperature(true);
  };

  const handleSaveWaterTemperature = () => {
    handleWeatherChange('waterTemperature', waterTemperatureDraft);
    setEditingWaterTemperature(false);
  };

  const handleCancelWaterTemperature = () => {
    setWaterTemperatureDraft(ics201Data.safetyAnalysis.weatherConditions.waterTemperature);
    setEditingWaterTemperature(false);
  };

  // Forecast Edit Handlers
  const handleEditForecast = () => {
    setForecastDraft(ics201Data.safetyAnalysis.weatherConditions.forecast);
    setEditingForecast(true);
  };

  const handleSaveForecast = () => {
    handleWeatherChange('forecast', forecastDraft);
    setEditingForecast(false);
  };

  const handleCancelForecast = () => {
    setForecastDraft(ics201Data.safetyAnalysis.weatherConditions.forecast);
    setEditingForecast(false);
  };

  // Safety Notes Edit Handlers
  const handleEditSafetyNotes = () => {
    setSafetyNotesDraft(ics201Data.safetyAnalysis.weatherConditions.safetyNotes);
    setEditingSafetyNotes(true);
  };

  const handleSaveSafetyNotes = () => {
    handleWeatherChange('safetyNotes', safetyNotesDraft);
    setEditingSafetyNotes(false);
  };

  const handleCancelSafetyNotes = () => {
    setSafetyNotesDraft(ics201Data.safetyAnalysis.weatherConditions.safetyNotes);
    setEditingSafetyNotes(false);
  };

  // PPE Notes Edit Handlers
  const handleEditPPENotes = () => {
    setPPENotesDraft(ics201Data.safetyAnalysis.ppeRequirements.ppeNotes);
    setEditingPPENotes(true);
  };

  const handleSavePPENotes = () => {
    handlePPEChange('ppeNotes', ppeNotesDraft);
    setEditingPPENotes(false);
  };

  const handleCancelPPENotes = () => {
    setPPENotesDraft(ics201Data.safetyAnalysis.ppeRequirements.ppeNotes);
    setEditingPPENotes(false);
  };

  // Material Row Edit Handlers
  const handleEditMaterial = (materialId: string) => {
    const material = ics201Data.safetyAnalysis.hazmatAssessment.materialDescriptions.find(m => m.id === materialId);
    if (material) {
      setMaterialDraft({
        material: material.material,
        quantity: material.quantity,
        physicalState: material.physicalState,
        nioshNumber: material.nioshNumber,
        specificGravity: material.specificGravity,
        ph: material.ph,
        idlh: material.idlh,
        flashPoint: material.flashPoint,
        lel: material.lel,
        uel: material.uel
      });
      setEditingMaterialId(materialId);
    }
  };

  const handleSaveMaterial = () => {
    if (editingMaterialId) {
      // Update all fields for the material
      Object.keys(materialDraft).forEach(field => {
        handleMaterialChange(editingMaterialId, field, materialDraft[field as keyof typeof materialDraft]);
      });
      setEditingMaterialId(null);
      setMaterialDraft({
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
      });
    }
  };

  const handleCancelMaterial = () => {
    setEditingMaterialId(null);
    setMaterialDraft({
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
    });
  };

  // Agenda Handlers
  const handleAgendaItemChange = (item: keyof typeof agendaItems, checked: boolean) => {
    setAgendaItems(prev => ({
      ...prev,
      [item]: checked
    }));
    
    // If clicking on Initial Response Objectives, scroll and highlight
    if (item === 'initialResponseObjectives' && checked) {
      scrollToInitialResponseObjectives();
    }
  };

  // Scroll and Highlight Handler
  const scrollToInitialResponseObjectives = () => {
    // Clear other highlights - only 1 agenda item highlighted at a time
    setHighlightCurrentSituationAgenda(false);
    setHighlightCurrentSituation(false);
    setHighlightIncidentRosterAgenda(false);
    setHighlightIncidentRoster(false);
    setShowConnector(false);
    
    // Apply permanent highlight to agenda item
    setHighlightObjectivesAgenda(true);
    
    // Check if ICS-201 is not expanded, expand it first
    if (!expandedDeliverables['draft-ics-202']) {
      const newExpandedDeliverables = { ...expandedDeliverables, 'draft-ics-202': true };
      setExpandedDeliverables(newExpandedDeliverables);
      updateData({ expandedDeliverables: newExpandedDeliverables });
      
      // Wait for expansion animation to complete before scrolling
      setTimeout(() => {
        if (initialResponseObjectivesRef.current && ics201ScrollContainerRef.current && initialResponseObjectivesAgendaRef.current) {
          const container = ics201ScrollContainerRef.current;
          const ics201Element = initialResponseObjectivesRef.current;
          const agendaElement = initialResponseObjectivesAgendaRef.current;
          
          // Get positions relative to viewport
          const agendaRect = agendaElement.getBoundingClientRect();
          const ics201Rect = ics201Element.getBoundingClientRect();
          
          // Calculate how much to scroll to align the ICS-201 element with the agenda element
          // We want ics201Element.top to equal agendaElement.top
          const scrollAdjustment = ics201Rect.top - agendaRect.top;
          const scrollTop = container.scrollTop + scrollAdjustment;
          
          container.scrollTo({
            top: scrollTop,
            behavior: 'smooth'
          });
          
          // Apply permanent highlight
          setHighlightObjectives(true);
        }
      }, 300); // Wait for expansion animation
    } else {
      // Already expanded, just scroll and highlight
      if (initialResponseObjectivesRef.current && ics201ScrollContainerRef.current && initialResponseObjectivesAgendaRef.current) {
        const container = ics201ScrollContainerRef.current;
        const ics201Element = initialResponseObjectivesRef.current;
        const agendaElement = initialResponseObjectivesAgendaRef.current;
        
        // Get positions relative to viewport
        const agendaRect = agendaElement.getBoundingClientRect();
        const ics201Rect = ics201Element.getBoundingClientRect();
        
        // Calculate how much to scroll to align the ICS-201 element with the agenda element
        // We want ics201Element.top to equal agendaElement.top
        const scrollAdjustment = ics201Rect.top - agendaRect.top;
        const scrollTop = container.scrollTop + scrollAdjustment;
        
        container.scrollTo({
          top: scrollTop,
          behavior: 'smooth'
        });
        
        // Apply permanent highlight
        setHighlightObjectives(true);
      }
    }
  };

  const scrollToCurrentSituation = () => {
    // Clear other highlights - only 1 agenda item highlighted at a time
    setHighlightObjectivesAgenda(false);
    setHighlightObjectives(false);
    setHighlightIncidentRosterAgenda(false);
    setHighlightIncidentRoster(false);
    
    // Apply permanent highlight to agenda item
    setHighlightCurrentSituationAgenda(true);
    
    // Check if ICS-201 is not expanded, expand it first
    if (!expandedDeliverables['draft-ics-202']) {
      const newExpandedDeliverables = { ...expandedDeliverables, 'draft-ics-202': true };
      setExpandedDeliverables(newExpandedDeliverables);
      updateData({ expandedDeliverables: newExpandedDeliverables });
      
      // Wait for expansion animation to complete before scrolling
      setTimeout(() => {
        if (currentSituationRef.current && ics201ScrollContainerRef.current) {
          const container = ics201ScrollContainerRef.current;
          const element = currentSituationRef.current;
          const containerRect = container.getBoundingClientRect();
          const elementRect = element.getBoundingClientRect();
          const scrollTop = container.scrollTop + elementRect.top - containerRect.top - (containerRect.height / 2) + (elementRect.height / 2);
          
          container.scrollTo({
            top: scrollTop,
            behavior: 'smooth'
          });
          
          // Apply permanent highlight
          setHighlightCurrentSituation(true);
          
          // Calculate and show connector line
          setTimeout(() => {
            if (currentSituationAgendaRef.current && currentSituationRef.current) {
              const agendaRect = currentSituationAgendaRef.current.getBoundingClientRect();
              const ics201Rect = currentSituationRef.current.getBoundingClientRect();
              
              setConnectorCoords({
                x1: agendaRect.right,
                y1: agendaRect.top + agendaRect.height / 2,
                x2: ics201Rect.left,
                y2: ics201Rect.top + ics201Rect.height / 2
              });
              setShowConnector(true);
            }
          }, 400);
        }
      }, 300); // Wait for expansion animation
    } else {
      // Already expanded, just scroll and highlight
      if (currentSituationRef.current && ics201ScrollContainerRef.current) {
        const container = ics201ScrollContainerRef.current;
        const element = currentSituationRef.current;
        const containerRect = container.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        const scrollTop = container.scrollTop + elementRect.top - containerRect.top - (containerRect.height / 2) + (elementRect.height / 2);
        
        container.scrollTo({
          top: scrollTop,
          behavior: 'smooth'
        });
        
        // Apply permanent highlight
        setHighlightCurrentSituation(true);
        
        // Calculate and show connector line
        setTimeout(() => {
          if (currentSituationAgendaRef.current && currentSituationRef.current) {
            const agendaRect = currentSituationAgendaRef.current.getBoundingClientRect();
            const ics201Rect = currentSituationRef.current.getBoundingClientRect();
            
            setConnectorCoords({
              x1: agendaRect.right,
              y1: agendaRect.top + agendaRect.height / 2,
              x2: ics201Rect.left,
              y2: ics201Rect.top + ics201Rect.height / 2
            });
            setShowConnector(true);
          }
        }, 400);
      }
    }
  };

  const scrollToIncidentRoster = () => {
    // Clear other highlights - only 1 agenda item highlighted at a time
    setHighlightObjectivesAgenda(false);
    setHighlightObjectives(false);
    setHighlightCurrentSituationAgenda(false);
    setHighlightCurrentSituation(false);
    setShowConnector(false);
    
    // Apply permanent highlight to agenda item
    setHighlightIncidentRosterAgenda(true);
    
    if (incidentRosterRef.current && ics201ScrollContainerRef.current && incidentRosterAgendaRef.current) {
      const container = ics201ScrollContainerRef.current;
      const ics201Element = incidentRosterRef.current;
      const agendaElement = incidentRosterAgendaRef.current;
      
      // Get positions relative to viewport
      const agendaRect = agendaElement.getBoundingClientRect();
      const ics201Rect = ics201Element.getBoundingClientRect();
      
      // Calculate how much to scroll to align the ICS-201 element with the agenda element
      // We want ics201Element.top to equal agendaElement.top
      const scrollAdjustment = ics201Rect.top - agendaRect.top;
      const scrollTop = container.scrollTop + scrollAdjustment;
      
      container.scrollTo({
        top: scrollTop,
        behavior: 'smooth'
      });
      
      // Apply permanent highlight
      setHighlightIncidentRoster(true);
    }
  };

  // Agenda Notes Expand/Collapse Handler
  const toggleAgendaNote = (item: keyof typeof agendaNotes) => {
    setExpandedAgendaNotes(prev => ({
      ...prev,
      [item]: !prev[item]
    }));
  };

  // Agenda Notes Edit Handlers
  const handleEditAgendaNote = (item: keyof typeof agendaNotes) => {
    setAgendaNoteDraft(agendaNotes[item]);
    setEditingAgendaNote(item);
    setAgendaNoteValidationError(false);
  };

  const handleAgendaNoteChange = (value: string) => {
    setAgendaNoteDraft(value);
    // Validate: show error if length is between 1-3 characters
    setAgendaNoteValidationError(value.length >= 1 && value.length <= 3);
  };

  const handleSaveAgendaNote = () => {
    if (editingAgendaNote) {
      setAgendaNotes(prev => ({
        ...prev,
        [editingAgendaNote]: agendaNoteDraft
      }));
      setEditingAgendaNote(null);
      setAgendaNoteDraft('');
      setAgendaNoteValidationError(false);
    }
  };

  const handleCancelAgendaNote = () => {
    setEditingAgendaNote(null);
    setAgendaNoteDraft('');
    setAgendaNoteValidationError(false);
  };

  const handleObjectiveChange = (objectiveId: string, field: 'objective' | 'time', value: string) => {
    const newObjectives = ics201Data.responseObjectives.map(obj =>
      obj.id === objectiveId ? { ...obj, [field]: value } : obj
    );
    handleIcs201Change('responseObjectives', newObjectives);
  };

  const toggleObjectiveExpansion = (objectiveId: string) => {
    setExpandedObjectives(prev => ({
      ...prev,
      [objectiveId]: !prev[objectiveId]
    }));
  };

  const toggleObjectiveSort = () => {
    if (objectiveSortOrder === null) {
      setObjectiveSortOrder('asc');
    } else if (objectiveSortOrder === 'asc') {
      setObjectiveSortOrder('desc');
    } else {
      setObjectiveSortOrder(null);
    }
  };

  const toggleActionSort = (objectiveId: string) => {
    setActionSortOrders(prev => {
      const currentSort = prev[objectiveId] || null;
      if (currentSort === null) {
        return { ...prev, [objectiveId]: 'asc' };
      } else if (currentSort === 'asc') {
        return { ...prev, [objectiveId]: 'desc' };
      } else {
        return { ...prev, [objectiveId]: null };
      }
    });
  };

  const toggleActionStatusSort = (objectiveId: string) => {
    setActionStatusSortOrders(prev => {
      const currentSort = prev[objectiveId] || null;
      if (currentSort === null) {
        return { ...prev, [objectiveId]: 'asc' };
      } else if (currentSort === 'asc') {
        return { ...prev, [objectiveId]: 'desc' };
      } else {
        return { ...prev, [objectiveId]: null };
      }
    });
  };

  const toggleActionTimeSort = (objectiveId: string) => {
    setActionTimeSortOrders(prev => {
      const currentSort = prev[objectiveId] || null;
      if (currentSort === null) {
        return { ...prev, [objectiveId]: 'asc' };
      } else if (currentSort === 'asc') {
        return { ...prev, [objectiveId]: 'desc' };
      } else {
        return { ...prev, [objectiveId]: null };
      }
    });
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
    const newObjectiveId = Date.now().toString();
    const newObjective = {
      id: newObjectiveId,
      objective: '',
      time: '',
      actions: [
        { id: Date.now().toString() + '-1', action: '', status: 'Current', time: '' }
      ]
    };
    handleIcs201Change('responseObjectives', [...ics201Data.responseObjectives, newObjective]);
    
    // Immediately enter edit mode for the new objective
    setEditingObjectiveId(newObjectiveId);
    setObjectiveDraft('');
  };

  const removeObjective = (objectiveId: string) => {
    const newObjectives = ics201Data.responseObjectives.filter(obj => obj.id !== objectiveId);
    handleIcs201Change('responseObjectives', newObjectives);
    
    // If we're deleting the objective that's currently being edited, clear the edit state
    if (editingObjectiveId === objectiveId) {
      setEditingObjectiveId(null);
      setObjectiveDraft('');
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
            actions: obj.actions.filter(action => action.id !== actionId)
          }
        : obj
    );
    handleIcs201Change('responseObjectives', newObjectives);
    
    // If we're deleting the action that's currently being edited, clear the edit state
    if (editingActionId === actionId) {
      setEditingActionId(null);
      setActionDraft({ action: '', status: '', time: '' });
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

    // Apply table sorting
    filteredActions.sort((a, b) => {
      let aValue = a[tableState.sortBy] || '';
      let bValue = b[tableState.sortBy] || '';
      
      if (tableState.sortBy === 'time') {
        // Handle time sorting - treat empty as earliest
        if (!aValue && !bValue) return 0;
        if (!aValue) return tableState.sortOrder === 'asc' ? -1 : 1;
        if (!bValue) return tableState.sortOrder === 'asc' ? 1 : -1;
      }
      
      const comparison = aValue.toString().localeCompare(bValue.toString(), undefined, { numeric: true });
      return tableState.sortOrder === 'asc' ? comparison : -comparison;
    });

    // Apply alphabetical sort from header control
    const actionSortOrder = actionSortOrders[objectiveId];
    if (actionSortOrder) {
      filteredActions.sort((a, b) => {
        const comparison = a.action.localeCompare(b.action);
        return actionSortOrder === 'asc' ? comparison : -comparison;
      });
    }

    // Apply status sort from header control
    const actionStatusSortOrder = actionStatusSortOrders[objectiveId];
    if (actionStatusSortOrder) {
      filteredActions.sort((a, b) => {
        const comparison = a.status.localeCompare(b.status);
        return actionStatusSortOrder === 'asc' ? comparison : -comparison;
      });
    }

    // Apply time sort from header control
    const actionTimeSortOrder = actionTimeSortOrders[objectiveId];
    if (actionTimeSortOrder) {
      filteredActions.sort((a, b) => {
        const aValue = a.time || '';
        const bValue = b.time || '';
        
        // Handle empty times - treat as earliest
        if (!aValue && !bValue) return 0;
        if (!aValue) return actionTimeSortOrder === 'asc' ? -1 : 1;
        if (!bValue) return actionTimeSortOrder === 'asc' ? 1 : -1;
        
        const comparison = aValue.localeCompare(bValue, undefined, { numeric: true });
        return actionTimeSortOrder === 'asc' ? comparison : -comparison;
      });
    }

    return filteredActions;
  };

  // Global search filter and sort for objectives
  const getFilteredObjectives = () => {
    let filtered = [...ics201Data.responseObjectives];
    
    // Apply search filter
    if (globalSearch && globalSearch.trim()) {
      filtered = filtered.filter(objective => {
        // Search in objective text
        const objectiveMatch = objective.objective.toLowerCase().includes(globalSearch.toLowerCase());
        
        // Search in actions
        const actionMatch = objective.actions.some(action =>
          action.action.toLowerCase().includes(globalSearch.toLowerCase()) ||
          action.time.toLowerCase().includes(globalSearch.toLowerCase())
        );
        
        return objectiveMatch || actionMatch;
      });
    }
    
    // Apply sort
    if (objectiveSortOrder === 'asc') {
      filtered.sort((a, b) => a.objective.localeCompare(b.objective));
    } else if (objectiveSortOrder === 'desc') {
      filtered.sort((a, b) => b.objective.localeCompare(a.objective));
    }
    
    return filtered;
  };

  // Organization Member Handlers
  const toggleMemberExpansion = (memberId: string) => {
    setExpandedMembers(prev => ({ ...prev, [memberId]: !prev[memberId] }));
  };

  const toggleMemberSort = () => {
    if (memberSortOrder === null) {
      setMemberSortOrder('asc');
    } else if (memberSortOrder === 'asc') {
      setMemberSortOrder('desc');
    } else {
      setMemberSortOrder(null);
    }
  };

  const getFilteredMembers = () => {
    let filtered = [...ics201Data.organizationMembers];
    
    // Apply sort
    if (memberSortOrder === 'asc') {
      filtered.sort((a, b) => a.memberId.localeCompare(b.memberId));
    } else if (memberSortOrder === 'desc') {
      filtered.sort((a, b) => b.memberId.localeCompare(a.memberId));
    }
    
    return filtered;
  };

  const addMember = () => {
    const newMemberId = Date.now().toString();
    const newMember = {
      id: newMemberId,
      memberId: '',
      position: '',
      activationStatus: 'Active',
      checkInStatus: 'Checked In',
      activationTime: '',
      approvalAuthority: '',
      profile: {
        name: '',
        contactNumber: '',
        email: '',
        certifications: '',
        notes: ''
      }
    };
    handleIcs201Change('organizationMembers', [...ics201Data.organizationMembers, newMember]);
    
    // Immediately enter edit mode for the new member
    setEditingMemberId(newMemberId);
    setMemberDraft({
      memberId: '',
      position: '',
      activationStatus: 'Active',
      checkInStatus: 'Checked In',
      activationTime: '',
      approvalAuthority: '',
      name: '',
      contactNumber: '',
      email: '',
      certifications: '',
      notes: ''
    });
  };

  const removeMember = (memberId: string) => {
    const newMembers = ics201Data.organizationMembers.filter(m => m.id !== memberId);
    handleIcs201Change('organizationMembers', newMembers);
    
    if (editingMemberId === memberId) {
      setEditingMemberId(null);
      setMemberDraft({
        memberId: '',
        position: '',
        activationStatus: '',
        checkInStatus: '',
        activationTime: '',
        approvalAuthority: '',
        name: '',
        contactNumber: '',
        email: '',
        certifications: '',
        notes: ''
      });
    }
  };

  const handleEditMember = (memberId: string, member: any) => {
    setMemberDraft({
      memberId: member.memberId,
      position: member.position,
      activationStatus: member.activationStatus,
      checkInStatus: member.checkInStatus,
      activationTime: member.activationTime,
      approvalAuthority: member.approvalAuthority,
      name: member.profile.name,
      contactNumber: member.profile.contactNumber,
      email: member.profile.email,
      certifications: member.profile.certifications,
      notes: member.profile.notes
    });
    setEditingMemberId(memberId);
  };

  const handleSaveMember = () => {
    if (editingMemberId) {
      const newMembers = ics201Data.organizationMembers.map(m =>
        m.id === editingMemberId
          ? {
              ...m,
              memberId: memberDraft.memberId,
              position: memberDraft.position,
              activationStatus: memberDraft.activationStatus,
              checkInStatus: memberDraft.checkInStatus,
              activationTime: memberDraft.activationTime,
              approvalAuthority: memberDraft.approvalAuthority,
              profile: {
                name: memberDraft.name,
                contactNumber: memberDraft.contactNumber,
                email: memberDraft.email,
                certifications: memberDraft.certifications,
                notes: memberDraft.notes
              }
            }
          : m
      );
      handleIcs201Change('organizationMembers', newMembers);
      setEditingMemberId(null);
      setMemberDraft({
        memberId: '',
        position: '',
        activationStatus: '',
        checkInStatus: '',
        activationTime: '',
        approvalAuthority: '',
        name: '',
        contactNumber: '',
        email: '',
        certifications: '',
        notes: ''
      });
    }
  };

  const handleCancelMember = () => {
    setEditingMemberId(null);
    setMemberDraft({
      memberId: '',
      position: '',
      activationStatus: '',
      checkInStatus: '',
      activationTime: '',
      approvalAuthority: '',
      name: '',
      contactNumber: '',
      email: '',
      certifications: '',
      notes: ''
    });
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

  const handleSafetyChange = (field: 'safetyOfficer' | 'physicalHazards' | 'environmentalHazards' | 'otherHazards', value: string | string[]) => {
    const newSafetyAnalysis = { ...ics201Data.safetyAnalysis, [field]: value };
    handleIcs201Change('safetyAnalysis', newSafetyAnalysis);
  };

  const handleWeatherChange = (field: 'temperature' | 'conditions' | 'wind' | 'tides' | 'seaState' | 'waterTemperature' | 'forecast' | 'safetyNotes', value: string) => {
    const newWeatherConditions = { ...ics201Data.safetyAnalysis.weatherConditions, [field]: value };
    const newSafetyAnalysis = { ...ics201Data.safetyAnalysis, weatherConditions: newWeatherConditions };
    handleIcs201Change('safetyAnalysis', newSafetyAnalysis);
  };

  const handlePPEChange = (field: 'requiredPPE' | 'ppeNotes' | 'isHazmat', value: string[] | string | boolean) => {
    const newPPERequirements = { ...ics201Data.safetyAnalysis.ppeRequirements, [field]: value };
    const newSafetyAnalysis = { ...ics201Data.safetyAnalysis, ppeRequirements: newPPERequirements };
    handleIcs201Change('safetyAnalysis', newSafetyAnalysis);
  };

  // Predefined PPE options
  const ppeOptions = [
    'Hard Hat/Helmet',
    'Safety Glasses/Goggles',
    'Face Shield',
    'Hearing Protection',
    'High-Visibility Vest',
    'Work Gloves',
    'Chemical Resistant Gloves',
    'Steel Toe Boots',
    'Chemical Resistant Boots',
    'Respirator/N95',
    'SCBA (Self-Contained Breathing Apparatus)',
    'Chemical Suit (Level A)',
    'Chemical Suit (Level B)',
    'Chemical Suit (Level C)',
    'Chemical Suit (Level D)',
    'Life Jacket/PFD',
    'Fall Protection Harness',
    'Cut Resistant Clothing',
    'Flame Resistant Clothing',
    'Disposable Coveralls'
  ];

  // Predefined HAZMAT classification options
  const hazmatClassifications = [
    'Class 1 - Explosives',
    'Class 2 - Gases',
    'Class 3 - Flammable Liquids',
    'Class 4 - Flammable Solids',
    'Class 5 - Oxidizing Substances',
    'Class 6 - Toxic & Infectious Substances',
    'Class 7 - Radioactive Materials',
    'Class 8 - Corrosive Substances',
    'Class 9 - Miscellaneous Dangerous Goods',
    'Marine Pollutant',
    'ORM-D (Other Regulated Materials)',
    'Elevated Temperature Materials'
  ];

  // Predefined protection level options
  const protectionLevelOptions = [
    'The atmosphere contains no known hazards and work conditions preclude splashes, immersion, or potential for unexpected inhalation contact with hazardous levels of any chemicals or pollutants.',
    'Concentrations or types of airborne substances are known and the criteria for using air purifying respirators are met.',
    'Highest level of respiratory protection is needed, but lesser level of skin protection is needed.',
    'Greatest level of skin, respiratory, and eye protection is needed. (Level A)'
  ];

  const handleHazmatChange = (field: 'hazmatClassification' | 'protectionLevels' | 'materialDescriptions', value: string[] | any[]) => {
    const newHazmatAssessment = { ...ics201Data.safetyAnalysis.hazmatAssessment, [field]: value };
    const newSafetyAnalysis = { ...ics201Data.safetyAnalysis, hazmatAssessment: newHazmatAssessment };
    handleIcs201Change('safetyAnalysis', newSafetyAnalysis);
  };

  const handleMaterialChange = (id: string, field: string, value: string) => {
    const newMaterialDescriptions = ics201Data.safetyAnalysis.hazmatAssessment.materialDescriptions.map(material =>
      material.id === id ? { ...material, [field]: value } : material
    );
    handleHazmatChange('materialDescriptions', newMaterialDescriptions);
  };

  const addMaterialRow = () => {
    const newMaterial = {
      id: Date.now().toString(),
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
    };
    handleHazmatChange('materialDescriptions', [...ics201Data.safetyAnalysis.hazmatAssessment.materialDescriptions, newMaterial]);
  };

  const removeMaterialRow = (id: string) => {
    const newMaterialDescriptions = ics201Data.safetyAnalysis.hazmatAssessment.materialDescriptions.filter(material => material.id !== id);
    handleHazmatChange('materialDescriptions', newMaterialDescriptions);
  };

  // Predefined hazard options
  const physicalHazardOptions = [
    'Fall Risk',
    'Electrical Hazards',
    'Heavy Equipment',
    'Traffic',
    'Sharp Objects',
    'Confined Spaces',
    'Heights',
    'Moving Machinery',
    'Unstable Structures',
    'Debris'
  ];

  const environmentalHazardOptions = [
    'Weather Conditions',
    'Extreme Temperatures',
    'High Winds',
    'Lightning',
    'Poor Visibility',
    'Flooding',
    'Ice/Snow',
    'Air Quality',
    'UV Exposure',
    'Noise Levels'
  ];

  const otherHazardOptions = [
    'Chemical Exposure',
    'Biological Contamination',
    'Radiation',
    'Crowd Control',
    'Security Threats',
    'Fatigue',
    'Stress',
    'Communication Issues',
    'Resource Shortages',
    'Public Safety'
  ];





  const handleThreatToggle = (threatId: string) => {
    const newExpandedThreats = { ...expandedThreats, [threatId]: !expandedThreats[threatId] };
    setExpandedThreats(newExpandedThreats);
    updateData({ expandedThreats: newExpandedThreats });
  };

  const handleTacticToggle = (tacticId: string) => {
    const newExpandedTactics = { ...expandedTactics, [tacticId]: !expandedTactics[tacticId] };
    setExpandedTactics(newExpandedTactics);
    updateData({ expandedTactics: newExpandedTactics });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return 'bg-red-500 text-white';
      case 'High':
        return 'bg-orange-500 text-white';
      case 'Medium':
        return 'bg-yellow-500 text-black';
      case 'Low':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-destructive text-destructive-foreground';
      case 'Monitoring':
        return 'bg-yellow-600 text-white';
      case 'Resolved':
        return 'bg-green-600 text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getWorkAssignmentStatusColor = (status: string) => {
    switch (status) {
      case 'Assigned':
        return 'bg-blue-600 text-white';
      case 'In Progress':
        return 'bg-yellow-600 text-white';
      case 'Complete':
        return 'bg-green-600 text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-500 text-white';
      case 'Medium':
        return 'bg-yellow-500 text-black';
      case 'Low':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  // Component for list management
  const ListManager = ({ 
    title, 
    field, 
    placeholder, 
    items 
  }: { 
    title: string; 
    field: string; 
    placeholder: string; 
    items: string[] 
  }) => {
    const [newItem, setNewItem] = useState('');
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editingValue, setEditingValue] = useState('');

    const handleAdd = () => {
      if (newItem.trim()) {
        handleAddListItem(field, newItem);
        setNewItem('');
      }
    };

    const handleEdit = (index: number) => {
      setEditingIndex(index);
      setEditingValue(items[index]);
    };

    const handleSaveEdit = () => {
      if (editingIndex !== null) {
        handleEditListItem(field, editingIndex, editingValue);
        setEditingIndex(null);
        setEditingValue('');
      }
    };

    const handleCancelEdit = () => {
      setEditingIndex(null);
      setEditingValue('');
    };

    return (
      <div>
        <Label className="text-sm text-foreground">{title}</Label>
        <div className="space-y-2 mt-1">
          {/* Existing items list */}
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-2 p-2 bg-muted/20 rounded-lg border border-border/50">
              {editingIndex === index ? (
                <>
                  <Input
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    className="flex-1 bg-input-background border-border text-foreground"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit();
                      if (e.key === 'Escape') handleCancelEdit();
                    }}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSaveEdit}
                    className="px-2 h-8"
                  >
                    <FileCheck className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancelEdit}
                    className="px-2 h-8"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm text-foreground">{item}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(index)}
                    className="px-2 h-8 hover:bg-muted/30"
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveListItem(field, index)}
                    className="px-2 h-8 hover:bg-destructive/20 text-destructive"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </>
              )}
            </div>
          ))}
          
          {/* Add new item */}
          <div className="flex items-center gap-2">
            <Input
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder={placeholder}
              className="flex-1 bg-input-background border-border text-foreground placeholder:text-muted-foreground"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd();
              }}
            />
            <Button
              size="sm"
              onClick={handleAdd}
              className="bg-accent hover:bg-accent/90 text-accent-foreground px-3"
              disabled={!newItem.trim()}
            >
              <Plus className="w-3 h-3 mr-1" />
              Add
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderDeliverableContent = (deliverable: any) => {
    switch (deliverable.id) {
      case 'draft-ics-202':
        return (
          <div className="space-y-3 p-3 bg-card rounded-lg">
            <div className="space-y-8">
              {/* ICS-201 Review Status Dropdown */}
              <div className="flex items-center gap-2">
                <Select value={ics201ReviewStatus} onValueChange={(value: 'draft' | 'ready-for-review') => setIcs201ReviewStatus(value)}>
                  <SelectTrigger className="w-[200px] h-7 px-2.5 text-xs border-white text-white hover:text-white hover:bg-white/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="ready-for-review">Ready for Review</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Export Draft functionality would go here
                    console.log('Export Draft clicked');
                  }}
                  className="h-9 px-2.5 text-xs border-white text-white hover:text-white hover:bg-white/20"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Export Draft
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Export ICS-201 functionality would go here
                    console.log('Export ICS-201 clicked');
                  }}
                  className="h-9 px-2.5 text-xs border-white text-white hover:text-white hover:bg-white/20"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Approve & Export ICS-201
                </Button>
              </div>
              
              {/* Current Situation Section */}
              <div
                ref={currentSituationRef}
                className={`transition-all duration-500 relative rounded-lg ${
                  highlightCurrentSituation 
                    ? 'bg-accent/10 z-50' 
                    : ''
                }`}
                style={highlightCurrentSituation ? { outline: '4px solid hsl(var(--accent))', outlineOffset: '-8px', boxShadow: '0 0 0 8px hsl(var(--accent) / 0.2), inset 0 0 0 2px hsl(var(--accent))' } : {}}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-chart-3/10 text-chart-3 border border-chart-3/20 rounded-full text-xs">
                    <Users className="w-3 h-3" />
                    <span>PSC</span>
                  </div>
                  <Label className="text-foreground" style={{ fontSize: 'var(--text-base)' }}>Current Situation</Label>
                </div>
                
                {isEditingCurrentSituation ? (
                  <div className="space-y-3">
                    <Textarea
                      value={currentSituationDraft}
                      onChange={(e) => setCurrentSituationDraft(e.target.value)}
                      placeholder="Describe the current situation..."
                      className="bg-accent/10 border-accent text-foreground placeholder:text-muted-foreground min-h-[140px]"
                      rows={6}
                    />
                    <div className="flex items-center gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancelCurrentSituation}
                        className="flex items-center border-border text-muted-foreground hover:text-foreground"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSaveCurrentSituation}
                        className="flex items-center bg-accent hover:bg-accent/90 text-accent-foreground"
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="p-3 min-h-[140px] bg-muted/10 border border-border rounded-lg text-foreground cursor-pointer hover:bg-muted/20 transition-colors"
                    onClick={handleEditCurrentSituation}
                  >
                    {ics201Data.currentSituation}
                  </div>
                )}
              </div>

              {/* Initial Response Objectives Section */}
              <div
                ref={initialResponseObjectivesRef}
                className={`transition-all duration-500 relative rounded-lg ${
                  highlightObjectives 
                    ? 'bg-accent/10 z-50' 
                    : ''
                }`}
                style={highlightObjectives ? { outline: '4px solid hsl(var(--accent))', outlineOffset: '-8px', boxShadow: '0 0 0 8px hsl(var(--accent) / 0.2), inset 0 0 0 2px hsl(var(--accent))' } : {}}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-chart-3/10 text-chart-3 border border-chart-3/20 rounded-full text-xs">
                    <Users className="w-3 h-3" />
                    <span>PSC</span>
                  </div>
                  <Label className="text-foreground" style={{ fontSize: 'var(--text-base)' }}>Initial Response Objectives</Label>
                  <div onClick={addObjective} className="cursor-pointer scale-90">
                    <ButtonXs />
                  </div>
                  {ics201Data.responseObjectives.length > 0 && (
                    <div className="relative flex-1 max-w-64">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                      <Input
                        value={globalSearch}
                        onChange={(e) => {
                          setGlobalSearch(e.target.value);
                          updateData({ globalSearch: e.target.value });
                        }}
                        placeholder="Search objectives and actions..."
                        className="h-8 pl-7 pr-2 text-xs bg-input-background border-border text-foreground placeholder:text-muted-foreground w-96"
                      />
                    </div>
                  )}
                </div>
                
<div className="border border-border rounded-lg overflow-hidden">
                  <Table className="table-fixed">
                    <colgroup>
                      <col className="w-[40px]" />
                      <col />
                      <col className="w-[340px]" />
                    </colgroup>
                    <TableHeader>
                      <TableRow className="bg-muted/30 hover:bg-muted/30">
                        <TableHead className="text-foreground font-medium border-r border-border"></TableHead>
                        <TableHead className="text-foreground font-medium">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={toggleObjectiveSort}
                              className="h-6 w-6 p-0 hover:bg-muted/20"
                            >
                              {objectiveSortOrder === 'asc' ? (
                                <ArrowUp className="w-4 h-4 text-foreground" />
                              ) : objectiveSortOrder === 'desc' ? (
                                <ArrowDown className="w-4 h-4 text-foreground" />
                              ) : (
                                <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                              )}
                            </Button>
                            <span>Objectives</span>
                          </div>
                        </TableHead>
                        <TableHead className="text-foreground font-medium text-center"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ics201Data.responseObjectives.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-12 text-muted-foreground">
                            <div className="text-base">No Objectives Yet</div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        getFilteredObjectives().map((objective, objectiveIndex) => (
                          <Fragment key={objective.id}>
                            {/* Main Objective Row */}
                            <TableRow className="hover:bg-muted/5">
                              <TableCell className="border-r border-border p-2 align-top">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleObjectiveExpansion(objective.id)}
                                  className="h-6 w-6 p-0 hover:bg-muted/20 mt-2"
                                >
                                  {expandedObjectives[objective.id] ? (
                                    <ChevronDown className="w-4 h-4 text-foreground" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4 text-foreground rotate-[-90deg]" />
                                  )}
                                </Button>
                              </TableCell>
{editingObjectiveId === objective.id ? (
                                <TableCell colSpan={2} className="p-3 align-top">
                                  <div className="space-y-3">
                                    <Input
                                      value={objectiveDraft}
                                      onChange={(e) => setObjectiveDraft(e.target.value)}
                                      placeholder="Enter Objective..."
                                      className="bg-accent/10 border-accent text-foreground placeholder:text-muted-foreground"
                                    />
                                    <div className="flex items-center gap-2 justify-end">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleCancelObjective}
                                        className="flex items-center border-border text-muted-foreground hover:text-foreground text-xs h-6"
                                      >
                                        Cancel
                                      </Button>
                                      <Button
                                        size="sm"
                                        onClick={handleSaveObjective}
                                        className="flex items-center bg-accent hover:bg-accent/90 text-accent-foreground text-xs h-6"
                                      >
                                        Save
                                      </Button>
                                    </div>
                                  </div>
                                </TableCell>
                              ) : (
                                <TableCell colSpan={2} className="p-3 align-top">
                                  <div className="flex items-center gap-2">
                                    <div 
                                      className="flex-1 p-2 min-h-[32px] bg-muted/10 border border-border rounded text-foreground cursor-pointer hover:bg-muted/20 transition-colors flex items-center text-sm"
                                      onClick={() => handleEditObjective(objective.id, objective.objective)}
                                    >
                                      {objective.objective}
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => removeObjective(objective.id)}
                                      className="h-6 w-6 p-0 hover:bg-destructive/20 text-destructive flex-shrink-0"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </TableCell>
                              )}
                            </TableRow>

                            {/* Nested Actions Rows - Only show when expanded */}
                            {expandedObjectives[objective.id] && (
                              <>
                                {/* Add Action Header Row with Status and Time headers */}
                                <TableRow className="bg-muted/5 hover:bg-muted/5">
                                  <TableCell className="border-t border-border border-r border-border"></TableCell>
                                  <TableCell className="p-3 border-t border-border">
                                    <div className="flex items-center gap-2 pl-6">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => toggleActionSort(objective.id)}
                                        className="h-6 w-6 p-0 hover:bg-muted/20"
                                      >
                                        {actionSortOrders[objective.id] === 'asc' ? (
                                          <ArrowUp className="w-4 h-4 text-foreground" />
                                        ) : actionSortOrders[objective.id] === 'desc' ? (
                                          <ArrowDown className="w-4 h-4 text-foreground" />
                                        ) : (
                                          <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                                        )}
                                      </Button>
                                      <span className="text-foreground font-medium">Aligned Actions</span>
                                      <div onClick={() => addAction(objective.id)} className="cursor-pointer scale-90">
                                        <ButtonXsAddAction />
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="p-3 border-t border-border">
                                    <div className="flex items-center gap-4 justify-between">
                                      <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2 w-32">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => toggleActionStatusSort(objective.id)}
                                            className="h-6 w-6 p-0 hover:bg-muted/20"
                                          >
                                            {actionStatusSortOrders[objective.id] === 'asc' ? (
                                              <ArrowUp className="w-4 h-4 text-foreground" />
                                            ) : actionStatusSortOrders[objective.id] === 'desc' ? (
                                              <ArrowDown className="w-4 h-4 text-foreground" />
                                            ) : (
                                              <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                                            )}
                                          </Button>
                                          <span className="text-sm text-foreground font-medium">Status</span>
                                        </div>
                                        <div className="flex items-center gap-2 w-32">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => toggleActionTimeSort(objective.id)}
                                            className="h-6 w-6 p-0 hover:bg-muted/20"
                                          >
                                            {actionTimeSortOrders[objective.id] === 'asc' ? (
                                              <ArrowUp className="w-4 h-4 text-foreground" />
                                            ) : actionTimeSortOrders[objective.id] === 'desc' ? (
                                              <ArrowDown className="w-4 h-4 text-foreground" />
                                            ) : (
                                              <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                                            )}
                                          </Button>
                                          <span className="text-sm text-foreground font-medium">Time</span>
                                        </div>
                                      </div>
                                    </div>
                                  </TableCell>
                                </TableRow>
                                
                                {/* Action Rows */}
                                {getFilteredAndSortedActions(objective.id, objective.actions).map((action, actionIndex) => (
                                  <TableRow 
                                    key={action.id} 
                                    className="hover:bg-muted/10 bg-muted/5 cursor-pointer"
                                    onClick={(e) => {
                                      // Only trigger edit if not already editing and not clicking on delete button
                                      if (editingActionId !== action.id && !(e.target as HTMLElement).closest('button')) {
                                        handleEditAction(objective.id, action.id, action);
                                      }
                                    }}
                                  >
                                    {editingActionId === action.id ? (
                                      <>
                                        <TableCell className="border-r border-border p-2"></TableCell>
                                        <TableCell className="p-2 align-top">
                                          <div className="pl-6">
                                            <Input
                                              value={actionDraft.action}
                                              onChange={(e) => setActionDraft({...actionDraft, action: e.target.value})}
                                              placeholder="Enter Action..."
                                              className="bg-accent/10 border-accent text-foreground placeholder:text-muted-foreground"
                                            />
                                          </div>
                                        </TableCell>
                                        <TableCell className="p-2 align-top">
                                          <div className="space-y-3">
                                            <div className="flex items-start gap-4">
                                              <div className="w-32">
                                                <Select 
                                                  value={actionDraft.status} 
                                                  onValueChange={(value) => setActionDraft({...actionDraft, status: value})}
                                                >
                                                  <SelectTrigger className="bg-accent/10 border-accent text-foreground h-9">
                                                    <SelectValue />
                                                  </SelectTrigger>
                                                  <SelectContent>
                                                    <SelectItem value="Current">
                                                      <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 bg-accent rounded-full"></div>
                                                        <span>Current</span>
                                                      </div>
                                                    </SelectItem>
                                                    <SelectItem value="Planned">
                                                      <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                                                        <span>Planned</span>
                                                      </div>
                                                    </SelectItem>
                                                  </SelectContent>
                                                </Select>
                                              </div>
                                              <div className="w-32">
                                                <Input
                                                  value={actionDraft.time}
                                                  onChange={(e) => setActionDraft({...actionDraft, time: e.target.value})}
                                                  placeholder="Time"
                                                  className="bg-accent/10 border-accent text-foreground placeholder:text-muted-foreground"
                                                />
                                              </div>
                                            </div>
                                            <div className="flex items-center gap-2 justify-end">
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleCancelAction}
                                                className="flex items-center border-border text-muted-foreground hover:text-foreground text-xs h-6"
                                              >
                                                Cancel
                                              </Button>
                                              <Button
                                                size="sm"
                                                onClick={() => handleSaveAction(objective.id)}
                                                className="flex items-center bg-accent hover:bg-accent/90 text-accent-foreground text-xs h-6"
                                              >
                                                Save
                                              </Button>
                                            </div>
                                          </div>
                                        </TableCell>
                                      </>
                                    ) : (
                                      <>
                                        <TableCell className="border-r border-border p-2"></TableCell>
                                        <TableCell className="p-2">
                                          <div className="pl-6">
                                            <div 
                                              className="p-2 min-h-[28px] bg-muted/10 border border-border rounded text-foreground flex items-center text-xs"
                                            >
                                              {action.action}
                                            </div>
                                          </div>
                                        </TableCell>
                                        <TableCell className="p-2">
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                              <div className="flex items-center gap-2 w-32">
                                                <div className={`w-2 h-2 rounded-full ${action.status === 'Current' ? 'bg-accent' : 'bg-muted-foreground'}`}></div>
                                                <span className="text-xs">{action.status}</span>
                                              </div>
                                              <div className="w-32">
                                                <span className="text-xs">
                                                  {action.time || (
                                                    <span className="text-muted-foreground italic">No time set</span>
                                                  )}
                                                </span>
                                              </div>
                                            </div>
                                            <div className="flex justify-end pr-2">
                                              <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  removeAction(objective.id, action.id);
                                                }}
                                                className="h-6 w-6 p-0 hover:bg-destructive/20 text-destructive"
                                              >
                                                <Trash2 className="w-3 h-3" />
                                              </Button>
                                            </div>
                                          </div>
                                        </TableCell>
                                      </>
                                    )}
                                  </TableRow>
                                ))}
                                
                                {/* Empty State */}
                                {getFilteredAndSortedActions(objective.id, objective.actions).length === 0 && (
                                  <TableRow className="bg-muted/5 hover:bg-transparent">
                                    <TableCell colSpan={3} className="text-center py-4 text-xs text-muted-foreground">
                                      No actions yet for this objective
                                    </TableCell>
                                  </TableRow>
                                )}
                              </>
                            )}
                          </Fragment>
                        ))
                      )}
                      </TableBody>
                    </Table>
                  </div>
              </div>



              {/* Organization Roster Section */}
              <div className={`transition-all duration-500 relative rounded-lg ${highlightIncidentRoster ? 'bg-accent/10 z-50' : ''}`} style={highlightIncidentRoster ? { outline: '4px solid hsl(var(--accent))', outlineOffset: '-8px', boxShadow: '0 0 0 8px hsl(var(--accent) / 0.2), inset 0 0 0 2px hsl(var(--accent))' } : {}}>
                <Button
                  ref={incidentRosterRef}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 transition-all duration-500 border-border text-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-chart-3/10 text-chart-3 border border-chart-3/20 rounded-full text-xs">
                    <Users className="w-3 h-3" />
                    <span>PSC</span>
                  </div>
                  Incident Roster
                </Button>
              </div>

              {/* Resources Summary Section */}
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 transition-all duration-200 border-border text-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  <ClipboardList className="w-4 h-4" />
                  Resource Management
                </Button>
              </div>

              {/* Safety Analysis Section */}
              <div>
                <Label className="text-foreground mb-3 block" style={{ fontSize: 'var(--text-base)' }}>Safety Analysis</Label>
                
                <div className="space-y-4">
                  {/* Safety Officer */}
                  <div>
                    <Label className="text-xs text-foreground font-medium mb-2 block">Safety Officer</Label>
                    
                    {editingSafetyOfficer ? (
                      <div className="space-y-3">
                        <Input
                          value={safetyOfficerDraft}
                          onChange={(e) => setSafetyOfficerDraft(e.target.value)}
                          placeholder="Name of assigned Safety Officer..."
                          className="bg-accent/10 border-accent text-foreground placeholder:text-muted-foreground"
                        />
                        <div className="flex items-center gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCancelSafetyOfficer}
                            className="flex items-center border-border text-muted-foreground hover:text-foreground"
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleSaveSafetyOfficer}
                            className="flex items-center bg-accent hover:bg-accent/90 text-accent-foreground"
                          >
                            Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div 
                        className="p-3 min-h-[40px] bg-muted/10 border border-border rounded-lg text-foreground cursor-pointer hover:bg-muted/20 transition-colors flex items-center"
                        onClick={handleEditSafetyOfficer}
                      >
                        {ics201Data.safetyAnalysis.safetyOfficer}
                      </div>
                    )}
                  </div>

                  {/* Hazards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Physical Hazards */}
                    <div>
                      <Label className="text-xs text-foreground font-medium mb-2 block">Physical Hazards</Label>
                      <div className="space-y-2">
                        <Select>
                          <SelectTrigger className="bg-input-background border-border text-foreground">
                            <SelectValue placeholder="Select physical hazards..." />
                          </SelectTrigger>
                          <SelectContent>
                            {physicalHazardOptions.map((hazard) => (
                              <SelectItem
                                key={hazard}
                                value={hazard}
                                onClick={() => {
                                  if (!ics201Data.safetyAnalysis.physicalHazards.includes(hazard)) {
                                    handleSafetyChange('physicalHazards', [...ics201Data.safetyAnalysis.physicalHazards, hazard]);
                                  }
                                }}
                              >
                                {hazard}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {ics201Data.safetyAnalysis.physicalHazards.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {ics201Data.safetyAnalysis.physicalHazards.map((hazard) => (
                              <Badge
                                key={hazard}
                                variant="outline"
                                className="text-xs border-border text-foreground cursor-pointer hover:bg-destructive/20"
                                onClick={() => {
                                  const newHazards = ics201Data.safetyAnalysis.physicalHazards.filter(h => h !== hazard);
                                  handleSafetyChange('physicalHazards', newHazards);
                                }}
                              >
                                {hazard} ×
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Environmental Hazards */}
                    <div>
                      <Label className="text-xs text-foreground font-medium mb-2 block">Environmental Hazards</Label>
                      <div className="space-y-2">
                        <Select>
                          <SelectTrigger className="bg-input-background border-border text-foreground">
                            <SelectValue placeholder="Select environmental hazards..." />
                          </SelectTrigger>
                          <SelectContent>
                            {environmentalHazardOptions.map((hazard) => (
                              <SelectItem
                                key={hazard}
                                value={hazard}
                                onClick={() => {
                                  if (!ics201Data.safetyAnalysis.environmentalHazards.includes(hazard)) {
                                    handleSafetyChange('environmentalHazards', [...ics201Data.safetyAnalysis.environmentalHazards, hazard]);
                                  }
                                }}
                              >
                                {hazard}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {ics201Data.safetyAnalysis.environmentalHazards.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {ics201Data.safetyAnalysis.environmentalHazards.map((hazard) => (
                              <Badge
                                key={hazard}
                                variant="outline"
                                className="text-xs border-border text-foreground cursor-pointer hover:bg-destructive/20"
                                onClick={() => {
                                  const newHazards = ics201Data.safetyAnalysis.environmentalHazards.filter(h => h !== hazard);
                                  handleSafetyChange('environmentalHazards', newHazards);
                                }}
                              >
                                {hazard} ×
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Other Hazards */}
                    <div>
                      <Label className="text-xs text-foreground font-medium mb-2 block">Other Hazards</Label>
                      <div className="space-y-2">
                        <Select>
                          <SelectTrigger className="bg-input-background border-border text-foreground">
                            <SelectValue placeholder="Select other hazards..." />
                          </SelectTrigger>
                          <SelectContent>
                            {otherHazardOptions.map((hazard) => (
                              <SelectItem
                                key={hazard}
                                value={hazard}
                                onClick={() => {
                                  if (!ics201Data.safetyAnalysis.otherHazards.includes(hazard)) {
                                    handleSafetyChange('otherHazards', [...ics201Data.safetyAnalysis.otherHazards, hazard]);
                                  }
                                }}
                              >
                                {hazard}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {ics201Data.safetyAnalysis.otherHazards.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {ics201Data.safetyAnalysis.otherHazards.map((hazard) => (
                              <Badge
                                key={hazard}
                                variant="outline"
                                className="text-xs border-border text-foreground cursor-pointer hover:bg-destructive/20"
                                onClick={() => {
                                  const newHazards = ics201Data.safetyAnalysis.otherHazards.filter(h => h !== hazard);
                                  handleSafetyChange('otherHazards', newHazards);
                                }}
                              >
                                {hazard} ×
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Weather Conditions Section */}
                <div className="mt-6">
                  <Label className="text-foreground font-medium mb-4 block" style={{ fontSize: 'var(--text-base)' }}>Weather Conditions</Label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Temperature */}
                    <div>
                      <Label className="text-xs text-foreground font-medium mb-2 block">Temperature</Label>
                      
                      {editingTemperature ? (
                        <div className="space-y-3">
                          <Input
                            value={temperatureDraft}
                            onChange={(e) => setTemperatureDraft(e.target.value)}
                            placeholder="°F or °C"
                            className="bg-accent/10 border-accent text-foreground placeholder:text-muted-foreground"
                          />
                          <div className="flex items-center gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleCancelTemperature}
                              className="flex items-center border-border text-muted-foreground hover:text-foreground text-xs h-6"
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={handleSaveTemperature}
                              className="flex items-center bg-accent hover:bg-accent/90 text-accent-foreground text-xs h-6"
                            >
                              Save
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div 
                          className="p-2 min-h-[40px] bg-muted/10 border border-border rounded-lg text-foreground cursor-pointer hover:bg-muted/20 transition-colors flex items-center text-sm"
                          onClick={handleEditTemperature}
                        >
                          {ics201Data.safetyAnalysis.weatherConditions.temperature}
                        </div>
                      )}
                    </div>

                    {/* Conditions */}
                    <div>
                      <Label className="text-xs text-foreground font-medium mb-2 block">Conditions</Label>
                      
                      {editingConditions ? (
                        <div className="space-y-3">
                          <Input
                            value={conditionsDraft}
                            onChange={(e) => setConditionsDraft(e.target.value)}
                            placeholder="Clear, Cloudy, Rain..."
                            className="bg-accent/10 border-accent text-foreground placeholder:text-muted-foreground"
                          />
                          <div className="flex items-center gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleCancelConditions}
                              className="flex items-center border-border text-muted-foreground hover:text-foreground text-xs h-6"
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={handleSaveConditions}
                              className="flex items-center bg-accent hover:bg-accent/90 text-accent-foreground text-xs h-6"
                            >
                              Save
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div 
                          className="p-2 min-h-[40px] bg-muted/10 border border-border rounded-lg text-foreground cursor-pointer hover:bg-muted/20 transition-colors flex items-center text-sm"
                          onClick={handleEditConditions}
                        >
                          {ics201Data.safetyAnalysis.weatherConditions.conditions}
                        </div>
                      )}
                    </div>

                    {/* Wind */}
                    <div>
                      <Label className="text-xs text-foreground font-medium mb-2 block">Wind</Label>
                      
                      {editingWind ? (
                        <div className="space-y-3">
                          <Input
                            value={windDraft}
                            onChange={(e) => setWindDraft(e.target.value)}
                            placeholder="Speed & direction"
                            className="bg-accent/10 border-accent text-foreground placeholder:text-muted-foreground"
                          />
                          <div className="flex items-center gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleCancelWind}
                              className="flex items-center border-border text-muted-foreground hover:text-foreground text-xs h-6"
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={handleSaveWind}
                              className="flex items-center bg-accent hover:bg-accent/90 text-accent-foreground text-xs h-6"
                            >
                              Save
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div 
                          className="p-2 min-h-[40px] bg-muted/10 border border-border rounded-lg text-foreground cursor-pointer hover:bg-muted/20 transition-colors flex items-center text-sm"
                          onClick={handleEditWind}
                        >
                          {ics201Data.safetyAnalysis.weatherConditions.wind}
                        </div>
                      )}
                    </div>

                    {/* Tides */}
                    <div>
                      <Label className="text-xs text-foreground font-medium mb-2 block">Tides</Label>
                      
                      {editingTides ? (
                        <div className="space-y-3">
                          <Input
                            value={tidesDraft}
                            onChange={(e) => setTidesDraft(e.target.value)}
                            placeholder="High/Low, times"
                            className="bg-accent/10 border-accent text-foreground placeholder:text-muted-foreground"
                          />
                          <div className="flex items-center gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleCancelTides}
                              className="flex items-center border-border text-muted-foreground hover:text-foreground text-xs h-6"
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={handleSaveTides}
                              className="flex items-center bg-accent hover:bg-accent/90 text-accent-foreground text-xs h-6"
                            >
                              Save
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div 
                          className="p-2 min-h-[40px] bg-muted/10 border border-border rounded-lg text-foreground cursor-pointer hover:bg-muted/20 transition-colors flex items-center text-sm"
                          onClick={handleEditTides}
                        >
                          {ics201Data.safetyAnalysis.weatherConditions.tides}
                        </div>
                      )}
                    </div>

                    {/* Sea State */}
                    <div>
                      <Label className="text-xs text-foreground font-medium mb-2 block">Sea State</Label>
                      
                      {editingSeaState ? (
                        <div className="space-y-3">
                          <Input
                            value={seaStateDraft}
                            onChange={(e) => setSeaStateDraft(e.target.value)}
                            placeholder="Wave height, period"
                            className="bg-accent/10 border-accent text-foreground placeholder:text-muted-foreground"
                          />
                          <div className="flex items-center gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleCancelSeaState}
                              className="flex items-center border-border text-muted-foreground hover:text-foreground text-xs h-6"
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={handleSaveSeaState}
                              className="flex items-center bg-accent hover:bg-accent/90 text-accent-foreground text-xs h-6"
                            >
                              Save
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div 
                          className="p-2 min-h-[40px] bg-muted/10 border border-border rounded-lg text-foreground cursor-pointer hover:bg-muted/20 transition-colors flex items-center text-sm"
                          onClick={handleEditSeaState}
                        >
                          {ics201Data.safetyAnalysis.weatherConditions.seaState}
                        </div>
                      )}
                    </div>

                    {/* Water Temperature */}
                    <div>
                      <Label className="text-xs text-foreground font-medium mb-2 block">Water Temperature</Label>
                      
                      {editingWaterTemperature ? (
                        <div className="space-y-3">
                          <Input
                            value={waterTemperatureDraft}
                            onChange={(e) => setWaterTemperatureDraft(e.target.value)}
                            placeholder="°F or °C"
                            className="bg-accent/10 border-accent text-foreground placeholder:text-muted-foreground"
                          />
                          <div className="flex items-center gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleCancelWaterTemperature}
                              className="flex items-center border-border text-muted-foreground hover:text-foreground text-xs h-6"
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={handleSaveWaterTemperature}
                              className="flex items-center bg-accent hover:bg-accent/90 text-accent-foreground text-xs h-6"
                            >
                              Save
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div 
                          className="p-2 min-h-[40px] bg-muted/10 border border-border rounded-lg text-foreground cursor-pointer hover:bg-muted/20 transition-colors flex items-center text-sm"
                          onClick={handleEditWaterTemperature}
                        >
                          {ics201Data.safetyAnalysis.weatherConditions.waterTemperature}
                        </div>
                      )}
                    </div>

                    {/* Forecast */}
                    <div className="md:col-span-2">
                      <Label className="text-xs text-foreground font-medium mb-2 block">Forecast</Label>
                      
                      {editingForecast ? (
                        <div className="space-y-3">
                          <Input
                            value={forecastDraft}
                            onChange={(e) => setForecastDraft(e.target.value)}
                            placeholder="Expected changes in conditions..."
                            className="bg-accent/10 border-accent text-foreground placeholder:text-muted-foreground"
                          />
                          <div className="flex items-center gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleCancelForecast}
                              className="flex items-center border-border text-muted-foreground hover:text-foreground text-xs h-6"
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={handleSaveForecast}
                              className="flex items-center bg-accent hover:bg-accent/90 text-accent-foreground text-xs h-6"
                            >
                              Save
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div 
                          className="p-2 min-h-[40px] bg-muted/10 border border-border rounded-lg text-foreground cursor-pointer hover:bg-muted/20 transition-colors flex items-center text-sm"
                          onClick={handleEditForecast}
                        >
                          {ics201Data.safetyAnalysis.weatherConditions.forecast}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Safety Notes - Full Width */}
                  <div className="mt-4">
                    <Label className="text-xs text-foreground font-medium mb-2 block">Safety Notes</Label>
                    
                    {editingSafetyNotes ? (
                      <div className="space-y-3">
                        <Textarea
                          value={safetyNotesDraft}
                          onChange={(e) => setSafetyNotesDraft(e.target.value)}
                          placeholder="Weather-related safety considerations and recommendations..."
                          className="bg-accent/10 border-accent text-foreground placeholder:text-muted-foreground min-h-[80px]"
                        />
                        <div className="flex items-center gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCancelSafetyNotes}
                            className="flex items-center border-border text-muted-foreground hover:text-foreground"
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleSaveSafetyNotes}
                            className="flex items-center bg-accent hover:bg-accent/90 text-accent-foreground"
                          >
                            Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div 
                        className="p-3 min-h-[80px] bg-muted/10 border border-border rounded-lg text-foreground cursor-pointer hover:bg-muted/20 transition-colors flex items-start"
                        onClick={handleEditSafetyNotes}
                      >
                        {ics201Data.safetyAnalysis.weatherConditions.safetyNotes}
                      </div>
                    )}
                  </div>
                </div>

                {/* PPE Requirements Section */}
                <div className="mt-6">
                  <Label className="text-foreground font-medium mb-4 block" style={{ fontSize: 'var(--text-base)' }}>PPE Requirements</Label>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Required PPE & HAZMAT */}
                    <div className="space-y-4">
                      {/* Required PPE Multi-Select */}
                      <div>
                        <Label className="text-xs text-foreground font-medium mb-2 block">Required PPE</Label>
                        <div className="space-y-2">
                          <Select>
                            <SelectTrigger className="bg-input-background border-border text-foreground">
                              <SelectValue placeholder="Select required PPE..." />
                            </SelectTrigger>
                            <SelectContent>
                              {ppeOptions.map((ppe) => (
                                <SelectItem
                                  key={ppe}
                                  value={ppe}
                                  onClick={() => {
                                    if (!ics201Data.safetyAnalysis.ppeRequirements.requiredPPE.includes(ppe)) {
                                      handlePPEChange('requiredPPE', [...ics201Data.safetyAnalysis.ppeRequirements.requiredPPE, ppe]);
                                    }
                                  }}
                                >
                                  {ppe}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {ics201Data.safetyAnalysis.ppeRequirements.requiredPPE.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {ics201Data.safetyAnalysis.ppeRequirements.requiredPPE.map((ppe) => (
                                <Badge
                                  key={ppe}
                                  variant="outline"
                                  className="text-xs border-border text-foreground cursor-pointer hover:bg-destructive/20"
                                  onClick={() => {
                                    const newPPE = ics201Data.safetyAnalysis.ppeRequirements.requiredPPE.filter(p => p !== ppe);
                                    handlePPEChange('requiredPPE', newPPE);
                                  }}
                                >
                                  {ppe} ×
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* HAZMAT Checkbox */}
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="hazmat"
                          checked={ics201Data.safetyAnalysis.ppeRequirements.isHazmat}
                          onCheckedChange={(checked) => handlePPEChange('isHazmat', checked as boolean)}
                          className="border-border data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                        />
                        <Label 
                          htmlFor="hazmat" 
                          className="text-sm text-foreground font-medium cursor-pointer"
                        >
                          Incident involves HAZMAT
                        </Label>
                      </div>
                    </div>

                    {/* PPE Notes */}
                    <div>
                      <Label className="text-xs text-foreground font-medium mb-2 block">Notes on PPE</Label>
                      
                      {editingPPENotes ? (
                        <div className="space-y-3">
                          <Textarea
                            value={ppeNotesDraft}
                            onChange={(e) => setPPENotesDraft(e.target.value)}
                            placeholder="Additional PPE requirements, specifications, or considerations..."
                            className="bg-accent/10 border-accent text-foreground placeholder:text-muted-foreground min-h-[120px]"
                          />
                          <div className="flex items-center gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleCancelPPENotes}
                              className="flex items-center border-border text-muted-foreground hover:text-foreground"
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={handleSavePPENotes}
                              className="flex items-center bg-accent hover:bg-accent/90 text-accent-foreground"
                            >
                              Save
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div 
                          className="p-3 min-h-[120px] bg-muted/10 border border-border rounded-lg text-foreground cursor-pointer hover:bg-muted/20 transition-colors flex items-start"
                          onClick={handleEditPPENotes}
                        >
                          {ics201Data.safetyAnalysis.ppeRequirements.ppeNotes}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* HAZMAT Assessment Section - Conditional */}
                {ics201Data.safetyAnalysis.ppeRequirements.isHazmat && (
                  <div className="mt-6 pt-6 border-t border-border">
                    <Label className="text-sm text-foreground font-medium mb-4 block">HAZMAT Assessment</Label>
                    
                    <div className="space-y-6">
                      {/* HAZMAT Classification */}
                      <div>
                        <Label className="text-xs text-foreground font-medium mb-2 block">HAZMAT Classification</Label>
                        <div className="space-y-2">
                          <Select>
                            <SelectTrigger className="bg-input-background border-border text-foreground">
                              <SelectValue placeholder="Select HAZMAT classifications..." />
                            </SelectTrigger>
                            <SelectContent>
                              {hazmatClassifications.map((classification) => (
                                <SelectItem
                                  key={classification}
                                  value={classification}
                                  onClick={() => {
                                    if (!ics201Data.safetyAnalysis.hazmatAssessment.hazmatClassification.includes(classification)) {
                                      handleHazmatChange('hazmatClassification', [...ics201Data.safetyAnalysis.hazmatAssessment.hazmatClassification, classification]);
                                    }
                                  }}
                                >
                                  {classification}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {ics201Data.safetyAnalysis.hazmatAssessment.hazmatClassification.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {ics201Data.safetyAnalysis.hazmatAssessment.hazmatClassification.map((classification) => (
                                <Badge
                                  key={classification}
                                  variant="outline"
                                  className="text-xs border-border text-foreground cursor-pointer hover:bg-destructive/20"
                                  onClick={() => {
                                    const newClassifications = ics201Data.safetyAnalysis.hazmatAssessment.hazmatClassification.filter(c => c !== classification);
                                    handleHazmatChange('hazmatClassification', newClassifications);
                                  }}
                                >
                                  {classification} ×
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Protection Levels */}
                      <div>
                        <Label className="text-xs text-foreground font-medium mb-2 block">Protection Levels</Label>
                        <div className="space-y-2">
                          <Select>
                            <SelectTrigger className="bg-input-background border-border text-foreground">
                              <SelectValue placeholder="Select protection levels..." />
                            </SelectTrigger>
                            <SelectContent>
                              {protectionLevelOptions.map((protectionLevel, index) => {
                                // Create shorter display names for the options
                                const displayNames = [
                                  'Level D - No Known Hazards',
                                  'Level C - Air Purifying Respirators',
                                  'Level B - High Respiratory Protection', 
                                  'Level A - Maximum Protection'
                                ];
                                
                                return (
                                  <SelectItem
                                    key={protectionLevel}
                                    value={protectionLevel}
                                    onClick={() => {
                                      if (!ics201Data.safetyAnalysis.hazmatAssessment.protectionLevels.includes(protectionLevel)) {
                                        handleHazmatChange('protectionLevels', [...ics201Data.safetyAnalysis.hazmatAssessment.protectionLevels, protectionLevel]);
                                      }
                                    }}
                                  >
                                    <div className="space-y-1">
                                      <div className="font-medium">{displayNames[index]}</div>
                                      <div className="text-xs text-muted-foreground line-clamp-2">
                                        {protectionLevel.length > 80 ? `${protectionLevel.substring(0, 80)}...` : protectionLevel}
                                      </div>
                                    </div>
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                          {ics201Data.safetyAnalysis.hazmatAssessment.protectionLevels.length > 0 && (
                            <div className="space-y-2">
                              {ics201Data.safetyAnalysis.hazmatAssessment.protectionLevels.map((protectionLevel, index) => {
                                const displayNames = [
                                  'Level D - No Known Hazards',
                                  'Level C - Air Purifying Respirators', 
                                  'Level B - High Respiratory Protection',
                                  'Level A - Maximum Protection'
                                ];
                                const levelIndex = protectionLevelOptions.indexOf(protectionLevel);
                                
                                return (
                                  <div
                                    key={protectionLevel}
                                    className="bg-muted/20 border border-border rounded-lg p-3 relative group cursor-pointer hover:bg-destructive/10"
                                    onClick={() => {
                                      const newProtectionLevels = ics201Data.safetyAnalysis.hazmatAssessment.protectionLevels.filter(p => p !== protectionLevel);
                                      handleHazmatChange('protectionLevels', newProtectionLevels);
                                    }}
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="min-w-0 flex-1">
                                        <div className="font-medium text-sm text-foreground mb-1">
                                          {levelIndex !== -1 ? displayNames[levelIndex] : 'Custom Protection Level'}
                                        </div>
                                        <div className="text-xs text-muted-foreground leading-relaxed">
                                          {protectionLevel}
                                        </div>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-destructive/20 text-muted-foreground hover:text-destructive flex-shrink-0"
                                      >
                                        <X className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Product or Material Description Table */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <Label className="text-xs text-foreground font-medium">Product or Material Description</Label>
                          <div onClick={addMaterialRow} className="cursor-pointer">
                            <ButtonAddMaterial />
                          </div>
                        </div>
                        
                        <div className="border border-border rounded-lg overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-muted/30">
                                <TableHead className="text-xs font-medium text-foreground border-r border-border">Material</TableHead>
                                <TableHead className="text-xs font-medium text-foreground border-r border-border">Quantity</TableHead>
                                <TableHead className="text-xs font-medium text-foreground border-r border-border">Physical State</TableHead>
                                <TableHead className="text-xs font-medium text-foreground border-r border-border">NIOSH#</TableHead>
                                <TableHead className="text-xs font-medium text-foreground border-r border-border">Specific Gravity</TableHead>
                                <TableHead className="text-xs font-medium text-foreground border-r border-border">pH</TableHead>
                                <TableHead className="text-xs font-medium text-foreground border-r border-border">IDLH</TableHead>
                                <TableHead className="text-xs font-medium text-foreground border-r border-border">Flash Point</TableHead>
                                <TableHead className="text-xs font-medium text-foreground border-r border-border">LEL</TableHead>
                                <TableHead className="text-xs font-medium text-foreground border-r border-border">UEL</TableHead>
                                <TableHead className="text-xs font-medium text-foreground w-10"></TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {ics201Data.safetyAnalysis.hazmatAssessment.materialDescriptions.map((material, index) => (
                                editingMaterialId === material.id ? (
                                  // Edit Mode Rows
                                  <Fragment key={material.id}>
                                    <TableRow key={material.id} className="border-b-0 bg-accent/5 hover:bg-accent/5">
                                      <TableCell className="p-1 border-r border-border">
                                        <Input
                                          value={materialDraft.material}
                                          onChange={(e) => setMaterialDraft({...materialDraft, material: e.target.value})}
                                          placeholder="Material name"
                                          className="h-8 text-xs bg-accent/10 border-accent text-foreground placeholder:text-muted-foreground"
                                          onClick={(e) => e.stopPropagation()}
                                        />
                                      </TableCell>
                                      <TableCell className="p-1 border-r border-border">
                                        <Input
                                          value={materialDraft.quantity}
                                          onChange={(e) => setMaterialDraft({...materialDraft, quantity: e.target.value})}
                                          placeholder="Amount"
                                          className="h-8 text-xs bg-accent/10 border-accent text-foreground placeholder:text-muted-foreground"
                                          onClick={(e) => e.stopPropagation()}
                                        />
                                      </TableCell>
                                      <TableCell className="p-1 border-r border-border">
                                        <Input
                                          value={materialDraft.physicalState}
                                          onChange={(e) => setMaterialDraft({...materialDraft, physicalState: e.target.value})}
                                          placeholder="Solid/Liquid/Gas"
                                          className="h-8 text-xs bg-accent/10 border-accent text-foreground placeholder:text-muted-foreground"
                                          onClick={(e) => e.stopPropagation()}
                                        />
                                      </TableCell>
                                      <TableCell className="p-1 border-r border-border">
                                        <Input
                                          value={materialDraft.nioshNumber}
                                          onChange={(e) => setMaterialDraft({...materialDraft, nioshNumber: e.target.value})}
                                          placeholder="NIOSH ID"
                                          className="h-8 text-xs bg-accent/10 border-accent text-foreground placeholder:text-muted-foreground"
                                          onClick={(e) => e.stopPropagation()}
                                        />
                                      </TableCell>
                                      <TableCell className="p-1 border-r border-border">
                                        <Input
                                          value={materialDraft.specificGravity}
                                          onChange={(e) => setMaterialDraft({...materialDraft, specificGravity: e.target.value})}
                                          placeholder="SG"
                                          className="h-8 text-xs bg-accent/10 border-accent text-foreground placeholder:text-muted-foreground"
                                          onClick={(e) => e.stopPropagation()}
                                        />
                                      </TableCell>
                                      <TableCell className="p-1 border-r border-border">
                                        <Input
                                          value={materialDraft.ph}
                                          onChange={(e) => setMaterialDraft({...materialDraft, ph: e.target.value})}
                                          placeholder="pH Level"
                                          className="h-8 text-xs bg-accent/10 border-accent text-foreground placeholder:text-muted-foreground"
                                          onClick={(e) => e.stopPropagation()}
                                        />
                                      </TableCell>
                                      <TableCell className="p-1 border-r border-border">
                                        <Input
                                          value={materialDraft.idlh}
                                          onChange={(e) => setMaterialDraft({...materialDraft, idlh: e.target.value})}
                                          placeholder="IDLH value"
                                          className="h-8 text-xs bg-accent/10 border-accent text-foreground placeholder:text-muted-foreground"
                                          onClick={(e) => e.stopPropagation()}
                                        />
                                      </TableCell>
                                      <TableCell className="p-1 border-r border-border">
                                        <Input
                                          value={materialDraft.flashPoint}
                                          onChange={(e) => setMaterialDraft({...materialDraft, flashPoint: e.target.value})}
                                          placeholder="Flash point"
                                          className="h-8 text-xs bg-accent/10 border-accent text-foreground placeholder:text-muted-foreground"
                                          onClick={(e) => e.stopPropagation()}
                                        />
                                      </TableCell>
                                      <TableCell className="p-1 border-r border-border">
                                        <Input
                                          value={materialDraft.lel}
                                          onChange={(e) => setMaterialDraft({...materialDraft, lel: e.target.value})}
                                          placeholder="LEL %"
                                          className="h-8 text-xs bg-accent/10 border-accent text-foreground placeholder:text-muted-foreground"
                                          onClick={(e) => e.stopPropagation()}
                                        />
                                      </TableCell>
                                      <TableCell className="p-1 border-r border-border">
                                        <Input
                                          value={materialDraft.uel}
                                          onChange={(e) => setMaterialDraft({...materialDraft, uel: e.target.value})}
                                          placeholder="UEL %"
                                          className="h-8 text-xs bg-accent/10 border-accent text-foreground placeholder:text-muted-foreground"
                                          onClick={(e) => e.stopPropagation()}
                                        />
                                      </TableCell>
                                      <TableCell className="p-1"></TableCell>
                                    </TableRow>
                                    <TableRow className="border-b border-border bg-accent/5 hover:bg-accent/5">
                                      <TableCell colSpan={11} className="p-2">
                                        <div className="flex items-center gap-2 justify-end">
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleCancelMaterial();
                                            }}
                                            className="flex items-center border-border text-muted-foreground hover:text-foreground text-xs h-6"
                                          >
                                            Cancel
                                          </Button>
                                          <Button
                                            size="sm"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleSaveMaterial();
                                            }}
                                            className="flex items-center bg-accent hover:bg-accent/90 text-accent-foreground text-xs h-6"
                                          >
                                            Save
                                          </Button>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  </Fragment>
                                ) : (
                                  // View Mode Row
                                  <TableRow 
                                    key={material.id} 
                                    className="border-b border-border cursor-pointer hover:bg-muted/5"
                                    onClick={(e) => {
                                      // Only trigger edit if not clicking on delete button
                                      if (!(e.target as HTMLElement).closest('button')) {
                                        handleEditMaterial(material.id);
                                      }
                                    }}
                                  >
                                    <TableCell className="p-1 border-r border-border">
                                      <div className="h-8 px-2 flex items-center text-xs text-foreground bg-muted/10 rounded">
                                        {material.material}
                                      </div>
                                    </TableCell>
                                    <TableCell className="p-1 border-r border-border">
                                      <div className="h-8 px-2 flex items-center text-xs text-foreground bg-muted/10 rounded">
                                        {material.quantity}
                                      </div>
                                    </TableCell>
                                    <TableCell className="p-1 border-r border-border">
                                      <div className="h-8 px-2 flex items-center text-xs text-foreground bg-muted/10 rounded">
                                        {material.physicalState}
                                      </div>
                                    </TableCell>
                                    <TableCell className="p-1 border-r border-border">
                                      <div className="h-8 px-2 flex items-center text-xs text-foreground bg-muted/10 rounded">
                                        {material.nioshNumber}
                                      </div>
                                    </TableCell>
                                    <TableCell className="p-1 border-r border-border">
                                      <div className="h-8 px-2 flex items-center text-xs text-foreground bg-muted/10 rounded">
                                        {material.specificGravity}
                                      </div>
                                    </TableCell>
                                    <TableCell className="p-1 border-r border-border">
                                      <div className="h-8 px-2 flex items-center text-xs text-foreground bg-muted/10 rounded">
                                        {material.ph}
                                      </div>
                                    </TableCell>
                                    <TableCell className="p-1 border-r border-border">
                                      <div className="h-8 px-2 flex items-center text-xs text-foreground bg-muted/10 rounded">
                                        {material.idlh}
                                      </div>
                                    </TableCell>
                                    <TableCell className="p-1 border-r border-border">
                                      <div className="h-8 px-2 flex items-center text-xs text-foreground bg-muted/10 rounded">
                                        {material.flashPoint}
                                      </div>
                                    </TableCell>
                                    <TableCell className="p-1 border-r border-border">
                                      <div className="h-8 px-2 flex items-center text-xs text-foreground bg-muted/10 rounded">
                                        {material.lel}
                                      </div>
                                    </TableCell>
                                    <TableCell className="p-1 border-r border-border">
                                      <div className="h-8 px-2 flex items-center text-xs text-foreground bg-muted/10 rounded">
                                        {material.uel}
                                      </div>
                                    </TableCell>
                                    <TableCell className="p-1">
                                      <div className="flex items-center gap-1">

                                        {ics201Data.safetyAnalysis.hazmatAssessment.materialDescriptions.length > 1 && (
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              removeMaterialRow(material.id);
                                            }}
                                            className="h-6 w-6 p-0 hover:bg-destructive/20 text-muted-foreground hover:text-destructive"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </Button>
                                        )}
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                )
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
        
      case 'uc-division-labor':
        return (
          <div className="space-y-3 p-3 bg-card border border-border rounded-lg">
            <p className="text-sm text-muted-foreground">
              Define roles and responsibilities for Unified Command members.
            </p>
            <div className="space-y-2">
              <div className="p-3 bg-muted/20 rounded-lg border border-border/50">
                <h5 className="text-sm text-foreground mb-2">Command Responsibilities</h5>
                <Textarea
                  placeholder="Define command responsibilities and authority distribution..."
                  className="bg-input-background border-border text-foreground placeholder:text-muted-foreground"
                  rows={2}
                />
              </div>
              <div className="p-3 bg-muted/20 rounded-lg border border-border/50">
                <h5 className="text-sm text-foreground mb-2">Resource Management</h5>
                <Textarea
                  placeholder="Define resource management roles..."
                  className="bg-input-background border-border text-foreground placeholder:text-muted-foreground"
                  rows={2}
                />
              </div>
            </div>
            <Button size="sm" variant="outline" className="border-border text-muted-foreground hover:text-foreground">
              <Plus className="w-3 h-3 mr-1" />
              Add Responsibility Area
            </Button>
          </div>
        );
        
      case 'daily-meeting-schedule':
        return (
          <div className="space-y-3 p-3 bg-card border border-border rounded-lg">
            <p className="text-sm text-muted-foreground">
              Create daily meeting and briefing schedule (ICS 230).
            </p>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="meeting-time" className="text-sm text-foreground">Planning Meeting</Label>
                  <Input
                    id="meeting-time"
                    type="time"
                    className="mt-1 bg-input-background border-border text-foreground"
                  />
                </div>
                <div>
                  <Label htmlFor="ops-briefing" className="text-sm text-foreground">Operations Briefing</Label>
                  <Input
                    id="ops-briefing"
                    type="time"
                    className="mt-1 bg-input-background border-border text-foreground"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="meeting-location" className="text-sm text-foreground">Default Meeting Location</Label>
                <Input
                  id="meeting-location"
                  placeholder="Enter meeting location..."
                  className="mt-1 bg-input-background border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>
            <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Calendar className="w-3 h-3 mr-1" />
              Generate ICS 230
            </Button>
          </div>
        );
        
      case 'updated-ics-233':
        return (
          <div className="space-y-3 p-3 bg-card border border-border rounded-lg">
            <p className="text-sm text-muted-foreground">
              Update Work Unit Analysis with current assignments and status.
            </p>
            <div className="space-y-2">
              <div className="p-3 bg-muted/20 rounded-lg border border-border/50">
                <h5 className="text-sm text-foreground mb-2">Current Work Units</h5>
                <div className="text-xs text-muted-foreground">
                  • Security Operations - 85% Complete
                </div>
                <div className="text-xs text-muted-foreground">
                  ��� Perimeter Control - In Progress
                </div>
                <div className="text-xs text-muted-foreground">
                  • Traffic Management - Assigned
                </div>
              </div>
              <div>
                <Label htmlFor="new-work-unit" className="text-sm text-foreground">Add Work Unit</Label>
                <Input
                  id="new-work-unit"
                  placeholder="Enter work unit name..."
                  className="mt-1 bg-input-background border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <ClipboardList className="w-3 h-3 mr-1" />
                Update ICS 233
              </Button>
              <Button variant="outline" size="sm" className="border-border text-muted-foreground hover:text-foreground">
                <Plus className="w-3 h-3 mr-1" />
                Add Work Unit
              </Button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  // Fullscreen Modal Component
  const FullscreenCardModal = ({ cardId, onClose }: { cardId: string, onClose: () => void }) => {
    const deliverable = deliverablesItems.find(item => item.id === cardId);
    if (!deliverable) return null;

    return (
      <div className="fixed inset-0 z-50 bg-background">
        <div className="h-full flex flex-col">
          {/* Fullscreen Header */}
          <div className="p-6 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <deliverable.icon className={`w-6 h-6 ${deliverable.color}`} />
              <div>
                <h2 className="text-foreground">{deliverable.text}</h2>
                <p className="text-sm text-muted-foreground">{deliverable.description}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="border-white text-white hover:text-white hover:bg-white/20"
            >
              <Minimize className="w-4 h-4 mr-2" />
              Minimize
            </Button>
          </div>

          {/* Fullscreen Content */}
          <div className="flex-1 overflow-auto p-6">
            <div className="max-w-4xl mx-auto">
              {renderDeliverableContent(deliverable)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-foreground">Initial Response & Assessment</h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAgendaPanelOpen(!agendaPanelOpen)}
            className={`flex items-center gap-2 transition-all duration-200 ${
              agendaPanelOpen
                ? 'bg-accent text-accent-foreground border-accent hover:bg-accent/90'
                : 'border-border text-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            <ListTodo className="w-4 h-4" />
            Agenda
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCompletePhaseModal(true)}
            className="flex items-center gap-2 border-border text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200"
          >
            <CheckCircle className="w-4 h-4" />
            Complete Phase & Advance to Phase 2
          </Button>
        </div>
      </div>
      
      {/* ICS Forms Tabs */}
      <div className="flex items-center border-b border-border mb-6">
        <button
          onClick={() => setSelectedIcsForm('ics-202')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-200 border-b-2 -mb-px ${
            selectedIcsForm === 'ics-202'
              ? 'border-accent text-accent'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
          }`}
        >
          <FileText className="w-4 h-4" />
          ICS-202 Incident Objectives
        </button>
        <button
          onClick={() => setSelectedIcsForm('ics-233')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-200 border-b-2 -mb-px ${
            selectedIcsForm === 'ics-233'
              ? 'border-accent text-accent'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
          }`}
        >
          <FileText className="w-4 h-4" />
          ICS-233 Open Actions Tracker
        </button>
        <button
          onClick={() => setSelectedIcsForm('ics-209')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-200 border-b-2 -mb-px ${
            selectedIcsForm === 'ics-209'
              ? 'border-accent text-accent'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
          }`}
        >
          <FileText className="w-4 h-4" />
          ICS-209 Incident Status Summary
        </button>
      </div>

      {/* Connector Line SVG - Fixed to viewport */}
      {showConnector && (
        <svg 
          className="fixed top-0 left-0 pointer-events-none" 
          style={{ width: '100vw', height: '100vh', zIndex: 9999 }}
        >
          <path
            d={`M ${connectorCoords.x1} ${connectorCoords.y1} L ${connectorCoords.x1 + 30} ${connectorCoords.y1} L ${connectorCoords.x1 + 30} ${connectorCoords.y2} L ${connectorCoords.x2} ${connectorCoords.y2}`}
            stroke="#93c5fd"
            strokeWidth="3"
            fill="none"
            opacity="1"
          />
          <circle
            cx={connectorCoords.x1}
            cy={connectorCoords.y1}
            r="4"
            fill="#93c5fd"
          />
          <circle
            cx={connectorCoords.x2}
            cy={connectorCoords.y2}
            r="4"
            fill="#93c5fd"
          />
        </svg>
      )}
      
      <div className={`flex gap-6 ${agendaPanelOpen ? '' : ''}`}>
        {/* Left Side - Agenda Panel */}
        {agendaPanelOpen && (
          <div className="w-1/2 transition-all duration-300">
            <Card className="sticky top-6 flex flex-col max-h-[calc(100vh-48px)]">
              <CardHeader className="py-3 flex-shrink-0 relative z-0">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-accent" />
                    <div>
                      <CardTitle className="text-foreground">Agenda</CardTitle>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAgendaPanelOpen(false)}
                    className="h-7 px-2 hover:bg-muted/20 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-2 p-3 border border-border rounded-lg bg-card">
                  <div className="flex items-center justify-between">
                    <span className="text-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                      Overall Progress
                    </span>
                    <span className="text-foreground" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                      {agendaProgress.completedItems}/{agendaProgress.totalItems} completed
                    </span>
                  </div>
                  <Progress 
                    value={agendaProgress.percentage} 
                    className="h-2 bg-border/30"
                    indicatorClassName="bg-accent"
                  />
                  
                  {/* Position-based progress */}
                  <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-border">
                    {/* PSC Progress */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 px-1.5 py-0.5 bg-chart-3/10 text-chart-3 border border-chart-3/20 rounded-full" style={{ fontSize: '10px' }}>
                          <Users className="w-2.5 h-2.5" />
                          <span>PSC</span>
                        </div>
                        <span className="text-foreground" style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)' }}>
                          {agendaProgress.psc.completed}/{agendaProgress.psc.total}
                        </span>
                      </div>
                      <Progress 
                        value={agendaProgress.psc.percentage} 
                        className="h-1.5 bg-border/30"
                        indicatorClassName="bg-chart-3"
                      />
                    </div>
                    
                    {/* IC/UC Progress */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 px-1.5 py-0.5 bg-chart-5/20 text-chart-5 border border-chart-5/30 rounded-full" style={{ fontSize: '10px' }}>
                          <Users className="w-2.5 h-2.5" />
                          <span>IC/UC</span>
                        </div>
                        <span className="text-foreground" style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)' }}>
                          {agendaProgress.icuc.completed}/{agendaProgress.icuc.total}
                        </span>
                      </div>
                      <Progress 
                        value={agendaProgress.icuc.percentage} 
                        className="h-1.5 bg-border/30"
                        indicatorClassName="bg-chart-5"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 overflow-y-auto flex-1">
                  <div className="space-y-4">
                    {/* Incident Briefing Meeting Info - Top of Agenda */}

                    
                    <div className="space-y-6">
                <div ref={currentSituationAgendaRef} className={`space-y-2 transition-all duration-500 rounded-lg relative ${highlightCurrentSituationAgenda ? 'bg-accent/15 z-50' : ''}`} style={highlightCurrentSituationAgenda ? { outline: '4px solid hsl(var(--accent))', outlineOffset: '-8px', boxShadow: '0 0 0 8px hsl(var(--accent) / 0.2), inset 0 0 0 2px hsl(var(--accent))' } : {}}>
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="currentSituation"
                      checked={agendaItems.currentSituation}
                      onCheckedChange={(checked) => handleAgendaItemChange('currentSituation', checked as boolean)}
                      className="mt-0.5 border-border data-[state=checked]:bg-success data-[state=checked]:border-success"
                    />
                    <div className="flex items-center gap-0.5 px-1.5 py-0 bg-chart-3/10 text-chart-3 border border-chart-3/20 rounded-full flex-shrink-0" style={{ fontSize: '10px' }}>
                      <Users className="w-2.5 h-2.5" />
                      <span>PSC</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center gap-0.5 px-1.5 py-0 bg-accent/10 text-accent border border-accent/20 rounded-full flex-shrink-0" style={{ fontSize: '10px' }}>
                          <FileText className="w-2.5 h-2.5" />
                          <span>ICS-201</span>
                        </div>
                        <Label 
                          className="text-foreground leading-relaxed cursor-pointer hover:text-accent transition-colors"
                          style={{ fontSize: 'var(--text-sm)' }}
                          onClick={scrollToCurrentSituation}
                        >
                          Current Situation
                        </Label>
                      </div>
                      {agendaNotes.currentSituation && !expandedAgendaNotes.currentSituation && (
                        <ul className="list-disc list-inside mt-1 space-y-0.5">
                          {agendaNotes.currentSituation.split('\n').filter(line => line.trim()).map((line, idx) => (
                            <li key={idx} className="text-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                              {line.trim()}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                  
                  {expandedAgendaNotes.currentSituation && (
                    <div className="ml-9">
                      <div className="space-y-3">
                        <div>
                          <Textarea
                            value={editingAgendaNote === 'currentSituation' ? agendaNoteDraft : agendaNotes.currentSituation}
                            onChange={(e) => {
                              if (editingAgendaNote !== 'currentSituation') {
                                handleEditAgendaNote('currentSituation');
                              }
                              handleAgendaNoteChange(e.target.value);
                            }}
                            placeholder="Add notes..."
                            className="bg-input-background border-border text-foreground placeholder:text-muted-foreground min-h-[80px]"
                          />
                          <div className="h-4 mt-1">
                            {agendaNoteValidationError && (
                              <span className="text-destructive caption">Notes must be at least 4 characters</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 justify-start">
                          <button
                            onClick={() => {
                              handleSaveAgendaNote();
                              toggleAgendaNote('currentSituation');
                            }}
                            className="bg-primary hover:bg-primary/90 rounded px-3 py-0 h-8 flex items-center justify-center text-primary-foreground"
                            style={{ fontVariationSettings: "'wdth' 100" }}
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              handleCancelAgendaNote();
                              toggleAgendaNote('currentSituation');
                            }}
                            className="bg-background border border-border hover:bg-background/80 rounded px-3 py-0 h-8 flex items-center justify-center text-foreground"
                            style={{ fontVariationSettings: "'wdth' 100" }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div ref={initialResponseObjectivesAgendaRef} className={`space-y-2 transition-all duration-500 rounded-lg relative ${highlightObjectivesAgenda ? 'bg-accent/15 z-50' : ''}`} style={highlightObjectivesAgenda ? { outline: '4px solid hsl(var(--accent))', outlineOffset: '-8px', boxShadow: '0 0 0 8px hsl(var(--accent) / 0.2), inset 0 0 0 2px hsl(var(--accent))' } : {}}>
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="initialResponseObjectives"
                      checked={agendaItems.initialResponseObjectives}
                      onCheckedChange={(checked) => handleAgendaItemChange('initialResponseObjectives', checked as boolean)}
                      className="mt-0.5 border-border data-[state=checked]:bg-success data-[state=checked]:border-success"
                    />
                    <div className="flex items-center gap-0.5 px-1.5 py-0 bg-chart-3/10 text-chart-3 border border-chart-3/20 rounded-full flex-shrink-0" style={{ fontSize: '10px' }}>
                      <Users className="w-2.5 h-2.5" />
                      <span>PSC</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center gap-0.5 px-1.5 py-0 bg-accent/10 text-accent border border-accent/20 rounded-full flex-shrink-0" style={{ fontSize: '10px' }}>
                          <FileText className="w-2.5 h-2.5" />
                          <span>ICS-201</span>
                        </div>
                        <Label 
                          className="text-foreground leading-relaxed cursor-pointer hover:text-accent transition-colors"
                          style={{ fontSize: 'var(--text-sm)' }}
                          onClick={scrollToInitialResponseObjectives}
                        >
                          Initial Response Objectives
                        </Label>
                      </div>
                      {agendaNotes.initialResponseObjectives && !expandedAgendaNotes.initialResponseObjectives && (
                        <ul className="list-disc list-inside mt-1 space-y-0.5">
                          {agendaNotes.initialResponseObjectives.split('\n').filter(line => line.trim()).map((line, idx) => (
                            <li key={idx} className="text-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                              {line.trim()}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                  
                  {expandedAgendaNotes.initialResponseObjectives && (
                    <div className="ml-9">
                      <div className="space-y-3">
                        <div>
                          <Textarea
                            value={editingAgendaNote === 'initialResponseObjectives' ? agendaNoteDraft : agendaNotes.initialResponseObjectives}
                            onChange={(e) => {
                              if (editingAgendaNote !== 'initialResponseObjectives') {
                                handleEditAgendaNote('initialResponseObjectives');
                              }
                              handleAgendaNoteChange(e.target.value);
                            }}
                            placeholder="Add notes..."
                            className="bg-input-background border-border text-foreground placeholder:text-muted-foreground min-h-[80px]"
                          />
                          <div className="h-4 mt-1">
                            {agendaNoteValidationError && (
                              <span className="text-destructive caption">Notes must be at least 4 characters</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 justify-start">
                          <button
                            onClick={() => {
                              handleSaveAgendaNote();
                              toggleAgendaNote('initialResponseObjectives');
                            }}
                            className="bg-primary hover:bg-primary/90 rounded px-3 py-0 h-8 flex items-center justify-center text-primary-foreground"
                            style={{ fontVariationSettings: "'wdth' 100" }}
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              handleCancelAgendaNote();
                              toggleAgendaNote('initialResponseObjectives');
                            }}
                            className="bg-background border border-border hover:bg-background/80 rounded px-3 py-0 h-8 flex items-center justify-center text-foreground"
                            style={{ fontVariationSettings: "'wdth' 100" }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div ref={incidentRosterAgendaRef} className={`space-y-3 transition-all duration-500 rounded-lg relative ${highlightIncidentRosterAgenda ? 'bg-accent/15 z-50' : ''}`} style={highlightIncidentRosterAgenda ? { outline: '4px solid hsl(var(--accent))', outlineOffset: '-8px', boxShadow: '0 0 0 8px hsl(var(--accent) / 0.2), inset 0 0 0 2px hsl(var(--accent))' } : {}}>
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="incidentRoster"
                      checked={agendaItems.incidentRoster}
                      onCheckedChange={(checked) => handleAgendaItemChange('incidentRoster', checked as boolean)}
                      className="mt-0.5 border-border data-[state=checked]:bg-success data-[state=checked]:border-success"
                    />
                    <div className="flex items-center gap-0.5 px-1.5 py-0 bg-chart-3/10 text-chart-3 border border-chart-3/20 rounded-full flex-shrink-0" style={{ fontSize: '10px' }}>
                      <Users className="w-2.5 h-2.5" />
                      <span>PSC</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center gap-0.5 px-1.5 py-0 bg-accent/10 text-accent border border-accent/20 rounded-full flex-shrink-0" style={{ fontSize: '10px' }}>
                          <FileText className="w-2.5 h-2.5" />
                          <span>ICS-201</span>
                        </div>
                        <Label 
                          className="text-foreground leading-relaxed cursor-pointer hover:text-accent transition-colors"
                          style={{ fontSize: 'var(--text-sm)' }}
                          onClick={scrollToIncidentRoster}
                        >
                          Incident Roster
                        </Label>
                      </div>
                    </div>
                  </div>
                  
                  {expandedAgendaNotes.incidentRoster && (
                    <div className="ml-9">
                      {editingAgendaNote === 'incidentRoster' ? (
                        <div className="space-y-3">
                          <div>
                            <Textarea
                              value={agendaNoteDraft}
                              onChange={(e) => handleAgendaNoteChange(e.target.value)}
                              placeholder="Add notes..."
                              className="bg-input-background border-border text-foreground placeholder:text-muted-foreground min-h-[80px]"
                            />
                            <div className="h-4 mt-1">
                              {agendaNoteValidationError && (
                                <span className="text-destructive caption">Notes must be at least 4 characters</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 justify-start">
                            <button
                              onClick={handleSaveAgendaNote}
                              className="bg-primary hover:bg-primary/90 rounded px-3 py-0 h-8 flex items-center justify-center text-primary-foreground"
                              style={{ fontVariationSettings: "'wdth' 100" }}
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancelAgendaNote}
                              className="bg-background border border-border hover:bg-background/80 rounded px-3 py-0 h-8 flex items-center justify-center text-foreground"
                              style={{ fontVariationSettings: "'wdth' 100" }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div 
                          className="p-2 min-h-[80px] bg-input-background border border-border rounded text-foreground cursor-pointer hover:border-accent transition-colors"
                          onClick={() => handleEditAgendaNote('incidentRoster')}
                          style={{ borderRadius: 'var(--radius)' }}
                        >
                          {agendaNotes.incidentRoster || (
                            <span className="text-muted-foreground italic">Click to add notes...</span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="resourceManagement"
                      checked={agendaItems.resourceManagement}
                      onCheckedChange={(checked) => handleAgendaItemChange('resourceManagement', checked as boolean)}
                      className="mt-0.5 border-border data-[state=checked]:bg-success data-[state=checked]:border-success"
                    />
                    <div className="flex items-center gap-0.5 px-1.5 py-0 bg-chart-5/20 text-chart-5 border border-chart-5/30 rounded-full flex-shrink-0" style={{ fontSize: '10px' }}>
                      <Users className="w-2.5 h-2.5" />
                      <span>IC/UC</span>
                    </div>
                    <Label 
                      className="text-foreground leading-relaxed flex-1"
                      style={{ fontSize: 'var(--text-sm)' }}
                    >
                      Resource Management
                    </Label>
                  </div>
                  
                  {expandedAgendaNotes.resourceManagement && (
                    <div className="ml-9">
                      {editingAgendaNote === 'resourceManagement' ? (
                        <div className="space-y-3">
                          <div>
                            <Textarea
                              value={agendaNoteDraft}
                              onChange={(e) => handleAgendaNoteChange(e.target.value)}
                              placeholder="Add notes..."
                              className="bg-input-background border-border text-foreground placeholder:text-muted-foreground min-h-[80px]"
                            />
                            <div className="h-4 mt-1">
                              {agendaNoteValidationError && (
                                <span className="text-destructive caption">Notes must be at least 4 characters</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 justify-start">
                            <button
                              onClick={handleSaveAgendaNote}
                              className="bg-primary hover:bg-primary/90 rounded px-3 py-0 h-8 flex items-center justify-center text-primary-foreground"
                              style={{ fontVariationSettings: "'wdth' 100" }}
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancelAgendaNote}
                              className="bg-background border border-border hover:bg-background/80 rounded px-3 py-0 h-8 flex items-center justify-center text-foreground"
                              style={{ fontVariationSettings: "'wdth' 100" }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div 
                          className="p-2 min-h-[80px] bg-input-background border border-border rounded text-foreground cursor-pointer hover:border-accent transition-colors"
                          onClick={() => handleEditAgendaNote('resourceManagement')}
                          style={{ borderRadius: 'var(--radius)' }}
                        >
                          {agendaNotes.resourceManagement || (
                            <span className="text-muted-foreground italic">Click to add notes...</span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="safetyAnalysis"
                      checked={agendaItems.safetyAnalysis}
                      onCheckedChange={(checked) => handleAgendaItemChange('safetyAnalysis', checked as boolean)}
                      className="mt-0.5 border-border data-[state=checked]:bg-success data-[state=checked]:border-success"
                    />
                    <div className="flex items-center gap-0.5 px-1.5 py-0 bg-chart-5/20 text-chart-5 border border-chart-5/30 rounded-full flex-shrink-0" style={{ fontSize: '10px' }}>
                      <Users className="w-2.5 h-2.5" />
                      <span>IC/UC</span>
                    </div>
                    <Label 
                      className="text-foreground leading-relaxed flex-1"
                      style={{ fontSize: 'var(--text-sm)' }}
                    >
                      Safety Analysis
                    </Label>
                  </div>
                  
                  {expandedAgendaNotes.safetyAnalysis && (
                    <div className="ml-9">
                      {editingAgendaNote === 'safetyAnalysis' ? (
                        <div className="space-y-3">
                          <div>
                            <Textarea
                              value={agendaNoteDraft}
                              onChange={(e) => handleAgendaNoteChange(e.target.value)}
                              placeholder="Add notes..."
                              className="bg-input-background border-border text-foreground placeholder:text-muted-foreground min-h-[80px]"
                            />
                            <div className="h-4 mt-1">
                              {agendaNoteValidationError && (
                                <span className="text-destructive caption">Notes must be at least 4 characters</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 justify-start">
                            <button
                              onClick={handleSaveAgendaNote}
                              className="bg-primary hover:bg-primary/90 rounded px-3 py-0 h-8 flex items-center justify-center text-primary-foreground"
                              style={{ fontVariationSettings: "'wdth' 100" }}
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancelAgendaNote}
                              className="bg-background border border-border hover:bg-background/80 rounded px-3 py-0 h-8 flex items-center justify-center text-foreground"
                              style={{ fontVariationSettings: "'wdth' 100" }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div 
                          className="p-2 min-h-[80px] bg-input-background border border-border rounded text-foreground cursor-pointer hover:border-accent transition-colors"
                          onClick={() => handleEditAgendaNote('safetyAnalysis')}
                          style={{ borderRadius: 'var(--radius)' }}
                        >
                          {agendaNotes.safetyAnalysis || (
                            <span className="text-muted-foreground italic">Click to add notes...</span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                    </div>
                  </div>

                </CardContent>
            </Card>
          </div>
        )}

        {/* Right Side - ICS-201 Card */}
        <div className={`space-y-8 transition-all duration-300 ${agendaPanelOpen ? 'w-1/2' : 'w-full'}`}>
          {/* Individual Deliverable Cards */}
          {deliverablesItems.filter(deliverable => deliverable.id === 'draft-ics-202').map((deliverable) => (
            <Card key={deliverable.id}>
              <CardHeader 
                className="py-3 cursor-pointer hover:bg-muted/5 transition-colors"
                onClick={(e) => {
                  // Don't toggle if clicking on buttons
                  const target = e.target as HTMLElement;
                  if (!target.closest('button')) {
                    handleDeliverableExpand(deliverable.id);
                  }
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-1.5">
                    <deliverable.icon className={`w-4 h-4 ${deliverable.color} mt-1.5`} />
                    <div>
                      <CardTitle className="text-foreground">{deliverable.text}</CardTitle>
                      <CardDescription className="text-[rgb(255,255,255)]">
                        {deliverable.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsExpandedModalOpen(true);
                      }}
                      className="h-7 w-7 p-0 hover:bg-muted/20"
                    >
                      <Maximize className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsPreviewModalOpen(true);
                      }}
                      className="flex items-center gap-2 h-7"
                    >
                      <FileText className="w-3 h-3" />
                      Preview ICS-201
                    </Button>
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-chart-3/10 text-chart-3 border border-chart-3/20 rounded-full text-xs">
                      <Users className="w-3 h-3" />
                      <span>PSC</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeliverableExpand(deliverable.id);
                      }}
                      className="h-7 w-7 p-0 hover:bg-muted/20"
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform ${expandedDeliverables[deliverable.id] ? '' : '-rotate-90'}`} />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {expandedDeliverables[deliverable.id] && (
                <div ref={ics201ScrollContainerRef} className="px-6 pb-2 space-y-1.5 max-h-[calc(100vh-300px)] overflow-y-auto">
                  {renderDeliverableContent(deliverable)}
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t border-border">
        <div>
          {onPrevious && (
            <Button variant="outline" onClick={onPrevious} className="border-white text-white hover:text-white hover:bg-white/20">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous Phase
            </Button>
          )}
        </div>
      </div>

      {/* Schedule Meeting Dialog */}
      <Dialog open={meetingDialogOpen} onOpenChange={setMeetingDialogOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">{meetingData ? 'Edit Meeting' : 'Schedule Meeting'}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {meetingData ? 'Update the' : 'Schedule a'} planning meeting for Initial Response & Assessment
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="meeting-title" className="text-foreground">Meeting Title</Label>
              <Input 
                id="meeting-title" 
                placeholder="e.g., Initial Response Planning Meeting"
                value={meetingFormData.title}
                onChange={(e) => setMeetingFormData({ ...meetingFormData, title: e.target.value })}
                className="bg-input-background border-border text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="meeting-date" className="text-foreground">Date & Time</Label>
              <Input 
                id="meeting-date" 
                type="datetime-local"
                value={meetingFormData.dateTime}
                onChange={(e) => setMeetingFormData({ ...meetingFormData, dateTime: e.target.value })}
                className="bg-input-background border-border text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="meeting-location" className="text-foreground">Location</Label>
              <Input 
                id="meeting-location" 
                placeholder="e.g., Command Post or Online"
                value={meetingFormData.location}
                onChange={(e) => setMeetingFormData({ ...meetingFormData, location: e.target.value })}
                className="bg-input-background border-border text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="meeting-attendees" className="text-foreground">Attendees</Label>
              <Textarea 
                id="meeting-attendees" 
                placeholder="List attendees (one per line)"
                value={meetingFormData.attendees}
                onChange={(e) => setMeetingFormData({ ...meetingFormData, attendees: e.target.value })}
                className="bg-input-background border-border text-foreground min-h-[80px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="meeting-link" className="text-foreground">Meeting Link (Optional)</Label>
              <Input 
                id="meeting-link" 
                placeholder="https://meet.example.com/..."
                value={meetingFormData.link}
                onChange={(e) => setMeetingFormData({ ...meetingFormData, link: e.target.value })}
                className="bg-input-background border-border text-foreground"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setMeetingDialogOpen(false);
                  setMeetingFormData({ title: '', dateTime: '', location: '', attendees: '', link: '' });
                }}
                className="border-border text-foreground hover:bg-muted"
              >
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  setMeetingData(meetingFormData);
                  onDataChange?.({ ...data, meetingData: meetingFormData });
                  setMeetingDialogOpen(false);
                  setMeetingFormData({ title: '', dateTime: '', location: '', attendees: '', link: '' });
                }}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Calendar className="w-4 h-4 mr-2" />
                {meetingData ? 'Update Meeting' : 'Schedule Meeting'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Meeting Info Dialog */}
      <Dialog open={meetingInfoDialogOpen} onOpenChange={setMeetingInfoDialogOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Meeting Information</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Details for the scheduled planning meeting
            </DialogDescription>
          </DialogHeader>
          {meetingData && (
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground" style={{ fontSize: 'var(--text-xs)' }}>Meeting Title</Label>
                <p className="text-foreground" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                  {meetingData.title || 'Not specified'}
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground" style={{ fontSize: 'var(--text-xs)' }}>Date & Time</Label>
                <p className="text-foreground" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                  {meetingData.dateTime ? new Date(meetingData.dateTime).toLocaleString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  }) : 'Not specified'}
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground" style={{ fontSize: 'var(--text-xs)' }}>Location</Label>
                <p className="text-foreground" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                  {meetingData.location || 'Not specified'}
                </p>
              </div>
              {meetingData.attendees && (
                <div className="space-y-2">
                  <Label className="text-muted-foreground" style={{ fontSize: 'var(--text-xs)' }}>Attendees</Label>
                  <div className="space-y-1">
                    {meetingData.attendees.split('\n').filter(line => line.trim()).map((attendee, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                        <Users className="w-3 h-3 text-muted-foreground" />
                        {attendee.trim()}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {meetingData.link && (
                <div className="space-y-2">
                  <Label className="text-muted-foreground" style={{ fontSize: 'var(--text-xs)' }}>Meeting Link</Label>
                  <a 
                    href={meetingData.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-accent hover:underline flex items-center gap-1"
                    style={{ fontSize: 'var(--text-sm)' }}
                  >
                    {meetingData.link}
                  </a>
                </div>
              )}
              <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <Button 
                  variant="outline" 
                  onClick={() => setMeetingInfoDialogOpen(false)}
                  className="border-border text-foreground hover:bg-muted"
                >
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    setMeetingFormData(meetingData);
                    setMeetingInfoDialogOpen(false);
                    setMeetingDialogOpen(true);
                  }}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Meeting
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Fullscreen Modal */}
      {fullscreenCard && (
        <FullscreenCardModal
          cardId={fullscreenCard}
          onClose={() => setFullscreenCard(null)}
        />
      )}

      {/* Complete Phase Confirmation Modal */}
      <Dialog open={showCompletePhaseModal} onOpenChange={setShowCompletePhaseModal}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-accent" />
              Complete IC/UC Objectives?
            </DialogTitle>
            <DialogDescription className="sr-only">
              Confirm phase completion
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <p className="text-foreground">
              You are about to complete <span className="font-medium text-accent">IC/UC Objectives</span> and advance to <span className="font-medium text-accent">Command & General Staff Meeting</span>.
            </p>
            <div className="bg-muted/30 border border-border rounded-md p-4 space-y-2">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                <p className="text-sm text-foreground">
                  <span className="font-medium">Important:</span> Edits to IC/UC Objectives will be locked after you advance to Command & General Staff Meeting.
                </p>
              </div>
              <p className="text-sm text-white pl-6">
                The phase can be reverted in Incident Settings if needed.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowCompletePhaseModal(false)}
              className="border-border text-foreground hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowCompletePhaseModal(false);
                onComplete?.();
              }}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Complete IC/UC Objectives
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Preview ICS-201 Modal */}
      <Dialog open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>ICS-201 Preview</DialogTitle>
            <DialogDescription>
              Preview and export the ICS-201 document
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center p-12 bg-muted/20 border border-border rounded-lg min-h-[400px]">
            <p className="text-muted-foreground text-center">
              [Placeholder for PDF document preview and export]
            </p>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Expanded ICS-201 Modal */}
      <Dialog open={isExpandedModalOpen} onOpenChange={setIsExpandedModalOpen}>
        <DialogContent className="!w-[98vw] !max-w-[98vw] max-h-[95vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-accent" />
                  ICS-201 - Initial Response & Assessment
                </DialogTitle>
                <DialogDescription>
                  Expanded view of the ICS-201 form
                </DialogDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpandedModalOpen(false)}
                className="h-8 w-8 p-0 hover:bg-muted/20"
              >
                <Minimize className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto mt-4">
            <div className="w-full px-8">
              {renderDeliverableContent(deliverablesItems.find(d => d.id === 'draft-ics-202'))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}