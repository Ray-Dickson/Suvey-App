const surveys = [
  {
    id: '1',
    title: 'Customer Satisfaction Survey',
    description: 'We want to hear about your experience with our service.',
    status: 'published', // or 'draft', 'archived'
    responses: 152,
    updatedAt: '2025-07-30T14:12:00Z',
  },
  {
    id: '2',
    title: 'Product Feedback',
    description: 'Help us improve by giving feedback on the new product features.',
    status: 'draft',
    responses: 0,
    updatedAt: '2025-07-29T09:40:00Z',
  },
  {
    id: '3',
    title: 'Employee Engagement Survey',
    description: 'Let us know how you feel about your work environment.',
    status: 'published',
    responses: 47,
    updatedAt: '2025-07-28T17:25:00Z',
  },
  {
    id: '4',
    title: 'Event Satisfaction Survey',
    description: 'Tell us what you thought of the Annual Tech Meetup.',
    status: 'archived',
    responses: 198,
    updatedAt: '2025-07-25T11:15:00Z',
  },
];

const surveyDetails = {
  id: '1',
  title: 'Customer Satisfaction Survey',
  description: 'We want to hear about your experience with our service.',
  status: 'published',
  questions: [
    {
      id: 'q1',
      type: 'rating',
      questionText: 'How satisfied are you with our service?',
      options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied'],
    },
    {
      id: 'q2',
      type: 'textarea',
      questionText: 'What can we do to improve?',
    },
  ],
};

export function getSurveyDetails() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(surveyDetails);
    }, 1000);
  });
}

const emptySurvey = []

export function getSurveys() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(surveys);
    }, 1000);
  });
}