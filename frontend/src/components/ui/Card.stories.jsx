import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './card';

export default {
  title: 'UI/Card',
  component: Card,
};

export const Basic = () => (
  <Card>
    <CardHeader>
      <CardTitle>Card Title</CardTitle>
    </CardHeader>
    <CardContent>
      <p>Card content goes here.</p>
    </CardContent>
  </Card>
);

