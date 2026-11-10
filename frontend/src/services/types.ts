export interface Agent {
  id: string;
  name: string;
  description: string;
  framework: string;
  version: string;
  adapter_type: string;
  model_provider?: string;
  model_name?: string;
  status: string;
  is_demo: boolean;
  created_at: string;
}

export interface BenchmarkTask {
  id: string;
  name: string;
  category: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  description: string;
  instruction: string;
  expected_outcome: string;
  verification_method: string;
  time_limit_seconds: number;
  environment_type: string;
  is_demo: boolean;
  created_at: string;
}

export interface FailureScenario {
  id: string;
  name: string;
  code: string;
  description: string;
  trigger_point: string;
  severity: string;
  parameters: Record<string, any>;
}

export interface Trial {
  id: string;
  trial_number: number;
  status: 'PASSED' | 'FAILED' | 'RECOVERED' | 'TIMEOUT';
  reward_score: number;
  duration_seconds: number;
  failure_injected: boolean;
  failure_recovered: boolean;
  error_message?: string;
  created_at: string;
}

export interface Run {
  id: string;
  total_trials: number;
  successful_trials: number;
  failed_trials: number;
  pass_rate: number;
  pass_at_k: number;
  pass_to_k: number;
  recovery_rate?: number;
  avg_duration_seconds: number;
  duration_variance: number;
  avg_cost_usd?: number;
  total_tokens?: number;
  status: string;
  trials: Trial[];
  created_at: string;
}

export interface Experiment {
  id: string;
  title: string;
  description?: string;
  agent_id: string;
  benchmark_task_id: string;
  failure_scenario_id?: string;
  repetitions_k: number;
  timeout_seconds: number;
  status: string;
  is_demo: boolean;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  agent?: Agent;
  benchmark_task?: BenchmarkTask;
  failure_scenario?: FailureScenario;
  runs: Run[];
}

export interface DashboardSummary {
  total_agents: number;
  total_benchmarks: number;
  total_experiments: number;
  overall_pass_rate: number;
  average_duration_seconds: number;
  average_cost_usd?: number;
  active_environment_mode: string;
  harbor_status: {
    available: boolean;
    installed_version?: string;
    required_version: string;
    docker_available: boolean;
    docker_version?: string;
    status: string;
    mode: string;
  };
  recent_experiments: Experiment[];
  recent_failures: Array<{
    trial_id: string;
    experiment_title: string;
    agent_name: string;
    error_message: string;
    created_at: string;
  }>;
  reliability_distribution: Array<{
    category: string;
    pass_rate: number;
    recovery_rate: number;
  }>;
}

export interface ATIFTrajectory {
  schema_version: string;
  session_id?: string;
  trajectory_id: string;
  agent: {
    name: string;
    version: string;
    model_name?: string;
    tool_definitions?: Array<{ name: string; description: string }>;
  };
  steps: Array<{
    step_id: number;
    timestamp: string;
    source: 'user' | 'agent' | 'system';
    message?: string;
    reasoning_content?: string;
    tool_calls?: Array<{
      tool_call_id: string;
      function_name: string;
      arguments: Record<string, any>;
    }>;
    observation?: {
      results: Array<{
        tool_call_id: string;
        content: string;
        is_error: boolean;
      }>;
    };
    metrics?: {
      prompt_tokens: number;
      completion_tokens: number;
      cached_tokens: number;
      cost: number;
    };
  }>;
  final_metrics?: Record<string, any>;
}

