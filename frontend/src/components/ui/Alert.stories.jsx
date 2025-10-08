import React from 'react';
import { Alert } from './alert';

export default {
  title: 'UI/Alert',
  component: Alert,
};

export const Variants = () => (
  <div className="space-y-3">
    <Alert variant="info" title="Info">Informational message.</Alert>
    <Alert variant="success" title="Success">Everything worked.</Alert>
    <Alert variant="warning" title="Warning">Be careful.</Alert>
    <Alert variant="danger" title="Error">Something failed.</Alert>
  </div>
);

