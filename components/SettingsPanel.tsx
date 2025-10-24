
import React from 'react';
import { LANGUAGES, SCENARIOS } from '../constants';

interface SettingsPanelProps {
  language: string;
  onLanguageChange: (value: string) => void;
  scenario: string;
  onScenarioChange: (value: string) => void;
  disabled: boolean;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  language,
  onLanguageChange,
  scenario,
  onScenarioChange,
  disabled,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="language-select" className="block text-sm font-medium text-text-secondary mb-2">
          Practice Language
        </label>
        <select
          id="language-select"
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
          disabled={disabled}
          className="w-full bg-bg-tertiary border-bg-tertiary text-text-primary rounded-lg p-2 focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="scenario-select" className="block text-sm font-medium text-text-secondary mb-2">
          Conversation Scenario
        </label>
        <select
          id="scenario-select"
          value={scenario}
          onChange={(e) => onScenarioChange(e.target.value)}
          disabled={disabled}
          className="w-full bg-bg-tertiary border-bg-tertiary text-text-primary rounded-lg p-2 focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {SCENARIOS.map((scen) => (
            <option key={scen.value} value={scen.value}>
              {scen.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
