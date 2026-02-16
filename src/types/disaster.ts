export interface DisasterPhase {
  id: string;
  name: string;
  shortName: string;
  description: string;
  completed: boolean;
  data?: Record<string, any>;
}

export interface OperationalPeriod {
  id: string;
  number: number;
  startTime: Date;
  endTime?: Date;
  phases: DisasterPhase[];
}

export const PLANNING_P_PHASES: Omit<DisasterPhase, 'completed' | 'data'>[] = [
  {
    id: 'initial-response',
    name: 'Initial Response & Assessment',
    shortName: 'Initial Response',
    description: 'Immediate response and situation assessment'
  }
];

export const OPERATIONAL_PERIOD_PHASES: Omit<DisasterPhase, 'completed' | 'data'>[] = [
  {
    id: 'initial-response',
    name: 'IC/UC Objectives',
    shortName: 'IC/UC Objectives',
    description: 'Establish incident objectives and priorities'
  },
  {
    id: 'command-staff-meeting',
    name: 'Command & General Staff Meeting',
    shortName: 'Command & General Staff Meeting',
    description: 'Review objectives with command and general staff'
  },
  {
    id: 'prepare-tactics',
    name: 'Prepare Tactics',
    shortName: 'Prepare Tactics',
    description: 'Develop tactical approaches and resource assignments'
  },
  {
    id: 'tactics-meeting',
    name: 'Tactics Meeting',
    shortName: 'Tactics Meeting',
    description: 'Review and finalize tactical assignments'
  },
  {
    id: 'prepare-planning',
    name: 'Prepare Planning',
    shortName: 'Prepare Planning',
    description: 'Develop incident action plan components'
  },
  {
    id: 'planning-meeting',
    name: 'Planning Meeting',
    shortName: 'Planning Meeting',
    description: 'Finalize and review the incident action plan'
  },
  {
    id: 'iap-prep-approval',
    name: 'IAP Prep & Approval',
    shortName: 'IAP Prep & Approval',
    description: 'Prepare and obtain approval for IAP'
  },
  {
    id: 'operations-briefing',
    name: 'Operations Briefing',
    shortName: 'Operations Briefing',
    description: 'Brief operational personnel on the IAP'
  }
];