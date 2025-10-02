// Legacy AI Assistant - Use AIEducationAssistant for full functionality
import React from 'react';
import { AIEducationAssistant } from './ai-education-assistant';

interface AIAssistantProps {
  className?: string;
  userType?: 'student' | 'teacher';
  subject?: string;
  grade?: string;
}

export function AIAssistant({ className, userType = 'student', subject, grade }: AIAssistantProps) {
  return (
    <AIEducationAssistant 
      className={className}
      userType={userType}
      subject={subject}
      grade={grade}
    />
  );
}