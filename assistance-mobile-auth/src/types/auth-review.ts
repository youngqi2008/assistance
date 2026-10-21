export type AuthDemoState = 'default' | 'loading' | 'success' | 'failure' | 'cancel'

export type AuthScene = 'native-number'

export type StatusTone = 'neutral' | 'progress' | 'success' | 'warning' | 'error'

export interface ActionConfig {
  label: string
  emphasis: 'primary' | 'secondary' | 'ghost'
  disabled?: boolean
}

export interface ScopeItem {
  label: string
  description: string
}

export interface PhoneDisplayConfig {
  label: string
  value: string
  assistiveText: string
}

export interface VerificationConfig {
  title: string
  description: string
  codeLabel: string
  placeholder: string
  countdownLabel: string
}

export interface FeedbackSummary {
  title: string
  description: string
  summaryLabel: string
  summaryValue: string
}

export interface AuthReviewScenario {
  key: `${AuthScene}-${AuthDemoState}`
  scene: AuthScene
  state: AuthDemoState
  sceneTitle: string
  sceneDescription: string
  phone: PhoneDisplayConfig
  showVerificationCode: boolean
  verification?: VerificationConfig
  primaryAction: ActionConfig
  secondaryAction?: ActionConfig
  statusTone: StatusTone
  statusTitle: string
  statusDescription: string
  resultSummary: FeedbackSummary
  errorHint?: string
  cancelHint?: string
  scopeItems: ScopeItem[]
}

export type AuthReviewScenarioMap = Record<AuthDemoState, AuthReviewScenario>
