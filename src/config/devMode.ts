
// Dev mode configuration for local development
export const DEV_MODE = {
  enabled: import.meta.env.VITE_DEV_MODE === 'true' || false,
  bypassAuth: import.meta.env.VITE_BYPASS_AUTH === 'true' || false,
  mockUser: {
    _id: 'dev-user-123',
    name: 'Dev User',
    email: 'dev@example.com',
    role: 'patient',
    created_at: new Date().toISOString(),
    emergency_contacts: [
      {
        name: 'Emergency Contact',
        relation: 'Family',
        phone: '+1234567890'
      }
    ]
  }
};

export const toggleDevMode = () => {
  // This would be used for runtime toggling if needed
  console.log('Dev mode toggle functionality');
};
