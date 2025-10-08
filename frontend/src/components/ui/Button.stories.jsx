import React from 'react';
import { Button } from './button';

export default {
  title: 'UI/Button',
  component: Button,
};

export const Default = () => <Button>Default</Button>;
export const Outline = () => <Button variant="outline">Outline</Button>;
export const Ghost = () => <Button variant="ghost">Ghost</Button>;

