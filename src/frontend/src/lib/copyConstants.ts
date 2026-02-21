export const COPY = {
  app: {
    name: 'Focus Guardian',
    tagline: 'Your productivity coach',
  },
  dashboard: {
    welcome: 'Welcome back!',
    subtitle: "Let's review your focus journey and celebrate your progress.",
  },
  warnings: {
    firstThreshold: {
      title: 'Focus Check-In',
      message: 'You might be experiencing cognitive fatigue.',
      suggestion: 'Consider taking a short desk recovery break to reset your focus.',
    },
    secondThreshold: {
      title: 'High Cognitive Load',
      message: 'Your burnout index is elevated.',
      suggestion: 'A break is strongly recommended to maintain productivity.',
    },
  },
  blocking: {
    title: 'Focus Session Required',
    subtitle: 'Complete a productive work session to unlock distracting applications',
    tips: [
      'Close unnecessary tabs and applications',
      'Focus on a single task',
      'Minimize context switching',
      'Take deep breaths if you feel restless',
    ],
  },
  breaks: {
    deskRecovery: {
      title: 'Desk Recovery',
      subtitle: 'Take a mindful break with guided breathing exercises',
      benefits: [
        {
          title: 'Reduces Mental Fatigue',
          description: 'Short breathing exercises help reset your cognitive resources',
        },
        {
          title: 'Improves Focus',
          description: 'Mindful breathing enhances concentration and attention span',
        },
        {
          title: 'Lowers Stress',
          description: 'Activates your parasympathetic nervous system for relaxation',
        },
      ],
    },
    walkBreak: {
      title: 'Walk Break',
      subtitle: 'Set a timer for your walk and return before the alarm sounds',
      tips: [
        'Leave your phone at your desk',
        'Get some fresh air if possible',
        'Stretch your legs and back',
        'Stay hydrated',
      ],
      benefits: [
        'Increases blood flow to the brain',
        'Reduces eye strain from screens',
        'Improves mood and energy',
        'Prevents prolonged sitting',
      ],
    },
  },
  focusGuardian: {
    warnings: {
      level1: {
        title: 'Gentle Reminder',
        message: "You've visited a few distractive sites. Let's try to stay focused on your goals.",
      },
      level2: {
        title: 'Focus Check-In',
        message: "You're getting distracted more frequently. Consider what's pulling your attention away.",
      },
      level3: {
        title: 'Final Warning',
        message: 'One more distractive visit will activate a focus lock to help you regain concentration.',
      },
    },
    lock: {
      title: 'Focus Lock Active',
      subtitle: 'Time to reset and refocus on what matters',
      supportMessage: "You've got this! This is an opportunity to strengthen your focus habits.",
    },
  },
};
